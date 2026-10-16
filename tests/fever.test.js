import test from 'node:test';
import assert from 'node:assert/strict';
import {newFever,FEVER_SYMPTOMS,EXAM,feverExam,feverNote,defaultAdvice,isInfant,feverWarnings} from '../src/fever.js';
test('diez síntomas con No inicial sin negativas confirmadas',()=>{const s=newFever();assert.equal(FEVER_SYMPTOMS.length,10);assert.ok(FEVER_SYMPTOMS.every(([id])=>s.symptoms[id].present==='no'));assert.doesNotMatch(feverNote(s),/No refiere|BEG|meníngeos negativos/);});
test('anamnesis revisada confirma negativas y convivientes',()=>{const s=newFever();s.historyReviewed=true;assert.match(feverNote(s),/No refiere síntomas catarrales/);assert.match(feverNote(s),/No refiere convivientes enfermos/);});
test('duración y detalles digestivos y dolor incluidos solo si positivos',()=>{
 const s=newFever();s.days='2';s.symptoms.diarrhea={present:'si',days:'1',count:'5'};s.symptoms.vomiting={present:'si',days:'2',count:'3',hours:'4'};s.symptoms.pain={present:'si',days:'1',location:'Abdomen'};s.contacts='si';s.contactWho='Hermano';s.contactIllness='Catarro';
 const n=feverNote(s);assert.match(n,/Fiebre de 2 días/);assert.match(n,/5 deposiciones en las últimas 24 horas/);assert.match(n,/3 vómitos en las últimas 24 horas; 4 horas/);assert.match(n,/localización: Abdomen/);assert.match(n,/Hermano; cuadro: Catarro/);
 s.symptoms.vomiting.present='no';assert.doesNotMatch(feverNote(s),/3 vómitos/);
});
test('campos incompletos pendientes, cero explícito conservado',()=>{const s=newFever();s.symptoms.vomiting.present='si';s.symptoms.vomiting.count='0';const n=feverNote(s);assert.match(n,/duración pendiente/);assert.match(n,/0 vómitos en las últimas 24 horas/);assert.match(n,/horas desde el último vómito pendientes/);});
test('exploración completa exacta tras confirmar y FANT solo <12 meses',()=>{
 const s=newFever();s.examReviewed=true;s.ageMonths='11';let n=feverExam(s);for(const [,,normal] of EXAM)assert.ok(n.includes(normal));
 s.ageMonths='12';assert.doesNotMatch(feverExam(s),/FANT/);s.ageMonths='';assert.doesNotMatch(feverExam(s),/FANT/);s.ageMonths='0';assert.equal(isInfant(s),true);
});
test('alteración sustituye todo su apartado y no se contradice con normalidad',()=>{const s=newFever();s.examReviewed=true;s.exam.respiratory='AP: sibilancias bilaterales.';s.exam.skin='Exantema macular.';s.exam.abdomen='Dolor a la palpación en FID.';const n=feverExam(s);assert.match(n,/sibilancias/);assert.doesNotMatch(n,/BVB|No lesiones cutáneas|Abdomen blando/);assert.match(n,/AC rítmica, sin soplos/);});
test('alteraciones sin revisión no certifican otros órganos normales',()=>{const s=newFever();s.exam.ears='Otoscopia derecha alterada';assert.match(feverExam(s),/Otoscopia derecha alterada/);assert.doesNotMatch(feverExam(s),/BEG|Oídos normales/);});
test('consejos dos líneas, no constan explicados hasta confirmar',()=>{const s=newFever();assert.equal(defaultAdvice(s).split('\n').length,2);assert.doesNotMatch(feverNote(s),/Se explican signos/);s.adviceReviewed=true;assert.match(feverNote(s),/Se explican signos/);s.adviceText='Consejos individuales revisados';assert.match(feverNote(s),/Consejos individuales revisados/);});
test('no pospone tres días de fiebre ni lactante pequeño dos días más',()=>{const s=newFever();s.returnMode='extra2';s.days='3';assert.match(defaultAdvice(s),/Reevaluar hoy/);assert.doesNotMatch(defaultAdvice(s),/en 48 horas/);s.ageMonths='2';assert.match(defaultAdvice(s),/valoración urgente/);assert.ok(feverWarnings(s).length>=2);});
test('duraciones negativas y cantidades no enteras se avisan conservando datos',()=>{const s=newFever();s.days='-1';s.symptoms.diarrhea={present:'si',days:'-2',count:'1.5'};assert.equal(feverWarnings(s).length,3);assert.equal(s.symptoms.diarrhea.count,'1.5');});
