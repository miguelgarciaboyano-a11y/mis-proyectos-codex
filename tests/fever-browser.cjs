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
 const validate=async()=>{const text=await note();assert.equal(text.split('\n').length,8);assert.ok(text.trim().split(/\s+/).length<=180);return text;};
 try{
 await page.goto('http://127.0.0.1:5173/');await page.locator('[data-first-path="responses.reason"]').fill('TDAH ficticio conservado');
 await page.locator('a[data-module="fever"]').click();assert.equal(await page.locator('[data-fever-path$=".present"]').count(),10);
 assert.equal(await page.locator('input[type="checkbox"]').count(),0);assert.equal(await page.locator('[data-fever-path^="exam"]').count(),1);
 for(const width of [1440,1024,768,390]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));
  const rows=await page.locator('.fever-symptom-row').evaluateAll(els=>els.map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})));
  assert.ok(rows.every(r=>r.top>=0&&r.bottom<=900),'diez síntomas en pantalla a '+width+': '+JSON.stringify(rows));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.setViewportSize({width:1440,height:1000});await action('generate');let n=await validate();
 assert.match(n,/^Exploración: no aportada\.$/m);assert.match(n,/^Plan: no aportado\.$/m);assert.doesNotMatch(n,/BEG|normal|No se refieren|Se explican|FANT/);
 await field('days').fill('2');await field('ageMonths').fill('8');await field('symptoms.cough.present').selectOption('no');
 await field('symptoms.vomiting.present').selectOption('si');await field('symptoms.vomiting.days').fill('1');await field('symptoms.vomiting.count').fill('3');await field('symptoms.vomiting.hours').fill('6');
 await field('symptoms.diarrhea.present').selectOption('si');await field('symptoms.diarrhea.count').fill('4');await field('symptoms.diarrhea.days').fill('1');
 await field('contacts').selectOption('si');await field('contactWho').fill('hermano');await field('contactIllness').fill('catarro');
 await field('examAlterations').fill('AP: sibilancias bilaterales.');
 await page.locator('details.section').evaluateAll(els=>els.forEach(el=>el.open=true));
 await field('relevantHistory').fill('Antecedente de bronquiolitis');await field('tests').fill('16/10/2026: PCR 8,5 mg/L');await field('assessment').fill('Sibilancias en contexto catarral según valoración del pediatra');await field('plan').fill('Revisión el 18/10/2026');
 await action('generate');n=await validate();
 for(const value of ['Fiebre de 2 días','3 vómitos en las últimas 24 horas','último vómito hace 6 horas','4 deposiciones','AP: sibilancias','8,5 mg/L','18/10/2026'])assert.ok(n.includes(value),value);
 assert.match(n,/No se refiere tos/);assert.doesNotMatch(n,/BVB|Oídos normales|sin soplos|FANT|Se explican/);
 await action('copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),n);
 await action('use-advice');assert.equal(await note(),n);await action('generate');n=await validate();assert.match(n,/Se explican signos/);
 await page.locator('#fever-note').fill('palabra '.repeat(181));await action('copy');assert.match(await page.locator('#note-status').innerText(),/supera 180/);assert.match(await page.locator('#fever-note-length').innerText(),/181\/180/);
 await page.locator('#fever-note').fill('Nota manual ficticia');await field('days').fill('3');assert.equal(await note(),'Nota manual ficticia');
 accept=false;await action('generate');assert.equal(await note(),'Nota manual ficticia');accept=true;
 await page.locator('a[data-module="tdah"]').click();assert.equal(await page.locator('[data-first-path="responses.reason"]').inputValue(),'TDAH ficticio conservado');
 await page.locator('a[data-module="fever"]').click();assert.equal(await note(),'Nota manual ficticia');
 await field('examAlterations').fill('');await action('generate');assert.match(await validate(),/^Exploración: no aportada\.$/m);
 await field('extraHistory').evaluate(el=>el.closest('details').open=true);await field('extraHistory').fill('Registro extenso '.repeat(300));await action('generate');assert.match(await validate(),/Información adicional no incluida por extensión/);assert.equal(await field('extraHistory').inputValue(),'Registro extenso '.repeat(300));
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 await action('reset');assert.equal(await note(),'');assert.equal(await field('symptoms.cough.present').inputValue(),'');
 await page.locator('a[data-module="tdah"]').click();assert.equal(await page.locator('[data-first-path="responses.reason"]').inputValue(),'TDAH ficticio conservado');
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 console.log('Síntesis Fiebre: ocho apartados y ≤180 palabras, solo datos aportados, no inferencias normales, fechas/cifras, consejo expreso, límite de copia, edición conservada, avisos de omisión, accesibilidad y diseño compacto: OK.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
