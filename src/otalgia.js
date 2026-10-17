import {clinicalText,wordCount,NOTE_LIMIT} from './note-summary.js';
export const OTALGIA_SIGNS=[['discharge','Otorrea'],['fever','Fiebre'],['cold','Síntomas catarrales'],['antibiotic','Antibiótico en los últimos 7 días'],['pool','Acude a piscina']];
export const INFANT_SIGNS=[['irritable','Irritabilidad'],['feeding','Rechazo de tomas'],['sleep','Sueño interrumpido'],['head','Autogolpes sobre el cráneo'],['crying','Llanto de predominio nocturno'],['earTouch','Manipulación del oído']];
export const EAR_SIGNS=[['tragus','Trago positivo'],['canal','CAE eritematoso'],['edema','CAE edematoso'],['severeEdema','CAE con edema importante'],['discharge','Otorrea'],['red','Tímpano hiperémico no abombado'],['bulging','Tímpano hiperémico y abombado']];
export const RISKS=[['severe','Otalgia muy intensa'],['family','Familiares de primer grado con secuelas óticas por OMA'],['hearing','Hipoacusia previa'],['craniofacial','Anomalía craneofacial'],['recurrent','OMA recurrente (≥3 episodios/6 meses o ≥4/12 meses)'],['persistent','OMA persistente (≤7 días tras finalizar tratamiento)'],['failure','Sin mejoría tras 48–72 h de antibiótico'],['intolerance','Intolerancia que impide la vía oral'],['immune','Inmunosupresión'],['implant','Implante coclear'],['recentImplant','Implante en primeros 3–6 meses o con malformación/fístula'],['tubes','Tubos de timpanostomía'],['conjunctivitis','Conjuntivitis purulenta'],['amoxi30','Amoxicilina en el último mes'],['allergy','Alergia a amoxicilina/penicilinas']];
export const PRIOR_ANTIBIOTICS=[['','No especificado'],['amoxicillin','Amoxicilina'],['amoxiclav','Amoxicilina-clavulánico'],['cefuroxime','Cefuroxima-axetilo'],['clarithromycin','Claritromicina'],['azithromycin','Azitromicina'],['ceftriaxone','Ceftriaxona'],['other','Otro antibiótico']];
export function previousAntibiotic(s){if(!s.priorAntibiotic)return '';return s.priorAntibiotic==='other'?s.antibioticName:PRIOR_ANTIBIOTICS.find(([key])=>key===s.priorAntibiotic)?.[1]||'';}
const ear=()=>({status:'',tragus:false,canal:false,edema:false,severeEdema:false,discharge:false,red:false,bulging:false});
export function newOtalgia(){return {years:'',months:'',weight:'',side:'',pain:'',painEquivalent:false,days:'',temperature:'',feverDays:'',coldDays:'',priorAntibiotic:'',antibioticName:'',antibioticDose:'',episodes12:'',episodes6:'',immuneSeverity:'',analgesia48:false,allergyMild:false,allergySevere:false,signs:Object.fromEntries([...OTALGIA_SIGNS,...INFANT_SIGNS].map(([k])=>[k,false])),risks:Object.fromEntries(RISKS.map(([k])=>[k,false])),right:ear(),left:ear()};}
const numeric=x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
const positive=x=>numeric(x)!==null&&Number(x)>0;
export function ageMonths(s){const y=numeric(s.years);if(y===null)return null;if(y<2){const m=numeric(s.months);return Number.isInteger(m)&&m<24&&Math.floor(m/12)===Math.floor(y)?m:null;}return y*12;}
export function underTwo(s){const years=numeric(s.years);return years!==null&&years<2;}
export function hasPainEquivalent(s){return underTwo(s)&&s.painEquivalent&&['irritable','sleep','head','crying','earTouch'].some(id=>s.signs[id]);}
export function recurrentOtitis(s){return !!s.risks.recurrent;}
function earEvidence(s,k){const e=s[k].status==='unseen'?{...s[k],red:false,bulging:false}:s[k],age=ageMonths(s),lateral=s.side==='bilateral'||s.side===k;
 const pain=lateral&&(s.pain==='si'||hasPainEquivalent(s));
 if(!e.status)return {kind:lateral&&s.signs.discharge?'oma':'unknown'};
 if(e.status==='normal')return {kind:'none'};
 const external=(e.canal&&(e.edema||e.severeEdema||e.tragus))||(e.severeEdema&&pain);
 if(external&&e.bulging)return {kind:'mixed'};
 if(external)return {kind:'oe'};
 // Abombado e hiperémico recoge inflamación y derrame; otalgia completa los tres criterios.
 if((pain&&e.bulging)||e.discharge||(lateral&&s.signs.discharge))return {kind:'oma'};
 const effusion=e.bulging||e.discharge||(lateral&&s.signs.discharge);
 if((pain&&e.red)||(effusion&&(pain||s.signs.cold||s.signs.fever||e.red))||(e.status==='unseen'&&pain&&(s.signs.cold||s.signs.fever))){
  const upgrade=s.signs.cold&&((age!==null&&age<6)||recurrentOtitis(s)||s.risks.family);
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
 if(recurrent&&(s.episodes6||s.episodes12)&&!(numeric(s.episodes6)>=3||(numeric(s.episodes12)>=4)))warnings.push('Revisar cifras de recurrencia: ≥3 OMA/6 meses o ≥4/12 meses. El antecedente marcado se mantiene como factor de riesgo.');
 if(s.risks.immune&&!s.immuneSeverity)warnings.push('Precisar gravedad de la inmunosupresión antes de seleccionar manejo ambulatorio.');
 const urgent=(age!==null&&age<1)||s.risks.recentImplant||(s.risks.immune&&s.immuneSeverity==='severe');
 const mixed=evidence.some(e=>e.kind==='mixed'),special=s.risks.implant||(s.risks.immune&&s.immuneSeverity!=='nonSevere')||s.risks.intolerance||s.risks.failure||s.risks.persistent||mixed;
 if(urgent)plan.push('Valoración hospitalaria prioritaria por criterios de ingreso o posible complicación.');
 if(s.risks.implant&&!urgent)plan.push('Consultar con ORL por implante coclear; valorar ingreso según fecha del implante, malformación/fístula y evolución.');
 if(s.risks.immune&&!s.immuneSeverity&&!urgent)plan.push('Precisar gravedad de la inmunosupresión: si es grave, valoración hospitalaria; si no es grave y hay OMA, antibiótico inicial adaptado a los factores de riesgo.');
 if(mixed)plan.push('Reevaluar posible afectación concomitante antes de seleccionar tratamiento.');
 const severe=s.risks.severe||(s.signs.fever&&numeric(s.temperature)>39)||s.signs.discharge||s.right.discharge||s.left.discharge||omas.length===2;
 const risk=s.risks.family||recurrent||s.risks.hearing||s.risks.craniofacial||s.risks.immune||s.risks.implant;
 const tenDays=s.risks.family||s.risks.hearing||s.risks.craniofacial||s.risks.immune||s.risks.implant||s.risks.persistent;
 const duration=(age!==null&&age<6)||tenDays||(age!==null&&age<24&&(severe||recurrent))?10:age!==null&&age<24?7:recurrent?'7–10':severe?7:5;
 const addOral=(clav,days,conditional=false)=>{
  if(s.risks.allergy){
   if(s.allergyMild&&!s.allergySevere&&weight>0){const mg=Math.min(weight*30/2,500);plan.push(`${conditional?'Si no mejora tras 48 h de observación: ':''}cefuroxima-axetilo ${fmt(mg)} mg por vía oral cada 12 h durante ${days} días (${fmt(Math.min(weight*30,1000)/weight)} mg/kg/día; máximo 1 g/día).`);}
   else if(s.allergySevere&&!s.allergyMild&&weight>0){const mg=Math.min(weight*15/2,500);plan.push(`${conditional?'Si no mejora tras 48 h de observación: ':''}claritromicina ${fmt(mg)} mg por vía oral cada 12 h durante ${days} días (${fmt(Math.min(weight*15,1000)/weight)} mg/kg/día; máximo 1 g/día); comprobar interacciones y adecuación clínica.`);}
   else if((s.allergyMild&&!s.allergySevere)||(s.allergySevere&&!s.allergyMild))plan.push(`${conditional?'Si no mejora tras 48 h de observación: ':''}${s.allergyMild?'cefuroxima-axetilo':'claritromicina'} por vía oral durante ${days} días. Dosis pendiente de registrar el peso.`);
   else warnings.push('Alergia seleccionada: precisar tipo antes de calcular alternativa.');return;
  }
  const d=oralDose(s.weight,clav);if(!d){plan.push(`${conditional?'Si no mejora tras 48 h de observación, iniciar':'Iniciar'} ${clav?'amoxicilina-clavulánico 100/12,5 mg/mL':'amoxicilina 250 mg/5 mL'} por vía oral durante ${days} días. Dosis y volumen pendientes de registrar el peso.`);return;}
  plan.push(`${conditional?'Si no mejora tras 48 h de observación, iniciar':'Iniciar'} ${clav?'amoxicilina-clavulánico 100/12,5 mg/mL':'amoxicilina 250 mg/5 mL'}: ${fmt(d.ml)} mL (${fmt(d.ml*d.concentration)}${clav?'/'+fmt(d.ml*12.5):''} mg) por vía oral cada 8 h durante ${days} días (${fmt(d.daily/weight)} mg/kg/día${d.daily<weight*80?'; dosis limitada al máximo de 3 g/día':''}).`);
 };
 const priorClav=s.priorAntibiotic==='amoxiclav',priorAmox=s.priorAntibiotic==='amoxicillin';
 if(oma&&!urgent&&!mixed&&(!s.risks.immune||s.immuneSeverity==='nonSevere')&&!s.risks.implant&&age!==null){
  const unsafeBeta=s.risks.allergy&&(!s.allergyMild||s.allergySevere);
  if(s.risks.tubes&&(s.signs.discharge||s.right.discharge||s.left.discharge))plan.push('Ciprofloxacino ótico monodosis: 1 envase monodosis cada 12 h en el oído afectado durante 7 días.');
  else if(s.risks.tubes)warnings.push('Con tubos, completar valoración y presencia de otorrea antes de seleccionar pauta.');
  else if((s.risks.failure||s.risks.intolerance)&&unsafeBeta)plan.push('Alergia grave o no caracterizada: individualizar rescate o tratamiento parenteral; no se calcula ceftriaxona automáticamente.');
  else if(s.risks.intolerance){if(!(weight>0))plan.push('Valorar ceftriaxona IM durante 3 días, con reevaluación de tolerancia oral en 24 h. Dosis pendiente de registrar el peso.');if(weight>0)plan.push(`Valorar ceftriaxona IM ${fmt(Math.min(weight*50,1000))} mg cada 24 h durante 3 días (${fmt(Math.min(weight*50,1000)/weight)} mg/kg/día; máximo 1 g/día), con reevaluación de tolerancia oral en 24 h.`);}
  else if(s.risks.failure){
   if(priorClav){if(!(weight>0))plan.push('Tras fracaso de amoxicilina-clavulánico, valorar ceftriaxona IM durante 3 días y reevaluar diagnóstico/adherencia. Dosis pendiente de registrar el peso.');else plan.push(`Tras fracaso de amoxicilina-clavulánico, valorar ceftriaxona IM ${fmt(Math.min(weight*50,1000))} mg cada 24 h durante 3 días (${fmt(Math.min(weight*50,1000)/weight)} mg/kg/día; máximo 1 g/día) y reevaluar diagnóstico/adherencia.`);}
   else if(s.priorAntibiotic==='ceftriaxone')plan.push('Fracaso tras ceftriaxona: valoración por ORL para timpanocentesis, cultivo y tratamiento según antibiograma.');
   else if(['cefuroxime','clarithromycin','azithromycin'].includes(s.priorAntibiotic))plan.push(`Fracaso tras ${previousAntibiotic(s).toLowerCase()}: reevaluar diagnóstico y adherencia; valorar ORL y alternativa guiada por alergia, cultivo y protocolo local.`);
   else if(priorAmox){plan.push('Fracaso tras amoxicilina: reevaluar diagnóstico y adherencia; cambiar tratamiento.');addOral(true,10);}
   else plan.push('Fracaso antibiótico: precisar tratamiento previo, reevaluar diagnóstico/adherencia y valorar ORL/cultivo antes de seleccionar rescate.');
  }else if(s.risks.persistent)plan.push('OMA persistente: identificar y reiniciar el tratamiento previamente eficaz durante 2–3 semanas, con revisión clínica individualizada.');
  else if(s.signs.antibiotic&&s.priorAntibiotic)plan.push(`Antecedente reciente de tratamiento con ${previousAntibiotic(s).toLowerCase()||'antibiótico no especificado'}: comprobar pauta, duración y respuesta antes de indicar continuación o cambio de antibiótico.`);
  else{
   const immediate=age<24||severe||risk||s.analgesia48||numeric(s.days)>=2;
   const clav=age<6||risk||recurrent||s.risks.conjunctivitis||s.risks.amoxi30;
   if(!immediate)plan.push('Observación con analgesia y seguimiento; reevaluar al completar 48 h desde el inicio si no mejora.');
   else if(s.analgesia48)plan.push('Sin mejoría tras ≥48 h con analgesia: iniciar antibiótico sin repetir observación.');
   addOral(clav,duration,!immediate);
  }
 }
 if(oe&&!urgent&&!special){
  if(oes.some(e=>s[e.side].severeEdema)){
   if(age!==null&&age>=6)plan.push('Ciprofloxacino/fluocinolona 3/0,25 mg/mL ótico (Cetraxal Plus, frasco multidosis): 6–8 gotas cada 12 h en el oído afectado durante 7 días.');
   else{warnings.push('Cetraxal Plus: completar edad; por debajo de 6 meses, individualizar la indicación y la pauta.');plan.push('Otitis externa con edema importante: individualizar tratamiento por edad antes de pautar ciprofloxacino con corticoide.');}
  }
  else plan.push('Ciprofloxacino ótico monodosis: 1 envase monodosis cada 12 h en el oído afectado durante 7 días.');
  plan.push('Mantener el CAE seco y evitar piscina.');
 }
 if((oma||oe)&&!urgent){plan.push('Analgesia oral según edad, peso y contraindicaciones, manteniéndola si persiste dolor.');plan.push('Revisión si no mejora en 48 h; valoración antes si empeora o aparece inflamación retroauricular o afectación general.');}
 if(oma&&(s.signs.discharge||s.right.discharge||s.left.discharge))plan.push('Valorar cultivo y antibiograma de la otorrea, especialmente ante fracaso terapéutico o alergia.');
 if(recurrent)plan.push('Valorar seguimiento por ORL por OMA recurrente.');
 if(!oma&&!oe&&!urgent&&!special)plan.push('Completar valoración clínica antes de establecer tratamiento etiológico.');
 return {diagnoses,plan,warnings,urgent,evidence};
}
const joinClinical=values=>values.length<2?(values[0]||''):values.slice(0,-1).join(', ')+' y '+values.at(-1);
const joinNegative=values=>values.length<2?(values[0]||''):values.slice(0,-1).join(', ')+' ni '+values.at(-1);
const durationText=value=>`${value} ${Number(value)===1?'día':'días'}`;
const sentence=value=>/[.!?]$/u.test(value)?value:value+'.';
export function otalgiaSummary(s){
 const p=otalgiaProposal(s),age=ageMonths(s),items=[];let quarantined=false;
 const add=(section,text,priority=80)=>{if(!text)return;const clean=clinicalText(text);quarantined||=clean.quarantined;if(clean.text)items.push({section,text:sentence(clean.text),priority,index:items.length});};
 const location={right:'derecha',left:'izquierda',bilateral:'bilateral'}[s.side];

 const symptoms=[];
 if(s.signs.fever)symptoms.push(`fiebre${s.feverDays?' de '+durationText(s.feverDays)+' de evolución':''}${s.temperature?' (temperatura máxima de '+s.temperature+' °C)':''}`);
 if(s.signs.cold)symptoms.push('síntomas catarrales'+(s.coldDays?' de '+durationText(s.coldDays)+' de evolución':''));
 const hasOtorrhea=s.signs.discharge||['right','left'].some(k=>s[k].status&&s[k].status!=='normal'&&s[k].discharge);
 if(hasOtorrhea)symptoms.push('otorrea');
 if(underTwo(s)){for(const [k,text] of INFANT_SIGNS.map(([key,label])=>[key,label.toLowerCase()]))if(s.signs[k])symptoms.push(text);}
 if(s.pain==='si'){
  add('history',`Consulta por otalgia${location?' '+location:''}${positive(s.days)?' de '+durationText(s.days)+' de evolución':''}`,130);
  if(symptoms.length)add('history','Asocia '+joinClinical(symptoms),110);
 }else if(symptoms.length)add('history','Consulta por '+joinClinical(symptoms),130);
 if(hasPainEquivalent(s)&&s.pain!=='si')add('history','Patrón clínico considerado equivalente de otalgia',109);
 const absent=[['fever','fiebre'],['cold','síntomas catarrales'],['discharge','otorrea'],...(underTwo(s)?INFANT_SIGNS.map(([key,label])=>[key,label.toLowerCase()]):[])].filter(([k])=>k==='discharge'?!hasOtorrhea:!s.signs[k]).map(([,label])=>label);
 if(absent.length)add('history','No presenta '+joinNegative(absent),108);
 if(s.signs.pool)add('history','Acude a piscina',65);
 if(s.signs.antibiotic||s.risks.failure||s.risks.persistent)add('history',`Ha recibido ${previousAntibiotic(s)||'antibiótico no especificado'} ${s.signs.antibiotic?'en los últimos 7 días':'previamente'}${s.antibioticDose?', con pauta de '+s.antibioticDose:''}`,115);
 if(s.risks.recurrent)add('history','Antecedente de otitis de repetición'+(s.episodes12||s.episodes6?' ('+[s.episodes12?s.episodes12+' episodios en 12 meses':'',s.episodes6?s.episodes6+' en 6 meses':''].filter(Boolean).join('; ')+')':''),95);
 for(const [k,label] of RISKS){if(!s.risks[k]||k==='recurrent')continue;let text=label;if(k==='immune')text='Inmunosupresión'+(s.immuneSeverity==='severe'?' grave':s.immuneSeverity==='nonSevere'?' no grave':', gravedad no especificada');if(k==='allergy')text='Alergia a amoxicilina/penicilinas'+(s.allergyMild?' con reacción no inmediata leve':s.allergySevere?' con reacción IgE mediada o retardada grave':' de tipo no precisado');add('history',text,['allergy','immune','recentImplant'].includes(k)?150:90);}
 for(const [k,label] of [['right','Oído derecho'],['left','Oído izquierdo']]){const e=s[k];if(!e.status)continue;let parts=e.status==='normal'?['trago negativo','CAE y tímpano normales']:EAR_SIGNS.filter(([id])=>e[id]&&!(id==='edema'&&e.severeEdema)&&!(e.status==='unseen'&&['red','bulging'].includes(id))).map(([,t])=>t.toLowerCase().replace(/\bcae\b/gu,'CAE'));if(e.status==='unseen')parts.push('tímpano no visualizado');add('exam',label+': '+(parts.join('; ')||'exploración anormal sin detallar'),140);}
 if(!s.right.status&&!s.left.status)add('exam','no aportada',80);
 const clinicalLabels={oma:'Otitis media aguda',omaRisk:'Otitis media aguda probable',probable:'Otitis media aguda probable',oe:'Otitis externa',mixed:'Posible otitis media aguda y externa concomitantes'};
 const diagnoses=p.evidence.filter(e=>clinicalLabels[e.kind]);
 if(diagnoses.length===2&&diagnoses[0].kind===diagnoses[1].kind)add('assessment',clinicalLabels[diagnoses[0].kind]+' bilateral',155);
 else diagnoses.forEach(e=>add('assessment',clinicalLabels[e.kind]+' '+sideLabel(e),155));
 if(!diagnoses.length&&s.pain==='si')add('assessment','Otalgia de etiología no establecida',100);
 for(let text of p.plan){
  // El tiempo previo afecta a la decisión terapéutica, pero no añade relato ni analgesia a la nota.
  if(/^(Analgesia oral|Sin mejoría tras ≥48 h con analgesia|Observación con analgesia)/u.test(text))continue;
  text=text.replace(/^Iniciar /u,'');
  text=text.charAt(0).toUpperCase()+text.slice(1);
  add('plan',text,/mL|[Cc]iprofloxacino|cefuroxima|claritromicina|ceftriaxona|hospitalaria prioritaria|inmunosupresión|Tratamiento individualizado/.test(text)?170:/Revisión/.test(text)?135:100);
 }
 if(s.risks.allergy&&!s.allergyMild&&!s.allergySevere&&p.warnings.some(t=>t.startsWith('Alergia seleccionada')))add('plan','Tratamiento antibiótico pendiente de caracterizar la alergia',165);
 // No se imprimen apartados vacíos ni avisos de datos ausentes en el texto para el historial.
 const selected=[],omitted=[];
 const render=()=>['history','exam','assessment','plan'].map(section=>{const body=selected.filter(x=>x.section===section).sort((a,b)=>a.index-b.index).map(x=>x.text).join(' ');return body?({history:'',exam:'Exploración: ',assessment:'Juicio clínico: ',plan:'Plan: '}[section])+body:'';}).filter(Boolean).join('\n\n');
 for(const item of items.slice().sort((a,b)=>b.priority-a.priority||a.index-b.index)){selected.push(item);if(wordCount(render())>NOTE_LIMIT){selected.pop();omitted.push({section:item.section,text:item.text});}}
 const text=render();return {text,words:wordCount(text),omitted,quarantined,proposal:p};
}
