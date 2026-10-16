// Prueba funcional con datos ficticios. Requiere npm start y Chromium.
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173/'))external.push(r.url());});
 let accept=true;page.on('dialog',d=>accept?d.accept():d.dismiss());
 const open=async id=>page.locator('#'+id).evaluate(el=>{el.open=true;});
 const fill=async (path,value)=>{const el=page.locator(`[data-path="${path}"]`);await el.fill(value);};
 const select=async(path,value)=>page.locator(`[data-path="${path}"]`).selectOption(value);
 const click=async action=>page.locator(`[data-action="${action}"]`).click();
 const note=()=>page.locator('#clinical-note').inputValue();
 try{
 await page.goto('http://127.0.0.1:5173/');await page.locator('[data-mode="follow"]').click();await page.locator('#f-interview-reason').waitFor();
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 await fs.writeFile('test-results/accessibility.json',JSON.stringify(a11y.violations,null,2));
 assert.deepEqual(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);
 await page.screenshot({path:'test-results/desktop.png',fullPage:false});
 await click('generate');assert.doesNotMatch(await note(),/normal|sin síntomas|negativo confirmado/i);
 await fill('interview.reason','Caso ficticio: tarda 90 minutos en los deberes');await click('add-goal');
 await fill('goals.0.description','Terminar deberes');await fill('goals.0.baseline','90 min');await fill('goals.0.criterion','60 min');await select('goals.0.context','escolar');
 await click('generate');assert.match(await note(),/Caso ficticio/);assert.match(await note(),/basal: 90 min/);
 await page.locator('#clinical-note').fill('EDICIÓN MANUAL FICTICIA');await fill('interview.reason','Motivo actualizado');assert.equal(await note(),'EDICIÓN MANUAL FICTICIA');
 accept=false;await click('generate');assert.equal(await note(),'EDICIÓN MANUAL FICTICIA');accept=true;await click('generate');assert.match(await note(),/Motivo actualizado/);
 await click('copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await note());
 // Límite por tipo: 2 familiares y 2 docentes, sin mezclar versiones.
 await open('questionnaires');await click('add-parent');await click('add-parent');assert.equal(await page.locator('[data-action="add-parent"]').isDisabled(),true);
 await click('add-teacher');await click('add-teacher');assert.equal(await page.locator('[data-action="add-teacher"]').isDisabled(),true);
 assert.equal(await page.locator('#questionnaire-list fieldset').count(),4);
 await page.locator('#questionnaire-list .subdetails').first().evaluate(el=>el.open=true);
 await fill('questionnaires.0.scores.inattention','10');assert.match(await page.locator('#questionnaire-result').innerText(),/fuera de 0–9/);
 await fill('questionnaires.0.scores.inattention','6');
 // Cambiar recorrido conserva el formulario sin reescribir la nota.
 const preserved=await note();await page.locator('[data-mode="follow"]').click();assert.equal(await note(),preserved);
 assert.equal(await page.locator('[data-action="accept-proposal"]').isDisabled(),true);
 await click('generate');assert.match(await note(),/no revisadas/);assert.doesNotMatch(await note(),/no, confirmado/);
 await open('tolerance');await page.locator('[data-path="ramReviewed"]').check();await click('generate');assert.match(await note(),/RAM revisadas, no referidas: pérdida de apetito/);
 await select('ram.appetite.present','true');assert.equal(await page.locator('[data-path="ramReviewed"]').isChecked(),false);
 await fill('ram.appetite.intensity','Leve');await fill('ram.appetite.onset','Mediodía');await page.locator('[data-path="ramReviewed"]').check();await click('generate');assert.match(await note(),/Pérdida de apetito: intensidad Leve/);
 await select('ram.appetite.present','false');await page.locator('[data-path="ramReviewed"]').check();
 // Ruta de propuesta completa y aceptación explícita.
 await open('session');await fill('birth','2018-01-01');await fill('date','2026-10-16');await select('sex','masculino');
 await open('treatment');for(const [k,v] of Object.entries({active:'Metilfenidato',presentation:'Ejemplo ficticio IR',formulation:'IR',dose:'5 mg por toma',total:'10',schedule:'08:00 y 12:00',start:'2026-09-01'}))await fill('drug.'+k,v);
 await open('follow');for(const [k,v] of Object.entries({effectOnset:'30 minutos',effectDuration:'4 horas',homeResponse:'Mejoría referida',schoolResponse:'Mejoría referida',comorbidityReview:'Revisadas'}))await fill('follow.'+k,v);
 await select('follow.adherence','buena');await select('follow.response','buena');await select('follow.coverage','suficiente');await select('follow.rebound','no');await fill('goals.0.current','55 min');
 await open('cardiovascular');for(const k of ['syncope','effortPain','effortBreath','palpitations','heartDisease','suddenDeath','arrhythmia'])await select('cv.'+k,'no');
 await open('measurements');for(const [k,v] of Object.entries({date:'2026-10-16',weight:'25',height:'125',sbp:'100',dbp:'60',hr:'75'}))await fill('measurement.'+k,v);
 await select('measurement.position','standing');await select('measurement.oedema','no');await select('constantsReview','compatible');await page.locator('[data-path="ramReviewed"]').check();
 assert.match(await page.locator('#measurement-result').innerText(),/16.00/);assert.match(await page.locator('#measurement-result').innerText(),/OMS 2007 · P/);
 assert.equal(await page.locator('[data-action="accept-proposal"]').isDisabled(),false);
 await page.locator('details').evaluateAll(els=>els.forEach(el=>el.open=true));
 const a11yFollow=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 await fs.writeFile('test-results/accessibility-follow.json',JSON.stringify(a11yFollow.violations,null,2));
 assert.deepEqual(a11yFollow.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 await click('generate');assert.doesNotMatch(await note(),/Opción aceptada por el profesional/);
 await click('accept-proposal');await click('generate');assert.match(await note(),/Opción aceptada por el profesional/);
 await fill('follow.effectDuration','3 horas');assert.match(await page.locator('#proposal').innerText(),/He revisado los datos/);await click('generate');assert.doesNotMatch(await note(),/Opción aceptada por el profesional/);
 // Exportación real e importación controlada, sin evolución ni RAM previas.
 const downloadPromise=page.waitForEvent('download');await click('export');const download=await downloadPromise;
 const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(exported.app,'consulta-pediatrica-local');assert.equal(exported.consultation.goals[0].baseline,'90 min');
 await click('reset');assert.equal(await note(),'');await page.locator('[data-mode="follow"]').click();await page.locator('#import-file').setInputFiles({name:'ficticio.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
 await click('apply-transfer');assert.match(await page.locator('#status').innerText(),/Selecciona/);
 await page.locator('#same-case').check();await page.locator('#transfer-goals').check();await page.locator('#transfer-drug').check();await page.locator('#transfer-measurements').check();await click('apply-transfer');
 assert.equal(await page.locator('[data-path="goals.0.baseline"]').inputValue(),'90 min');assert.equal(await page.locator('[data-path="goals.0.current"]').inputValue(),'');
 await open('measurements');assert.equal(await page.locator('[data-path="measurement.weight"]').inputValue(),'');assert.match(await page.locator('#measurement-history').innerText(),/25 kg/);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.deepEqual(await context.cookies(),[]);
 // HTML importado se muestra como texto; cancelar descarta el archivo.
 exported.consultation.goals[0].description='<img src=x onerror=alert(1)>';
 await page.locator('#import-file').setInputFiles({name:'ficticio.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});assert.equal(await page.locator('#transfer-panel img').count(),0);await click('cancel-transfer');
 // Navegación nativa por teclado: abrir details con Enter y enfoque visible.
 const details=page.locator('#pattern');await details.evaluate(el=>el.open=false);await details.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await details.getAttribute('open'),'');
 const unlabeled=await page.locator('input:not([type=file]),select,textarea').evaluateAll(els=>els.filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')).map(el=>el.outerHTML));assert.deepEqual(unlabeled,[]);
 for(const width of [1024,768,390]){
  await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'sin scroll horizontal a '+width);
  await page.screenshot({path:`test-results/width-${width}.png`,fullPage:false});
 }
 await click('reset');assert.equal(await note(),'');assert.equal(await page.locator('#goal-list fieldset').count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('Navegador: ambos recorridos, nota/ediciones/copiado, 4 escalas, RAM, percentiles, propuesta/aceptación/invalidez, exportación/importación/reinicio, teclado/etiquetas, 3 anchos y ausencia de peticiones externas: OK.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
