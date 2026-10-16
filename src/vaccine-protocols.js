// No se atribuyen reglas clínicas a una fuente sin disponer de su versión contrastada.
export const VACCINE_PROTOCOLS=[
 {id:'aep',label:'Manual de Vacunas de la AEP',url:'https://vacunasaep.org/documentos/manual',verified:false,version:'',rules:[],status:'Pendiente de incorporar el calendario y las pautas de rescate vigentes de la AEP.'},
 {id:'madrid',label:'Comunidad de Madrid',url:'https://www.comunidad.madrid/servicios/salud/vacunas',verified:false,version:'',rules:[],status:'Pendiente de incorporar el calendario y las pautas de rescate vigentes de Madrid.'}
];
// Hasta contrastar edad, producto, intervalos, cohortes y excepciones no se recomienda completar dosis.
export function compareVaccineProtocols(audit,protocols=VACCINE_PROTOCOLS){return protocols.map(p=>({id:p.id,label:p.label,url:p.url,version:p.version,status:p.status,assessed:false,recommendations:[],reason:!p.verified||!p.rules.length?'No se puede determinar qué vacunas faltan sin una pauta de referencia contrastada.':!audit.ready?'Fechas de nacimiento o consulta pendientes de revisión.':audit.rows.some(r=>r.problems.length)?'Comprobar los registros antes de evaluar la pauta.':'Pauta pendiente de validación clínica; no se generan recomendaciones automáticas.'}));}
