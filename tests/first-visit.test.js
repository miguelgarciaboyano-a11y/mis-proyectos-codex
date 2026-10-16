import test from 'node:test';
import assert from 'node:assert/strict';
import {FIRST_BLOCKS,SCHOOL_REQUEST,firstVisitSummary,firstVisitWarnings} from '../src/first-visit.js';
import {newState} from '../src/schema.js';
import {generateNote} from '../src/clinical.js';
import {wordCount,NOTE_HEADINGS} from '../src/note-summary.js';
test('12 bloques y 36 casillas de proceso, sin diagnóstico presupuesto',()=>{
 assert.equal(FIRST_BLOCKS.length,12);assert.equal(FIRST_BLOCKS.reduce((n,b)=>n+b.checks.length,0),36);
 const text=FIRST_BLOCKS.flatMap(b=>b.checks.map(([,q])=>q)).join(' ');assert.match(text,/En qué situaciones observáis/);assert.doesNotMatch(text,/desde cuándo tiene TDAH|diagnóstico confirmado/i);
 assert.ok(FIRST_BLOCKS.some(b=>b.source.includes('Colegio')||b.source.includes('colegio')));assert.ok(FIRST_BLOCKS.some(b=>b.source.includes('Familia')));assert.ok(FIRST_BLOCKS.some(b=>b.source.includes('Pediatría')));
});
test('marcar toda la checklist no crea hechos clínicos, pruebas, plan o negativos',()=>{
 const s=newState();const before=generateNote(s);for(const b of FIRST_BLOCKS)for(const [id] of b.checks)s.firstVisit.checks[b.id+'_'+id]=true;
 assert.equal(generateNote(s),before);assert.match(before,/Exploración: no aportada/);assert.match(before,/Valoración del pediatra: no aportada/);assert.match(before,/Plan: no aportado/);assert.doesNotMatch(before,/normal|sin síntomas|TDAH confirmado|derivar/);
});
test('datos familiares, escolares y de otras actividades se distinguen en nota',()=>{
 const s=newState();Object.assign(s.firstVisit,{ageYears:'9',origin:'school'});Object.assign(s.firstVisit.responses,{reason:'Dificultades de organización',home:'Necesita 8 recordatorios',school:'Tareas incompletas',otherContexts:'Participa con apoyo en deporte',impact:'Deberes 90 min/día',timeline:'Desde hace 2 años'});
 const n=generateNote(s);for(const x of ['Edad: 9 años','Sospecha comunicada por: colegio','Hogar: Necesita 8 recordatorios','Colegio: Tareas incompletas','Otras actividades: Participa con apoyo en deporte','90 min/día','2 años'])assert.ok(n.includes(x),x);assert.ok(wordCount(n)<=180);assert.deepEqual(n.split('\n').map(l=>l.split(':')[0]),NOTE_HEADINGS);
});
test('hallazgos, comprobaciones, valoración y plan solo de campos expresos',()=>{
 const s=newState();Object.assign(s.firstVisit.responses,{reason:'Consulta por dificultades de atención',examination:'Agudeza visual aportada 0,6 OD',checksPerformed:'Audiometría del 01/10/2026 aportada',clinicalAssessment:'Información insuficiente para concluir',alternatives:'Sueño y aprendizaje a contrastar',agreedPlan:'Recabar información escolar con autorización',followup:'Revisión en 3 semanas'});
 const n=generateNote(s);assert.match(n,/Exploración: Agudeza visual aportada 0,6 OD/);assert.match(n,/Pruebas: Audiometría del 01\/10\/2026/);assert.match(n,/Valoración del pediatra: Información insuficiente/);assert.match(n,/Plan: Recabar información escolar/);assert.match(n,/Revisión en 3 semanas/);assert.doesNotMatch(n,/iniciar metilfenidato|derivar automáticamente|diagnóstico de TDAH/);
});
test('prioridad y discrepancias son selecciones clínicas, nunca inferencias de casillas',()=>{
 const s=newState();assert.deepEqual(firstVisitWarnings(s.firstVisit),[]);s.firstVisit.checks.priority_safety=true;assert.deepEqual(firstVisitWarnings(s.firstVisit),[]);
 s.firstVisit.priorityStatus='concern';s.firstVisit.responses.priorityDetails='Cambio brusco de funcionamiento pendiente de valorar';s.firstVisit.schoolStatus='discordant';
 assert.equal(firstVisitWarnings(s.firstVisit).length,2);const n=generateNote(s);assert.match(n,/preocupación que requiere valorar la prioridad/);assert.match(n,/Cambio brusco/);assert.match(n,/fuentes discordantes/);assert.match(n,/Plan: no aportado/);
});
test('datos pendientes no se convierten en ausencia de afectación escolar',()=>{const n=generateNote(newState());assert.match(n,/Información del colegio no aportada/);assert.match(n,/Otros contextos no documentados/);assert.doesNotMatch(n,/sin problemas escolares|no hay afectación|pruebas normales/);});
test('guía 6–13 años: advierte fuera de rango sin bloquear registro',()=>{for(const age of ['6','13','13.9']){const s=newState();s.firstVisit.ageYears=age;assert.deepEqual(firstVisitWarnings(s.firstVisit),[]);}for(const age of ['5','14','-1']){const s=newState();s.firstVisit.ageYears=age;assert.equal(firstVisitWarnings(s.firstVisit).length,1);assert.match(generateNote(s),new RegExp('Edad: '+age));}});
test('solicitud escolar de seis líneas, neutral y sin identificadores',()=>{assert.equal(SCHOOL_REQUEST.split('\n').length,6);assert.match(SCHOOL_REQUEST,/previa autorización/);assert.match(SCHOOL_REQUEST,/no presupone diagnóstico/);assert.match(SCHOOL_REQUEST,/fortalezas/);assert.doesNotMatch(SCHOOL_REQUEST,/Nombre:|DNI:|diagnóstico confirmado/);});
test('síntesis extensa prioriza datos fundamentales, avisa y preserva el registro',()=>{const s=newState();s.firstVisit.responses.reason='Dificultades de atención';s.firstVisit.responses.difficulties='dato clínico '.repeat(250);s.firstVisit.responses.priorityDetails='Riesgo actual registrado para valorar';s.firstVisit.responses.agreedPlan='Plan individualizado por el pediatra';const r=firstVisitSummary(s);assert.ok(r.words<=180);assert.match(r.text,/Riesgo actual registrado/);assert.match(r.text,/Plan individualizado/);assert.ok(r.omitted.length>0);assert.equal(s.firstVisit.responses.difficulties,'dato clínico '.repeat(250));});
test('recorrido sucesivo no incorpora respuestas de primera consulta ni plantilla escolar',()=>{const s=newState();s.firstVisit.responses.reason='Motivo exclusivo primera';s.firstVisit.schoolRequest='Solicitud exclusiva';s.mode='follow';s.interview.reason='Motivo de seguimiento';const n=generateNote(s);assert.match(n,/Motivo de seguimiento/);assert.doesNotMatch(n,/Motivo exclusivo primera|Solicitud exclusiva/);});
