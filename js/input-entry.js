// Clear only on deliberate field entry. Cancelling without typing restores the
// previous display and never dispatches an input event or writes stored data.
export function setupInputEntry(document){
  const entries=new WeakMap();
  document.addEventListener('pointerdown',event=>{
    const input=event.target.closest?.('input,textarea');
    if(!input||input.disabled||input.readOnly||input.hidden||entries.has(input))return;
    if(input.tagName==='INPUT'&&!['text','number','email','password','search','tel','url'].includes(input.type))return;
    entries.set(input,{value:input.value,edited:false});input.value='';
  },true);
  document.addEventListener('input',event=>{const entry=entries.get(event.target);if(entry)entry.edited=true;},true);
  document.addEventListener('focusout',event=>{
    const input=event.target,entry=entries.get(input);if(!entry)return;
    if(!entry.edited&&input.value==='')input.value=entry.value;
    entries.delete(input);
  },true);
}
