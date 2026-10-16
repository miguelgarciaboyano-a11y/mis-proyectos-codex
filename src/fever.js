// Plantilla documental solicitada por el profesional. No diagnostica ni decide el alta.
export const FEVER_SYMPTOMS=[['catarrhal','Síntomas catarrales'],['cough','Tos'],['breathing','Dificultad respiratoria'],['diarrhea','Diarrea'],['vomiting','Vómitos'],['pain','Dolor'],['throat','Odinofagia'],['rash','Exantema'],['urinary','Molestias urinarias'],['earache','Otalgia']];
import {buildSummary} from './note-summary.js';
export function newFever(){return {days:'',ageMonths:'',symptoms:Object.fromEntries(FEVER_SYMPTOMS.map(([id])=>[id,{present:'',days:'',count:'',hours:'',location:''}])),contacts:'',contactWho:'',contactIllness:'',extraHistory:'',examAlterations:'',returnMode:'total3',customReturn:'',adviceText:'',relevantHistory:'',tests:'',assessment:'',plan:'',pending:''};}
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
  if(['diarrhea','vomiting'].includes(id)&&x.count!==''&&x.count!=null&&(num(x.count)===null||!Number.isInteger(Number(x.count))))warnings.push(label+': el número en 24 horas debe ser un entero no negativo.');
  if(id==='vomiting'&&x.hours!==''&&x.hours!=null&&num(x.hours)===null)warnings.push('Vómitos: revisar horas desde el último episodio.');
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
export function feverExam(s){return feverSummary(s).text.split('\n').find(line=>line.startsWith('Exploración:'));}
const duration=x=>num(x)===null?'':` de ${x} ${Number(x)===1?'día':'días'} de evolución`;
export function feverSummary(s){
 const history=[],pending=[];
 if(s.ageMonths!=='')history.push({text:'Edad: '+s.ageMonths+' meses',priority:70});
 const negative=[];
 for(const [id,label] of FEVER_SYMPTOMS){
  const x=s.symptoms[id];
  if(x.present==='no'){negative.push(label.toLocaleLowerCase('es'));continue;}
  if(x.present!=='si')continue;
  let text=label+duration(x.days);
  const details=[];
  if(id==='pain'&&x.location?.trim())details.push('localización: '+x.location.trim());
  if(['diarrhea','vomiting'].includes(id)&&x.count!==''&&x.count!=null)details.push(`${x.count} ${id==='diarrhea'?'deposiciones':'vómitos'} en las últimas 24 horas`);
  if(id==='vomiting'&&x.hours!==''&&x.hours!=null)details.push(`último vómito hace ${x.hours} horas`);
  if(details.length)text+=' ('+details.join('; ')+')';
  history.push({text,priority:id==='breathing'?100:75});
  if(!x.days&&x.days!==0)pending.push('Duración de '+label.toLocaleLowerCase('es')+' no aportada');
 }
 if(negative.length)history.push({text:(negative.length===1?'No se refiere ':'No se refieren ')+negative.join(', '),priority:55});
 if(s.contacts==='si')history.push({text:'Convivientes enfermos'+([s.contactWho.trim(),s.contactIllness.trim()].some(Boolean)?': '+[s.contactWho.trim(),s.contactIllness.trim()].filter(Boolean).join('; '):''),priority:60});
 else if(s.contacts==='no')history.push({text:'No se refieren convivientes enfermos',priority:55});
 if(s.extraHistory.trim())history.push({text:s.extraHistory,priority:85});
 if(s.pending?.trim())pending.unshift(s.pending);
 if(!s.examAlterations.trim())pending.push('Exploración no aportada');
 if(!s.assessment?.trim())pending.push('Valoración no aportada');
 if(!s.plan?.trim()&&!s.adviceText.trim())pending.push('Plan no aportado');
 return buildSummary([
  [{text:'Fiebre'+duration(s.days),priority:100}],history,
  [s.relevantHistory],[{text:s.examAlterations,priority:100}],[s.tests],
  [{text:s.assessment,priority:100}],
  [{text:s.plan,priority:100},{text:s.adviceText,priority:95}],pending
 ]);
}
export function feverNote(s){return feverSummary(s).text;}
