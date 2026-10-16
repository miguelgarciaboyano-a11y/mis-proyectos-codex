export const VERSIONS = {
 parent:{label:'NICHQ Vanderbilt — padres, rev. 1102 (2005; AAP 2010)',period:'Últimos seis meses',source:'Spanish Vanderbilt ADHD Parent.pdf, p. 4',
  scales:[['inattention','Inatención: nº de ítems 1–9 con 2–3',0,9],['hyperactivity','Hiperactividad/impulsividad: nº 10–18 con 2–3',0,9],['total','Suma de síntomas 1–18',0,54],['opposition','Oposición: nº 19–26 con 2–3',0,8],['conduct','Conducta: nº 27–40 con 2–3',0,14],['anxiety','Ansiedad/ánimo: nº 41–47 con 2–3',0,7],['performance','Rendimiento: nº 48–55 con 4–5',0,8],['average','Media de rendimiento 48–55',1,5]]},
 teacher:{label:'NICHQ Vanderbilt — maestro, rev. 0303 (2005; AAP 2010)',period:'Desde inicio del curso; indicar semanas o meses de observación',source:'Spanish Vanderbilt ADHD Teacher.pdf, p. 4',
  scales:[['inattention','Inatención: nº de ítems 1–9 con 2–3',0,9],['hyperactivity','Hiperactividad/impulsividad: nº 10–18 con 2–3',0,9],['total','Suma de síntomas 1–18',0,54],['oppositionConduct','Oposición/conducta: nº 19–28 con 2–3',0,10],['anxiety','Ansiedad/ánimo: nº 29–35 con 2–3',0,7],['performance','Rendimiento: nº 36–43 con 4–5',0,8],['average','Media de rendimiento 36–43',1,5]]}
};
export function scoreErrors(q){
 const v=VERSIONS[q.type]; if(!v)return ['Versión no implementada.'];
 return v.scales.flatMap(([id,label,min,max])=>{
  const x=q.scores?.[id]; if(x===''||x==null)return [];
  const n=Number(x); return !Number.isFinite(n)||n<min||n>max||(id!=='average'&&!Number.isInteger(n))?[`${label}: valor fuera de ${min}–${max}${id==='average'?'':' (entero)'}.`]:[];
 });
}
export function questionnaireText(q){
 const v=VERSIONS[q.type];if(!v)return 'Instrumento no implementado.';
 const errors=scoreErrors(q);
 const scores=v.scales.filter(([id])=>q.scores?.[id]!==''&&q.scores?.[id]!=null)
  .map(([id,label])=>`${label}: ${q.scores[id]}`).join('; ');
 return `${v.label}. Informante: ${q.informant||'pendiente'}; relación: ${q.relation||'pendiente'}; fecha: ${q.date||'pendiente'}. Período observado: ${q.period||'pendiente'}; medicación durante la evaluación: ${q.medication||'no consta'}.\n${scores||'Sin puntuaciones aportadas; no interpretable.'}${errors.length?'\nDatos pendientes de revisión: '+errors.join(' '):''}\nInterpretación automática no disponible: el adjunto no incluye criterios completos de clasificación.${q.interpretation?'\nInterpretación introducida por el profesional: '+q.interpretation:''}`;
}
