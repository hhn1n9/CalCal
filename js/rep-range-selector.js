import {targetRepBounds,targetReps} from './workout-model.js?v=1.2.67';
export function repSliderValue(index){index=Math.max(0,Math.min(26,Math.round(Number(index)||0)));return index<=20?index:20+(index-20)*5;}
export function repSliderIndex(value){value=Math.max(0,Math.min(50,Number(value)||0));return value<=20?Math.round(value):20+Math.round((value-20)/5);}
export function createRepRangeSelector(element,{tr,onApply}){
  if(!element)return {open(){},close(){}};
  const low=element.querySelector('#rep-range-min'),high=element.querySelector('#rep-range-max'),min=element.querySelector('#rep-input-min'),max=element.querySelector('#rep-input-max'),output=element.querySelector('#rep-range-value'),error=element.querySelector('#rep-range-error'),sliders=element.querySelector('.rep-range-sliders');
  let context=null,returnFocus=null,single=false,gesture=null;
  function render(){
    const a=Number(min.value),b=Number(max.value),left=repSliderValue(repSliderIndex(a)),right=repSliderValue(repSliderIndex(b));
    single=min.value!==''&&max.value!==''&&a===b;
    output.classList.toggle('single',single);max.hidden=single;
    low.max=high.max='50';low.value=String(left);high.value=String(right);
    low.setAttribute?.('aria-valuetext',String(a));high.setAttribute?.('aria-valuetext',String(b));
    sliders.style.setProperty('--range-left',(left/50*100)+'%');sliders.style.setProperty('--range-right',(right/50*100)+'%');sliders.classList.toggle('same',single);
  }
  function close(){element.classList.remove('open');context=null;gesture=null;returnFocus?.focus?.({preventScroll:true});returnFocus=null;}
  function open(value,next){context=next;returnFocus=document.activeElement;const bounds=targetRepBounds(value)||{min:8,max:12};min.value=bounds.min;max.value=bounds.max;error.textContent='';render();element.classList.add('open');}
  function apply(clear=false){
    try{
      const value=clear?null:targetReps(min.value===''&&max.value===''?null:min.value===max.value?min.value:`${min.value}-${max.value}`);
      onApply(value,context);close();
    }catch(err){error.textContent=tr(err.message);}
  }
  for(const input of [min,max])input.addEventListener('input',()=>{if(input===min&&single)max.value=min.value;error.textContent='';render();});
  for(const [input,role] of [[low,'min'],[high,'max']]){
    input.addEventListener('pointerdown',()=>{gesture={role:single?null:role,start:Number(min.value)};});
    input.addEventListener('pointerup',()=>{gesture=null;});input.addEventListener('pointercancel',()=>{gesture=null;});
    const move=()=>{
      const value=repSliderValue(repSliderIndex(input.value));
      let side=gesture?.role||role;
      if(gesture&&!gesture.role)side=gesture.role=value<gesture.start?'min':'max';
      else if(!gesture&&single)side=value<Number(min.value)?'min':'max';
      if(side==='min')min.value=String(Math.min(value,Number(max.value)||0));
      else max.value=String(Math.max(value,Number(min.value)||0));
      error.textContent='';render();
    };
    input.addEventListener('input',move);
    input.addEventListener('keydown',event=>{
      const direction=['ArrowRight','ArrowUp'].includes(event.key)?1:['ArrowLeft','ArrowDown'].includes(event.key)?-1:0;
      if(!direction)return;event.preventDefault();input.value=String(repSliderValue(repSliderIndex(input.value)+direction));move();
    });
  }
  element.addEventListener('click',event=>{const action=event.target.closest('[data-rep-action]')?.dataset.repAction;if(action==='cancel'||event.target===element)close();else if(action==='save')apply();else if(action==='clear')apply(true);});
  element.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Enter'&&event.target.matches('input[type="number"]')){event.preventDefault();apply();}});
  return {open,close};
}
