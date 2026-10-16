const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();let accept=true;const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>accept?d.accept():d.dismiss());
 const field=p=>page.locator(`[data-fever-path="${p}"]`);
 const action=a=>page.locator(`[data-fever-action="${a}"]`).click();
 const note=()=>page.locator('#fever-note').inputValue();
 try{
 await page.goto('http://127.0.0.1:5173/');await page.locator('[data-path="interview.reason"]').fill('TDAH ficticio conservado');
 await page.locator('[data-module="fever"]').click();assert.equal(await page.locator('[data-fever-path$=".present"]').count(),10);
 await action('generate');assert.doesNotMatch(await note(),/BEG|No refiere/);
 await field('days').fill('2');await field('ageMonths').fill('8');
 await field('symptoms.vomiting.present').selectOption('si');await field('symptoms.vomiting.days').fill('1');await field('symptoms.vomiting.count').fill('3');await field('symptoms.vomiting.hours').fill('6');
 await field('symptoms.diarrhea.present').selectOption('si');await field('symptoms.diarrhea.count').fill('4');await field('symptoms.diarrhea.days').fill('1');
 await field('symptoms.pain.present').selectOption('si');await field('symptoms.pain.location').fill('Abdomen');
 await field('contacts').selectOption('si');await field('contactWho').fill('Hermano');await field('contactIllness').fill('Catarro');
 await field('historyReviewed').check();await field('exam.respiratory').fill('AP: sibilancias bilaterales.');await field('examReviewed').check();await field('adviceReviewed').check();
 await action('generate');let n=await note();assert.match(n,/Fiebre de 2 días/);assert.match(n,/3 vómitos.*6 horas/);assert.match(n,/4 deposiciones/);assert.match(n,/Hermano; cuadro: Catarro/);assert.match(n,/sibilancias/);assert.doesNotMatch(n,/BVB/);assert.match(n,/FANT/);assert.match(n,/Se explican signos/);
 await action('copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),n);
 await page.locator('#fever-note').fill('Nota manual ficticia');await field('days').fill('3');assert.equal(await note(),'Nota manual ficticia');assert.equal(await field('adviceReviewed').isChecked(),false);
 accept=false;await action('generate');assert.equal(await note(),'Nota manual ficticia');accept=true;
 await page.locator('[data-module="tdah"]').click();assert.equal(await page.locator('[data-path="interview.reason"]').inputValue(),'TDAH ficticio conservado');
 await page.locator('[data-module="fever"]').click();assert.equal(await note(),'Nota manual ficticia');assert.equal(await field('symptoms.vomiting.count').inputValue(),'3');
 await field('ageMonths').fill('12');assert.equal(await field('examReviewed').isChecked(),false);await field('examReviewed').check();await action('generate');assert.doesNotMatch(await note(),/FANT/);
 await field('returnMode').selectOption('extra2');assert.match(await page.locator('#fever-advice-preview').innerText(),/Reevaluar hoy/);
 await field('ageMonths').fill('2');assert.match(await page.locator('#fever-warnings').innerText(),/valoración urgente/);assert.doesNotMatch(await page.locator('#fever-advice-preview').innerText(),/en 48 horas/);
 await field('symptoms.cough.present').selectOption('si');assert.equal(await field('historyReviewed').isChecked(),false);
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await action('reset');assert.equal(await note(),'');assert.equal(await field('days').inputValue(),'');
 await page.locator('[data-module="tdah"]').click();assert.equal(await page.locator('[data-path="interview.reason"]').inputValue(),'TDAH ficticio conservado');
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 console.log('Fiebre: síntomas/detalles, exploración sin contradicciones, FANT por edad, consejos revisados, avisos, edición/copia, consultas independientes, reinicio, axe y 3 anchos: OK.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
