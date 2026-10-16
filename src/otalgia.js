import {buildSummary} from './note-summary.js';
export const OTALGIA_SIGNS=[['discharge','Otorrea'],['fever','Fiebre'],['cold','Síntomas catarrales'],['antibiotic','Antibiótico en los últimos 7 días'],['recurrent','Otitis de repetición'],['pool','Acude a piscina']];
export const INFANT_SIGNS=[['irritable','Irritabilidad'],['feeding','Rechazo de tomas'],['sleep','Sueño interrumpido'],['head','Autogolpes sobre el cráneo']];
export const EAR_SIGNS=[['tragus','Trago positivo'],['canal','CAE eritematoso'],['edema','CAE edematoso'],['discharge','Otorrea'],['red','Tímpano hiperémico no abombado'],['bulging','Tímpano hiperémico y abombado']];
export const RISKS=[['severe','Otalgia muy intensa'],['family','Familiares de primer grado con secuelas óticas por OMA'],['hearing','Hipoacusia previa'],['craniofacial','Anomalía craneofacial'],['relapse','OMA recidivante (>7 días tras finalizar tratamiento)'],['persistent','OMA persistente (≤7 días tras finalizar tratamiento)'],['failure','Sin mejoría tras 48–72 h de antibiótico'],['intolerance','Intolerancia que impide la vía oral'],['immune','Inmunodepresión'],['severeImmune','Inmunodepresión grave'],['implant','Implante coclear'],['recentImplant','Implante en primeros 3–6 meses o con malformación/fístula'],['tubes','Tubos de timpanostomía'],['conjunctivitis','Conjuntivitis purulenta'],['amoxi30','Amoxicilina en el último mes'],['unvaccinated','Vacunación incompleta frente a neumococo'],['mastoid','Sospecha de mastoiditis u otra complicación'],['unwell','Afectación del estado general'],['allergy','Alergia a amoxicilina/penicilinas']];
const ear=()=>({status:'',tragus:false,canal:false,edema:false,discharge:false,red:false,bulging:false});
export function newOtalgia(){return {years:'',months:'',weight:'',side:'',pain:'',days:'',temperature:'',feverDays:'',coldDays:'',antibioticName:'',antibioticDose:'',episodes12:'',episodes6:'',analgesia48:false,allergyMild:false,allergySevere:false,signs:Object.fromEntries([...OTALGIA_SIGNS,...INFANT_SIGNS].map(([k])=>[k,false])),risks:Object.fromEntries(RISKS.map(([k])=>[k,false])),right:ear(),left:ear()};}
const numeric=x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
const positive=x=>numeric(x)!==null&&Number(x)>0;
export function ageMonths(s){const y=numeric(s.years);if(y===null)return null;if(y<2){const m=numeric(s.months);return Number.isInteger(m)&&m<24&&Math.floor(m/12)===Math.floor(y)?m:null;}return y*12;}
export function recurrentOtitis(s){const a=numeric(s.episodes6),b=numeric(s.episodes12);return s.signs.recurrent&&((a!==null&&a>=3)||(b!==null&&b>=4&&a!==null&&a>=1));}
function earEvidence(s,k){const e=s[k].status==='unseen'?{...s[k],red:false,bulging:false}:s[k],age=ageMonths(s),lateral=s.side==='bilateral'||s.side===k;
 const pain=lateral&&(s.pain==='si'||(age!==null&&age<24&&INFANT_SIGNS.some(([id])=>s.signs[id])));
 if(!e.status)return {kind:'unknown'};
 if(e.status==='normal')return {kind:'none'};
 const external=e.canal&&(e.edema||e.tragus);
 if(external&&e.bulging)return {kind:'mixed'};
 if(external)return {kind:'oe'};
 // Abombado e hiperémico recoge inflamación y derrame; otalgia completa los tres criterios.
 if(pain&&e.bulging)return {kind:'oma'};
 const effusion=e.bulging||e.discharge||(lateral&&s.signs.discharge);
 if((pain&&e.red)||(effusion&&(pain||s.signs.cold||s.signs.fever||e.red))||(e.status==='unseen'&&pain&&(s.signs.cold||s.signs.fever))){
  const upgrade=s.signs.cold&&((age!==null&&age<6)||recurrentOtitis(s)||s.risks.relapse||s.risks.family);
  return {kind:upgrade?'omaRisk':'probable'};
 }
 return {kind:effusion?'probable':'none'};
}
const fmt=n=>Number(n.toFixed(2)).toLocaleString('es-ES',{maximumFractionDigits:2,useGrouping:false});
export function oralDose(weight,clav=false){if(!positive(weight))return null;const daily=Math.min(Number(weight)*80,3000),concentration=clav?100:50,ml=Math.round(daily/3/concentration*100)/100;
 // Redondeo descendente al alcanzar el máximo para que el volumen no lo exceda.
 const volume=ml*concentration*3>3000?Math.floor(daily/3/concentration*100)/100:ml;
 return {daily,mgPerDose:daily/3,ml:volume,concentration,actualDaily:volume*concentration*3};}
const sideLabel=e=>e.side==='right'?'derecha':'izquierda';
export function otalgiaProposal(s){
 const age=ageMonths(s),weight=numeric(s.weight),warnings=[],plan=[],evidence=['right','left'].map(k=>({side:k,...earEvidence(s,k)}));
 const omaKinds=['oma','omaRisk','probable'],omas=evidence.filter(e=>omaKinds.includes(e.kind)),oes=evidence.filter(e=>e.kind==='oe'),oma=omas.length>0,oe=oes.length>0,recurrent=recurrentOtitis(s);
 const diagnoses=evidence.filter(e=>['oma','omaRisk','probable','oe','mixed'].includes(e.kind)).map(e=>({oma:'Otitis media aguda '+sideLabel(e)+' confirmada por criterios clínico-otoscópicos',omaRisk:'Otitis media aguda '+sideLabel(e)+' probable, equiparada a confirmada a efectos terapéuticos por factores de riesgo',probable:'Otitis media aguda '+sideLabel(e)+' probable',oe:'Otitis externa '+sideLabel(e),mixed:'Posible OMA y otitis externa concomitantes '+sideLabel(e)+'; requiere valoración individual'}[e.kind]));
 if(!diagnoses.length)diagnoses.push('Otalgia de etiología no establecida con los datos registrados');
 if(age===null)warnings.push('Completar edad: años y, si <2 años, meses totales coherentes (0–23).');
 if(!positive(s.weight))warnings.push('Peso pendiente o no válido: no se puede calcular tratamiento por peso.');
 if(!s.side||!s.pain||!positive(s.days))warnings.push('Completar localización, otalgia y duración de síntomas.');
 if(s.signs.fever&&!positive(s.temperature))warnings.push('Temperatura máxima pendiente.');
 if(s.signs.recurrent&&!recurrent)warnings.push('Confirmar recurrencia: ≥3 OMA/6 meses o ≥4/12 meses con ≥1/6 meses.');
 const urgent=(age!==null&&age<1)||s.risks.unwell||s.risks.mastoid||s.risks.severeImmune||s.risks.recentImplant;
 const mixed=evidence.some(e=>e.kind==='mixed'),special=s.risks.implant||s.risks.immune||s.risks.intolerance||s.risks.failure||s.risks.persistent||mixed;
 if(urgent)plan.push('Valoración hospitalaria prioritaria por criterios de ingreso o posible complicación.');
 if(s.risks.implant&&!urgent)plan.push('Consultar con ORL por implante coclear; valorar ingreso según fecha del implante, malformación/fístula y evolución.');
 if(s.risks.immune&&!urgent)plan.push('Individualizar manejo de la inmunodepresión; si grave, valoración hospitalaria.');
 if(mixed)plan.push('Reevaluar posible afectación concomitante antes de seleccionar tratamiento.');
 const severe=s.risks.severe||(s.signs.fever&&numeric(s.temperature)>39)||s.signs.discharge||s.right.discharge||s.left.discharge||omas.length===2;
 const risk=s.risks.family||recurrent||s.risks.hearing||s.risks.craniofacial||s.risks.immune||s.risks.implant;
 const duration=(age!==null&&age<6)||severe||risk||s.risks.persistent?10:age!==null&&age<24?7:age!==null&&age>60?5:7;
 const addOral=(clav,days,conditional=false)=>{
  if(s.risks.allergy){
   if(s.allergyMild&&!s.allergySevere&&weight>0){const mg=Math.min(weight*30/2,500);plan.push(`${conditional?'Si no mejora: ':''}cefuroxima-axetilo ${fmt(mg)} mg por vía oral cada 12 h durante ${days} días (máximo 1 g/día).`);}
   else if(s.allergySevere&&!s.allergyMild&&weight>0){const mg=Math.min(weight*15/2,500);plan.push(`${conditional?'Si no mejora: ':''}claritromicina ${fmt(mg)} mg por vía oral cada 12 h durante ${days} días (máximo 1 g/día); comprobar interacciones y adecuación clínica.`);}
   else warnings.push('Alergia seleccionada: precisar tipo antes de calcular alternativa.');return;
  }
  const d=oralDose(s.weight,clav);if(!d)return;
  plan.push(`${conditional?'Si no mejora en el plazo indicado, iniciar':'Iniciar'} ${clav?'amoxicilina-clavulánico':'amoxicilina'} ${d.concentration} mg/mL: ${fmt(d.ml)} mL (${fmt(d.ml*d.concentration)} mg de amoxicilina) por vía oral cada 8 h durante ${days} días${clav?'; verificar proporción de clavulanato de la presentación':''}.`);
 };
 const prior=s.antibioticName.toLowerCase(),priorClav=/clav|augment|clav[uú]/.test(prior),priorAmox=/amox|amoxi/.test(prior);
 if(oma&&!urgent&&!mixed&&age!==null){
  const unsafeBeta=s.risks.allergy&&(!s.allergyMild||s.allergySevere);
  if((s.risks.failure||s.risks.intolerance)&&unsafeBeta){plan.push('Alergia grave o no caracterizada: individualizar rescate o tratamiento parenteral; no se calcula ceftriaxona automáticamente.');}
  else
  if(s.risks.tubes&&(s.signs.discharge||s.right.discharge||s.left.discharge))plan.push('Ciprofloxacino ótico monodosis (Baycip® o Septocipro ótico®): 1 monodosis cada 12 h en el oído afectado durante 7 días; confirmar presentación.');
  else if(s.risks.tubes)warnings.push('Con tubos, completar valoración y presencia de otorrea antes de seleccionar pauta.');
  else if(s.risks.intolerance){if(weight>0)plan.push(`Valorar ceftriaxona IM ${fmt(Math.min(weight*50,1000))} mg cada 24 h durante 3 días (máximo 1 g/día), con reevaluación de tolerancia oral en 24 h.`);}
  else if(s.risks.failure){
   if(priorClav&&weight>0)plan.push(`Tras fracaso de amoxicilina-clavulánico, valorar ceftriaxona IM ${fmt(Math.min(weight*50,1000))} mg cada 24 h durante 3 días (máximo 1 g/día) y reevaluar diagnóstico/adherencia.`);
   else if(priorAmox){plan.push('Fracaso tras amoxicilina: reevaluar diagnóstico y adherencia; cambiar tratamiento.');addOral(true,10);}
   else plan.push('Fracaso antibiótico: precisar tratamiento previo, reevaluar diagnóstico/adherencia y valorar ORL/cultivo antes de seleccionar rescate.');
  }else if(s.risks.persistent)plan.push('OMA persistente: identificar y reiniciar el tratamiento previamente eficaz durante 2–3 semanas, con revisión clínica individualizada.');
  else if(s.risks.implant||s.risks.immune)plan.push('Tratamiento individualizado con el equipo responsable; no se genera pauta ambulatoria estándar.');
  else{
   const immediate=age<24||severe||risk||s.analgesia48||numeric(s.days)>=2;
   const clav=age<6||(age<24&&severe)||risk||recurrent||s.risks.conjunctivitis||s.risks.amoxi30||s.risks.unvaccinated;
   if(!immediate)plan.push('Observación con analgesia y seguimiento; reevaluar al completar 48–72 h desde el inicio si no mejora.');
   else if(s.analgesia48)plan.push('Sin mejoría tras ≥48 h con analgesia: iniciar antibiótico sin repetir observación.');
   addOral(clav,duration,!immediate);
  }
 }
 if(oe&&!urgent&&!special){plan.push('Ciprofloxacino ótico monodosis (Baycip® o Septocipro ótico®): 1 monodosis cada 12 h en el oído afectado durante 7 días; confirmar presentación.');plan.push('Mantener el CAE seco, evitar piscina y objetos en el oído; aplicar gotas con oído hacia arriba durante 3–5 minutos.');}
 if((oma||oe)&&!urgent){plan.push('Analgesia oral según edad, peso y contraindicaciones, manteniéndola si persiste dolor.');plan.push('Revisión si no mejora en 48–72 h; valoración antes si empeora o aparece inflamación retroauricular o afectación general.');}
 if(oma&&(s.signs.discharge||s.right.discharge||s.left.discharge))plan.push('Valorar cultivo y antibiograma de la otorrea, especialmente ante fracaso terapéutico o alergia.');
 if(recurrent)plan.push('Valorar seguimiento por ORL por OMA recurrente.');
 if(!oma&&!oe&&!urgent&&!special)plan.push('Completar valoración clínica antes de establecer tratamiento etiológico.');
 return {diagnoses,plan,warnings,urgent,evidence};
}
export function otalgiaSummary(s){
 const g=Array.from({length:8},()=>[]),add=(i,text,priority=60)=>{if(text)g[i].push({text,priority});},age=ageMonths(s),p=otalgiaProposal(s);
 add(0,s.side?'Otalgia '+({right:'derecha',left:'izquierda',bilateral:'bilateral'}[s.side]):'Consulta por molestias óticas',90);
 add(1,[age!==null?`Edad ${age<24?age+' meses':s.years+' años'}`:'',positive(s.weight)?`peso ${s.weight} kg`:'',s.days?`evolución de ${s.days} ${Number(s.days)===1?'día':'días'}`:''].filter(Boolean).join('; '),100);
 if(s.pain)add(1,s.pain==='si'?'Refiere otalgia':'No refiere otalgia');
 for(const [k,label] of [...OTALGIA_SIGNS,...INFANT_SIGNS]){if(!s.signs[k]||(INFANT_SIGNS.some(([id])=>id===k)&&(age===null||age>=24)))continue;let text=label;if(k==='fever')text+=[s.temperature?`máxima ${s.temperature} °C`:'',s.feverDays?`${s.feverDays} días`:''].filter(Boolean).map(t=>', '+t).join('');if(k==='cold'&&s.coldDays)text+=`, ${s.coldDays} días`;if(k==='antibiotic')text+=`: ${s.antibioticName||'sin especificar'}${s.antibioticDose?', '+s.antibioticDose:''}`;if(k==='recurrent')text+=`${s.episodes12?`, ${s.episodes12} episodios/12 meses`:''}${s.episodes6?`, ${s.episodes6} episodios/6 meses`:''}`;add(1,text,75);}
 if(s.analgesia48)add(1,'Persistencia de síntomas pese a ≥48 h de analgesia/antitérmicos',145);
 for(const [k,label] of [['right','OD'],['left','OI']]){const e=s[k];if(!e.status)continue;const parts=e.status==='normal'?['trago negativo, CAE y tímpano normales']:EAR_SIGNS.filter(([id])=>e[id]&&!(e.status==='unseen'&&['red','bulging'].includes(id))).map(([,t])=>t.toLowerCase());if(e.status==='unseen')parts.push('tímpano no visualizado');add(3,label+': '+(parts.join('; ')||'exploración anormal sin detallar'),140);}
 for(const [k,label] of RISKS)if(s.risks[k])add(2,k==='allergy'?`Alergia a amoxicilina/penicilinas${s.allergyMild?' no inmediata leve':s.allergySevere?' IgE mediada o retardada grave':', tipo no precisado'}`:label,['mastoid','unwell','allergy','severeImmune','recentImplant'].includes(k)?155:100);
 p.diagnoses.forEach(t=>add(5,t,150));p.plan.forEach(t=>add(6,t,/mL|cefuroxima|claritromicina|ceftriaxona|hospitalaria prioritaria|tratamiento individualizado/.test(t)?165:/Observación|sin repetir|Revisión/.test(t)?148:125));p.warnings.forEach(t=>add(7,t,145));return {...buildSummary(g),proposal:p};
}
