// Campos de entrevista: las reglas clínicas se mantienen en clinical.js.
export const STATES = [['','No valorado'],['no','No'],['si','Sí'],['desconocido','Desconocido']];
export const symptoms = [
 ['attention','Dificultad para mantener la atención en tareas con esfuerzo'],['instructions','Dificultad para seguir instrucciones sin repetición'],
 ['completion','Dificultad para terminar lo que empieza'],['forgetting','Pérdidas u olvidos de material y deberes'],
 ['organization','Dificultad para organizarse o estimar el tiempo'],['distraction','Distracción por estímulos'],
 ['disconnect','Parece desconectar o no escuchar'],['careless','Errores por descuido'],['avoidance','Evita tareas de esfuerzo mental sostenido'],
 ['movement','Movimiento excesivo cuando debe estar tranquilo'],['interruptions','Habla excesiva o interrupciones'],
 ['turns','Dificultad para esperar turno'],['impulsivity','Actuar antes de pensar, responder antes de tiempo o invadir actividades']
];
export const differentials = [
 ['learning','Aprendizaje','Lectura lenta o imprecisa, escritura/ortografía o matemáticas muy focales. Puede coexistir con TDAH.'],
 ['capacity','Capacidad / desarrollo intelectual','Comprensión global incluso atento, autonomía, aprendizaje muy rápido o discordancia capacidad–rendimiento.'],
 ['language','Lenguaje / comunicación','Inicio del lenguaje, comprensión de instrucciones, expresión y narración ordenada.'],
 ['social','Área social / TEA','Reciprocidad, bromas y reglas implícitas, rigidez, intereses restringidos, sensibilidad sensorial incluso estando atento.'],
 ['anxiety','Ansiedad','Preocupación, evitación, reafirmación, somatizaciones o perfeccionismo; relación con la inatención.'],
 ['mood','Ánimo','Tristeza o irritabilidad persistente, anhedonia, sueño/apetito, culpa o inutilidad.'],
 ['conduct','Conducta','Desafío deliberado, enfado, agresividad o conducta antisocial; diferenciar de impulsividad seguida de arrepentimiento.'],
 ['sleep','Sueño','Duración, insomnio, ronquido, pausas respiratorias, somnolencia, piernas inquietas y pantallas.'],
 ['context','Contexto psicosocial','Cambios, pérdidas, conflictos, estrés, absentismo, normas y estructura familiar/escolar.']
];
export const cvFields = [
 ['syncope','Síncope inexplicado'],['effortPain','Dolor con esfuerzo'],['effortBreath','Disnea de esfuerzo'],
 ['palpitations','Palpitaciones'],['heartDisease','Cardiopatía personal'],
 ['suddenDeath','Muerte súbita familiar'],['arrhythmia','Arritmias familiares']
];
export const adverseEffects = [
 ['appetite','Pérdida de apetito'],['insomnia','Insomnio'],['irritability','Irritabilidad'],
 ['pressure','TA o FC elevadas'],['inhibition','Inhibición excesiva / aplanamiento'],['hyperfocus','Hiperfocalización excesiva']
];
export const drugFields = [
 ['active','Principio activo'],['presentation','Presentación / marca y concentración'],['formulation','Formulación / tipo de liberación'],
 ['dose','Dosis por toma y unidad'],['total','Dosis total diaria (mg/día)','number'],['schedule','Horarios / relación con comidas'],
 ['start','Fecha de inicio','date'],['changes','Cambios recientes y respuesta a escalones previos','textarea']
];
export const interviewGroups = [
 {id:'pattern',title:'Motivo, patrón y contexto',fields:[
 ['reason','Motivo de consulta y 2–3 dificultades prioritarias','textarea'],['informants','Informantes, relación y contexto de la información'],
 ['onset','Inicio: edad aproximada y circunstancias'],['before12','Síntomas antes de los 12 años','state'],
 ['duration','Duración y persistencia: tiempo y curso'],['persistent','Patrón persistente descrito','state'],
 ['course','Constante, reciente o fluctuante; posibles desencadenantes'],['contexts','Entornos y ejemplos concretos','textarea'],
 ['home','Síntomas en casa','state'],['school','Síntomas en el colegio','state'],['activities','Síntomas en actividades / ámbito social','state'],
 ['exceptions','Dónde casi no aparecen; estructura, demandas y motivación','textarea']
 ]},
 {id:'impact',title:'Impacto funcional',fields:[
 ['academic','Académico: rendimiento, esfuerzo, supervisión y minutos de deberes','textarea'],
 ['autonomy','Autonomía: rutinas, mochila, higiene, vestirse y recordatorios','textarea'],
 ['relationships','Social / conducta: conflictos, sanciones, amigos, juego o deporte','textarea'],
 ['wellbeing','Bienestar: autoestima, frustración, esfuerzo y seguridad','textarea'],
 ['impairment','Repercusión funcional relevante según valoración profesional','state']
 ]},
 {id:'history',title:'Antecedentes e intervenciones',fields:[
 ['personal','Antecedentes personales, gestación/perinatal, desarrollo y enfermedades','textarea'],
 ['family','Antecedentes familiares y comorbilidades conocidas','textarea'],['previous','Evaluaciones e intervenciones previas y resultado','textarea'],
 ['current','Intervenciones actuales: familia, colegio, apoyo educativo o psicológico','textarea'],
 ['baselineAppetite','Apetito basal'],['baselineSleep','Sueño basal'],['examination','Exploración efectivamente realizada y hallazgos','textarea']
 ]},
 {id:'teachers',title:'Información del profesorado',fields:[
 ['teacherTiming','Momentos del día o asignaturas donde funciona mejor y peor','textarea'],
 ['teacherComparison','Comparación con edad y madurez similares','textarea'],['teacherMeasures','Medidas probadas y resultado','textarea'],
 ['teacherProblem','Dificultad principal: organización, aprendizaje, conducta o combinación','textarea'],
 ['teacherGoals','Tres cambios observables que indicarían mejoría','textarea'],
 ['study','Evaluación psicopedagógica / psicométrica: datos, indicación y pendientes','textarea']
 ]}
];
export const followFields = [
 ['adherence','Adherencia','select',[['','No valorada'],['buena','Buena, confirmada'],['dificultades','Dificultades / tomas omitidas'],['desconocida','Desconocida']]],
 ['adherenceDetails','Tomas reales, horarios y dificultades','textarea'],
 ['response','Respuesta global','select',[['','No valorada'],['ninguna','Sin mejoría observable'],['parcial','Mejoría insuficiente'],['buena','Buena respuesta funcional']]],
 ['homeResponse','Respuesta en familia'],['schoolResponse','Respuesta escolar / información docente'],['socialResponse','Respuesta social / deporte'],
 ['effectOnset','Inicio del efecto tras la toma'],['effectDuration','Duración observada del efecto'],['coverageNeeds','Horas y actividades que necesitan cobertura'],
 ['coverage','Cobertura de las necesidades','select',[['','No valorada'],['suficiente','Suficiente'],['corta','Insuficiente / se agota pronto'],['desconocida','Desconocida']]],
 ['rebound','Posible rebote','state'],['reboundDetails','Momento, síntomas y relación temporal del posible rebote','textarea'],
 ['weekends','Funcionamiento y necesidades en fines de semana / vacaciones','textarea'],
 ['comorbidityReview','Revisión de comorbilidades, contexto y alternativas antes de ajustar','textarea']
];
export function newState(){return {
 mode:'first', date:new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Madrid'}), birth:'',sex:'',
 interview:{}, symptoms:{}, symptomExamples:'', differential:{}, differentialDetails:'',selfHarm:'', cv:{},cvDetails:'',
 goals:[],measurements:[],measurement:{date:'',weight:'',height:'',sbp:'',dbp:'',hr:'',position:'',oedema:''},
 drug:{},follow:{},ramReviewed:false,ram:Object.fromEntries(adverseEffects.map(([id])=>[id,{present:false,intensity:'',onset:'',impact:'',notes:''}])),
 otherRam:'',constantsReview:'',questionnaires:[],assessment:'',plan:'',followup:'',accepted:[]
};}
