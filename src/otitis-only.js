import {createOtalgiaUI} from './otalgia-app.js?v=20261017-otitis-8';
const root=document.getElementById('app');
root.dataset.module='otalgia';
const consultation=createOtalgiaUI(root,{standalone:true});
consultation.render();
window.addEventListener('beforeunload',event=>{
 if(consultation.hasData()){event.preventDefault();event.returnValue='';}
});
