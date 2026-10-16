import {newFever,FEVER_SYMPTOMS,EXAM,isInfant,feverWarnings,defaultAdvice,feverNote} from './fever.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createFeverUI(root){
 let s=newFever(),note='',dirty=false,baseline=JSON.stringify(s);
 const get=p=>p.split('.').reduce((o,k)=>o[k],s);
 const field=(path,label,type='text',opts=null)=>{
  const id='fever-'+path.replaceAll('.','-'),v=get(path);
  const control=opts?`<select id="${id}" data-fever-path="${path}">${opts.map(([key,text])=>`<option value="${key}" ${v===key?'selected':''}>${text}</option>`).join('')}</select>`:type==='textarea'?`<textarea rows="2" id="${id}" data-fever-path="${path}" maxlength="10000">${esc(v)}</textarea>`:`<input id="${id}" data-fever-path="${path}" type="${type}" value="${esc(v)}" ${type==='number'?'min="0" step="any" inputmode="decimal"':'maxlength="10000"'}>`;
  return `<div class="field"><label for="${id}">${label}</label>${control}</div>`;
 };
 const yesno=[['no','No'],['si','Sí']];
 const check=(path,label)=>`<label class="check emphasis"><input type="checkbox" data-fever-path="${path}" ${get(path)?'checked':''}>${label}</label>`;
 function status(text){const e=root.querySelector('#status');if(e)e.textContent=text;const n=root.querySelector('#note-status');if(n)n.textContent=text;}
 function render(){root.innerHTML=`
 <aside class="sidebar"><a class="brand" href="#workspace"><span class="brand-icon" aria-hidden="true">✚</span><span>consulta<small>PEDIATRÍA</small></span></a><p class="nav-label">ESPACIO CLÍNICO</p><a class="side-link" href="#workspace" data-module="tdah">◉ TDAH <span class="small-badge">01</span></a><a class="side-link active" aria-current="page" href="#workspace" data-module="fever">◉ Fiebre <span class="small-badge">02</span></a><div class="sidebar-bottom">Procesamiento local<small>Datos solo en memoria.<br>Sin envío de información clínica.</small></div></aside>
 <div class="page"><header class="topbar"><span>Pediatría de atención primaria / <strong>Fiebre</strong></span><span class="prototype">PLANTILLA · REVISIÓN PROFESIONAL</span></header><main id="workspace" tabindex="-1"><div class="page-heading"><div><p class="eyebrow">CUADERNO DE CONSULTA</p><h1>Fiebre</h1><p class="lead">Anamnesis y exploración física. Escribe, revisa y copia tu nota.</p></div><button class="text-button danger" data-fever-action="reset">Reiniciar consulta de fiebre</button></div>
 <div class="notice"><div><strong>Una plantilla para documentar la consulta.</strong> Los «No» iniciales y la exploración normal solo se incorporan tras confirmar su revisión. La nota no decide el alta ni garantiza protección legal.</div></div>
 <div class="consultation-grid"><div class="form-column">
 <section class="section"><div class="section-body"><h2>Anamnesis</h2><div class="fields">${field('days','Fiebre · duración en días','number')}${field('ageMonths','Edad en meses · para FANT y avisos por edad','number')}</div>
 <p class="hint">Marca «Sí» para registrar duración y detalles. Los tres síntomas adicionales son exantema, molestias urinarias y otalgia.</p>
 ${FEVER_SYMPTOMS.map(([id,label])=>`<fieldset class="entry"><legend>${label}</legend>${field('symptoms.'+id+'.present',label,'select',yesno)}<div id="fever-details-${id}" ${s.symptoms[id].present==='si'?'':'hidden'}><div class="fields">${field('symptoms.'+id+'.days','Duración en días','number')}${['diarrhea','vomiting'].includes(id)?field('symptoms.'+id+'.count',id==='diarrhea'?'N.º de deposiciones en las últimas 24 h':'N.º de vómitos en las últimas 24 h','number'):''}${id==='vomiting'?field('symptoms.'+id+'.hours','Horas desde el último vómito','number'):''}${id==='pain'?field('symptoms.'+id+'.location','Localización del dolor'):''}</div></div></fieldset>`).join('')}
 ${field('extraHistory','Otros datos de anamnesis','textarea')}${check('historyReviewed','Anamnesis revisada: confirmo los síntomas y convivientes marcados «No»')}</div></section>
 <details class="section" open><summary><strong>Convivientes enfermos</strong></summary><div class="section-body">${field('contacts','Convivientes enfermos','select',yesno)}<div id="fever-contact-details" ${s.contacts==='si'?'':'hidden'}><div class="fields">${field('contactWho','Quién · relación, sin nombre')}${field('contactIllness','Qué tiene')}</div></div></div></details>
 <section class="section"><div class="section-body"><h2>Exploración física</h2><p class="hint">Escribe únicamente lo que está alterado en su apartado: sustituirá la frase normal completa de ese apartado. Deja el resto vacío y confirma la exploración realizada. No se interpreta texto libre con IA.</p>
 ${EXAM.map(([id,label,normal])=>`<div ${id==='fontanelle'?'id="fever-fontanelle"':''} ${id==='fontanelle'&&!isInfant(s)?'hidden':''}>${field('exam.'+id,label+' · escribir solo alteraciones','textarea')}<p class="hint">Plantilla si está normal y revisado: ${normal}</p></div>`).join('')}
 ${check('examReviewed','He realizado y revisado la exploración; confirmo normales los apartados sin alteraciones escritas')}</div></section>
 <section class="section"><div class="section-body"><h2>Información y seguimiento</h2><p class="hint">Propuesta editable en dos líneas. Confirma que se ha explicado a la familia y adapta el plazo al caso. No sustituye la valoración clínica.</p>
 ${field('returnMode','Plazo propuesto de reconsulta','select',[['total3','Si alcanza 3 días de fiebre en total'],['extra2','Si persiste 2 días más'],['custom','Plazo individualizado']])}<div id="fever-custom-return" ${s.returnMode==='custom'?'':'hidden'}>${field('customReturn','Plazo y condiciones individualizados','textarea')}</div>
 <div id="fever-advice-preview" class="reference-note"></div>${field('adviceText','Consejos personalizados · opcional, sustituye las dos líneas propuestas','textarea')}${check('adviceReviewed','He revisado estos consejos y el plazo de reconsulta y los he explicado a la familia')}
 <p class="hint">Ante fiebre de 3 días o más se propone reevaluar hoy, y no esperar automáticamente otros dos días. En menores de 3 meses con fiebre ≥38 °C se indica valoración urgente. El texto personalizado exige tu revisión.</p><div id="fever-warnings" role="status" aria-live="polite"></div></div></section>
 <details class="privacy" id="privacy"><summary>Privacidad y límites</summary><p>Datos y nota solo en memoria de esta pestaña. Cambiar entre TDAH y Fiebre conserva ambas consultas; recargar o cerrar las pierde. Reiniciar fiebre solo borra esta consulta. Copiar conserva texto en el portapapeles hasta que lo sustituyas. Sin exportación, almacenamiento persistente, IA ni envío de datos clínicos.</p><p>Exploración basada en la plantilla proporcionada por el profesional, no en una exploración efectuada por la aplicación. Consejos orientativos que deben individualizarse; no certifican la idoneidad del alta ni ofrecen garantía legal.</p></details>
 </div><aside class="note-panel"><div class="note-header"><span class="eyebrow">DOCUMENTACIÓN</span><span class="pill">TEXTO EDITABLE</span></div><h2>Nota clínica · Fiebre</h2><p>Actualiza el borrador con los datos revisados. Tus cambios manuales se conservan hasta que aceptes reemplazarlos.</p><div class="note-actions"><button class="primary" data-fever-action="generate">Generar / actualizar borrador</button></div><label class="sr-only" for="fever-note">Nota clínica de fiebre editable</label><textarea id="fever-note" placeholder="Genera un borrador y revisa el texto antes de copiarlo." spellcheck="false">${esc(note)}</textarea><div class="note-footer"><span id="note-status">${dirty?'Ediciones manuales conservadas':note?'Borrador generado · revisar':'Aún sin generar'}</span><button class="secondary" data-fever-action="copy">Copiar texto</button></div></aside></div></main></div><p class="sr-only" id="status" role="status" aria-live="polite"></p>`;update();}
 function update(){
  root.querySelector('#fever-advice-preview').textContent=defaultAdvice(s);
  root.querySelector('#fever-warnings').innerHTML=feverWarnings(s).map(t=>'<p class="hint">'+esc(t)+'</p>').join('');
  root.querySelector('#fever-fontanelle').hidden=!isInfant(s);
 }
 root.addEventListener('input',e=>{
  if(root.dataset.module!=='fever')return;
  if(e.target.id==='fever-note'){note=e.target.value;dirty=true;status('Ediciones manuales conservadas');return;}
  const path=e.target.dataset.feverPath;if(!path)return;
  const keys=path.split('.');let o=s;for(const k of keys.slice(0,-1))o=o[k];o[keys.at(-1)]=e.target.type==='checkbox'?e.target.checked:e.target.value;
  const revoke=key=>{s[key]=false;root.querySelector(`[data-fever-path="${key}"]`).checked=false;};
  if(path.startsWith('symptoms.')||['contacts','contactWho','contactIllness'].includes(path))revoke('historyReviewed');
  if(path.startsWith('exam.')||path==='ageMonths')revoke('examReviewed');
  if(['days','ageMonths','returnMode','customReturn','adviceText'].includes(path))revoke('adviceReviewed');
  if(path.endsWith('.present'))root.querySelector('#fever-details-'+keys[1]).hidden=e.target.value!=='si';
  if(path==='contacts')root.querySelector('#fever-contact-details').hidden=s.contacts!=='si';
  if(path==='returnMode')root.querySelector('#fever-custom-return').hidden=s.returnMode!=='custom';
  update();if(note)status('Formulario modificado · nota conservada, pendiente de actualizar');
 });
 root.addEventListener('click',async e=>{
  if(root.dataset.module!=='fever')return;
  const action=e.target.closest('[data-fever-action]')?.dataset.feverAction;if(!action)return;
  if(action==='generate'){
   if(dirty&&!confirm('¿Reemplazar tus ediciones manuales por un nuevo borrador? Cancelar conserva tus cambios.'))return;
   note=feverNote(s);dirty=false;root.querySelector('#fever-note').value=note;status('Borrador actualizado · revisar antes de copiar');
  }else if(action==='copy'){
   if(!note.trim()){status('Genera o escribe una nota antes de copiar.');return;}
   try{await navigator.clipboard.writeText(note);status('Nota copiada como texto sencillo.');}
   catch{const el=root.querySelector('#fever-note');el.focus();el.select();status('Texto seleccionado: pulsa Ctrl+C o ⌘C para copiar.');}
  }else if(action==='reset'&&confirm('¿Borrar los datos y la nota de fiebre de esta pestaña? No borra el portapapeles ni la consulta TDAH.')){
   s=newFever();baseline=JSON.stringify(s);note='';dirty=false;render();status('Consulta de fiebre reiniciada.');
  }
 });
 return {render,hasData:()=>!!note||JSON.stringify(s)!==baseline};
}
