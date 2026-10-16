// Importación restrictiva: solo se trasladan objetivos, pauta y mediciones elegidos.
import {drugFields} from './schema.js';
const text=x=>typeof x==='string'?x.slice(0,10000):typeof x==='number'&&Number.isFinite(x)?String(x):'';
const pick=(o,keys)=>Object.fromEntries(keys.map(k=>[k,text(o?.[k])]));
export function parseTransfer(raw){
 if(raw.length>1_000_000)throw Error('Archivo demasiado grande (máximo 1 MB).');
 const p=JSON.parse(raw);
 if(p?.app!=='consulta-pediatrica-local'||p.version!==1||!p.consultation||typeof p.consultation!=='object')throw Error('No es una exportación compatible de Consulta v1.');
 const s=p.consultation;
 return {
  date:text(s.date),
  goals:(Array.isArray(s.goals)?s.goals:[]).slice(0,30).filter(g=>g&&typeof g==='object').map(g=>({...pick(g,['description','baseline','criterion','context']),current:''})),
  drug:pick(s.drug,drugFields.map(([k])=>k)),
  measurements:[...(Array.isArray(s.measurements)?s.measurements:[]),...(s.measurement&&typeof s.measurement==='object'?[s.measurement]:[])].slice(-200).filter(m=>m&&typeof m==='object'&&['weight','height','sbp','dbp','hr'].some(k=>m[k]!==''&&m[k]!=null)).map(m=>pick(m,['date','weight','height','sbp','dbp','hr','position','oedema']))
 };
}
export function applyTransfer(s,previous,selection){
 if(selection.goals)s.goals=previous.goals.map(g=>({...g}));
 if(selection.drug)s.drug={...previous.drug};
 if(selection.measurements)s.measurements=previous.measurements.map(m=>({...m}));
 s.accepted=[];return s;
}
