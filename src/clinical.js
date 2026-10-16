import {symptoms,differentials,cvFields,adverseEffects,interviewGroups,drugFields,followFields} from './schema.js';
import {measurementText,measurementWarnings,numeric} from './measurements.js';
import {questionnaireText} from './questionnaires.js';
import {ageDays,growthForMeasurement,formatGrowth} from './percentiles.js';
export const SOURCES={interview:'Anamnesis TDAH explicada, pp. 1–4 (sin fecha)',med:'Metilfenidato, p. 2, apartados 3–5 (sin fecha)'};
export function synthesis(s){
 const i=s.interview,support=[],gaps=[],alternatives=[],next=[];
 const rated=symptoms.filter(([k])=>s.symptoms[k]!==''&&s.symptoms[k]!=null);
 const frequent=rated.filter(([k])=>Number(s.symptoms[k])>=2);
 if(frequent.length)support.push('Conductas descritas como frecuentes o muy frecuentes: '+frequent.map(([,l])=>l).join('; ')+'. No equivale a un criterio diagnóstico.');
 else gaps.push('No constan conductas nucleares frecuentes documentadas; no se deduce ausencia de síntomas.');
 if(rated.length<symptoms.length)gaps.push('Entrevista de síntomas parcial o pendiente.');
 if(i.before12==='si')support.push('Se documenta inicio antes de los 12 años.');else gaps.push(i.before12==='no'?'Se registra que no había síntomas antes de los 12 años: revisar cronología y alternativas.':'Inicio antes de los 12 años pendiente o desconocido.');
 if(i.persistent==='si'&&i.duration)support.push('Persistencia referida: '+i.duration);else gaps.push('Persistencia y duración no suficientemente descritas.');
 const contexts=[['home','casa'],['school','colegio'],['activities','actividades/social']].filter(([k])=>i[k]==='si').map(([,l])=>l);
 if(contexts.length>1)support.push('Síntomas referidos en varios entornos: '+contexts.join(', ')+'.');else gaps.push('Presencia en varios entornos no confirmada; revisar diferencias ambientales y recabar información externa.');
 if(i.impairment==='si')support.push('Repercusión funcional relevante indicada por el profesional.');else gaps.push(i.impairment==='no'?'No se refiere repercusión funcional relevante; revisar significado clínico.':'Repercusión funcional relevante pendiente de valoración.');
 for(const [k,l] of differentials)if(s.differential[k]==='si')alternatives.push(l+': cribado positivo referido; ampliar evaluación, no constituye diagnóstico.');
 const unknown=differentials.filter(([k])=>!s.differential[k]||s.differential[k]==='desconocido');
 if(unknown.length)gaps.push('Áreas diferenciales pendientes/desconocidas: '+unknown.map(([,l])=>l).join(', ')+'.');
 if(s.selfHarm==='si')next.push('Verbalizaciones autolesivas o ideas de muerte: requieren valoración específica sin atribuirlas al TDAH (guion explicado, p. 3).');
 if(!s.questionnaires.length)gaps.push('No se han aportado cuestionarios; no equivale a un resultado negativo.');
 if(!i.teacherComparison&&!i.teacherProblem)next.push('Recabar información del profesorado y contrastar demandas, funcionamiento y medidas ensayadas (p. 4).');
 if(['learning','capacity','language'].some(k=>s.differential[k]==='si'))next.push('Valorar evaluación psicopedagógica/psicométrica si puede cambiar diagnóstico o manejo; no de rutina (p. 4).');
 if(['social','anxiety','mood'].some(k=>s.differential[k]==='si'))next.push('Ampliar valoración específica y considerar derivación según intensidad; no hay circuito local documentado (p. 3).');
 if(s.differential.sleep==='si')next.push('Estudiar/corregir el sueño cuando sea relevante (p. 3).');
 return {support,gaps,alternatives,next,source:SOURCES.interview};
}
export function therapyProposal(s){
 const source=SOURCES.med,missing=[],precautions=['Requiere valoración y aceptación profesional. La guía adjunta no tiene fecha; contrastar con ficha técnica vigente. Sin dosis, conversiones ni equivalencias automáticas.'];
 const base={id:'med-review',source,missing,precautions,evidence:[],text:'',blocked:true};
 if(!s.drug.active?.trim())missing.push('Principio activo');
 if(s.drug.active?.trim()&&!/^metilfenidato$/i.test(s.drug.active.trim()))return {...base,id:'other-drug',text:'No hay reglas implementadas para este principio activo. No aplicar la guía de metilfenidato.',missing:[],rule:'Ámbito de la fuente: exclusivamente metilfenidato.'};
 for(const [k,l] of drugFields.filter(([k])=>['presentation','formulation','dose','total','schedule','start'].includes(k)))if(!s.drug[k])missing.push(l);
 if(!(numeric(s.drug.total)>0))missing.push('Dosis total diaria positiva y verificada');
 if(ageDays(s.birth,s.date)===null||s.birth===s.date)missing.push('Fecha de nacimiento y fecha de consulta válidas');
 if(!s.follow.response)missing.push('Respuesta global');
 if(!s.follow.effectDuration||!s.follow.coverage||s.follow.coverage==='desconocida')missing.push('Duración y cobertura conocidas');
 if(!s.follow.effectOnset)missing.push('Inicio del efecto');
 if(!['si','no'].includes(s.follow.rebound)||s.follow.rebound==='si'&&!s.follow.reboundDetails)missing.push('Valoración del posible rebote y detalles si está presente');
 if(s.drug.start&&(ageDays(s.birth,s.drug.start)===null||ageDays(s.drug.start,s.date)===null))missing.push('Fecha de inicio de tratamiento coherente');
 if(s.follow.adherence!=='buena')missing.push('Adherencia confirmada y tomas reales');
 if(!s.follow.homeResponse||!s.follow.schoolResponse)missing.push('Respuesta familiar y escolar');
 if(!s.follow.comorbidityReview)missing.push('Revisión de comorbilidades y explicaciones alternativas');
 if(!s.goals.some(g=>g.description&&g.baseline&&g.criterion&&g.current))missing.push('Objetivo con situación basal, criterio y evolución actual');
 if(!s.ramReviewed)missing.push('Revisión explícita de reacciones adversas');
 if(cvFields.some(([k])=>!['no','si'].includes(s.cv[k])))missing.push('Cribado cardiovascular dirigido completo');
 if(!s.measurement.date||Object.keys({weight:1,height:1,sbp:1,dbp:1,hr:1}).some(k=>!(numeric(s.measurement[k])>0)))missing.push('Peso, talla, TA y FC actuales con fecha');
 if(ageDays(s.birth,s.measurement.date)===null||ageDays(s.measurement.date,s.date)===null)missing.push('Fechas de medición coherentes con nacimiento y consulta');
 if(s.constantsReview!=='compatible')missing.push('Valoración profesional de las constantes y evolución');
 if(measurementWarnings(s.measurement).length)missing.push('Revisión de las advertencias de medición');
 const cvPositive=cvFields.filter(([k])=>s.cv[k]==='si');
 const adverse=adverseEffects.filter(([k])=>s.ram[k]?.present);
 if(cvPositive.length)precautions.push('Cribado cardiovascular positivo: '+cvPositive.map(([,l])=>l).join(', ')+'. Valorar antes de ajustar.');
 if(s.constantsReview==='review')precautions.push('Constantes marcadas para revisión clínica.');
 if(adverse.length||s.otherRam.trim())precautions.push('RAM registradas: priorizar intensidad, repercusión y relación temporal.');
 base.evidence=[s.follow.response&&'Respuesta: '+s.follow.response,s.follow.coverage&&'Cobertura: '+s.follow.coverage,s.follow.adherence&&'Adherencia: '+s.follow.adherence,s.follow.effectOnset&&'Inicio del efecto: '+s.follow.effectOnset,s.follow.effectDuration&&'Duración observada: '+s.follow.effectDuration,s.follow.rebound&&'Posible rebote: '+stateLabel(s.follow.rebound),s.drug.active&&'Pauta registrada: '+[s.drug.active,s.drug.presentation,s.drug.formulation,s.drug.dose,s.drug.schedule].filter(Boolean).join('; '),s.measurement.date&&'Constantes registradas: '+measurementText(s.measurement),s.ramReviewed?'RAM revisadas':'RAM no revisadas',...s.goals.filter(g=>g.description&&g.current).map(g=>`${g.description}: basal ${g.baseline||'pendiente'}; actual ${g.current}`)].filter(Boolean);
 if(s.selfHarm==='si')return {...base,id:'self-harm',text:'Priorizar valoración específica de las verbalizaciones autolesivas o ideas de muerte antes de plantear un ajuste.',rule:'Las verbalizaciones autolesivas requieren valoración específica; Anamnesis TDAH explicada, p. 3.',source:'Anamnesis TDAH explicada, p. 3 (sin fecha)'};
 if(cvPositive.length||s.constantsReview==='review')return {...base,id:'safety',text:'Priorizar valoración cardiovascular / de constantes antes de plantear un ajuste farmacológico.',rule:'Línea basal y cribado cardiovascular, p. 1; RAM de TA/FC y revisión antes de subir, p. 2.',source:'Metilfenidato, pp. 1–2 (sin fecha)'};
 if(!s.ramReviewed||missing.length)return {...base,text:'Propuesta de ajuste bloqueada. Completar los datos pendientes y revisar adherencia, duración, información escolar y comorbilidad antes de decidir.',rule:'Antes de seguir: revisar adherencia, información escolar, comorbilidad y posible rebote; p. 2, apartado 4.'};
 if(adverse.length||s.otherRam.trim())return {...base,id:'tolerance',blocked:false,text:'Valorar tolerabilidad y relevancia de las RAM; la guía contempla reducir, cambiar horario/formulación o replantear el tratamiento. No se concreta cambio ni dosis.',rule:'Aparecen RAM relevantes: reducir, cambiar horario/formulación o replantear; p. 2, apartado 3.'};
 if(s.follow.response==='buena'&&s.follow.coverage==='suficiente')return {...base,id:'maintain',blocked:false,text:'Valorar mantener la pauta si se confirma el logro funcional y tolerabilidad aceptable. Continuar seguimiento de objetivos y constantes.',rule:'Funciona bien y dura lo necesario: mantener; p. 2, apartados 3–4.'};
 if(s.follow.response==='buena'&&s.follow.coverage==='corta')return {...base,id:'coverage',blocked:false,text:'Valorar cobertura horaria: la guía contempla formulación de mayor duración o refuerzo IR. No aumentar por reflejo ni convertir dosis entre preparados; requiere revisión individual.',rule:'Funciona bien pero dura poco: ajustar duración, no intensidad; p. 2, apartados 3–4.'};
 return {...base,id:'response',blocked:false,text:'Revisar la respuesta durante las horas activas y los escalones previos. La guía contempla valorar titulación del mismo preparado si persiste deterioro y no hay RAM relevantes; ausencia de dosis-respuesta exige replantear antes de seguir subiendo. Sin propuesta de dosis.',rule:'Respuesta nula o insuficiente y cuándo no seguir subiendo; p. 2, apartados 3–4.'};
}
const stateLabel=x=>({'si':'Sí','no':'No','desconocido':'Desconocido'}[x]||'No valorado');
export function ramText(s){
 if(!s.ramReviewed)return 'Reacciones adversas no revisadas. Los valores iniciales «No» no son negaciones confirmadas.';
 const lines=adverseEffects.map(([k,l])=>{
  const r=s.ram[k];if(!r?.present)return `${l}: no, confirmado tras revisión.`;
  return `${l}: sí. ${[['intensity','Intensidad'],['onset','Aparición'],['impact','Repercusión'],['notes','Observaciones']].filter(([k])=>r[k]).map(([k,l])=>`${l}: ${r[k]}`).join('; ')||'Detalles pendientes.'}`;
 });
 if(s.otherRam)lines.push('Otras RAM: '+s.otherRam);return lines.join('\n');
}
export function generateNote(s){
 const blocks=[`TDAH · ${s.mode==='first'?'PRIMERA CONSULTA':'CONSULTA SUCESIVA CON TRATAMIENTO'}${s.date?' · '+s.date:''}`];
 const add=(title,lines)=>{const body=lines.filter(Boolean).join('\n');if(body)blocks.push(title+'\n'+body);};
 if(s.birth||s.sex)add('DATOS PARA CÁLCULOS',[s.birth&&'Nacimiento: '+s.birth,s.sex&&'Sexo de referencia para crecimiento: '+s.sex]);
 for(const g of interviewGroups)add(g.title.toLocaleUpperCase('es'),g.fields.filter(([k])=>s.interview[k]).map(([k,l,t])=>`${l}: ${t==='state'?stateLabel(s.interview[k]):s.interview[k]}`));
 add('SÍNTOMAS REFERIDOS (ENTREVISTA, SIN PUNTUACIÓN DIAGNÓSTICA)',[
 ...symptoms.filter(([k])=>s.symptoms[k]!==''&&s.symptoms[k]!=null).map(([k,l])=>`${l}: ${['nunca/casi nunca','a veces','frecuente','muy frecuente'][Number(s.symptoms[k])]}.`),s.symptomExamples&&'Ejemplos e inicio por síntoma: '+s.symptomExamples]);
 add('CRIBADO DIFERENCIAL',[
 ...differentials.filter(([k])=>s.differential[k]).map(([k,l])=>`${l}: ${stateLabel(s.differential[k])}.`),
 s.differentialDetails,s.selfHarm&&'Verbalizaciones autolesivas / ideas de muerte: '+stateLabel(s.selfHarm)]);
 add('CRIBADO CARDIOVASCULAR DIRIGIDO',[
 ...cvFields.filter(([k])=>s.cv[k]).map(([k,l])=>`${l}: ${stateLabel(s.cv[k])}.`),s.cvDetails]);
 add('OBJETIVOS FUNCIONALES',s.goals.filter(g=>g.description||g.baseline||g.criterion||g.current).map((g,i)=>`${i+1}. ${g.description||'Descripción pendiente'}; contexto: ${g.context||'pendiente'}; basal: ${g.baseline||'pendiente'}; criterio de mejoría: ${g.criterion||'pendiente'}${g.current?'; evolución: '+g.current:''}`));
 add('CUESTIONARIOS — DATOS INTRODUCIDOS',s.questionnaires.map(questionnaireText));
 const measurements=[...s.measurements,...(Object.keys({weight:1,height:1,sbp:1,dbp:1,hr:1}).some(k=>s.measurement[k]!==''&&s.measurement[k]!=null)?[s.measurement]:[])];
 add('ANTROPOMETRÍA Y CONSTANTES',[
 ...measurements.flatMap(m=>[measurementText(m),...Object.entries(growthForMeasurement(m,s.birth,s.sex)).map(([k,r])=>({weight:'Peso/edad',height:'Talla o longitud/edad',bmi:'IMC/edad'}[k])+': '+formatGrowth(r))]),...measurementWarnings(s.measurement),measurements.length&&'Método de percentiles: LMS OMS 2006 diario / OMS 2007 interpolado (edad en días/30,4375), ajuste de colas en peso/IMC. Talla/longitud estandarizada según técnica en menores de 5 años. Percentiles de TA/FC no disponibles. Cálculos pendientes de revisión profesional.',
 s.constantsReview&&'Valoración profesional de constantes: '+(s.constantsReview==='compatible'?'revisadas, compatibles con el plan considerado':'requieren revisión adicional')]);
 add(s.mode==='first'?'TRATAMIENTO REGISTRADO / INICIO SI PROCEDE':'TRATAMIENTO PREVIO A LA CONSULTA',drugFields.filter(([k])=>s.drug[k]).map(([k,l])=>`${l}: ${s.drug[k]}`));
 if(s.mode==='follow'){
  add('SEGUIMIENTO DEL TRATAMIENTO',followFields.filter(([k])=>s.follow[k]).map(([k,l,t,opts])=>`${l}: ${t==='state'?stateLabel(s.follow[k]):t==='select'?(opts.find(([v])=>v===s.follow[k])?.[1]||s.follow[k]):s.follow[k]}`));
  add('TOLERABILIDAD — LISTA DE LA GUÍA DE METILFENIDATO, NO EXHAUSTIVA',[ramText(s)]);
 }
 add('VALORACIÓN INTRODUCIDA POR EL PROFESIONAL',[s.assessment]);
 add('PLAN INTRODUCIDO / ACEPTADO POR EL PROFESIONAL',[s.plan,...s.accepted.map(p=>p.text+' [Propuesta orientativa aceptada por el profesional; fuente: '+p.source+']'),s.followup&&'Seguimiento: '+s.followup]);
 return blocks.join('\n\n');
}
