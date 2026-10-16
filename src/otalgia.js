import {buildSummary} from './note-summary.js';
export const OTALGIA_SIGNS=[['discharge','Otorrea'],['fever','Fiebre'],['cold','Síntomas catarrales'],['antibiotic','Antibiótico en los últimos 7 días'],['recurrent','Otitis de repetición'],['pool','Acude a piscina']];
export const INFANT_SIGNS=[['irritable','Irritabilidad'],['feeding','Rechazo de tomas'],['sleep','Sueño interrumpido'],['head','Autogolpes sobre el cráneo']];
export const EAR_SIGNS=[['tragus','Trago positivo'],['canal','CAE eritematoso'],['edema','Edema del CAE'],['discharge','Otorrea'],['red','Tímpano hiperémico no abombado'],['bulging','Tímpano hiperémico y abombado']];
export const RISKS=[['severe','Otalgia intensa / consulta nocturna por dolor'],['family','Familiares de primer grado con secuelas óticas inflamatorias'],['hearing','Alteración auditiva'],['relapse','Recaída tras finalizar antibiótico'],['failure','Sin mejoría tras 48–72 h de antibiótico, con adherencia adecuada'],['intolerance','Intolerancia que impide tratamiento oral'],['immune','Inmunosupresión'],['implant','Implante coclear'],['tubes','Tubos de timpanostomía'],['conjunctivitis','Conjuntivitis purulenta'],['beta30','Betalactámico en los últimos 30 días'],['mastoid','Tumefacción retroauricular / sospecha de mastoiditis'],['unwell','Mal estado general / signos meníngeos']];
// Referencia aportada por el usuario: no se incorpora a la nota ni se aplica automáticamente.
export const OTALGIA_REFERENCE=[
 ['Alergia no anafiláctica','Cefuroxima-axetilo: 30 mg/kg/día en 2 dosis; máximo 250 mg cada 12 h. Duración según situación clínica. Caracterizar la reacción antes de elegir cefalosporina.'],
 ['Anafilaxia y edad >6 meses','Opciones aportadas para contrastar: claritromicina 15 mg/kg/día en 2 dosis, máximo 500 mg/dosis, 7 días; o azitromicina 10 mg/kg el día 1 (máximo 500 mg) y 5 mg/kg/día los días 2–5 (máximo 250 mg/día); alternativa de 10 mg/kg/día durante 3 días (máximo 500 mg/día). Elegir una única pauta según protocolo, alergia y resistencias locales. No se calculan ni seleccionan automáticamente.'],
 ['Fracaso a las 48–72 h','Reevaluar OMA y adherencia. Tras amoxicilina, considerar amoxicilina-clavulánico durante 10 días; tras esta, considerar ceftriaxona IM 50 mg/kg cada 24 h durante 3 días, máximo 1 g/día, según valoración y protocolo. La expresión de las notas originales «dosis única … ×3 días» se interpreta como una dosis diaria, no una única dosis total. Persistencia: ORL, timpanocentesis y cultivo dirigido.'],
 ['Menores de 2 meses','Valoración hospitalaria; considerar cultivo/timpanocentesis con el equipo responsable. Fiebre o mal estado general requieren manejo de posible infección grave. No se extrapolan dosis intravenosas de mastoiditis sin un protocolo específico.'],
 ['Implante coclear o inmunosupresión','Consultar ORL/equipo hospitalario. Implante reciente (<2 meses), malformación/fístula, mal estado general o complicación requieren especial prioridad. Cefotaxima, meropenem o piperacilina-tazobactam quedan para selección y dosificación hospitalaria; no son pautas generadas por esta página.'],
 ['Tubos de timpanostomía con otorrea','Valorar ciprofloxacino ótico sin corticoide. La pauta «1 unidosis/12 h ×10 días» de las indicaciones requiere confirmar concentración, volumen y ficha técnica de la presentación concreta; una unidosis no es una unidad intercambiable entre productos.'],
 ['OE con mala respuesta, gravedad o inmunosupresión','Reevaluar en 24–48 h; considerar cultivo y ORL. No se traslada al paciente pediátrico la dosis fija de ciprofloxacino oral 500 mg/12 h de las notas. Quinolonas sistémicas, levofloxacino o linezolid requieren selección especializada individualizada.'],
 ['Analgesia y gotas','Registrar analgesia individualizada y comprobar edad, hidratación y contraindicaciones. Para ibuprofeno 2 % no se generan mL sin una dosis elegida y revisada. Gotas: oído afectado hacia arriba durante 3–5 minutos. Si no hay respuesta, reevaluar antes de prolongar a 14 días.']
];
const ear=()=>({status:'',membrane:'',tragus:false,canal:false,edema:false,discharge:false,red:false,bulging:false,externalExcluded:'',obstruction:'',extra:''});
export function newOtalgia(){return {years:'',months:'',weight:'',side:'',pain:'',days:'',temperature:'',feverDays:'',coldDays:'',antibioticName:'',antibioticDose:'',episodes12:'',episodes6:'',allergy:'',extra:'',history:'',tests:'',assessment:'',plan:'',pending:'',analgesia:'',signs:Object.fromEntries([...OTALGIA_SIGNS,...INFANT_SIGNS].map(([k])=>[k,false])),risks:Object.fromEntries(RISKS.map(([k])=>[k,false])),right:ear(),left:ear()};}
const numeric=x=>x!==''&&Number.isFinite(Number(x))&&Number(x)>=0?Number(x):null;
export function ageMonths(s){const y=numeric(s.years);if(y===null)return null;if(y<2){const m=numeric(s.months);return m!==null&&m<24&&Math.floor(m/12)===Math.floor(y)?m:null;}return y*12;}
const positive=(x)=>numeric(x)!==null&&Number(x)>0;
function earEvidence(s,k){const e=s[k],age=ageMonths(s),lateral=s.side==='bilateral'||s.side===k;
 const pain=lateral&&(s.pain==='si'||(age!==null&&age<24&&INFANT_SIGNS.some(([id])=>s.signs[id])));
 if(e.status==='normal')return {kind:'none',text:'Exploración ótica normal registrada; no se cumplen criterios de OMA/OE.'};
 if(!e.status)return {kind:'unknown',text:'Exploración no aportada.'};
 const oe=e.canal&&(e.tragus||e.edema);
 if(oe&&e.bulging)return {kind:'mixed',text:'Hallazgos de posible OE y OMA concomitantes; requiere valoración individual.'};
 if(oe)return {kind:'oe',text:'Hallazgos compatibles con otitis externa; correlacionar con clínica.'};
 const discharge=e.discharge&&e.externalExcluded==='si';
 if((pain&&e.bulging)||discharge)return {kind:'oma',text:'Criterios aportados compatibles con OMA (orientación a validar por el pediatra).'};
 if(e.discharge&&e.externalExcluded!=='si')return {kind:'unknown',text:'Otorrea: precisar origen y descartar OE antes de atribuirla a OMA.'};
 if((e.bulging&&(s.signs.cold||s.signs.fever))||(e.status==='unseen'&&pain&&(s.signs.cold||s.signs.fever)))return {kind:'probable',text:'Posible OMA; confirmar hallazgos y diferenciar de otitis media con efusión.'};
 return {kind:'none',text:'Datos insuficientes para orientar a OMA u OE; la hiperemia aislada no confirma OMA.'};
}
const round=n=>Number(n.toFixed(1));
export function otalgiaProposal(s){
 const age=ageMonths(s),weight=numeric(s.weight),warnings=[],plan=[],evidence=['right','left'].map(k=>({side:k,...earEvidence(s,k)}));
 const diagnoses=evidence.map(e=>(e.side==='right'?'OD':'OI')+': '+e.text);
 const oma=evidence.some(e=>['oma','probable'].includes(e.kind)),oe=evidence.some(e=>e.kind==='oe');
 const recurrent=s.signs.recurrent||(numeric(s.episodes6)>=3&&s.episodes6!=='')||(numeric(s.episodes12)>=4&&s.episodes12!=='');
 if(age===null)warnings.push('Completar edad coherente: años y, si <2 años, meses totales (0–23).');
 if(!positive(s.weight))warnings.push('Peso válido pendiente: no se calcula dosis.');
 if(!s.side||!s.days||!s.pain)warnings.push('Completar localización, duración y presencia de otalgia.');
 if(s.signs.fever&&!positive(s.temperature))warnings.push('Temperatura máxima pendiente.');
 if(s.signs.antibiotic&&(!s.antibioticName||!s.antibioticDose))warnings.push('Precisar antibiótico previo y dosis.');
 if(evidence.some(e=>e.kind==='mixed'))warnings.push('Posible afectación concomitante: no se propone pauta automática.');
 const urgent=(age!==null&&age<2)||s.risks.mastoid||s.risks.unwell;
 const complex=s.risks.immune||s.risks.implant||s.risks.failure||s.risks.intolerance||evidence.some(e=>e.kind==='mixed');
 if(urgent)plan.push('Valoración hospitalaria prioritaria: edad <2 meses o signos de posible complicación. No emitir pauta ambulatoria automática.');
 if(s.risks.implant)plan.push('Consultar con ORL por implante coclear; valorar ingreso según tiempo desde implante, malformación/fístula, estado general y complicaciones; si manejo oral acordado, revisión a las 24 h.');
 if(s.risks.immune)plan.push('Valorar gravedad de inmunosupresión y manejo hospitalario/especializado antes de elegir antibiótico.');
 if(s.risks.failure)plan.push('Reevaluar diagnóstico y adherencia ante fracaso a las 48–72 h: tras amoxicilina, valorar amoxicilina-clavulánico; tras esta, valoración especializada/ceftriaxona según protocolo. Fracaso posterior: ORL y cultivo dirigido.');
 if(s.risks.intolerance)plan.push('Si no tolera vía oral, reevaluar hidratación y tratamiento parenteral según protocolo.');
 if(oma&&!urgent&&!complex&&age!==null){
  const high=s.risks.severe||(s.signs.fever&&numeric(s.temperature)>39),exception=s.risks.hearing||s.risks.conjunctivitis||s.risks.beta30||s.signs.antibiotic;
  const immediate=age<24||high||s.risks.family||recurrent||s.risks.relapse||s.signs.discharge||s.right.discharge||s.left.discharge||evidence.filter(e=>['oma','probable'].includes(e.kind)).length===2||exception;
  const clav=age<6||exception||(age<24&&(high||s.risks.family||recurrent));
  const duration=age<24||s.risks.family||recurrent||s.risks.hearing?10:immediate?7:'5–7';
  if(evidence.some(e=>e.kind==='probable'))warnings.push('Orientación probable: contrastar criterios antes de adoptar tratamiento. Recurrencia/edad no sustituyen una otoscopia diagnóstica.');
  if(!immediate)plan.push('Valorar observación con analgesia y reevaluación a las 48 h; antibiótico diferido si no mejora o aparece otorrea, según evolución.');
  else plan.push('Valorar antibiótico inicial según exploración, gravedad y protocolo local.');
  const when=immediate?'Opción a validar':'Si se decide antibiótico diferido';
  if(s.allergy==='no'){
   const drug=clav?'Amoxicilina-clavulánico':'Amoxicilina',cap=clav?2600:3000;
   if(weight>0){const daily=Math.min(weight*80,cap);plan.push(`${when}: ${drug}, ${round(daily/3)} mg cada 8 h durante ${duration} días (${round(daily)} mg/día${clav?', referidos al componente amoxicilina':''}; máximo ${cap} mg/día). Confirmar formulación${clav?' y proporción de clavulanato':''}; no se calculan mL.`);}
  }else if(s.allergy==='nonAnaphylactic'&&weight>0){const dose=Math.min(weight*15,250);plan.push(`${when}: valorar cefuroxima-axetilo ${round(dose)} mg cada 12 h durante ${duration} días (máximo 250 mg/dosis), tras caracterizar alergia y contrastar protocolo.`);}
  else if(s.allergy==='anaphylactic')plan.push('Anafilaxia a penicilina: seleccionar alternativa según edad, alergia documentada y protocolo local; no se genera pauta automática de macrólido, quinolona ni linezolid.');
  else warnings.push('Caracterizar alergias antes de proponer una pauta antibiótica.');
 }
 if(oe&&!urgent&&!complex){
  if(s.risks.tubes||['right','left'].some(k=>s[k].discharge||s[k].status==='unseen'))plan.push('Posible perforación, otorrea o tubos: valorar ciprofloxacino ótico según presentación; evitar gotas potencialmente ototóxicas. Confirmar integridad timpánica.');
  else if(['right','left'].filter(k=>earEvidence(s,k).kind==='oe').every(k=>s[k].membrane==='intact'))plan.push('Con integridad timpánica documentada: opción Otix®, 4 gotas cada 8 h durante 7 días; revisar ficha técnica, edad y alergias. Si persiste, reevaluar antes de prolongar hasta 14 días.');
  else plan.push('Confirmar integridad timpánica antes de seleccionar gotas; si no puede excluirse perforación, valorar ciprofloxacino ótico según ficha técnica.');
  plan.push('Evitar humedad y piscina al menos 10 días, no introducir objetos en el CAE; aplicar gotas con oído hacia arriba y mantener 3–5 minutos. Reevaluar si no mejora en 24–48 h; gravedad o inmunosupresión: valorar cultivo y ORL, sin ciprofloxacino oral automático.');
 }
 if(s.risks.tubes&&oma)plan.push('Con tubos y otorrea, valorar tratamiento tópico con ciprofloxacino sin corticoide según presentación; no incorporar pauta oral sin revisar esta excepción.');
 if((s.signs.discharge||s.right.discharge||s.left.discharge)&&(recurrent||s.risks.failure||s.risks.immune||(age!==null&&age<3)))plan.push('Valorar cultivo de otorrea por recurrencia, refractariedad, inmunodeficiencia o edad <3 meses.');
 if(recurrent)plan.push('Contrastar recurrencia (≥3 episodios/6 meses o ≥4/12 meses) y valorar ORL según protocolo local.');
 if((oma||oe)&&!urgent)plan.push('Analgesia pautada las primeras 48 h; valorar ibuprofeno si edad, hidratación y antecedentes lo permiten. Registrar fármaco y dosis individualizados. Reevaluar antes si empeora, hay tumefacción retroauricular o mal estado general.');
 if(!oma&&!oe&&!urgent&&!complex)plan.push('Completar valoración clínica antes de establecer diagnóstico y tratamiento.');
 // Los tubos requieren una estrategia propia: nunca ofrecer simultáneamente pauta oral estándar.
 if(s.risks.tubes){for(let i=plan.length-1;i>=0;i--)if(/^(Opción a validar|Si se decide antibiótico diferido):/.test(plan[i]))plan.splice(i,1);}
 return {diagnoses,plan,warnings,urgent,evidence};
}
export function otalgiaSummary(s){
 const g=Array.from({length:8},()=>[]),add=(i,text,priority=60)=>{if(text)g[i].push({text,priority});};
 const age=ageMonths(s);add(0,s.side?'Otalgia '+({right:'derecha',left:'izquierda',bilateral:'bilateral'}[s.side]):'Consulta por molestias óticas');
 add(1,[age!==null?`Edad ${age<24?age+' meses':s.years+' años'}`:'',positive(s.weight)?`peso ${s.weight} kg`:'',s.days?`evolución de ${s.days} días`:''].filter(Boolean).join('; '),85);
 if(s.pain)add(1,s.pain==='si'?'Refiere otalgia':'No refiere otalgia');
 const labels=Object.fromEntries([...OTALGIA_SIGNS,...INFANT_SIGNS]);
 for(const [k,v] of Object.entries(s.signs)){if(!v||(INFANT_SIGNS.some(([id])=>id===k)&&(age===null||age>=24)))continue;let text=labels[k];if(k==='fever')text+=[s.temperature?`máxima ${s.temperature} °C`:'',s.feverDays?`${s.feverDays} días`:''].filter(Boolean).map(t=>', '+t).join('');if(k==='cold'&&s.coldDays)text+=`, ${s.coldDays} días`;if(k==='antibiotic')text+=`: ${s.antibioticName||'sin especificar'}${s.antibioticDose?', '+s.antibioticDose:''}`;if(k==='recurrent')text+=`${s.episodes12?`, ${s.episodes12} episodios/12 meses`:''}${s.episodes6?`, ${s.episodes6} episodios/6 meses`:''}`;add(1,text,70);}
 add(1,s.extra);add(2,s.history);if(s.allergy)add(2,'Alergia a penicilinas: '+({no:'negada',nonAnaphylactic:'reacción no anafiláctica',anaphylactic:'anafilaxia',unknown:'no caracterizada'}[s.allergy]),100);
 for(const [k,label] of [['right','OD'],['left','OI']]){const e=s[k];if(!e.status)continue;const parts=e.status==='normal'?['trago negativo, CAE y tímpano normales']:EAR_SIGNS.filter(([id])=>e[id]).map(([,t])=>t.toLowerCase());if(e.status==='unseen')parts.push('tímpano no visualizado'+(e.obstruction?' por '+e.obstruction:''));if(e.membrane==='intact')parts.push('membrana timpánica íntegra');if(e.membrane==='perforated')parts.push('perforación timpánica');if(e.extra)parts.push(e.extra);add(3,label+': '+(parts.join('; ')||'exploración sin detallar'),105);}
 for(const [k,label] of RISKS)if(s.risks[k])add(2,label,k==='mastoid'||k==='unwell'?150:85);
 add(4,s.tests);for(const t of s.assessment.split('\n'))add(5,t,140);for(const t of s.plan.split('\n'))add(6,t,/mg cada|hospitalaria prioritaria/.test(t)?149:/Analgesia/.test(t)?138:135);add(6,s.analgesia,130);add(7,s.pending,120);return buildSummary(g);
}
