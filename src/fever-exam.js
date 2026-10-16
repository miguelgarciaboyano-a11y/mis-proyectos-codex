// Interpretación local y conservadora de frases: no es comprensión clínica general.
// El texto original se conserva; solo se retiran frases de plantilla asignables.
export const EXAM=[
 ['general','Estado general, color y tono','BEG, buen color, buen tono.'],
 ['hydration','Nutrición e hidratación','Bien nutrido e hidratado.'],
 ['skin','Piel','No lesiones cutáneas.'],
 ['cardiac','Auscultación cardíaca','AC rítmica, sin soplos.'],
 ['respiratory','Auscultación pulmonar','AP: BVB, sin ruidos sobreañadidos.'],
 ['abdomen','Abdomen','Abdomen blando, depresible, no doloroso, no masas ni megalias, ni signos de irritación peritoneal.'],
 ['orl','ORL','ORL normal.'],['ears','Oídos','Oídos normales.'],
 ['neuro','Cuello y signos meníngeos','No rigidez nucal, meníngeos negativos.'],
 ['fontanelle','Fontanela (<12 meses)','FANT.']
];
const normalise=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rules=[
 ['general',/\b(beg|reg|meg|estado general|color|tono|palid\w*|hipotoni\w*|decaid\w*|cianosis|aspecto|somnol\w*|letargi\w*|irritab\w*|postrad\w*)\b/],
 ['hydration',/\b(hidrat\w*|deshidrat\w*|hipohidrat\w*|nutri\w*|mucosas? secas?|turgor|relleno capilar|pliegue cutaneo)\b/],
 ['skin',/\b(piel|cutane\w*|exantema\w*|petequia\w*|purpura|urticaria|vesicula\w*|macula\w*|papula\w*|erupcion\w*|lesiones?)\b/],
 ['cardiac',/\b(ac|cardiac\w*|cardiopulmonar|soplo\w*|ritm\w*|arritm\w*|taquicardia|bradicardia|tonos cardiacos)\b/],
 ['respiratory',/\b(ap|pulmon\w*|respiratori\w*|cardiopulmonar|bvb|sibilan\w*|crepitan\w*|roncus|estertor\w*|tiraje|taquipnea|bradipnea|estridor|hipoventila\w*|murmullo vesicular|aleteo nasal|quejido)\b/],
 ['abdomen',/\b(abdomen|abdominal\w*|abd|fid|fii|hcd|hci|epigastr\w*|hipogastr\w*|fosa iliaca|peritone\w*|megalias|hepatomegalia|esplenomegalia|blumberg|murphy|hepat\w*|esplen\w*)\b/],
 ['orl',/\b(orl|faring\w*|amigdal\w*|orofaring\w*|rinorrea|nasal|garganta|orofaringe|enantema|uvula|exudado amigdalar)\b/],
 ['ears',/\b(oido\w*|otitis|otoscop\w*|timpan\w*|conducto auditivo|otalgia|otorrea|cerumen)\b/],
 ['neuro',/\b(nucal|nuca|mening\w*|kernig|brudzinski|neurolog\w*|cuello|rigidez)\b/],
 ['fontanelle',/\b(fontanel\w*|fant)\b/]
];
function phrases(text){
 // Evitar separar decimales y abreviaturas habituales antes de delimitar frases.
 const protectedText=text.replace(/\b(?:sat|aprox|abd|der|izq|ac|ap)\./gi,m=>m.slice(0,-1)+'\uE000').replace(/(\d)\.(?=\d)/g,'$1\uE000');
 const boundary='(?:AP|AC|ORL|abdomen|piel|o[ií]dos?|faringe|am[ií]gdalas?|t[ií]mpano|fontanela|sibilancias|crepitantes|exantema|petequias|soplo|men[ií]ngeos|rigidez nucal)\\b';
 return protectedText.split(new RegExp('[;\\n]+|\\.(?:\\s+|$)|,\\s*(?='+boundary+')|\\s+y\\s+(?='+boundary+')','gi')).map(x=>x.replaceAll('\uE000','.').trim()).filter(Boolean);
}
export function interpretExam(text=''){
 const segments=phrases(text),assignments=segments.map(text=>({text,systems:rules.filter(([,r])=>r.test(normalise(text))).map(([id])=>id),additional:/\b(adenopat\w*|ganglio\w*|temperatura|sato2|spo2|saturacion|peso|talla)\b|\bsat\.?\s*\d/.test(normalise(text))}));
 const unknown=assignments.filter(x=>!x.systems.length&&!x.additional).map(x=>x.text);
 const affected=[...new Set(assignments.flatMap(x=>x.systems))];
 return {assignments,unknown,affected,conservative:unknown.length>0};
}
const sentence=s=>/[.!?]$/.test(s.trim())?s.trim():s.trim()+'.';
export function assembleExam(text,infant){
 const parsed=interpretExam(text);
 if(parsed.conservative)return {text:parsed.assignments.map(x=>sentence(x.text)).join(' '),...parsed};
 const emitted=new Set(),parts=[];
 for(const [id,,normal] of EXAM){
  const matches=parsed.assignments.filter(x=>x.systems.includes(id));
  if(matches.length){for(const m of matches)if(!emitted.has(m)){parts.push(sentence(m.text));emitted.add(m);}}
  else if(!parsed.affected.includes(id)&&(id!=='fontanelle'||infant))parts.push(normal);
 }
 for(const m of parsed.assignments)if(m.additional&&!emitted.has(m)){parts.push(sentence(m.text));emitted.add(m);}
 return {text:parts.join(' '),...parsed};
}
