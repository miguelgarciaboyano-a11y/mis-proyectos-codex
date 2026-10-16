import test from 'node:test';
import assert from 'node:assert/strict';
import {newState,cvFields,adverseEffects} from '../src/schema.js';
import {generateNote,ramText,therapyProposal,synthesis} from '../src/clinical.js';
import {bmi,measurementWarnings,compareMeasurements,percentileStatus} from '../src/measurements.js';
import {VERSIONS,scoreErrors,questionnaireText} from '../src/questionnaires.js';
import {parseTransfer,applyTransfer} from '../src/transfer.js';
const complete=()=>{
 const s=newState();s.mode='follow';s.birth='2016-01-01';s.date='2026-10-16';
 s.drug={active:'Metilfenidato',presentation:'Ejemplo ficticio',formulation:'IR',dose:'5 mg',total:'10',schedule:'08:00 y 12:00',start:'2026-09-01'};
 s.follow={adherence:'buena',response:'buena',effectOnset:'30 minutos',effectDuration:'4 horas',coverage:'suficiente',rebound:'no',homeResponse:'Mejoría funcional referida',schoolResponse:'Mejoría referida',comorbidityReview:'Revisadas por el profesional'};
 s.goals=[{description:'Deberes',baseline:'90 min',criterion:'60 min',current:'55 min',context:'escolar'}];
 s.measurement={date:'2026-10-16',weight:'30',height:'140',sbp:'100',dbp:'60',hr:'75'};
 s.ramReviewed=true;s.constantsReview='compatible';for(const [k] of cvFields)s.cv[k]='no';return s;
};
test('consulta incompleta no inventa hallazgos ni negaciones',()=>{
 const s=newState();s.mode='follow';s.interview.reason='Distracción referida';const n=generateNote(s);
 assert.match(n,/Distracción referida/);assert.doesNotMatch(n,/diagnóstico de TDAH|exploración normal|cardiopatía.*no|sin reacciones adversas/i);
 assert.doesNotMatch(n,/IMC|cuestionario.*negativo/i);
});
test('frecuencia cero explícita se conserva; vacío no se convierte en cero',()=>{
 const s=newState();s.mode='follow';s.symptoms.attention='0';const n=generateNote(s);assert.match(n,/nunca\/casi nunca/);assert.doesNotMatch(n,/Seguir instrucciones/);
});
test('RAM iniciales no generan negativas confirmadas',()=>{
 const s=newState();assert.match(ramText(s),/no revisadas/);assert.doesNotMatch(ramText(s),/no, confirmado/);
 s.ramReviewed=true;assert.equal((ramText(s).match(/no, confirmado/g)||[]).length,adverseEffects.length);
});
test('RAM positiva incluye detalles y no pierde otras negativas revisadas',()=>{
 const s=newState();s.ramReviewed=true;s.ram.appetite={present:true,intensity:'Moderada',onset:'Mediodía',impact:'Come menos',notes:'Caso ficticio'};
 assert.match(ramText(s),/sí.*Intensidad: Moderada.*Mediodía.*Come menos.*Caso ficticio/);
 assert.match(ramText(s),/Insomnio: no, confirmado/);
});
test('síntesis vacía declara lagunas sin probabilidad o diagnóstico',()=>{
 const r=synthesis(newState());assert.equal(r.support.length,0);assert.ok(r.gaps.length>4);assert.match(r.gaps.join(' '),/no equivale a un resultado negativo/);
});
test('síntesis separa contexto, deterioro y alternativas',()=>{
 const s=newState();Object.assign(s.interview,{before12:'si',persistent:'si',duration:'2 años',home:'si',school:'si',impairment:'si'});s.symptoms.attention='2';s.differential.learning='si';s.selfHarm='si';
 const r=synthesis(s);assert.match(r.support.join(' '),/varios entornos/);assert.match(r.alternatives.join(' '),/Aprendizaje/);assert.match(r.next.join(' '),/valoración específica/);assert.match(r.next.join(' '),/psicopedagógica/);
});
test('la síntesis automática no entra en la nota sin aceptación',()=>{assert.doesNotMatch(generateNote(complete()),/Hallazgos que apoyan|varios entornos/);});
test('propuesta vacía bloqueada con campos concretos',()=>{const p=therapyProposal(newState());assert.equal(p.blocked,true);assert.ok(p.missing.includes('Principio activo'));assert.ok(p.missing.includes('Revisión explícita de reacciones adversas'));});
test('cada prerrequisito relevante bloquea ajustes',()=>{
 const variants=[s=>s.ramReviewed=false,s=>s.measurement.weight='',s=>s.measurement.date='',s=>s.cv.syncope='',s=>s.constantsReview='',s=>s.follow.schoolResponse='',s=>s.follow.adherence='desconocida',s=>s.follow.effectDuration='',s=>s.goals=[],s=>s.drug.formulation='',s=>s.drug.total='0',s=>s.birth='',s=>s.follow.rebound=''];
 for(const mutate of variants){const s=complete();mutate(s);assert.equal(therapyProposal(s).blocked,true);}
});
test('metilfenidato no se extiende a otros principios activos',()=>{const s=complete();s.drug.active='Atomoxetina';assert.equal(therapyProposal(s).id,'other-drug');assert.equal(therapyProposal(s).blocked,true);});
test('constantes o cribado CV preocupantes priorizan seguridad',()=>{
 const s=complete();s.cv.syncope='si';assert.equal(therapyProposal(s).id,'safety');assert.equal(therapyProposal(s).blocked,true);
 s.cv.syncope='no';s.constantsReview='review';assert.equal(therapyProposal(s).id,'safety');
});
test('respuesta buena suficiente -> valorar mantener, sin prescripción',()=>{const p=therapyProposal(complete());assert.equal(p.id,'maintain');assert.equal(p.blocked,false);assert.doesNotMatch(p.text,/\d+\s*mg/);assert.ok(p.rule&&p.source);});
test('respuesta buena corta -> cobertura, sin conversiones',()=>{const s=complete();s.follow.coverage='corta';const p=therapyProposal(s);assert.equal(p.id,'coverage');assert.match(p.text,/No aumentar por reflejo/);});
test('RAM revisadas positivas priorizan tolerabilidad',()=>{const s=complete();s.ram.appetite.present=true;assert.equal(therapyProposal(s).id,'tolerance');});
test('respuesta insuficiente no produce escalones numéricos',()=>{const s=complete();s.follow.response='parcial';const p=therapyProposal(s);assert.equal(p.id,'response');assert.match(p.text,/Sin propuesta de dosis/);});
test('propuesta no aceptada excluida del plan; aceptada se identifica expresamente',()=>{
 const s=complete();assert.doesNotMatch(generateNote(s),/valorar mantener/i);s.accepted=[therapyProposal(s)];assert.match(generateNote(s),/Opción aceptada por el profesional:/);
});
test('IMC unidades kg y cm: 25 kg, 125 cm = 16',()=>{assert.equal(bmi({weight:'25',height:'125'}),16);});
test('IMC ausente o no calculable no produce infinito ni cero ficticio',()=>{
 for(const m of [{},{weight:'25',height:''},{weight:'',height:'120'},{weight:'25',height:'0'},{weight:'-2',height:'120'}])assert.equal(bmi(m),null);
});
test('datos dudosos se conservan y se marcan, no clasifican normalidad',()=>{
 const m={date:'',weight:'30',height:'1.4',sbp:'80',dbp:'90',hr:'999'};assert.ok(measurementWarnings(m).length>=4);assert.equal(m.hr,'999');
});
test('comparación solo con medición previa cronológica; diferencias en unidades',()=>{
 const a={date:'2026-10-16',weight:'30',height:'140'},b={date:'2026-09-16',weight:'29',height:'139'};
 assert.match(compareMeasurements(a,b).join(' '),/\+1.0 kg/);assert.match(compareMeasurements(b,a)[0],/posterior/);
});
test('percentiles no se inventan ni extrapolan',()=>{assert.match(percentileStatus('weight'),/Sin extrapolación/);assert.match(percentileStatus('hr'),/No se atribuye una referencia OMS/);});
for(const type of ['parent','teacher'])test('Vanderbilt '+type+': límites por versión y valores ausentes',()=>{
 const q={type,scores:{}};assert.deepEqual(scoreErrors(q),[]);assert.match(questionnaireText(q),/Sin puntuaciones aportadas/);
 for(const [id,,min,max] of VERSIONS[type].scales){q.scores={[id]:String(min)};assert.deepEqual(scoreErrors(q),[]);q.scores={[id]:String(max)};assert.deepEqual(scoreErrors(q),[]);q.scores={[id]:String(max+1)};assert.equal(scoreErrors(q).length,1);if(id!=='average'){q.scores={[id]:'0.5'};assert.equal(scoreErrors(q).length,1);}}
 assert.match(questionnaireText(q),/Interpretación automática no disponible/);
});
test('versiones no comparten subescalas de oposición/conducta',()=>{assert.ok(VERSIONS.parent.scales.some(([id])=>id==='conduct'));assert.ok(!VERSIONS.teacher.scales.some(([id])=>id==='conduct'));});
test('transferencia solo de grupos elegidos y no de negativos o decisiones',()=>{
 const old=complete();old.goals[0].current='55 min';old.assessment='No trasladar';old.accepted=[therapyProposal(old)];
 const p=parseTransfer(JSON.stringify({app:'consulta-pediatrica-local',version:1,consultation:old}));const s=newState();applyTransfer(s,p,{goals:true,drug:false,measurements:true});
 assert.equal(s.goals[0].current,'');assert.equal(s.goals[0].baseline,'90 min');assert.deepEqual(s.drug,{});assert.deepEqual(s.cv,{});assert.equal(s.ramReviewed,false);assert.equal(s.assessment,'');assert.equal(s.measurements.length,1);assert.equal(s.measurement.weight,'');assert.deepEqual(s.accepted,[]);
});
test('rechaza importaciones incompatibles, gigantes y campos peligrosos',()=>{
 assert.throws(()=>parseTransfer('{}'));assert.throws(()=>parseTransfer('x'.repeat(1_000_001)));
 const p=parseTransfer('{"app":"consulta-pediatrica-local","version":1,"consultation":{"drug":{"__proto__":{"polluted":true},"active":"Metilfenidato"},"goals":[{"description":"<script>x</script>","current":"no trasladar"}]}}');
 assert.equal({}.polluted,undefined);assert.equal(p.goals[0].current,'');assert.equal(p.drug.active,'Metilfenidato');assert.equal(p.goals[0].description,'<script>x</script>');
});

test('fechas incoherentes y autolesión bloquean propuestas',()=>{
 const s=complete();s.measurement.date='2027-01-01';assert.equal(therapyProposal(s).blocked,true);
 s.measurement.date=s.date;s.selfHarm='si';assert.equal(therapyProposal(s).id,'self-harm');assert.equal(therapyProposal(s).blocked,true);
});
