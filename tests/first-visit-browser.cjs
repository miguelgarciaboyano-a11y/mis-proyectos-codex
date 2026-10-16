const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[],external=[];let accept=true;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173/'))external.push(r.url());});page.on('dialog',d=>accept?d.accept():d.dismiss());
 const f=p=>page.locator(`[data-first-path="${p}"]`),action=a=>page.locator(`[data-action="${a}"]`).click();
 const open=async id=>page.locator('#first-block-'+id).evaluate(el=>el.open=true);
 const note=()=>page.locator('#clinical-note').inputValue();
 const validate=async()=>{const n=await note();assert.equal(n.split('\n').length,8);assert.ok(n.trim().split(/\s+/).length<=180);return n;};
 try{
 await page.goto('http://127.0.0.1:5173/');await page.locator('#first-block-reason').waitFor();
 assert.equal(await page.locator('.first-block').count(),12);assert.equal(await page.locator('.first-check input').count(),36);assert.equal(await page.locator('#treatment').count(),0);assert.equal(await page.locator('#proposal').count(),0);
 await action('generate');const empty=await validate();assert.match(empty,/Exploración: no aportada/);assert.doesNotMatch(empty,/diagnóstico de TDAH|normal|sin síntomas/);
 await page.locator('[data-first-action="expand"]').click();await page.locator('.first-check input').evaluateAll(els=>els.forEach(el=>{el.checked=true;el.dispatchEvent(new Event('input',{bubbles:true}));}));
 assert.match(await page.locator('#first-progress').innerText(),/36\/36/);await action('generate');assert.equal(await note(),empty);
 await f('ageYears').fill('9');await f('origin').selectOption('school');
 for(const [key,value] of Object.entries({reason:'Preocupación por organización',timeline:'Desde hace 2 años',impact:'Deberes 90 min/día',home:'Necesita 8 recordatorios',school:'Tareas incompletas',otherContexts:'Participa en deporte con apoyo',clinicalAssessment:'Información insuficiente para concluir',agreedPlan:'Recabar información con autorización familiar',followup:'Revisión en 3 semanas'}))await f('responses.'+key).fill(value);
 await action('generate');let n=await validate();for(const text of ['Preocupación por organización','90 min/día','Hogar: Necesita 8 recordatorios','Colegio: Tareas incompletas','Otras actividades: Participa en deporte con apoyo','Información insuficiente para concluir','Revisión en 3 semanas'])assert.ok(n.includes(text),text);
 await action('copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),n);
 const school=await f('schoolRequest').inputValue();assert.equal(school.split('\n').length,6);await page.locator('[data-first-action="copy-school"]').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),school);assert.match(await page.locator('#first-school-status').innerText(),/No se ha enviado/);
 await page.locator('#clinical-note').fill('Edición manual ficticia');await f('responses.home').fill('Precisa supervisión en las rutinas');assert.equal(await note(),'Edición manual ficticia');accept=false;await action('generate');assert.equal(await note(),'Edición manual ficticia');accept=true;
 await page.locator('[data-mode="follow"]').click();assert.equal(await note(),'Edición manual ficticia');await page.locator('[data-mode="first"]').click();assert.equal(await f('responses.home').inputValue(),'Precisa supervisión en las rutinas');assert.equal(await note(),'Edición manual ficticia');
 await page.locator('a[data-module="fever"]').click();await page.locator('a[data-module="tdah"]').click();assert.equal(await f('responses.reason').inputValue(),'Preocupación por organización');
 await page.locator('[data-first-action="expand"]').click();await f('priorityStatus').selectOption('concern');await f('responses.priorityDetails').fill('Cambio brusco de funcionamiento a valorar');await f('schoolStatus').selectOption('discordant');assert.match(await page.locator('#first-warnings').innerText(),/preocupación de prioridad/);assert.match(await page.locator('#first-warnings').innerText(),/discordante/);
 await action('generate');n=await validate();assert.match(n,/Cambio brusco de funcionamiento/);assert.doesNotMatch(n,/derivar automáticamente|tratamiento indicado por el sistema/);
 // Anexos compartidos siguen funcionando dentro de los bloques pertinentes.
 await page.locator('#questionnaires').evaluate(el=>el.open=true);await action('add-parent');await page.locator('[data-path="questionnaires.0.relation"]').fill('Familiar');
 await page.locator('#measurements').evaluate(el=>el.open=true);await page.locator('[data-path="measurement.weight"]').fill('30');await page.locator('[data-path="measurement.height"]').fill('140');assert.match(await page.locator('#measurement-result').innerText(),/15.31/);
 await f('ageYears').fill('5');assert.match(await page.locator('#first-warnings').innerText(),/6–13 años/);
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 await page.locator('[data-first-action="collapse"]').click();await page.locator('[data-first-jump="home"]').click();assert.equal(await page.locator('#first-block-home').getAttribute('open'),'');
 await page.locator('#first-block-home').evaluate(el=>el.open=false);await page.locator('#first-block-home summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#first-block-home').getAttribute('open'),'');
 for(const width of [1440,1024,768,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'sin scroll horizontal '+width);}
 const downloadPromise=page.waitForEvent('download');await action('export');const download=await downloadPromise;const payload=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(payload.consultation.firstVisit.responses.reason,'Preocupación por organización');assert.equal(payload.consultation.firstVisit.checks.reason_origin,true);
 await action('reset');assert.equal(await f('responses.reason').inputValue(),'');assert.match(await page.locator('#first-progress').innerText(),/0\/36/);assert.equal(await note(),'');
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'test-results/first-visit.png',fullPage:false});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 console.log('Primera consulta: 12 bloques/36 casillas sin inferencias, fuentes y 3 contextos, síntesis ≤180 palabras, prioridad/discrepancias, solicitud de 6 líneas y copia, anexos, conservación, exportación/reinicio, teclado, axe y 4 anchos: OK.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
