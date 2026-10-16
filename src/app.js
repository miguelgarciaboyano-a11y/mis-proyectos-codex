import {createOtalgiaUI} from './otalgia-app.js';
import {createFirstVisitUI} from './first-visit-app.js';
import {wordCount,NOTE_LIMIT} from './note-summary.js';
import {createFeverUI} from './fever-app.js';
import {newState,STATES,symptoms,differentials,cvFields,adverseEffects,drugFields,interviewGroups,followFields} from './schema.js';
import {synthesis,therapyProposal,generateNote} from './clinical.js';
import {bmi,measurementWarnings,measurementText,compareMeasurements,percentileStatus} from './measurements.js';
import {VERSIONS,scoreErrors} from './questionnaires.js';
import {growthForMeasurement,formatGrowth} from './percentiles.js';
import {parseTransfer,applyTransfer} from './transfer.js';
let state=newState(),note='',noteDirty=false,previous=null;
let initialSnapshot=JSON.stringify(state),readEpoch=0;
const root=document.getElementById('app');
const feverUI=createFeverUI(root);
const otalgiaUI=createOtalgiaUI(root);
let activeModule='tdah';
const firstUI=createFirstVisitUI(root,{getState:()=>state,getNote:()=>note,isNoteDirty:()=>noteDirty,extras:{date:()=>field('date','Fecha de consulta','date'),measurements:()=>'<div class="fields">'+field('birth','Nacimiento · solo para cálculos de crecimiento','date')+field('sex','Sexo de referencia para crecimiento','select',[['','No indicado'],['femenino','Femenino'],['masculino','Masculino']])+'</div>'+measurementSection(),questionnaires:()=>questionnaireSection(),goals:()=>goalsSection()},onEdit:()=>{state.accepted=[];if(note)noteStatus('Formulario modificado · nota conservada, pendiente de actualizar');}});
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const at=path=>path.split('.').reduce((v,k)=>v?.[k],state);
function set(path,value){const keys=path.split('.');let o=state;for(const k of keys.slice(0,-1))o=o[k];o[keys.at(-1)]=value;}
function options(list,value){return list.map(([v,l])=>`<option value="${escape(v)}" ${String(value??'')===v?'selected':''}>${escape(l)}</option>`).join('');}
function field(path,label,type='text',opts){
 const id='f-'+path.replaceAll('.','-'),v=at(path)??'';
 let input;
 if(type==='state'||type==='select')input=`<select id="${id}" data-path="${path}">${options(type==='state'?STATES:opts,v)}</select>`;
 else if(type==='textarea')input=`<textarea id="${id}" data-path="${path}" rows="2" maxlength="10000">${escape(v)}</textarea>`;
 else input=`<input id="${id}" data-path="${path}" type="${type}" value="${escape(v)}" ${type==='number'?'step="any" inputmode="decimal"':''} ${type==='text'?'maxlength="10000"':''}>`;
 return `<div class="field ${type==='textarea'?'wide':''}"><label for="${id}">${escape(label)}</label>${input}</div>`;
}
function fields(list,prefix){return list.map(([k,l,t,opts])=>field(prefix+'.'+k,l,t,opts)).join('');}
function section(id,number,title,subtitle,content,open=false){return `<details class="section" id="${id}" ${open?'open':''}><summary><span class="section-num">${number}</span><span><strong>${title}</strong><small>${subtitle}</small></span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="section-body">${content}</div></details>`;}
function render(){
 root.dataset.module=activeModule;
 if(activeModule==='fever'){feverUI.render();return;}
 if(activeModule==='otalgia'){otalgiaUI.render();return;}
 if(state.mode==='first'){firstUI.render();updateDerived();updateNoteCount();return;}
 root.innerHTML=`
 <aside class="sidebar"><a class="brand" href="#workspace" aria-label="Consulta Pediatría, inicio"><span class="brand-icon" aria-hidden="true">✚</span><span>consulta<small>PEDIATRÍA</small></span></a>
 <p class="nav-label">ESPACIO CLÍNICO</p><a class="side-link active" aria-current="page" data-module="tdah" href="#workspace"><span aria-hidden="true">◉</span> TDAH <span class="small-badge">01</span></a><a class="side-link" href="#workspace" data-module="fever">◉ Fiebre <span class="small-badge">02</span></a><a class="side-link" data-module="otalgia" href="#workspace">◉ Otalgia <span class="small-badge">03</span></a>
 <div class="sidebar-bottom"><span class="local-dot"></span> Procesamiento local<small>Sin IA, analítica ni telemetría.<br>Los datos viven en esta pestaña.</small><a href="#privacy">Privacidad y fuentes ↗</a></div></aside>
 <div class="page"><header class="topbar"><span>Pediatría de atención primaria <span class="muted">/</span> <strong>TDAH</strong></span><span class="prototype">PROTOTIPO · REVISIÓN PROFESIONAL</span></header>
 <main id="workspace" tabindex="-1"><div class="page-heading"><div><p class="eyebrow">CUADERNO DE CONSULTA</p><h1>Una consulta, bien recogida.</h1><p class="lead">Anamnesis, objetivos y seguimiento del TDAH en un mismo lugar.</p></div><span class="memory"><span class="local-dot"></span> Solo en esta pestaña</span></div>
 <div class="toolbar"><div class="mode-switch" role="group" aria-label="Tipo de consulta"><button data-mode="first" aria-pressed="${state.mode==='first'}">01 <span>Primera consulta</span></button><button data-mode="follow" aria-pressed="${state.mode==='follow'}">02 <span>Consulta sucesiva</span></button></div><div class="tools"><button class="text-button" data-action="import">Importar consulta previa</button><button class="text-button" data-action="export">Exportar JSON</button><button class="text-button danger" data-action="reset">Reiniciar</button><input type="file" id="import-file" accept=".json,application/json" hidden></div></div>
 <div id="transfer-panel"></div>
 <div class="notice"><span class="notice-icon" aria-hidden="true">i</span><div><strong>Apoyo a la consulta, con criterio clínico.</strong> Puedes completar solo lo que necesites. Los campos vacíos no se interpretan como normales. Las propuestas requieren tu revisión; este prototipo no está validado para uso clínico.</div></div>
 <div class="consultation-grid"><div class="form-column"><div class="form-title"><h2>${state.mode==='first'?'Primera consulta':'Seguimiento del tratamiento'}</h2><span>Registro parcial permitido</span></div>
 <nav class="section-nav" aria-label="Ir a una sección"><a href="#interview">Entrevista</a><a href="#goals">Objetivos</a><a href="#measurements">Constantes</a><a href="#questionnaires">Escalas</a><a href="#assessment">Valoración</a></nav>
 ${section('session','—','Datos de la consulta','Sin nombre, DNI, teléfono ni otros identificadores',`<div class="fields">${field('date','Fecha de consulta','date')}${field('birth','Fecha de nacimiento · solo para edad precisa','date')}${field('sex','Sexo de referencia para crecimiento','select',[['','No indicado'],['femenino','Femenino'],['masculino','Masculino']])}</div><p class="hint">La fecha de nacimiento es sensible: usa datos ficticios en este prototipo. Los percentiles requieren fechas, sexo de referencia y mediciones aplicables.</p>`,true)}
 <div id="interview">${interviewGroups.map((g,index)=>section(g.id,'0'+(index+1),g.title,'Información referida y observaciones de la consulta',`<div class="fields">${fields(g.fields,'interview')}</div>`,index===0)).join('')}</div>
 ${section('symptoms','05','Síntomas nucleares','Entrevista descriptiva · no suma ni escala diagnóstica',`<p class="hint">Registrar conductas observables, frecuencia, ejemplos, edad de inicio y entorno. No equiparar estas preguntas a los ítems de Vanderbilt.</p><div class="symptom-list">${symptoms.map(([k,l])=>field('symptoms.'+k,l,'select',[['','No valorado'],['0','0 · Nunca / casi nunca'],['1','1 · A veces'],['2','2 · Frecuente'],['3','3 · Muy frecuente']])).join('')}</div>${field('symptomExamples','Ejemplos, consecuencias, inicio y entornos; accidentes por precipitación y adecuación a edad/desarrollo','textarea')}`)}
 ${section('differential','06','Diferencial y comorbilidad','Explorar qué puede coexistir o explicar mejor el cuadro',`<div class="screening-list">${differentials.map(([k,l,h])=>`<div>${field('differential.'+k,l,'state')}<p class="hint">${h}</p></div>`).join('')}</div>${field('selfHarm','Verbalizaciones autolesivas / ideas de muerte','state')}<p class="hint">Si se refieren, requieren valoración específica; no atribuirlas al TDAH.</p>${field('differentialDetails','Hallazgos, relación temporal, discrepancias y próximos pasos por área','textarea')}`)}
 ${section('cardiovascular','07','Cribado cardiovascular dirigido','Personal y familiar · antes de iniciar o ajustar',`<div class="fields">${cvFields.map(([k,l])=>field('cv.'+k,l,'state')).join('')}</div>${field('cvDetails','Detalles, antecedentes, exploración y valoración si procede','textarea')}<p class="source">Fuente: Metilfenidato, p. 1. Un resultado positivo exige valoración individual; no se presume aptitud cardiovascular.</p>`)}
 ${goalsSection()}
 ${measurementSection()}
 ${questionnaireSection()}
 ${section('treatment','11',state.mode==='first'?'Tratamiento · si se inicia':'Tratamiento previo a la consulta','Registro clínico de la pauta; no prescripción automática',`<div class="fields">${fields(drugFields,'drug')}</div><p class="hint">Describe cada toma, unidad y horario. No se asume equivalencia entre formulaciones ni se calcula dosis a partir del peso.</p>`)}
 ${state.mode==='follow'?section('follow','12','Respuesta, cobertura y adherencia','La mejoría se compara con objetivos y situación basal',`<div class="fields">${fields(followFields,'follow')}</div>`,true)+section('tolerance','13','Tolerabilidad','Lista de la guía de metilfenidato · no exhaustiva',`<label class="check emphasis"><input type="checkbox" data-path="ramReviewed" ${state.ramReviewed?'checked':''}> Reacciones adversas revisadas con el paciente / familia</label><p class="hint">Mientras no confirmes la revisión, la nota indicará «no revisadas», aunque los selectores muestren «No». Al modificar una RAM se solicita confirmar de nuevo.</p>${adverseEffects.map(([k,l])=>`<div class="ram-card">${field('ram.'+k+'.present',l,'select',[['false','No'],['true','Sí']])}<div class="ram-details fields" id="ram-${k}" ${state.ram[k].present?'':'hidden'}>${field('ram.'+k+'.intensity','Intensidad')}${field('ram.'+k+'.onset','Momento de aparición')}${field('ram.'+k+'.impact','Repercusión')}${field('ram.'+k+'.notes','Observaciones','textarea')}</div></div>`).join('')}${field('otherRam','Otras reacciones adversas o preocupaciones','textarea')}<p class="source">Fuente: Metilfenidato, p. 2, apartado 4. Lista no exhaustiva; no extrapolar a otros fármacos.</p>`,true):''}
 ${section('assessment','14','Valoración y plan','Orientación separada del texto validado',`<div id="synthesis" class="derived"></div><button class="secondary" data-action="accept-synthesis">Revisar e incorporar síntesis a valoración</button>${field('assessment','Valoración del profesional · editable','textarea')}<div id="proposal"></div>${field('plan','Plan decidido por el profesional','textarea')}${field('followup','Plan de seguimiento: fecha, coordinación y controles','textarea')}`,true)}
 <details class="privacy" id="privacy"><summary>Privacidad, fuentes y límites del prototipo</summary><p>No se guarda nada en localStorage, cookies ni bases de datos. Los datos y la nota permanecen en memoria de esta pestaña hasta reiniciar, cerrar o recargar. El navegador puede conservar una pestaña suspendida o copias del portapapeles: reinicia al terminar.</p><p>Exportar descarga un JSON sin cifrar con datos y nota. Tú eliges dónde guardarlo y debes borrar las copias cuando proceda. «Reiniciar» limpia esta pestaña; no borra archivos exportados, el portapapeles ni copias en la historia clínica.</p><p>Importar solo traslada, con selección explícita, objetivos sin evolución, tratamiento y mediciones como previas. No traslada identidad, negaciones, valoración, revisión de RAM ni decisiones aceptadas. Revisa la pertenencia al mismo caso antes de importar.</p><p>Sin servicios externos, modelos de IA, fuentes remotas, analítica ni telemetría. Servir solo en un equipo de confianza, enlazado a 127.0.0.1. Usar datos ficticios mientras no se haya revisado el prototipo.</p><a href="./docs/FUENTES.md" target="_blank" rel="noopener">Correspondencia y límites de las fuentes ↗</a><p>TDAH y plantilla de Fiebre implementados. Sin validación clínica, circuitos locales de derivación ni fichas técnicas actualizadas integradas. Datos y métodos OMS: World Health Organization, GPL ≥3; sin garantía. <a href="./vendor/who/LICENSE.md" target="_blank" rel="noopener">Licencia y redistribución</a>; <a href="./vendor/who/manifest.json" target="_blank" rel="noopener">versiones y atribución</a>.</p></details>
 </div><aside class="note-panel" aria-labelledby="note-heading"><div class="note-header"><span class="eyebrow">DOCUMENTACIÓN</span><span class="pill">MÁX. 180 PALABRAS</span></div><h2 id="note-heading">Nota clínica</h2><p>Síntesis de ocho apartados con datos aportados.<br>Sin hallazgos ni decisiones automáticas.</p><div class="note-actions"><button class="primary" data-action="generate">Generar / actualizar borrador</button></div><label class="sr-only" for="clinical-note">Borrador editable de la nota clínica</label><textarea id="clinical-note" placeholder="La nota aparecerá aquí cuando generes el borrador. No se añaden datos negativos ni decisiones no registradas." spellcheck="false">${escape(note)}</textarea><p class="hint" id="clinical-note-length"></p><div class="note-footer"><span id="note-status">${noteDirty?'Ediciones manuales conservadas':note?'Borrador generado · revisar':'Aún sin generar'}</span><button class="secondary" data-action="copy">Copiar texto</button></div><p class="note-tip">Los cambios en el formulario no sobrescriben la nota. Actualízala expresamente cuando lo necesites.</p></aside></div>
 <footer>CONSULTA · PEDIATRÍA <span>Herramienta local de apoyo · Madrid</span></footer></main></div><div class="toast" id="status" role="status" aria-live="polite"></div>`;
 updateDerived();updateNoteCount();
}
function goalList(){return state.goals.length?state.goals.map((g,i)=>`<fieldset class="entry"><legend>Objetivo ${i+1}</legend><div class="fields">${field('goals.'+i+'.description','Descripción concreta')}${field('goals.'+i+'.context','Contexto','select',[['','No indicado'],['familiar','Familiar'],['escolar','Escolar'],['social','Social']])}${field('goals.'+i+'.baseline','Situación basal: frecuencia, tiempo o número')}${field('goals.'+i+'.criterion','Criterio observable de mejoría')}${field('goals.'+i+'.current','Evolución actual respecto a la basal','textarea')}</div><button class="text-button danger" data-action="remove-goal" data-index="${i}">Eliminar objetivo ${i+1}</button></fieldset>`).join(''):'<p class="empty-state">Todavía no hay objetivos.<br><span>Empieza por un cambio que sea importante para el menor y su familia.</span></p>';}
function questionnaireList(){return state.questionnaires.map((q,i)=>{
 const v=VERSIONS[q.type],prefix='questionnaires.'+i;
 return `<fieldset class="entry"><legend>${q.type==='parent'?'Familiar':'Docente'} ${state.questionnaires.slice(0,i+1).filter(x=>x.type===q.type).length}</legend><p class="instrument">${v.label}</p><p class="hint">${v.period}</p><div class="fields">${field(prefix+'.informant','Informante · código no identificativo')}${field(prefix+'.relation','Relación con el menor / materia y curso')}${field(prefix+'.date','Fecha del cuestionario','date')}${field(prefix+'.period','Período observado / tiempo de observación')}${field(prefix+'.medication','Medicación durante la evaluación','select',[['','No consta'],['con medicación','Con medicación'],['sin medicación','Sin medicación'],['desconocido','Desconocido']])}</div><details class="subdetails"><summary>Puntuaciones ya calculadas</summary><div class="fields">${v.scales.map(([k,l,min,max])=>field(prefix+'.scores.'+k,l+` (${min}–${max})`,'number')).join('')}</div></details>${field(prefix+'.interpretation','Interpretación introducida por el profesional (opcional)','textarea')}<p class="source">Fuente: ${v.source}. Sin interpretación automática.</p><button class="text-button danger" data-action="remove-questionnaire" data-index="${i}">Eliminar este cuestionario</button></fieldset>`;
 }).join('')||'<p class="empty-state">Sin cuestionarios aportados.<br><span>La ausencia de escalas no se interpreta como un resultado negativo.</span></p>';}
function list(items){return items.length?'<ul>'+items.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul>':'<p class="hint">Sin datos documentados en este apartado.</p>';}
function updateDerived(){
 if(state.mode==='first')firstUI.update();
 const b=bmi(state.measurement),warnings=measurementWarnings(state.measurement);
 if(document.getElementById('measurement-result'))document.getElementById('measurement-result').innerHTML=`<div class="metric"><span>IMC calculado</span><strong>${b===null?'—':b.toFixed(2)} <small>kg/m²</small></strong></div>${list(warnings)}<h3>Percentiles calculados · referencia OMS</h3>${list(Object.entries(growthForMeasurement(state.measurement,state.birth,state.sex)).map(([k,r])=>({weight:'Peso/edad',height:'Talla o longitud/edad',bmi:'IMC/edad'}[k])+': '+formatGrowth(r)))}<p class="hint">El percentil de IMC usa talla/longitud estandarizada según edad y técnica; el IMC superior usa la medición introducida. Sin interpretación automática.</p><p class="hint">${b===null?'Requiere peso y talla positivos.':'Cálculo aritmético; no implica normalidad ni percentil.'}</p>`;
 const sorted=[...state.measurements].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
 if(document.getElementById('measurement-history'))document.getElementById('measurement-history').innerHTML=sorted.length?`<h3>Mediciones previas importadas</h3>${list(sorted.map(measurementText))}<h3>Cambio respecto a la previa más reciente</h3>${list(compareMeasurements(state.measurement,sorted.at(-1)))}`:'<p class="hint">Sin mediciones previas. Puedes trasladarlas desde una exportación elegida.</p>';
 if(document.getElementById('questionnaire-result'))document.getElementById('questionnaire-result').innerHTML=list(state.questionnaires.flatMap((q,i)=>scoreErrors(q).map(e=>`Registro ${i+1}: ${e}`)));
 for(const type of ['parent','teacher']){
 const btn=root.querySelector(`[data-action="add-${type}"]`);if(btn)btn.disabled=state.questionnaires.filter(q=>q.type===type).length>=2;
 }
 const syn=synthesis(state);
 if(document.getElementById('synthesis'))document.getElementById('synthesis').innerHTML=`<span class="eyebrow">SÍNTESIS ORIENTATIVA · NO DIAGNÓSTICO</span><h3>Hallazgos que apoyan la sospecha</h3>${list(syn.support)}<h3>Información insuficiente o discordante</h3>${list(syn.gaps)}<h3>Alternativas y comorbilidades por explorar</h3>${list(syn.alternatives)}<h3>Próximos pasos documentados</h3>${list(syn.next)}<p class="source">Fuente: ${syn.source}. Las escalas no diagnostican por sí solas. No se estima probabilidad.</p>`;
 const p=therapyProposal(state);
 if(document.getElementById('proposal'))document.getElementById('proposal').innerHTML=state.mode==='follow'?`<div class="proposal ${p.blocked?'blocked':''}"><span class="eyebrow">APOYO TERAPÉUTICO · METILFENIDATO</span><h3>${p.blocked?'Valoración previa necesaria':'Opción para revisión profesional'}</h3><p>${escape(p.text)}</p><h4>Datos que la justifican</h4>${list(p.evidence)}<h4>Información pendiente</h4>${p.missing.length?list(p.missing):'<p>No faltan los campos requeridos por esta regla. Su contenido requiere revisión clínica.</p>'}<h4>Precauciones</h4>${list(p.precautions)}<p class="source"><strong>Regla:</strong> ${escape(p.rule)}<br><strong>Fuente:</strong> ${escape(p.source)}</p><p>Durante titulación: feedback habitual semanal de familia y profesorado (guía, p. 2). Registrar efecto, duración y RAM.</p><button class="secondary" data-action="accept-proposal" ${p.blocked?'disabled':''}>${state.accepted.length?'Propuesta aceptada para este registro':'He revisado los datos: incorporar opción al plan'}</button>${state.accepted.length?'<p class="hint">Aceptación registrada. Cualquier cambio en el formulario la invalida; una nota ya editada se conserva y debes revisarla.</p>':''}</div>`:'<p class="hint">El apoyo terapéutico está disponible en la consulta sucesiva. El inicio de tratamiento requiere decisión y pauta introducidas por el profesional.</p>';
}
function toast(message){const el=document.getElementById('status');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),6500);}
function updateNoteCount(){const el=document.getElementById('clinical-note-length');if(el)el.textContent=`${wordCount(note)}/${NOTE_LIMIT} palabras${wordCount(note)>NOTE_LIMIT?' · reduce el texto antes de copiar':''}`;}
function noteStatus(message){document.getElementById('note-status').textContent=message;}
root.addEventListener('input',e=>{
 if(activeModule!=='tdah')return;
 if(e.target.id==='clinical-note'){note=e.target.value;noteDirty=true;updateNoteCount();noteStatus('Ediciones manuales conservadas');return;}
 const path=e.target.dataset.path;if(!path)return;
 let value=e.target.type==='checkbox'?e.target.checked:e.target.value;
 if(path.endsWith('.present'))value=value==='true';
 set(path,value);
 if(path.startsWith('ram.')||path==='otherRam'){
 state.ramReviewed=false;const checkbox=root.querySelector('[data-path="ramReviewed"]');if(checkbox)checkbox.checked=false;
 if(path.endsWith('.present'))document.getElementById('ram-'+path.split('.')[1]).hidden=!value;
 }
 const hadAccepted=state.accepted.length;state.accepted=[];
 if(hadAccepted)toast('La propuesta aceptada se ha invalidado al cambiar datos. Revisa también cualquier nota ya generada.');
 if(note)noteStatus('Formulario modificado · nota conservada, pendiente de actualizar');
 updateDerived();
});
root.addEventListener('change',async e=>{
 if(activeModule!=='tdah'||e.target.id!=='import-file')return;
 const file=e.target.files[0];if(!file)return;const epoch=++readEpoch;
 try{if(file.size>1_000_000)throw Error('Máximo 1 MB.');const raw=await file.text();if(epoch!==readEpoch)return;previous=parseTransfer(raw);showTransfer();toast('Archivo leído localmente. Elige qué trasladar y comprueba el caso.');}
 catch(err){toast('No se ha importado: '+err.message);}
 e.target.value='';
});
root.addEventListener('click',async e=>{
 const module=e.target.closest('a[data-module]')?.dataset.module;
 if(module){e.preventDefault();activeModule=module;render();root.querySelector('#workspace').focus();return;}
 if(activeModule!=='tdah')return;
 const mode=e.target.closest('[data-mode]')?.dataset.mode;
 if(mode){state.mode=mode;state.accepted=[];render();if(note)noteStatus('Recorrido cambiado · nota conservada, pendiente de actualizar');toast('Recorrido cambiado. Los datos se conservan; actualiza la nota si ya estaba generada.');return;}
 const b=e.target.closest('[data-action]');if(!b)return;
 const action=b.dataset.action,index=Number(b.dataset.index);
 if(note&&['add-goal','remove-goal','add-parent','add-teacher','remove-questionnaire','accept-synthesis','accept-proposal','apply-transfer'].includes(action))noteStatus('Datos modificados · nota conservada, pendiente de actualizar');
 if(action==='add-goal'){
  if(state.goals.length>=30){toast('Límite de 30 objetivos por consulta.');return;}
  state.goals.push({description:'',baseline:'',criterion:'',context:'',current:''});state.accepted=[];
  document.getElementById('goal-list').innerHTML=goalList();document.getElementById('f-goals-'+(state.goals.length-1)+'-description').focus();updateDerived();
 }else if(action==='remove-goal'){
  if(!confirm('¿Eliminar este objetivo de la consulta actual?'))return;
  state.goals.splice(index,1);state.accepted=[];document.getElementById('goal-list').innerHTML=goalList();root.querySelector('[data-action="add-goal"]').focus();updateDerived();
 }else if(action==='add-parent'||action==='add-teacher'){
  const type=action.slice(4);if(state.questionnaires.filter(q=>q.type===type).length>=2)return;
  state.questionnaires.push({type,informant:'',relation:'',date:'',period:'',medication:'',scores:{},interpretation:''});state.accepted=[];
  document.getElementById('questionnaire-list').innerHTML=questionnaireList();updateDerived();document.getElementById('f-questionnaires-'+(state.questionnaires.length-1)+'-informant').focus();
 }else if(action==='remove-questionnaire'){
  if(!confirm('¿Eliminar este registro de cuestionario?'))return;
  state.questionnaires.splice(index,1);state.accepted=[];document.getElementById('questionnaire-list').innerHTML=questionnaireList();updateDerived();root.querySelector('[data-action="add-parent"]').focus();
 }else if(action==='generate'){
  if(noteDirty&&!confirm('La nota contiene ediciones manuales. ¿Reemplazarla por un nuevo borrador a partir del formulario? Cancelar conserva íntegramente tus cambios.'))return;
  note=generateNote(state);noteDirty=false;document.getElementById('clinical-note').value=note;updateNoteCount();noteStatus('Borrador actualizado · revisar antes de copiar');toast('Borrador generado. La síntesis orientativa solo se incluye si la incorporas expresamente.');
 }else if(action==='copy'){
  if(wordCount(note)>NOTE_LIMIT){toast('La nota supera 180 palabras. Reduce el texto antes de copiar.');return;}
  if(!note.trim()){toast('Genera o escribe una nota antes de copiar.');return;}
  try{await navigator.clipboard.writeText(note);toast('Nota copiada como texto sencillo. Revisa antes de pegar en la historia.');}
  catch{document.getElementById('clinical-note').focus();document.getElementById('clinical-note').select();toast('No se pudo usar el portapapeles. Texto seleccionado: pulsa Ctrl+C o ⌘C.');}
 }else if(action==='accept-synthesis'){
  if(!confirm('¿Has revisado los datos y quieres incorporar esta síntesis orientativa a tu valoración? No se añadirá un diagnóstico.'))return;
  const syn=synthesis(state);state.assessment+=(state.assessment?'\n\n':'')+'Síntesis orientativa revisada por el profesional:\n'+[['Apoyo',syn.support],['Lagunas/discordancias',syn.gaps],['Alternativas',syn.alternatives],['Próximos pasos',syn.next]].filter(([,v])=>v.length).map(([l,v])=>l+': '+v.join(' ')).join('\n')+'\nFuente: '+syn.source;
  document.getElementById('f-assessment').value=state.assessment;state.accepted=[];updateDerived();toast('Síntesis incorporada a valoración. La nota se conserva hasta que la actualices.');
 }else if(action==='accept-proposal'){
  const p=therapyProposal(state);if(p.blocked)return;
  if(!confirm('¿Aceptas incorporar esta opción orientativa al plan, tras revisar su justificación, límites y precauciones? No genera una prescripción.'))return;
  state.accepted=[{text:p.text,source:p.source}];updateDerived();toast('Opción aceptada. Actualiza el borrador para incluirla en la nota.');
 }else if(action==='export'){
  if(!confirm('Se descargará un JSON SIN CIFRAR con los datos actuales y la nota. Puede contener información sensible. ¿Quieres exportarlo a un almacenamiento bajo tu control?'))return;
  const url=URL.createObjectURL(new Blob([JSON.stringify({app:'consulta-pediatrica-local',version:1,consultation:state,note},null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='consulta-tdah.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Exportación solicitada. El archivo no tiene cifrado ni caducidad automática.');
 }else if(action==='import'){document.getElementById('import-file').click();
 }else if(action==='apply-transfer'){
  const selection=Object.fromEntries(['goals','drug','measurements'].map(k=>[k,document.getElementById('transfer-'+k).checked]));
  if(!Object.values(selection).some(Boolean)){toast('Selecciona al menos un grupo para trasladar.');return;}
  if(!document.getElementById('same-case').checked){toast('Confirma que los datos corresponden al mismo caso.');return;}
  if(!confirm('Se reemplazarán los grupos seleccionados de esta consulta. No se trasladarán decisiones ni evolución de objetivos. ¿Continuar?'))return;
  applyTransfer(state,previous,selection);previous=null;render();toast('Datos elegidos trasladados. Revisa pauta y mediciones antes de usarlos; actualiza la nota si procede.');
 }else if(action==='cancel-transfer'){readEpoch++;previous=null;document.getElementById('transfer-panel').innerHTML='';
 }else if(action==='reset'){
  if(!confirm('¿Borrar todos los datos y la nota de esta pestaña? Esta acción no borra exportaciones, portapapeles ni copias externas.'))return;
  readEpoch++;state=newState();initialSnapshot=JSON.stringify(state);note='';noteDirty=false;previous=null;render();toast('Consulta reiniciada. Datos de esta pestaña eliminados.');
 }
});
function showTransfer(){document.getElementById('transfer-panel').innerHTML=`<div class="transfer"><h2>Trasladar desde una consulta previa</h2><p>Fecha indicada en el archivo: ${escape(previous.date||'no consta')}. Comprueba el caso fuera de la aplicación.</p><label class="check"><input id="same-case" type="checkbox"> He comprobado que corresponde al mismo caso</label><label class="check"><input id="transfer-goals" type="checkbox"> Reemplazar objetivos (${previous.goals.length}); sin evolución previa</label><label class="check"><input id="transfer-drug" type="checkbox"> Reemplazar tratamiento; revisión clínica pendiente</label><label class="check"><input id="transfer-measurements" type="checkbox"> Reemplazar mediciones previas (${previous.measurements.length}); no modifica la medición actual</label><details><summary>Revisar contenido antes de trasladar</summary><h3>Objetivos</h3>${list(previous.goals.map(g=>g.description+' · basal: '+g.baseline+' · criterio: '+g.criterion))}<h3>Tratamiento</h3>${list(drugFields.filter(([k])=>previous.drug[k]).map(([k,l])=>l+': '+previous.drug[k]))}<h3>Mediciones previas</h3>${list(previous.measurements.map(measurementText))}</details><div class="button-row"><button class="primary" data-action="apply-transfer">Trasladar selección</button><button class="secondary" data-action="cancel-transfer">Cancelar y descartar archivo</button></div></div>`;document.getElementById('same-case').focus();}
window.addEventListener('beforeunload',e=>{if(otalgiaUI.hasData()||feverUI.hasData()||note||JSON.stringify(state)!==initialSnapshot){e.preventDefault();e.returnValue='';}});
render();

function goalsSection(){return section('goals','—','Objetivos funcionales','Situación basal → cambio observable',`<p class="hint">Prioriza problemas medibles. Ejemplo ficticio: «deberes 90 min/día» → «terminar en 60 min con dos recordatorios».</p><div id="goal-list">${goalList()}</div><button class="secondary" data-action="add-goal">+ Añadir objetivo</button>`,true);}

function measurementSection(){return section('measurements','—','Antropometría y constantes','Datos introducidos, cálculo de IMC y evolución',`<div class="fields">${field('measurement.date','Fecha de medición','date')}${field('measurement.weight','Peso (kg)','number')}${field('measurement.height','Talla (cm)','number')}${field('measurement.sbp','TA sistólica (mmHg)','number')}${field('measurement.dbp','TA diastólica (mmHg)','number')}${field('measurement.hr','Frecuencia cardíaca (lpm)','number')}${field('measurement.position','Técnica de talla / longitud','select',[['','No indicada'],['standing','De pie'],['recumbent','Tumbado (longitud)']])}${field('measurement.oedema','Edema presente · para percentiles de peso / IMC','state')}</div><div id="measurement-result" class="derived"></div>${field('constantsReview','Valoración profesional de constantes y evolución','select',[['','No revisadas'],['compatible','Revisadas y compatibles con el plan considerado'],['review','Requieren revisión adicional']])}<p class="hint">No hay clasificación automática de TA o FC. Los avisos de entrada comprueban plausibilidad, no normalidad clínica. Los datos dudosos se conservan para revisar.</p><div class="reference-note"><strong>Referencias de crecimiento</strong><p>OMS 2006: 0 a menos de 60 meses; tablas diarias. OMS 2007: 60–228 meses para talla/IMC y 60–120 meses para peso. Edad en días/30,4375. Método LMS con interpolación mensual y ajuste de colas para peso/IMC. Fuera de rango no se calcula.</p><p>${percentileStatus('hr')}</p><p>Tablas oficiales locales de WorldHealthOrganization/anthro y anthroplus. Cálculo contrastado con ejemplos de esos repositorios; pendiente revisión clínica independiente. Para menores de 2 años: longitud; desde 2 años: talla. Se ajustan 0,7 cm si la técnica difiere, conforme a Anthro. <a href="./docs/PERCENTILES.md" target="_blank" rel="noopener">Método, versiones y pruebas ↗</a>.</p></div><div id="measurement-history"></div>`);}

function questionnaireSection(){return section('questionnaires','—','Cuestionarios por informante','Hasta 2 familiares y 2 docentes · versiones separadas',`<p class="hint">Solo puntuaciones ya calculadas. Los adjuntos Vanderbilt no incluyen instrucciones completas de clasificación. No se calcula diagnóstico ni se puntúan ítems; Conners no está disponible.</p><div id="questionnaire-list">${questionnaireList()}</div><div class="button-row"><button class="secondary" data-action="add-parent">+ Familiar</button><button class="secondary" data-action="add-teacher">+ Docente</button></div><div id="questionnaire-result" class="hint" aria-live="polite"></div>`);}
