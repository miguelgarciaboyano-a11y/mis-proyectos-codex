export function numeric(x){return x!==''&&x!=null&&Number.isFinite(Number(x))?Number(x):null;}
export function bmi(m){const w=numeric(m.weight),h=numeric(m.height);return w>0&&h>0?w/((h/100)**2):null;}
// Límites de plausibilidad de entrada, NO umbrales de normalidad clínica.
export const bounds={weight:[0.5,300,'kg'],height:[30,230,'cm'],sbp:[40,250,'mmHg'],dbp:[20,180,'mmHg'],hr:[20,250,'lpm']};
export function measurementWarnings(m){
 const warnings=[];
 for(const [k,[min,max]] of Object.entries(bounds)){
  if(m[k]===''||m[k]==null)continue;
  const n=numeric(m[k]);if(n===null||n<min||n>max)warnings.push(`${k}: comprobar valor y unidades (control de entrada ${min}–${max}, no rango de normalidad).`);
 }
 if(numeric(m.sbp)!==null&&numeric(m.dbp)!==null&&Number(m.dbp)>=Number(m.sbp))warnings.push('Comprobar TA: diastólica igual o mayor que sistólica.');
 if(!m.date&&Object.keys(bounds).some(k=>m[k]!==''&&m[k]!=null))warnings.push('Fecha de medición pendiente.');
 return warnings;
}
export function percentileStatus(variable){
 return variable==='sbp'||variable==='dbp'||variable==='hr'
  ? 'Percentil no disponible. No se atribuye una referencia OMS a TA o FC. TA: valorar AAP 2017; FC: falta referencia por edad y condiciones.'
  : 'Percentil OMS disponible cuando existen datos aplicables: OMS 2006 <60 meses; OMS 2007 talla/IMC 60–228 meses y peso 60–120 meses. Sin extrapolación.';
}
export function measurementText(m){
 const names={weight:'Peso',height:'Talla',sbp:'TA sistólica',dbp:'TA diastólica',hr:'FC'};
 const p=Object.entries(names).filter(([k])=>m[k]!==''&&m[k]!=null).map(([k,l])=>`${l}: ${m[k]} ${bounds[k][2]}`);
 const b=bmi(m);if(b!==null)p.push(`IMC calculado: ${b.toFixed(2)} kg/m²${measurementWarnings(m).length?' (medición pendiente de revisión)':''}`);
 return `${m.date||'Fecha pendiente'} — ${p.join('; ')||'Sin valores'}`;
}
export function compareMeasurements(current,previous){
 if(!current.date||!previous.date||current.date<=previous.date)return ['Para comparar, la medición actual debe ser posterior a la previa.'];
 const results=[];
 for(const [k,[,,unit]] of Object.entries(bounds)){
  const a=numeric(current[k]),b=numeric(previous[k]);if(a!==null&&b!==null)results.push(`${k}: ${a-b>0?'+':''}${(a-b).toFixed(1)} ${unit}`);
 }
 const a=bmi(current),b=bmi(previous);if(a!==null&&b!==null)results.push(`IMC: ${a-b>0?'+':''}${(a-b).toFixed(2)} kg/m²`);
 return results;
}
