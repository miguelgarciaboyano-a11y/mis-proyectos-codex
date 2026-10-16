import {createOtalgiaUI} from './otalgia-app.js?v=20261017-vaccines-9';
const root=document.getElementById('app');
root.dataset.module='otalgia';
const consultation=createOtalgiaUI(root,{standalone:true});
consultation.render();
window.addEventListener('beforeunload',event=>{
 if(consultation.hasData()){event.preventDefault();event.returnValue='';}
});
