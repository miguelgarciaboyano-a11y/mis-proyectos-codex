import {newFever,FEVER_SYMPTOMS,EXAM,feverWarnings,defaultAdvice,feverNote} from './fever.js';
import {interpretExam} from './fever-exam.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createFeverUI(root){
 let s=newFever(),note='',dirty=false,baseline=JSON.stringify(s);
 const get=p=>p.split('.').reduce((o,k)=>o[k],s);
 const field=(path,label,type='text',opts=null,compact=false)=>{
  const id='fever-'+path.replaceAll('.','-'),v=get(path);
  const control=opts?`<select id="${id}" data-fever-path="${path}">${opts.map(([key,text])=>`<option value="${key}" ${v===key?'selected':''}>${text}</option>`).join('')}</select>`:type==='textarea'?`<textarea rows="3" id="${id}" data-fever-path="${path}" maxlength="10000">${esc(v)}</textarea>`:`<input id="${id}" data-fever-path="${path}" type="${type}" value="${esc(v)}" ${type==='number'?'min="0" step="any" inputmode="decimal" '+(path.endsWith('days')?' placeholder="Días"':''):'maxlength="10000"'}>`;
  return `<div class="field${compact?' compact-field':''}"><label ${compact?'class="sr-only"':''} for="${id}">${label}</label>${control}</div>`;
 };
 const yesno=[['no','No'],['si','Sí']];
 function status(text){const e=root.querySelector('#status');if(e)e.textContent=text;const n=root.querySelector('#note-status');if(n)n.textContent=text;}
 function render(){root.innerHTML=`
 <aside class="sidebar"><a class="brand" href="#workspace"><span class="brand-icon" aria-hidden="true">✚</span><span>consulta<small>PEDIATRÍA</small></span></a><p class="nav-label">ESPACIO CLÍNICO</p><a class="side-link" href="#workspace" data-module="tdah">◉ TDAH <span class="small-badge">01</span></a><a class="side-link active" aria-current="page" href="#workspace" data-module="fever">◉ Fiebre <span class="small-badge">02</span></a><div class="sidebar-bottom">Procesamiento local<small>Datos solo en memoria.<br>Sin envío de información clínica.</small></div></aside>
 <div class="page"><header class="topbar"><span>Pediatría de atención primaria / <strong>Fiebre</strong></span><span class="prototype">PLANTILLA · REVISIÓN PROFESIONAL</span></header><main class="fever-workspace" id="workspace" tabindex="-1"><div class="page-heading"><div><p class="eyebrow">CUADERNO DE CONSULTA</p><h1>Fiebre</h1><p class="lead">Registro breve y nota clínica lista para revisar.</p></div><button class="text-button danger" data-fever-action="reset">Reiniciar consulta de fiebre</button></div>
 <div class="notice"><div>La nota utiliza los «No» y la exploración normal por defecto. Revisa que refleje la consulta y los consejos realmente explicados antes de copiarla.</div></div>
 <div class="consultation-grid"><div class="form-column">
 <section class="section"><div class="section-body"><h2>Anamnesis</h2><div class="fields fever-basics">${field('days','Fiebre · duración en días','number')}${field('ageMonths','Edad en meses','number')}</div>
 <p class="hint fever-symptom-hint">Síntomas asociados · marca «Sí» y añade los días de evolución.</p>
 <div class="fever-symptom-grid">${FEVER_SYMPTOMS.map(([id,label])=>`<div class="fever-symptom" data-symptom="${id}"><div class="fever-symptom-row"><label class="fever-symptom-name" for="fever-symptoms-${id}-present">${label}</label>${field('symptoms.'+id+'.present',label,'select',yesno,true)}<div id="fever-duration-${id}" ${s.symptoms[id].present==='si'?'':'hidden'}>${field('symptoms.'+id+'.days',label+' · días de evolución','number',null,true)}</div></div>
 ${['diarrhea','vomiting','pain'].includes(id)?`<div class="fever-extra" id="fever-details-${id}" ${s.symptoms[id].present==='si'?'':'hidden'}>${['diarrhea','vomiting'].includes(id)?field('symptoms.'+id+'.count',id==='diarrhea'?'Deposiciones en las últimas 24 h':'Vómitos en las últimas 24 h','number'):''}${id==='vomiting'?field('symptoms.'+id+'.hours','Horas desde el último vómito','number'):''}${id==='pain'?field('symptoms.'+id+'.location','Localización del dolor'):''}</div>`:''}</div>`).join('')}</div>
 <div class="fever-contacts">${field('contacts','Convivientes enfermos','select',yesno)}<div id="fever-contact-details" ${s.contacts==='si'?'':'hidden'}><div class="fields">${field('contactWho','Quién · relación, sin nombre')}${field('contactIllness','Qué tiene')}</div></div></div>
 <details class="subdetails"><summary>Otros datos de anamnesis</summary>${field('extraHistory','Información adicional','textarea')}</details></div></section>
 <section class="section"><div class="section-body"><h2>Exploración física</h2><p class="hint">Escribe solo lo alterado, por ejemplo: «AP: sibilancias bilaterales. Oídos: tímpano derecho abombado». Se sustituyen las frases de esos apartados y se conserva el resto de la plantilla.</p>
 ${field('examAlterations','Alteraciones de la exploración física','textarea')}<div id="fever-exam-interpretation" class="hint" role="status" aria-live="polite"></div>
 <details class="subdetails"><summary>Ver plantilla normal de referencia</summary><p class="hint">${EXAM.filter(([id])=>id!=='fontanelle').map(([, ,normal])=>normal).join(' ')} FANT si consta edad menor de 12 meses.</p></details></div></section>
 <details class="section"><summary><strong>Información y seguimiento</strong></summary><div class="section-body"><p class="hint">El texto final se añade por defecto; puedes adaptar el plazo y la redacción a la consulta.</p>
 ${field('returnMode','Plazo de reconsulta','select',[['total3','Si alcanza 3 días de fiebre en total'],['extra2','Si persiste 2 días más'],['custom','Plazo individualizado']])}<div id="fever-custom-return" ${s.returnMode==='custom'?'':'hidden'}>${field('customReturn','Plazo y condiciones individualizados','textarea')}</div>
 <div id="fever-advice-preview" class="reference-note"></div>${field('adviceText','Consejos personalizados · sustituye el texto propuesto','textarea')}
 </div></details><div id="fever-warnings" role="status" aria-live="polite"></div>
 <details class="privacy" id="privacy"><summary>Privacidad y límites</summary><p>Datos y nota solo en memoria de esta pestaña. Cambiar de apartado conserva ambas consultas; recargar o cerrar las pierde. Reiniciar fiebre solo borra esta consulta. Sin almacenamiento persistente, IA ni envío de datos clínicos.</p><p>La exploración usa reglas locales para reconocer órganos y términos frecuentes; no comprende cualquier texto. Si una frase no puede asignarse con seguridad, se conserva y se retira la plantilla normal automática de toda la exploración para evitar contradicciones. No se deducen hallazgos ni se decide el alta. Revisa el resultado antes de copiarlo.</p></details>
 </div><aside class="note-panel"><div class="note-header"><span class="eyebrow">DOCUMENTACIÓN</span><span class="pill">TEXTO EDITABLE</span></div><h2>Nota clínica · Fiebre</h2><p>Anamnesis, exploración y recomendaciones en un texto clínico estructurado.</p><div class="note-actions"><button class="primary" data-fever-action="generate">Generar / actualizar nota</button></div><label class="sr-only" for="fever-note">Nota clínica de fiebre editable</label><textarea id="fever-note" placeholder="Genera la nota y revisa el texto antes de copiarlo." spellcheck="false">${esc(note)}</textarea><div class="note-footer"><span id="note-status">${dirty?'Ediciones manuales conservadas':note?'Nota generada · revisar':'Aún sin generar'}</span><button class="secondary" data-fever-action="copy">Copiar texto</button></div></aside></div></main></div><p class="sr-only" id="status" role="status" aria-live="polite"></p>`;update();}
 function update(){
  root.querySelector('#fever-advice-preview').textContent=defaultAdvice(s);
  root.querySelector('#fever-warnings').innerHTML=feverWarnings(s).map(t=>'<p class="hint">'+esc(t)+'</p>').join('');
  const parsed=interpretExam(s.examAlterations),names=parsed.affected.map(id=>EXAM.find(([key])=>key===id)[1]);
  root.querySelector('#fever-exam-interpretation').textContent=parsed.conservative?'Texto no asignado con seguridad: «'+parsed.unknown.join(' / ')+'». Se conserva lo escrito y se omite la plantilla normal de toda la exploración. Puedes precisar el órgano en este mismo cuadro.':names.length?'Se sustituyen: '+names.join(', ')+'. El resto conserva la plantilla normal.':parsed.assignments.length?'Se incorporan los hallazgos adicionales y se conserva la plantilla normal.':'Sin alteraciones escritas: se utilizará la plantilla normal.';
 }
 root.addEventListener('input',e=>{
  if(root.dataset.module!=='fever')return;
  if(e.target.id==='fever-note'){note=e.target.value;dirty=true;status('Ediciones manuales conservadas');return;}
  const path=e.target.dataset.feverPath;if(!path)return;
  const keys=path.split('.');let o=s;for(const k of keys.slice(0,-1))o=o[k];o[keys.at(-1)]=e.target.value;
  if(path.endsWith('.present')){
   root.querySelector('#fever-duration-'+keys[1]).hidden=e.target.value!=='si';
   const details=root.querySelector('#fever-details-'+keys[1]);if(details)details.hidden=e.target.value!=='si';
  }
  if(path==='contacts')root.querySelector('#fever-contact-details').hidden=s.contacts!=='si';
  if(path==='returnMode')root.querySelector('#fever-custom-return').hidden=s.returnMode!=='custom';
  update();if(note)status('Formulario modificado · nota conservada, pendiente de actualizar');
 });
 root.addEventListener('click',async e=>{
  if(root.dataset.module!=='fever')return;
  const action=e.target.closest('[data-fever-action]')?.dataset.feverAction;if(!action)return;
  if(action==='generate'){
   if(dirty&&!confirm('¿Reemplazar tus ediciones manuales por una nueva nota? Cancelar conserva tus cambios.'))return;
   note=feverNote(s);dirty=false;root.querySelector('#fever-note').value=note;status('Nota actualizada · revisar antes de copiar');
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
