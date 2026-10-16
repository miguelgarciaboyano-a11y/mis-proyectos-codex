// Plantilla documental solicitada por el profesional. No diagnostica ni decide el alta.
export const FEVER_SYMPTOMS=[['catarrhal','Síntomas catarrales'],['cough','Tos'],['breathing','Dificultad respiratoria'],['diarrhea','Diarrea'],['vomiting','Vómitos'],['pain','Dolor'],['throat','Odinofagia'],['rash','Exantema'],['urinary','Molestias urinarias'],['earache','Otalgia']];
export const EXAM=[
 ['general','Estado general, color y tono','BEG, buen color, buen tono.'],
 ['hydration','Nutrición e hidratación','Bien nutrido e hidratado.'],
 ['skin','Piel','No lesiones cutáneas.'],
 ['cardiac','Auscultación cardíaca','AC rítmica, sin soplos.'],
 ['respiratory','Auscultación pulmonar','AP: BVB, sin ruidos sobreañadidos.'],
 ['abdomen','Abdomen','Abdomen blando, depresible, no doloroso, no masas ni megalias, ni signos de irritación peritoneal.'],
 ['orl','ORL','ORL normal.'],['ears','Oídos','Oídos normales.'],
 ['neuro','Cuello y signos meníngeos','No rigidez nucal, meníngeos negativos.'],['fontanelle','Fontanela (<12 meses)','FANT.']
];
export function newFever(){return {days:'',ageMonths:'',symptoms:Object.fromEntries(FEVER_SYMPTOMS.map(([id])=>[id,{present:'no',days:'',count:'',hours:'',location:''}])),historyReviewed:false,contacts:'no',contactWho:'',contactIllness:'',extraHistory:'',examReviewed:false,exam:Object.fromEntries(EXAM.map(([id])=>[id,''])),adviceReviewed:false,returnMode:'total3',customReturn:'',adviceText:''};}
const num=x=>x!==''&&x!=null&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
export function isInfant(s){const a=num(s.ageMonths);return a!==null&&a<12;}
export function feverWarnings(s){
 const warnings=[];const age=num(s.ageMonths),days=num(s.days);
 if(s.ageMonths!==''&&age===null)warnings.push('Revisar edad: usar meses, valor no negativo.');
 if(s.days!==''&&days===null)warnings.push('Revisar duración de la fiebre: días no negativos.');
 if(age!==null&&age<3)warnings.push('Menor de 3 meses: fiebre ≥38 °C requiere valoración urgente. Esta plantilla no determina idoneidad del alta.');
 if(days!==null&&days>=3)warnings.push('Fiebre de 3 días o más: requiere reevaluar su persistencia; no aplazar automáticamente otros dos días.');
 for(const [id,label] of FEVER_SYMPTOMS){const x=s.symptoms[id];if(x.present!=='si')continue;
  if(x.days!==''&&num(x.days)===null)warnings.push(label+': revisar duración en días.');
  if(['diarrhea','vomiting'].includes(id)&&x.count!==''&&(num(x.count)===null||!Number.isInteger(Number(x.count))))warnings.push(label+': el número en 24 horas debe ser un entero no negativo.');
  if(id==='vomiting'&&x.hours!==''&&num(x.hours)===null)warnings.push('Vómitos: revisar horas desde el último episodio.');
 }
 return warnings;
}
export function defaultAdvice(s){
 let next='Reconsultar si la fiebre alcanza 3 días desde su inicio, antes si empeora.';
 if(s.returnMode==='extra2')next='Reconsultar si persiste la fiebre en 48 horas, antes si empeora.';
 if(s.returnMode==='custom')next=s.customReturn.trim()||'Plazo de reconsulta pendiente de concretar por el profesional.';
 if(num(s.days)!==null&&Number(s.days)>=3)next='Reevaluar hoy la persistencia de fiebre de 3 días o más y concretar seguimiento según valoración clínica.';
 if(num(s.ageMonths)!==null&&Number(s.ageMonths)<3)next='Menor de 3 meses: ante fiebre ≥38 °C, valoración urgente; no aplicar un plazo de espera domiciliaria.';
 return 'Se explican signos de alarma: mal estado general, dificultad respiratoria, somnolencia anormal, lesiones que no desaparecen a la presión o signos de deshidratación; acudir de inmediato si aparecen.\n'+next;
}
export function feverExam(s){
 if(!s.examReviewed){
  const entered=EXAM.filter(([id])=>s.exam[id].trim());
  return 'Exploración física: plantilla normal pendiente de revisión.'+(entered.length?'\nHallazgos introducidos: '+entered.map(([id,label])=>label+': '+s.exam[id].trim()).join('; '):'');
 }
 return 'Exploración física: '+EXAM.flatMap(([id,,normal])=>{
  if(id==='fontanelle'&&!isInfant(s))return s.exam[id].trim()?['Fontanela (edad no aplicable o pendiente de revisar): '+s.exam[id].trim()]:[];
  return [s.exam[id].trim()||normal];
 }).join(' ');
}
export function feverNote(s){
 const lines=['FIEBRE','ANAMNESIS',s.days!==''?`Fiebre de ${s.days} días de evolución.`:'Fiebre; duración pendiente.'];
 if(s.ageMonths!=='')lines.push(`Edad: ${s.ageMonths} meses.`);
 const no=[];
 for(const [id,label] of FEVER_SYMPTOMS){const x=s.symptoms[id];if(x.present!=='si'){if(s.historyReviewed)no.push(label.toLocaleLowerCase('es'));continue;}
  let text=label+': sí; '+(x.days!==''?x.days+' días de evolución':'duración pendiente');
  if(['diarrhea','vomiting'].includes(id))text+='; '+(x.count!==''?x.count:'número pendiente de')+(id==='diarrhea'?' deposiciones':' vómitos')+' en las últimas 24 horas';
  if(id==='vomiting')text+='; '+(x.hours!==''?x.hours+' horas desde el último vómito':'horas desde el último vómito pendientes');
  if(id==='pain')text+='; localización: '+(x.location.trim()||'pendiente');
  lines.push(text+'.');
 }
 if(no.length)lines.push('No refiere '+no.join(', ')+'.');
 if(!s.historyReviewed)lines.push('Negativas de síntomas y convivientes pendientes de confirmar; los «No» iniciales no se consideran revisados.');
 if(s.contacts==='si')lines.push('Convivientes enfermos: '+(s.contactWho.trim()||'quién: pendiente')+'; cuadro: '+(s.contactIllness.trim()||'pendiente')+'.');
 else if(s.historyReviewed)lines.push('No refiere convivientes enfermos.');
 if(s.extraHistory.trim())lines.push(s.extraHistory.trim());
 lines.push('',feverExam(s),'','INFORMACIÓN Y SEGUIMIENTO');
 lines.push(s.adviceReviewed?(s.adviceText.trim()||defaultAdvice(s)):'Consejos y plazo de reconsulta pendientes de revisión y explicación a la familia.');
 return lines.join('\n');
}
