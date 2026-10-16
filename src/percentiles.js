// Métodos OMS Anthro / AnthroPlus (ver docs/PERCENTILES.md).
// Implementación JS añadida 2026-10-16; datos y métodos de referencia OMS, GPL >=3.
// Sin garantía. Conservar atribución y vendor/who/LICENSE.md al redistribuir.
import {WHO_DATA} from './who-data.js';
const MS_DAY=86400000;
export function ageDays(birth,date){
 const parse=s=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;
  const d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?+d:null;
 };
 const a=parse(birth),b=parse(date);return a===null||b===null||b<a?null:(b-a)/MS_DAY;
}
export function lmsAt(era,variable,sex,age){
 const rows=WHO_DATA[era]?.[variable]?.[sex];if(!rows||!Number.isFinite(age))return null;
 if(age<rows[0][0]||age>rows.at(-1)[0])return null;
 const low=Math.floor(age),a=rows[low-rows[0][0]],b=rows[low+1-rows[0][0]];
 if(!a)return null;
 if(age===low)return a.slice(1);
 if(!b)return null;
 const f=age-low;return a.slice(1).map((x,i)=>x+f*(b[i+1]-x));
}
export function lmsZ(value,[l,m,s],adjusted=false){
 let z=l===0?Math.log(value/m)/s:((value/m)**l-1)/(l*s);
 if(adjusted&&Math.abs(z)>3){
  const sd=n=>l===0?m*Math.exp(s*n):m*(1+l*s*n)**(1/l);
  z=z>3?3+(value-sd(3))/(sd(3)-sd(2)):-3+(value-sd(-3))/(sd(-2)-sd(-3));
 }
 return z;
}
// Cuadratura de Simpson de la normal estándar, validada contra math.erf:
// 121 puntos entre -6 y 6, error absoluto <1e-11. No sustituye las tablas LMS.
export function normalCDF(z){
 if(!Number.isFinite(z))return null;
 if(z===0)return .5;
 const a=Math.min(Math.abs(z),8),n=2048,h=a/n;
 const density=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
 let sum=density(0)+density(a);
 for(let i=1;i<n;i++)sum+=(i%2?4:2)*density(i*h);
 return .5+Math.sign(z)*h*sum/3;
}
export function growthPercentile({variable,sex,days,value,oedema,position}){
 const fail=reason=>({available:false,reason});
 if(!['weight','height','bmi'].includes(variable))return fail('No hay referencia OMS implementada para esta variable.');
 const refSex={masculino:'1',femenino:'2'}[sex];
 if(!refSex)return fail('Falta sexo de referencia.');
 if(days===null||!Number.isFinite(days)||days<0)return fail('Faltan fechas válidas de nacimiento y medición.');
 if(!(typeof value==='number'&&Number.isFinite(value)&&value>0))return fail('Falta una medición positiva y válida.');
 if(variable!=='height'&&oedema!=='no')return fail(oedema==='si'?'Edema referido: no se calcula percentil de peso/IMC.':'Falta confirmar ausencia de edema para peso/IMC.');
 if(variable!=='weight'&&!['standing','recumbent'].includes(position))return fail('Falta indicar talla de pie o longitud tumbado.');
 const months=days/30.4375,era=months<60?'2006':'2007';
 // Elección explícita conforme a Anthro (<60 meses) y AnthroPlus (>=60).
 if(era==='2007'&&(months>228||variable==='weight'&&months>120))return fail(variable==='weight'?'Peso/edad OMS 2007: fuera del rango implementado 60–120 meses.':'Fuera del rango implementado OMS 2007: 60–228 meses.');
 if(era==='2007'&&variable!=='weight'&&position!=='standing')return fail('OMS 2007: se requiere talla de pie, no longitud tumbado.');
 if(era==='2006'&&days>1856)return fail('Fuera de tabla diaria OMS 2006.');
 const lms=lmsAt(era,variable,refSex,era==='2006'?days:months);
 if(!lms)return fail('No hay fila de referencia para esta edad; no se extrapola.');
 const z=lmsZ(value,lms,variable!=='height');
 const flagged=variable==='height'?Math.abs(z)>6:variable==='weight'?z < -6||z>5:Math.abs(z)>5;
 if(!Number.isFinite(z)||flagged)return fail('Z fuera de límites de plausibilidad OMS: revisar la medición. Se conserva el dato, sin percentil.');
 return {available:true,z,percentile:normalCDF(z)*100,source:'OMS '+era,sex,days,months,lms,method:era==='2006'?'LMS diario, Anthro; ajuste de colas para peso/IMC':'LMS interpolado por edad exacta en meses (días/30,4375), AnthroPlus; ajuste de colas para peso/IMC'};
}
export function growthForMeasurement(m,birth,sex){
 const days=ageDays(birth,m.date),rawHeight=Number(m.height),weight=Number(m.weight);
 let adjustedHeight=rawHeight;
 if(days!==null&&days/30.4375<60){
  if(days<731&&m.position==='standing')adjustedHeight+=.7;
  if(days>=731&&m.position==='recumbent')adjustedHeight-=.7;
 }
 const values={weight: m.weight===''?null:weight,height:m.height===''?null:adjustedHeight,bmi:m.weight!==''&&m.height!==''&&weight>0&&adjustedHeight>0?weight/(adjustedHeight/100)**2:null};
 return Object.fromEntries(['weight','height','bmi'].map(variable=>[variable,growthPercentile({variable,sex,days,value:values[variable],oedema:m.oedema,position:m.position})]));
}
export function formatGrowth(result){return result.available?`${result.source} · P${result.percentile<.1?'<0,1':result.percentile>99.9?'>99,9':result.percentile.toFixed(1)} · Z ${result.z.toFixed(2)} · ${result.sex}; edad ${result.months.toFixed(3)} meses`:'Percentil no disponible: '+result.reason;}
