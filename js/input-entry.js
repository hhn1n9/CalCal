// Values need explicit system-default provenance; saved/user values are never
// inferred from their contents or cleared merely because they match a default.
export function setInputValue(input,value,{systemDefault=false}={}){
  input.value=value??'';input.dataset??={};
  if(systemDefault)input.dataset.systemDefault=String(input.value);
  else delete input.dataset.systemDefault;
}
export function setupInputEntry(document){
  const entries=new WeakMap();
  document.addEventListener('pointerdown',event=>{
    const input=event.target.closest?.('input,textarea');
    if(!input||input.disabled||input.readOnly||input.hidden||entries.has(input))return;
    if(input.tagName==='INPUT'&&!['text','number','email','password','search','tel','url'].includes(input.type))return;
    if(input.dataset?.systemDefault!==String(input.value))return;
    entries.set(input,{value:input.value,edited:false});input.value='';
  },true);
  const edited=event=>{const entry=entries.get(event.target);if(entry)entry.edited=true;if(event.target.dataset)delete event.target.dataset.systemDefault;};
  document.addEventListener('input',edited,true);document.addEventListener('change',edited,true);
  document.addEventListener('focusout',event=>{
    const input=event.target,entry=entries.get(input);if(!entry)return;
    if(!entry.edited&&input.value==='')input.value=entry.value;
    entries.delete(input);
  },true);
}
