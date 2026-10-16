const MAX_BYTES=8*1024*1024;
export async function prepareVaccinePhoto(file,rotation=0,options={}){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Usa una foto JPG, PNG o WebP. Convierte HEIC antes de cargarla.');
 if(file.size>MAX_BYTES)throw new Error('La foto supera 8 MB. Reduce su tamaño antes de cargarla.');
 const url=URL.createObjectURL(file),img=new Image();
 try{img.src=url;await img.decode();if(!img.width||!img.height||img.width*img.height>24000000)throw new Error('Usa una imagen de hasta 24 megapíxeles.');
  const scale=Math.min(1,2400/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),turn=((rotation%360)+360)%360,canvas=document.createElement('canvas');
  canvas.width=turn%180?h:w;canvas.height=turn%180?w:h;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(turn*Math.PI/180);ctx.drawImage(img,-w/2,-h/2,w,h);const {left=0,top=0,right=100,bottom=100}=options.crop||{};
  if(![left,top,right,bottom].every(Number.isFinite)||left<0||top<0||right>100||bottom>100||right-left<1||bottom-top<1)throw new Error('El recorte debe tener ancho y alto y estar entre 0 y 100 %.');
  const out=document.createElement('canvas'),cw=canvas.width*(right-left)/100,ch=canvas.height*(bottom-top)/100,zoom=Math.min(2,3000/Math.max(cw,ch));out.width=Math.max(1,Math.round(cw*zoom));out.height=Math.max(1,Math.round(ch*zoom));const oc=out.getContext('2d',{willReadFrequently:true});oc.drawImage(canvas,canvas.width*left/100,canvas.height*top/100,cw,ch,0,0,out.width,out.height);
  if(options.contrast){const pixels=oc.getImageData(0,0,out.width,out.height);for(let i=0;i<pixels.data.length;i+=4){const v=Math.max(0,Math.min(255,(0.299*pixels.data[i]+0.587*pixels.data[i+1]+0.114*pixels.data[i+2]-128)*1.7+150));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}oc.putImageData(pixels,0,0);}return out;
 }catch(e){if(e.message?.includes('megapíxeles')||e.message?.includes('recorte'))throw e;throw new Error('No se pudo abrir la foto. Prueba con JPG o PNG legible.');}finally{URL.revokeObjectURL(url);}
}
// Cliente del protocolo del worker de Tesseract.js 7, fijado por versión y probado con OCR real.
// Conservamos el control del Worker desde su creación para cancelar también carga e inicialización.
export function createLocalVaccineOcr(){let active=null;
 const stop=(session,error)=>{if(!session)return;session.worker.terminate();clearTimeout(session.timer);for(const pending of session.pending.values())pending.reject(error);session.pending.clear();if(active===session)active=null;};
 const cancel=()=>stop(active,new Error('Lectura cancelada.'));
 return {cancel,async recognize(canvas,onProgress=()=>{},mode='6'){
  cancel();if(!globalThis.Worker||!globalThis.WebAssembly)throw new Error('Este navegador no permite la lectura local. Puedes pegar el texto o registrar las dosis manualmente.');
  const base=new URL('../vendor/ocr/',import.meta.url).href,session={worker:new Worker(base+'worker.min.js'),pending:new Map(),serial:0,timer:null};active=session;
  session.timer=setTimeout(()=>stop(session,new Error('La lectura local ha tardado demasiado. Prueba una imagen más pequeña o pega el texto.')),90000);
  session.worker.onmessage=({data})=>{if(active!==session)return;if(data.status==='progress'){onProgress(data.data);return;}const pending=session.pending.get(data.jobId);if(!pending)return;session.pending.delete(data.jobId);if(data.status==='resolve')pending.resolve(data.data);else if(data.status==='reject')pending.reject(new Error(String(data.data)));};
  session.worker.onerror=event=>{event.preventDefault();stop(session,new Error('No se pudo iniciar el motor local de lectura. Puedes pegar el texto manualmente.'));};
  const job=(action,payload)=>new Promise((resolve,reject)=>{if(active!==session){reject(new Error('Lectura cancelada.'));return;}const jobId='vaccine-'+session.serial++;session.pending.set(jobId,{resolve,reject});session.worker.postMessage({workerId:'local-vaccine-ocr',jobId,action,payload});});
  try{
   await job('load',{options:{lstmOnly:true,corePath:base,logging:false}});
   await job('loadLanguage',{langs:'spa',options:{langPath:base,cacheMethod:'none',gzip:true,lstmOnly:true}});
   await job('initialize',{langs:'spa',oem:1,config:{}});
   await job('setParameters',{params:{tessedit_pageseg_mode:['6','11','7'].includes(mode)?mode:'6',preserve_interword_spaces:'1'}});
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('No se pudo preparar la imagen para lectura.');
   const image=new Uint8Array(await blob.arrayBuffer()),data=await job('recognize',{image,options:{},output:{text:true}});return {text:data.text||'',confidence:data.confidence};
  }finally{stop(session,new Error('Lectura terminada.'));}
 }};
}
