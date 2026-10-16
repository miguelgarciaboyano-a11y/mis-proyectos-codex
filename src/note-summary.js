// Síntesis local extractiva: las entradas son datos, nunca instrucciones ejecutables.
export const NOTE_LIMIT=180;
export const NOTE_HEADINGS=['Motivo','Anamnesis/evolución','Antecedentes relevantes','Exploración','Pruebas','Valoración del pediatra','Plan','Información pendiente'];
const defaults=['no aportado','no aportada','no aportados','no aportada','no aportadas','no aportada','no aportado','no especificada'];
export const wordCount=text=>(String(text).trim().match(/\S+/gu)||[]).length;
export function minimiseIdentifiers(value){
 return String(value??'').replace(/\b(?:nombre(?:\s+y\s+apellidos)?|apellidos|paciente\s+identificado\s+como|dni|nie|nif|nhc|cip|tel[eé]fono|m[oó]vil|direcci[oó]n|fecha\s+de\s+nacimiento)\s*[:=]\s*[^\n;.]+[;.]?/giu,'').replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,'[correo omitido]').replace(/\b\d{8}[A-Z]\b/giu,'[identificador omitido]').trim();
}
const directive=/(?:ignora|ignore|omite)\b.{0,60}\b(?:instrucciones|instructions|reglas)|\bact[uú]a como\b|<\/?(?:system|developer|assistant|notas_consulta)>|\{\{PEGAR_NOTAS/i;
export function clinicalText(value){
 const text=minimiseIdentifiers(value).replace(/\s+/gu,' ').trim();
 return {text:directive.test(text)?'':text,quarantined:directive.test(text)};
}
const finish=text=>/[.!?]$/u.test(text)?text:text+'.';
// No cortar palabras, fechas, cifras, unidades o frases clínicas a mitad.
export function buildSummary(groups){
 const candidates=[],selected=Array.from({length:8},()=>[]),omitted=[];let quarantined=false;
 groups.forEach((items,section)=>(items||[]).filter(Boolean).forEach((item,index)=>{
  const source=typeof item==='string'?{text:item}:item;
  const cleaned=clinicalText(source.text);if(cleaned.quarantined){quarantined=true;return;}
  if(cleaned.text)candidates.push({text:cleaned.text,section,index,priority:source.priority??50});
 }));
 const render=(notice='')=>NOTE_HEADINGS.map((title,i)=>{
  const values=selected[i].slice().sort((a,b)=>a.index-b.index).map(x=>finish(x.text));
  if(i===7&&notice)values.push(notice);
  return title+': '+(values.length?values.join(' '):finish(candidates.some(x=>x.section===i)?'Datos aportados no incluidos por extensión':defaults[i]));
 }).join('\n');
 const reserve='Información adicional no incluida por extensión; revisar el registro completo.';
 const quarantineNotice='Texto no clínico pendiente de revisión.';
 // Mantener espacio para informar de exclusiones sin exceder 180 palabras.
 const suffix=(quarantined?quarantineNotice+' ':'')+reserve;
 const sorted=candidates.slice().sort((a,b)=>(a.section===7?-1:0)-(b.section===7?-1:0)||b.priority-a.priority||a.index-b.index);
 for(const item of sorted){
  selected[item.section].push(item);
  if(wordCount(render(suffix))>NOTE_LIMIT){selected[item.section].pop();omitted.push(item);}
 }
 const notice=[quarantined?quarantineNotice:'',omitted.length?reserve:''].filter(Boolean).join(' ');
 const text=render(notice);
 return {text,words:wordCount(text),omitted:omitted.map(({section,text})=>({section:NOTE_HEADINGS[section],text})),quarantined};
}
