import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ageDays,lmsAt,lmsZ,normalCDF,growthPercentile,growthForMeasurement} from '../src/percentiles.js';
import {WHO_DATA} from '../src/who-data.js';
const p=(variable,sex,days,value,more={})=>growthPercentile({variable,sex,days,value,position:'standing',oedema:'no',...more});
test('edad exacta en días UTC: bisiestos y fechas no válidas',()=>{
 assert.equal(ageDays('2020-02-28','2020-03-01'),2);assert.equal(ageDays('2020-01-01','2020-01-01'),0);
 for(const [a,b] of [['2020-02-30','2020-03-01'],['','2020-03-01'],['2021-01-01','2020-01-01']])assert.equal(ageDays(a,b),null);
});
test('cuadratura normal contrastada con 121 valores math.erf',()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/normal-cdf.json',import.meta.url)));
 for(const [z,expected] of fixture)assert.ok(Math.abs(normalCDF(z)-expected)<1e-11,`CDF ${z}`);
});
test('todas las tablas LMS tienen edades contiguas y parámetros válidos',()=>{
 for(const era of Object.values(WHO_DATA))for(const variable of Object.values(era))for(const rows of Object.values(variable)){
  assert.ok(rows.length>60);rows.forEach(([age,l,m,s],i)=>{assert.equal(age,rows[0][0]+i);assert.ok(Number.isFinite(l)&&m>0&&s>0);});
 }
});
test('todas las medianas oficiales -> Z0 y P50 para ambos sexos',()=>{
 for(const [era,indicators] of Object.entries(WHO_DATA))for(const [variable,sexes] of Object.entries(indicators))for(const [sex,rows] of Object.entries(sexes)){
  for(const [age,l,m,s] of rows.filter((_,i)=>i%19===0)){
   const days=era==='2006'?age:age*30.4375;if(era==='2006'&&days/30.4375>=60||era==='2007'&&(age>228||variable==='weight'&&age>120))continue;
   const r=p(variable,sex==='1'?'masculino':'femenino',days,m);
   assert.equal(r.available,true);assert.ok(Math.abs(r.z)<1e-10);assert.ok(Math.abs(r.percentile-50)<1e-8);
  }
 }
});
test('Anthro 2006 ejemplo oficial: niña 1522 días, 17kg -> Z0.24',()=>{const r=p('weight','femenino',1522,17);assert.equal(r.available,true);assert.equal(Number(r.z.toFixed(2)),.24);});
test('Anthro 2006 ejemplo oficial longitud niño 44 días 50cm',()=>{const r=p('height','masculino',44,50,{position:'recumbent'});assert.equal(Number(r.z.toFixed(2)),Number((((50/56.4833)-1)/.03492).toFixed(2)));});
test('AnthroPlus ejemplos oficiales con interpolación mensual',()=>{
 for(const [months,height,weight,zh,zw,zb] of [[60.32,113.8,18.7,.96,.21,-.58],[60.911701,113.6,20.5,.85,.79,.42]]){
  for(const [variable,value,expected] of [['height',height,zh],['weight',weight,zw],['bmi',weight/(height/100)**2,zb]]){
   const r=p(variable,'femenino',months*30.4375,value);assert.equal(r.available,true);assert.equal(Number(r.z.toFixed(2)),expected);
  }
 }
});
test('LMS interpola parámetros, no percentiles ni edades redondeadas',()=>{
 const a=lmsAt('2007','bmi','1',100),b=lmsAt('2007','bmi','1',101),c=lmsAt('2007','bmi','1',100.25);c.forEach((v,i)=>assert.ok(Math.abs(v-(a[i]+.25*(b[i]-a[i])))<1e-12));
});
test('ajuste OMS de colas ±3 respeta distancias SD2–3',()=>{
 const lms=lmsAt('2007','bmi','2',100),[l,m,s]=lms,sd=z=>m*(1+l*s*z)**(1/l);
 assert.ok(Math.abs(lmsZ(sd(3)+(sd(3)-sd(2)),lms,true)-4)<1e-10);
 assert.ok(Math.abs(lmsZ(sd(-3)-(sd(-2)-sd(-3)),lms,true)+4)<1e-10);
});
test('límites: no extrapola peso >120 ni talla/IMC >228 meses',()=>{
 for(const variable of ['height','bmi','weight']){
  const max=variable==='weight'?120:228;
  assert.equal(p(variable,'masculino',max*30.4375,lmsAt('2007',variable,'1',max)[1]).available,true);
  assert.equal(p(variable,'masculino',(max+.001)*30.4375,variable==='height'?170:30).available,false);
 }
 assert.equal(p('weight','masculino',-1,15).available,false);
});
test('transición 60 meses selecciona 2007; por debajo usa 2006',()=>{
 assert.equal(p('weight','masculino',1826,18).source,'OMS 2006');assert.equal(p('weight','masculino',1827,18).source,'OMS 2007');
});
test('sin sexo/fechas/medida/ausencia edema, no inventa percentiles',()=>{
 for(const r of [p('weight','',500,10),p('weight','masculino',null,10),p('weight','masculino',500,0),p('weight','masculino',500,10,{oedema:''}),p('bmi','masculino',500,15,{oedema:'si'}),p('height','masculino',500,80,{position:''})])assert.equal(r.available,false);
});
test('postura y 0.7 cm conforme a Anthro; IMC estandarizado explícito',()=>{
 const birth='2020-01-01';const a=growthForMeasurement({date:'2021-01-01',weight:'10',height:'75',position:'standing',oedema:'no'},birth,'masculino');
 const b=p('height','masculino',366,75.7,{position:'recumbent'});assert.equal(a.height.z,b.z);
 const c=growthForMeasurement({date:'2023-01-01',weight:'15',height:'100',position:'recumbent',oedema:'no'},birth,'femenino');
 assert.equal(c.height.z,p('height','femenino',1096,99.3).z);
 assert.equal(p('height','masculino',2400,130,{position:'recumbent'}).available,false);
});
test('valores extremos señalados no muestran percentil engañoso',()=>{
 assert.equal(p('height','masculino',2400,230).available,false);assert.equal(p('bmi','femenino',2400,100).available,false);
});
test('TA y FC no tienen percentil OMS',()=>{assert.equal(p('hr','masculino',2400,75).available,false);assert.equal(p('sbp','masculino',2400,100).available,false);});
