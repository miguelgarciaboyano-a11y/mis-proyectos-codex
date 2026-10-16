// Registro documental: reconocer un preparado no valida automáticamente una dosis.
export const ANTIGENS={hepB:'Hepatitis B',diphtheria:'Difteria',tetanus:'Tétanos',pertussis:'Tosferina',polio:'Poliomielitis',hib:'Haemophilus influenzae b',pcv:'Neumococo',menC:'Meningococo C',menACWY:'Meningococo ACWY',menB:'Meningococo B',rotavirus:'Rotavirus',measles:'Sarampión',mumps:'Parotiditis',rubella:'Rubéola',varicella:'Varicela',hpv:'VPH',influenza:'Gripe',covid:'COVID-19',hepA:'Hepatitis A',bcg:'BCG',rsv:'VRS · inmunización, no vacuna'};
export const VACCINES=[
 {id:'hexavalent',label:'Hexavalente · DTPa-VPI-Hib-HB',antigens:['diphtheria','tetanus','pertussis','polio','hib','hepB'],pattern:/\b(?:hexavalente|infanrix hexa|hexyon|vaxelis|dtpa[- /]+(?:vpi|ipv)[- /]+hib[- /]+(?:hb|hepb))\b/},
 {id:'mmrv',label:'SRPV · triple vírica y varicela',antigens:['measles','mumps','rubella','varicella'],pattern:/\b(?:srpv|mmrv|proquad|priorix tetra|tetravirica)\b/},
 {id:'mmr',label:'SRP · triple vírica',antigens:['measles','mumps','rubella'],pattern:/\b(?:srp|mmr|triple virica|triple viral|priorix|m-m-rvaxpro)\b/},
 {id:'dtpPolio',label:'DTP(a)-VPI',antigens:['diphtheria','tetanus','pertussis','polio'],pattern:/\b(?:dtpa[- /]+(?:vpi|ipv)|infanrix ipv|boostrix polio|repevax)\b/},
 {id:'dtp',label:'DTP(a) / dTpa · revisar formulación',antigens:['diphtheria','tetanus','pertussis'],pattern:/\b(?:dtpa|dtp|dpt|tdap|boostrix|triple bacteriana)\b/},
 {id:'td',label:'Td / dT',antigens:['diphtheria','tetanus'],pattern:/\b(?:td|dt|difteria[- /]+tetanos)\b/},
 {id:'hepB',label:'Hepatitis B',antigens:['hepB'],pattern:/\b(?:hepatitis b|hepb|hbv|engerix[- ]?b|hbvaxpro)\b/},
 {id:'polio',label:'VPI / polio',antigens:['polio'],pattern:/\b(?:vpi|ipv|polio|poliomielitis|imovax polio)\b/},
 {id:'hib',label:'Hib',antigens:['hib'],pattern:/\b(?:hib|act[- ]?hib|h[b]? influenzae b)\b/},
 {id:'pcv13',label:'Neumococo · VNC13',antigens:['pcv'],pattern:/\b(?:vnc ?13|pcv ?13|prevenar ?13)\b/},
 {id:'pcv15',label:'Neumococo · VNC15',antigens:['pcv'],pattern:/\b(?:vnc ?15|pcv ?15|vaxneuvance)\b/},
 {id:'pcv20',label:'Neumococo · VNC20',antigens:['pcv'],pattern:/\b(?:vnc ?20|pcv ?20|prevenar ?20|apexxnar)\b/},
 {id:'pcvUnknown',label:'Neumococo · producto no precisado',antigens:['pcv'],pattern:/\b(?:neumococo|neumococica|vnc|pcv|prevenar)\b/},
 {id:'menACWY',label:'Meningococo ACWY',antigens:['menACWY'],pattern:/\b(?:men ?acwy|meningococo acwy|menveo|nimenrix|menquadfi|acwy)\b/},
 {id:'menB',label:'Meningococo B',antigens:['menB'],pattern:/\b(?:men ?b|meningococo b|bexsero|trumenba)\b/},
 {id:'menC',label:'Meningococo C',antigens:['menC'],pattern:/\b(?:men ?c|meningococo c|neisvac[- ]?c|menjugate)\b/},
 {id:'rotarix',label:'Rotavirus · Rotarix',antigens:['rotavirus'],pattern:/\brotarix\b/},
 {id:'rotateq',label:'Rotavirus · RotaTeq',antigens:['rotavirus'],pattern:/\brotateq\b/},
 {id:'rotavirus',label:'Rotavirus · producto no precisado',antigens:['rotavirus'],pattern:/\brotavirus\b/},
 {id:'varicella',label:'Varicela',antigens:['varicella'],pattern:/\b(?:varicela|varicella|varilrix|varivax)\b/},
 {id:'hpv',label:'VPH · revisar producto',antigens:['hpv'],pattern:/\b(?:vph|hpv|gardasil(?: ?9)?|cervarix|papiloma)\b/},
 {id:'influenza',label:'Gripe · revisar campaña/producto',antigens:['influenza'],pattern:/\b(?:gripe|influenza|vaxigrip|influvac|fluarix|fluenz)\b/},
 {id:'covid',label:'COVID-19 · revisar producto',antigens:['covid'],pattern:/\b(?:covid[- ]?19|sars[- ]?cov[- ]?2|comirnaty|spikevax)\b/},
 {id:'hepA',label:'Hepatitis A',antigens:['hepA'],pattern:/\b(?:hepatitis a|hepa|havrix|vaqta)\b/},
 {id:'hepAB',label:'Hepatitis A+B',antigens:['hepA','hepB'],pattern:/\b(?:twinrix|hepatitis a ?[+\/] ?b)\b/},
 {id:'bcg',label:'BCG',antigens:['bcg'],pattern:/\bbcg\b/},
 {id:'nirsevimab',label:'Nirsevimab · inmunización frente a VRS',antigens:['rsv'],pattern:/\b(?:nirsevimab|beyfortus)\b/}
];
export const vaccineById=id=>VACCINES.find(v=>v.id===id);
const DAY=86400000;
export function dateValue(iso){if(!/^\d{4}-\d{2}-\d{2}$/u.test(iso||''))return null;const value=Date.parse(iso+'T00:00:00Z');return Number.isFinite(value)&&new Date(value).toISOString().slice(0,10)===iso?value:null;}
export function parseFullDate(value){let text=String(value).trim();if(/^\d{4}-\d{2}-\d{2}$/u.test(text))return dateValue(text)!==null?text:null;const m=text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/u);if(!m)return null;text=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return dateValue(text)!==null?text:null;}
export function addMonths(iso,months){const value=dateValue(iso);if(value===null||!Number.isInteger(months))return null;const d=new Date(value),target=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months,1)),last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(d.getUTCDate(),last));return target.toISOString().slice(0,10);}
export function ageAt(birth,date){const b=dateValue(birth),d=dateValue(date);if(b===null||d===null||d<b)return null;const bd=new Date(b),dd=new Date(d);let months=(dd.getUTCFullYear()-bd.getUTCFullYear())*12+dd.getUTCMonth()-bd.getUTCMonth();if(dateValue(addMonths(birth,months))>d)months--;const days=Math.round((d-dateValue(addMonths(birth,months)))/DAY);return {months,days,totalDays:Math.round((d-b)/DAY),years:Math.floor(months/12),remainingMonths:months%12};}
export function ageLabel(age){if(!age)return 'Edad no calculable';const a=[];if(age.years)a.push(`${age.years} ${age.years===1?'año':'años'}`);if(age.remainingMonths)a.push(`${age.remainingMonths} ${age.remainingMonths===1?'mes':'meses'}`);if(age.days||!a.length)a.push(`${age.days} ${age.days===1?'día':'días'}`);return a.join(', ');}
export const newVaccineRow=(id)=>({id,vaccine:'',product:'',date:'',reportedAge:'',source:'manual',reviewed:false});
const norm=text=>text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
function matchesFor(line){const normalized=norm(line),hits=[];for(const def of VACCINES){const m=def.pattern.exec(normalized);if(m)hits.push({vaccine:def.id,start:m.index,end:m.index+m[0].length,product:line.slice(m.index,m.index+m[0].length)});}const specificPcv=hits.some(h=>['pcv13','pcv15','pcv20'].includes(h.vaccine)),specificRota=hits.some(h=>['rotarix','rotateq'].includes(h.vaccine));return hits.filter(h=>!(h.vaccine==='pcvUnknown'&&specificPcv)&&!(h.vaccine==='rotavirus'&&specificRota)).sort((a,b)=>(b.end-b.start)-(a.end-a.start)).filter((hit,i,all)=>!all.slice(0,i).some(earlier=>earlier.start<=hit.start&&earlier.end>=hit.end)).sort((a,b)=>a.start-b.start);}
// Solo fechas completas; no se adivinan siglos, fechas manuscritas ni pares en tablas ambiguas.
export function parseVaccineText(text){if(typeof text!=='string'||text.length>50000)throw new Error('Usa como máximo 50 000 caracteres.');const rows=[],unparsed=[],warnings=[];let next=0;
 for(const raw of text.split(/\r?\n/u)){const line=raw.trim();if(!line)continue;const hits=matchesFor(line);const dates=[...line.matchAll(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.\-]\d{1,2}[/.\-]\d{4})\b/gu)];
  if(/\b(?:pendiente|programad[ao]|previst[ao]|rechazad[ao]|pospuest[ao]|proxima dosis|por administrar|cita para|no (?:se )?(?:ha )?(?:administrad[ao]|vacunad[ao]|recibid[ao])|se (?:aconseja|recomienda))\b/u.test(norm(line))){unparsed.push({text:line,reason:'Menciona una dosis pendiente, negada o recomendada; no demuestra administración.'});continue;}
  if(!hits.length){unparsed.push({text:line,reason:'No se reconoce un preparado con suficiente precisión.'});continue;}
  if(hits.length>1&&dates.length>1){unparsed.push({text:line,reason:'Hay varios preparados y varias fechas: asigna cada dosis manualmente.'});continue;}
  if(!dates.length){const age=line.match(/\b\d+\s*(?:mes(?:es)?|a[nñ]os?|semanas?|d[ií]as?)\b/iu)?.[0]||'';for(const hit of hits)rows.push({...newVaccineRow('p'+next++),vaccine:hit.vaccine,product:hit.product,reportedAge:age,source:line.slice(0,1000)});warnings.push('Hay preparados sin fecha completa; una edad recomendada no demuestra administración.');continue;}
  for(const hit of hits)for(const date of dates){const iso=parseFullDate(date[0]);if(!iso){unparsed.push({text:line,reason:`Fecha no válida: ${date[0]}.`});continue;}rows.push({...newVaccineRow('p'+next++),vaccine:hit.vaccine,product:hit.product,date:iso,source:line.slice(0,1000)});}
  if(rows.length>200)throw new Error('Máximo 200 registros por consulta. Divide el documento.');
 }
 if(rows.length>200)throw new Error('Máximo 200 registros por consulta. Divide el documento.');
 const seen=new Set();for(const row of rows){const key=row.vaccine+'|'+row.date;if(row.date&&seen.has(key))warnings.push('Hay registros repetidos del mismo preparado y fecha; revísalos antes de contar dosis.');seen.add(key);}
 return {rows,unparsed,warnings:[...new Set(warnings)]};
}
export function auditVaccineRows(rows,birth,consult){const issues=[],valid=[],birthValue=dateValue(birth),consultValue=dateValue(consult),seen=new Map();
 if(birthValue===null)issues.push('Completa una fecha de nacimiento válida.');if(consultValue===null)issues.push('Completa una fecha de consulta válida.');if(birthValue!==null&&consultValue!==null&&birthValue>consultValue)issues.push('La fecha de consulta precede al nacimiento.');
 for(const row of rows){const problems=[],def=vaccineById(row.vaccine),date=dateValue(row.date);if(!def)problems.push('Preparado no identificado');if(date===null)problems.push('Fecha de administración incompleta o no válida');if(date!==null&&birthValue!==null&&date<birthValue)problems.push('Administración anterior al nacimiento');if(date!==null&&consultValue!==null&&date>consultValue)problems.push('Administración posterior a la consulta');if(!row.reviewed)problems.push('Dato pendiente de comprobar');
  if(def&&date!==null){for(const antigen of def.antigens){const key=antigen+'|'+row.date;if(seen.has(key)){problems.push(`Posible solapamiento de ${ANTIGENS[antigen]} en la misma fecha`);const previous=seen.get(key);previous.problems.push(`Posible solapamiento de ${ANTIGENS[antigen]} en la misma fecha`);}else seen.set(key,{row,problems});}}
  valid.push({row,def,age:ageAt(birth,row.date),problems});
 }
 const ready=birthValue!==null&&consultValue!==null&&birthValue<=consultValue;
 return {issues,rows:valid,eligible:ready?valid.filter(x=>!x.problems.length).map(x=>x.row):[],ready};
}
export function antigenHistory(rows,birth,consult){const audit=auditVaccineRows(rows,birth,consult);return {audit,antigens:Object.entries(ANTIGENS).map(([id,label])=>({id,label,doses:audit.rows.filter(x=>x.def?.antigens.includes(id)).sort((a,b)=>(dateValue(a.row.date)??Infinity)-(dateValue(b.row.date)??Infinity))})).filter(a=>a.doses.length)};}
