import test from 'node:test';
import assert from 'node:assert/strict';
import {newFever,FEVER_SYMPTOMS,feverExam,feverNote,feverSummary,defaultAdvice,feverWarnings} from '../src/fever.js';
import {NOTE_HEADINGS,wordCount} from '../src/note-summary.js';
test('Fiebre vacía no inventa negativos, exploración, diagnóstico o consejos',()=>{
 const s=newFever(),n=feverNote(s);assert.equal(FEVER_SYMPTOMS.length,10);assert.ok(FEVER_SYMPTOMS.every(([id])=>s.symptoms[id].present===''));
 assert.match(n,/^Exploración: no aportada\.$/m);assert.match(n,/^Valoración del pediatra: no aportada\.$/m);assert.match(n,/^Plan: no aportado\.$/m);
 assert.doesNotMatch(n,/BEG|normal|sin soplos|No se refieren|FANT|Se explican signos/);
 assert.deepEqual(n.split('\n').map(l=>l.split(':')[0]),NOTE_HEADINGS);assert.ok(wordCount(n)<=180);
});
test('solo los No elegidos por el profesional entran como negativos',()=>{
 const s=newFever();s.symptoms.cough.present='no';s.contacts='no';const n=feverNote(s);assert.match(n,/No se refiere tos/);assert.match(n,/No se refieren convivientes enfermos/);assert.doesNotMatch(n,/No se refieren síntomas catarrales/);
});
test('fechas, cifras y unidades no se convierten al redactar',()=>{
 const s=newFever();s.days='2';s.ageMonths='27';s.symptoms.vomiting={present:'si',days:'1',count:'3',hours:'6'};s.tests='16/10/2026: PCR 8,5 mg/L';s.examAlterations='Temperatura 38,7 °C; FC 110 lpm';const n=feverNote(s);
 for(const value of ['Fiebre de 2 días','Edad: 27 meses','3 vómitos en las últimas 24 horas','último vómito hace 6 horas','16/10/2026','8,5 mg/L','38,7 °C','110 lpm'])assert.ok(n.includes(value),value);
});
test('síntomas digestivos y dolor conservan datos; ausencia no genera cifras',()=>{
 const s=newFever();s.symptoms.diarrhea={present:'si',days:'1',count:'0'};s.symptoms.pain={present:'si',days:'',location:'fosa ilíaca derecha'};
 const n=feverNote(s);assert.match(n,/0 deposiciones/);assert.match(n,/localización: fosa ilíaca derecha/);assert.doesNotMatch(n,/vómitos|último vómito hace/);assert.match(n,/Duración de dolor no aportada/);
});
test('exploración escrita se conserva sin completar otros órganos ni FANT',()=>{
 const s=newFever();s.ageMonths='8';s.examAlterations='AP: sibilancias bilaterales.';assert.equal(feverExam(s),'Exploración: AP: sibilancias bilaterales.');assert.doesNotMatch(feverNote(s),/FANT|sin soplos|Oídos normales|BEG/);
 s.examAlterations='FANT. AP: BVB.';assert.match(feverExam(s),/FANT\. AP: BVB\./);
});
test('separación de antecedentes, pruebas, valoración y plan expresos',()=>{
 const s=newFever();Object.assign(s,{relevantHistory:'Alergia a penicilina',tests:'Test estreptococo negativo',assessment:'Probable infección viral según valoración del pediatra',plan:'Revisión el 18/10/2026',adviceText:'Se explica volver antes si empeora',pending:'Informe previo no disponible'});
 const n=feverNote(s);assert.match(n,/^Antecedentes relevantes: Alergia a penicilina\./m);assert.match(n,/^Pruebas: Test estreptococo negativo\./m);assert.match(n,/^Valoración del pediatra: Probable infección viral/m);assert.match(n,/^Plan: Revisión el 18\/10\/2026\. Se explica volver antes si empeora\./m);assert.match(n,/Informe previo no disponible/);
});
test('propuestas de consejo no son hechos ni se incorporan sin selección expresa',()=>{
 const s=newFever();s.returnMode='extra2';assert.match(defaultAdvice(s),/48 horas/);assert.doesNotMatch(feverNote(s),/48 horas|Se explican/);
 s.adviceText=defaultAdvice(s);assert.match(feverNote(s),/48 horas|Se explican/);
});
test('síntesis larga queda en 180 palabras, avisa y preserva fuente',()=>{
 const s=newFever();s.extraHistory='Dato clínico extenso '.repeat(300);s.examAlterations='AP: BVB';s.assessment='Valoración clínica aportada';const original=s.extraHistory,r=feverSummary(s);
 assert.ok(r.words<=180);assert.ok(r.omitted.length>0);assert.match(r.text,/Información adicional no incluida por extensión/);assert.match(r.text,/Exploración: AP: BVB/);assert.equal(s.extraHistory,original);
});
test('consejos orientativos mantienen avisos por edad y persistencia fuera de nota',()=>{
 const s=newFever();s.returnMode='extra2';s.days='3';assert.match(defaultAdvice(s),/Reevaluar hoy/);s.ageMonths='2';assert.match(defaultAdvice(s),/valoración urgente/);assert.ok(feverWarnings(s).length>=2);assert.doesNotMatch(feverNote(s),/valoración urgente|Reevaluar hoy/);
});
test('valores dudosos se conservan para revisión y no se sustituyen por normales',()=>{const s=newFever();s.days='-1';s.symptoms.diarrhea={present:'si',days:'-2',count:'1.5'};assert.equal(feverWarnings(s).length,3);assert.equal(s.symptoms.diarrhea.count,'1.5');});
