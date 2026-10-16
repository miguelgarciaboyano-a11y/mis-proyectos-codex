// Plantilla documental solicitada por el profesional. No diagnostica ni decide el alta.
export const FEVER_SYMPTOMS=[['catarrhal','Síntomas catarrales'],['cough','Tos'],['breathing','Dificultad respiratoria'],['diarrhea','Diarrea'],['vomiting','Vómitos'],['pain','Dolor'],['throat','Odinofagia'],['rash','Exantema'],['urinary','Molestias urinarias'],['earache','Otalgia']];
import {assembleExam} from './fever-exam.js';
export {EXAM} from './fever-exam.js';
export function newFever(){return {days:'',ageMonths:'',symptoms:Object.fromEntries(FEVER_SYMPTOMS.map(([id])=>[id,{present:'no',days:'',count:'',hours:'',location:''}])),contacts:'no',contactWho:'',contactIllness:'',extraHistory:'',examAlterations:'',returnMode:'total3',customReturn:'',adviceText:''};}
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
 return 'Exploración física: '+assembleExam(s.examAlterations,isInfant(s)).text;
}
const sentence=x=>/[.!?]$/.test(x.trim())?x.trim():x.trim()+'.';
const duration=x=>num(x)===null?'':` de ${x} ${Number(x)===1?'día':'días'} de evolución`;
function enumeration(parts,last='y'){
 return parts.length<2?parts.join(''):parts.slice(0,-1).join(', ')+' '+last+' '+parts.at(-1);
}
function ageDescription(months){
 const n=num(months);if(n===null)return '';
 if(n<1)return 'menor de un mes';
 if(n<24)return `${months} ${n===1?'mes':'meses'}`;
 const years=Math.floor(n/12),rest=n%12;
 return `${years} ${years===1?'año':'años'}`+(rest?` y ${Number(rest.toFixed(2))} ${rest===1?'mes':'meses'}`:'');
}
export function feverNote(s){
 const age=ageDescription(s.ageMonths),history=[`${age?'Paciente '+(age.startsWith('menor')?'':'de ')+age+' que consulta':'Consulta'} por fiebre${duration(s.days)}.`],positive=[],negative=[];
 for(const [id,label] of FEVER_SYMPTOMS){
  const x=s.symptoms[id];if(x.present!=='si'){negative.push(label.toLocaleLowerCase('es'));continue;}
  let text=label.toLocaleLowerCase('es');
  if(id==='pain'&&x.location.trim())text+=' localizado en '+x.location.trim();
  text+=duration(x.days);
  const details=[];
  if(['diarrhea','vomiting'].includes(id)&&num(x.count)!==null){
   const unit=id==='diarrhea'?(Number(x.count)===1?'deposición':'deposiciones'):(Number(x.count)===1?'episodio':'episodios');
   details.push(`${x.count} ${unit} en las últimas 24 horas`);
  }
  if(id==='vomiting'&&num(x.hours)!==null)details.push(`último vómito hace ${x.hours} ${Number(x.hours)===1?'hora':'horas'}`);
  if(details.length)text+=' ('+details.join('; ')+')';
  positive.push(text);
 }
 if(positive.length)history.push('Asocia '+enumeration(positive)+'.');
 if(negative.length)history.push((negative.length===1?'No se refiere ':'No se refieren ')+enumeration(negative,'ni')+'.');
 if(s.contacts==='si'){
  const details=[s.contactWho.trim(),s.contactIllness.trim()].filter(Boolean);
  history.push('Se refieren convivientes enfermos'+(details.length?' ('+details.join(': ')+')':'')+'.');
 }else history.push('No se refieren convivientes enfermos.');
 if(s.extraHistory.trim())history.push(sentence(s.extraHistory));
 return 'Anamnesis: '+history.join(' ')+'\n\n'+feverExam(s)+'\n\nPlan y recomendaciones: '+(s.adviceText.trim()||defaultAdvice(s));
}
