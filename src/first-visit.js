// Guía de primera consulta solicitada por el profesional. No escala ni algoritmo diagnóstico.
import {buildSummary} from './note-summary.js';
import {VERSIONS} from './questionnaires.js';
export const FIRST_BLOCKS=[
 {id:'reason',title:'Motivo de consulta y expectativas',time:'1 min',source:'Familia · colegio · niño/a · pediatría',checks:[
 ['origin','¿Quién ha comunicado la preocupación y qué situaciones concretas la motivan?'],
 ['expectations','¿Qué os gustaría comprender o mejorar tras esta consulta? ¿Qué necesita el niño o la niña?'],
 ['strengths','¿Qué actividades se le dan bien y qué apoyos le ayudan?']
 ],fields:[['reason','Motivo y ejemplos que han llevado a consultar'],['expectations','Expectativas, necesidades y fortalezas referidas']]},
 {id:'difficulties',title:'Descripción de las dificultades, inicio, frecuencia e impacto',time:'2 min',source:'Familia · colegio · niño/a',checks:[
 ['attention','¿En qué situaciones observáis más dificultad para mantener la atención, organizarse o terminar actividades?'],
 ['activity','¿Cómo se regula el movimiento, la espera o la participación? ¿Cuándo le resulta más fácil?'],
 ['timeline','¿Desde cuándo ocurre, con qué frecuencia y qué impacto tiene? ¿Fue gradual, fluctuante o un cambio reciente?']
 ],fields:[['difficulties','Conductas observables, frecuencia, situaciones y ejemplos'],['timeline','Inicio, duración, curso y relación con cambios'],['impact','Repercusión en aprendizaje, autonomía, relaciones, bienestar o seguridad']]},
 {id:'home',title:'Funcionamiento en casa',time:'1 min',source:'Familia · niño/a',checks:[
 ['routines','¿Cómo van las rutinas, los deberes, el juego y la autonomía? ¿Cuánta ayuda o tiempo necesita?'],
 ['family','¿Cómo influyen las demandas, la organización familiar, las normas y los cambios o situaciones de estrés?'],
 ['otherActivities','¿Qué ocurre en deporte, ocio y otras actividades? ¿Hay diferencias con casa o colegio?']
 ],fields:[['home','Hogar: funcionamiento, ejemplos, apoyos y dinámica familiar'],['otherContexts','Otras actividades: funcionamiento, ejemplos y diferencias']]},
 {id:'school',title:'Información necesaria del colegio',time:'2 min',source:'Colegio · familia',checks:[
 ['observations','¿Qué observa el profesorado, desde cuándo y durante cuánto tiempo ha podido observarlo?'],
 ['schoolImpact','¿Cómo varía por asignatura, tarea o momento del día? ¿Qué impacto tiene en aprendizaje, participación y convivencia?'],
 ['schoolSupport','¿Qué apoyos o adaptaciones se han probado y con qué resultado? ¿Coinciden o difieren los relatos?']
 ],fields:[['school','Información escolar recibida, tiempo de observación y repercusión'],['schoolSupport','Apoyos ensayados, respuesta y concordancias o discrepancias']]},
 {id:'development',title:'Desarrollo, aprendizaje y lenguaje',time:'2 min',source:'Familia · colegio · pediatría',checks:[
 ['development','¿Cómo ha sido el desarrollo motor, de autonomía, comunicación y habilidades sociales? ¿Ha perdido alguna habilidad?'],
 ['learning','¿Las dificultades se concentran en lectura, escritura o cálculo, o son más globales? ¿Cómo aprende con ayuda?'],
 ['language','¿Comprende instrucciones y puede explicar lo que necesita o relatar lo ocurrido? ¿Qué valoraciones o apoyos existen?']
 ],fields:[['development','Desarrollo, hitos, autonomía y posibles cambios'],['learningLanguage','Aprendizaje, lenguaje, apoyos y evaluaciones aportadas']]},
 {id:'health',title:'Sueño, hábitos y salud general',time:'2 min',source:'Familia · niño/a · pediatría',checks:[
 ['sleep','¿Cuánto y cómo duerme? ¿Hay ronquido, pausas, despertares o somnolencia durante el día?'],
 ['habits','¿Cómo son las rutinas, las pantallas, la actividad física y la alimentación? ¿Usa cafeína, bebidas energéticas u otras sustancias?'],
 ['sensoryHealth','¿Hay problemas de visión, audición o salud general? ¿Qué medicación o suplementos toma y qué relación temporal tienen con las dificultades?']
 ],fields:[['sleepHabits','Sueño, rutinas, pantallas, alimentación y actividad física'],['healthSensory','Salud general, visión/audición, cribados previos y síntomas referidos'],['medication','Medicación y suplementos actuales: indicación, dosis, horario y cambios si constan']]},
 {id:'emotions',title:'Estado emocional, conducta y relaciones',time:'1 min',source:'Niño/a · familia · colegio',checks:[
 ['emotions','¿Cómo se siente? ¿Hay preocupaciones, tristeza, irritabilidad, frustración o cambios en su autoestima?'],
 ['relationships','¿Cómo son las relaciones con iguales y adultos? ¿Hay aislamiento, conflictos, acoso o situaciones de malestar?'],
 ['regulation','¿Qué suele ocurrir antes de las conductas que preocupan y qué le ayuda a regularse?']
 ],fields:[['emotionalSocial','Salud emocional, regulación, relaciones y necesidades de apoyo']]},
 {id:'background',title:'Antecedentes personales y familiares',time:'1 min',source:'Familia · registros clínicos',checks:[
 ['personal','¿Hay antecedentes gestacionales/perinatales, enfermedades, episodios neurológicos o intervenciones relevantes?'],
 ['familyBackground','¿Hay antecedentes familiares de dificultades de aprendizaje, neurodesarrollo, salud mental u otros relevantes?'],
 ['priorAssessments','¿Qué valoraciones previas se han realizado, qué conclusiones constan y qué respuesta hubo a los apoyos?']
 ],fields:[['background','Antecedentes personales y familiares relevantes'],['priorCare','Evaluaciones, intervenciones e informes previos efectivamente aportados']]},
 {id:'exam',title:'Exploración y comprobaciones pertinentes en Atención Primaria',time:'2 min',source:'Pediatría · registros de cribado',checks:[
 ['generalExam','Realizar y registrar la exploración general, crecimiento y constantes que sean pertinentes para este caso.'],
 ['sensoryCheck','Comprobar qué información de visión y audición existe y qué procede revisar según síntomas, hallazgos y protocolos locales.'],
 ['clinicalObservation','Describir la interacción, comunicación y autorregulación observadas sin generalizar una consulta a todos los contextos.']
 ],fields:[['examination','Exploración efectivamente realizada y hallazgos · no se completa normalidad'],['checksPerformed','Comprobaciones o pruebas realizadas/aportadas, con fecha y resultado si constan']]},
 {id:'alternatives',title:'Diagnósticos diferenciales o comorbilidades a considerar',time:'1 min',source:'Integración clínica de todas las fuentes',checks:[
 ['learningAlternative','Contrastar si aprendizaje, lenguaje, desarrollo u otro perfil de necesidades explican o acompañan parte de las dificultades.'],
 ['healthAlternative','Contrastar sueño, visión/audición, salud general, medicación y hábitos como factores posibles.'],
 ['emotionalAlternative','Contrastar bienestar emocional, experiencias adversas, acoso y contexto familiar/escolar; no convertir estas posibilidades en diagnósticos.']
 ],fields:[['alternatives','Posibles explicaciones alternativas o coexistentes que el pediatra considera necesario contrastar · sin confirmar diagnósticos']]},
 {id:'priority',title:'Señales que requieren valoración prioritaria',time:'1 min',source:'Niño/a · familia · colegio · pediatría',checks:[
 ['safety','Explorar preocupación actual por ideas de muerte/autolesión, riesgo para otras personas o desprotección, cuando sea pertinente.'],
 ['regression','Preguntar por pérdida de habilidades, cambio brusco, síntomas neurológicos o deterioro funcional importante.'],
 ['priorityDecision','Si existe preocupación relevante, valorar la prioridad según los hallazgos y el circuito local; la checklist no determina ni retrasa la actuación.']
 ],fields:[['priorityDetails','Datos de seguridad o deterioro relevantes, contexto y valoración de prioridad efectivamente realizada']]},
 {id:'plan',title:'Información pendiente y plan acordado',time:'2 min',source:'Acuerdo entre pediatría · familia · niño/a; coordinación escolar',checks:[
 ['synthesis','Diferenciar qué se conoce, qué relatos discrepan y qué falta; no cerrar el diagnóstico a partir de una única fuente o escala.'],
 ['goals','Acordar necesidades prioritarias y objetivos funcionales concretos, incorporando la perspectiva del niño o la niña.'],
 ['nextSteps','Contrastar con protocolos locales si procede ampliar información, evaluar aspectos específicos o coordinar atención, antes de decidir pruebas, tratamiento o derivación.']
 ],fields:[['clinicalAssessment','Valoración del pediatra expresamente indicada · integrar incertidumbre y necesidades'],['pendingInfo','Información pendiente: familia, colegio, otras actividades o comprobaciones'],['agreedPlan','Plan efectivamente acordado: responsables, coordinación y próximos pasos'],['followup','Seguimiento acordado: cuándo, con quién y qué se revisará']]}
];
export const SCHOOL_REQUEST=[
 'Solicitamos, previa autorización de la familia, información descriptiva sobre atención, organización y autorregulación para valorar necesidades; no presupone diagnóstico.',
 'Describan desde cuándo observan las dificultades, su frecuencia y ejemplos por tareas, asignaturas y momentos, respecto a alumnado de edad y desarrollo similares.',
 'Indiquen repercusión en aprendizaje, autonomía, participación, convivencia y bienestar, así como fortalezas y situaciones de mejor funcionamiento.',
 'Detallen lectura, escritura, cálculo y comprensión/expresión del lenguaje; apoyos o adaptaciones probados y su respuesta.',
 'Aporten información sobre relaciones, regulación emocional, asistencia y cambios observados, indicando informantes y período de observación.',
 'Propongan 2–3 cambios funcionales observables que indicarían mejoría y adjunten informes disponibles, evitando etiquetas diagnósticas.'
].join('\n');
export function newFirstVisit(){return {ageYears:'',origin:'',schoolStatus:'',priorityStatus:'',checks:{},responses:Object.fromEntries(FIRST_BLOCKS.flatMap(b=>b.fields.map(([id])=>[id,'']))),schoolRequest:SCHOOL_REQUEST};}
export function firstVisitWarnings(v){
 const warnings=[];
 if(v.ageYears!==''&&(!Number.isFinite(Number(v.ageYears))||Number(v.ageYears)<6||Number(v.ageYears)>=14))warnings.push('Esta guía está diseñada para 6–13 años. Adapta la entrevista y la interpretación a la edad; el registro no se bloquea.');
 if(v.priorityStatus==='concern')warnings.push('Has registrado una preocupación de prioridad. Contrasta la actuación y sus tiempos con la valoración clínica y los protocolos locales; completar la checklist no debe retrasarla.');
 if(v.schoolStatus==='discordant')warnings.push('Se ha señalado información discordante. Describe qué difiere entre contextos y fuentes antes de atribuirle una explicación.');
 return warnings;
}
export function firstVisitSummary(s){
 const v=s.firstVisit,r=v.responses,history=[],background=[],exam=[],tests=[],assessment=[],plan=[],pending=[];
 const add=(list,text,priority=75)=>{if(text?.trim())list.push({text,priority});};
 add(history,s.date?'Fecha: '+s.date:'',100);
 if(v.ageYears!=='')add(history,'Edad: '+v.ageYears+' años',80);
 if(v.origin)add(history,'Sospecha comunicada por: '+({family:'familia',school:'colegio',clinician:'pediatría',multiple:'varias fuentes'}[v.origin]),90);
 for(const [key,label,p] of [['difficulties','Dificultades observadas',95],['timeline','Inicio y curso',95],['impact','Impacto funcional',100],['home','Hogar',95],['otherContexts','Otras actividades',90],['school','Colegio',95],['schoolSupport','Apoyos y diferencias entre fuentes',85],['expectations','Necesidades y fortalezas',85],['sleepHabits','Sueño y hábitos',80],['healthSensory','Salud, visión/audición',85],['medication','Medicación registrada',90],['emotionalSocial','Bienestar emocional y relaciones',90]])if(r[key])add(history,label+': '+r[key],p);
 if(r.priorityDetails)add(history,'Seguridad/prioridad: '+r.priorityDetails,120);
 if(v.priorityStatus==='concern')add(history,'El pediatra registra una preocupación que requiere valorar la prioridad',125);
 else if(v.priorityStatus==='notIdentified')add(history,'El pediatra no identifica señales de prioridad en lo valorado',75);
 for(const [key,label] of [['development','Desarrollo'],['learningLanguage','Aprendizaje y lenguaje'],['background','Antecedentes'],['priorCare','Evaluaciones previas']])if(r[key])add(background,label+': '+r[key],80);
 add(exam,r.examination,105);add(tests,r.checksPerformed,85);
 // Mediciones y escalas son datos optativos; ninguna casilla equivale a un resultado.
 const m=s.measurement;
 if(m&&['weight','height','sbp','dbp','hr'].some(k=>m[k]!==''&&m[k]!=null)){
  const units={weight:['Peso','kg'],height:['Talla','cm'],sbp:['TA sistólica','mmHg'],dbp:['TA diastólica','mmHg'],hr:['FC','lpm']};
  add(exam,(m.date?m.date+'; ':'')+Object.entries(units).filter(([k])=>m[k]!==''&&m[k]!=null).map(([k,[label,unit]])=>label+': '+m[k]+' '+unit).join('; '),100);
 }
 for(const q of s.questionnaires||[]){const version=VERSIONS[q.type];if(!version)continue;const scores=version.scales.filter(([key])=>q.scores?.[key]!==''&&q.scores?.[key]!=null).map(([key,label])=>label+': '+q.scores[key]);if(scores.length)add(tests,version.label+(q.date?'; '+q.date:'')+'; '+scores.join('; '),65);if(q.interpretation)add(tests,'Interpretación aportada por el profesional: '+q.interpretation,70);}
 add(assessment,r.clinicalAssessment,110);
 if(r.alternatives)add(assessment,'Aspectos a contrastar, sin diagnóstico confirmado: '+r.alternatives,90);
 add(plan,r.agreedPlan,110);if(r.followup)add(plan,'Seguimiento acordado: '+r.followup,110);
 for(const g of s.goals||[])if(g.description)add(plan,'Objetivo funcional: '+g.description+[g.baseline&&'basal: '+g.baseline,g.criterion&&'criterio: '+g.criterion].filter(Boolean).map(x=>'; '+x).join(''),80);
 add(pending,r.pendingInfo,90);
 if(!r.home)add(pending,'Información del hogar no aportada',60);
 if(!r.school)add(pending,v.schoolStatus==='received'?'Contenido de la información escolar recibida no registrado':v.schoolStatus==='pending'?'Información escolar pendiente de recibir':'Información del colegio no aportada',60);
 if(!r.otherContexts)add(pending,'Otros contextos no documentados',60);
 if(v.schoolStatus==='discordant')add(pending,'Contraste entre fuentes discordantes pendiente',85);
 return buildSummary([[{text:r.reason,priority:110}],history,background,exam,tests,assessment,plan,pending]);
}
