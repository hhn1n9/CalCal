import {targetRepBounds,targetReps} from './workout-model.js?v=1.2.73';
import {setInputValue} from './input-entry.js?v=1.2.68';
import {createNumberWheel} from './number-wheel.js?v=1.2.68';
export function repSliderValue(index){index=Math.max(0,Math.min(26,Math.round(Number(index)||0)));return index<=20?index:20+(index-20)*5;}
export function repSliderIndex(value){value=Math.max(0,Math.min(50,Number(value)||0));return value<=20?Math.round(value):20+Math.round((value-20)/5);}
export function createRepRangeSelector(element,{tr,onApply,mountWheel=createNumberWheel}){
  if(!element)return {open(){},close(){}};
  const low=element.querySelector('#rep-range-min'),high=element.querySelector('#rep-range-max'),min=element.querySelector('#rep-input-min'),max=element.querySelector('#rep-input-max'),output=element.querySelector('#rep-range-value'),error=element.querySelector('#rep-range-error'),sliders=element.querySelector('.rep-range-sliders');
  const numeric=element.querySelector('[data-rep-numeric]'),timed=element.querySelector('[data-rep-time]'),minutes=element.querySelector('#target-time-minutes'),seconds=element.querySelector('#target-time-seconds'),clock=element.querySelector('[data-rep-action="time"]');
  let context=null,returnFocus=null,single=false,gesture=null,mode='reps',wheels=null;
  function setMode(next){
    mode=next;numeric.hidden=mode!=='reps';timed.hidden=mode!=='time';
    element.querySelector('[data-rep-failure]').hidden=mode!=='failure';
    element.querySelector('[data-rep-action="failure"]').setAttribute?.('aria-pressed',String(mode==='failure'));
    element.querySelector('#rep-range-title').textContent=tr(mode==='time'?'Time target':mode==='failure'?'Target':'Target reps');
    clock.setAttribute?.('aria-pressed',String(mode==='time'));clock.setAttribute?.('aria-label',tr(mode==='time'?'Use rep target':'Use time target'));
    error.textContent='';
    if(mode==='time'){
      wheels??=[mountWheel(minutes,element.querySelector('#target-minutes-wheel'),{min:0,max:999,initial:1}),mountWheel(seconds,element.querySelector('#target-seconds-wheel'),{min:0,max:59,initial:0})];
      wheels.forEach(wheel=>wheel.sync());
    }
  }
  function render(){
    const a=Number(min.value),b=Number(max.value),left=repSliderIndex(a),right=repSliderIndex(b);
    single=min.value!==''&&max.value!==''&&a===b;
    output.classList.toggle('single',single);max.hidden=single;
    low.max=high.max='26';low.value=String(left);high.value=String(right);
    low.setAttribute?.('aria-valuetext',String(a));high.setAttribute?.('aria-valuetext',String(b));
    sliders.style.setProperty('--range-left',(left/26*100)+'%');sliders.style.setProperty('--range-right',(right/26*100)+'%');sliders.classList.toggle('same',single);
  }
  function close(){element.classList.remove('open');context=null;gesture=null;returnFocus?.focus?.({preventScroll:true});returnFocus=null;}
  function open(value,next){
    context=next;returnFocus=document.activeElement;const savedBounds=targetRepBounds(value),bounds=savedBounds||{min:8,max:12},duration=value?.type==='time'?value.seconds:60;
    setInputValue(min,bounds.min,{systemDefault:!savedBounds});setInputValue(max,bounds.max,{systemDefault:!savedBounds});
    setInputValue(minutes,Math.floor(duration/60),{systemDefault:value?.type!=='time'});setInputValue(seconds,duration%60,{systemDefault:value?.type!=='time'});
    error.textContent='';render();element.classList.add('open');setMode(value==='UF'?'failure':value?.type==='time'?'time':'reps');
  }
  function apply(clear=false,forced=null){
    try{
      if(mode==='time'&&!clear&&!forced)wheels.forEach(wheel=>wheel.flush());
      const value=clear?null:forced||targetReps(mode==='failure'?'UF':mode==='time'?{type:'time',seconds:Number(minutes.value)*60+Number(seconds.value)}:min.value===''&&max.value===''?null:min.value===max.value?min.value:`${min.value}-${max.value}`);
      onApply(value,context);close();
    }catch(err){error.textContent=tr(err.message);}
  }
  for(const input of [min,max])input.addEventListener('input',()=>{if(input.dataset)delete input.dataset.systemDefault;if(input===min&&single)setInputValue(max,min.value);error.textContent='';render();});
  for(const [input,role] of [[low,'min'],[high,'max']]){
    input.addEventListener('pointerdown',()=>{gesture={role:single?null:role,start:Number(min.value)};});
    input.addEventListener('pointerup',()=>{gesture=null;});input.addEventListener('pointercancel',()=>{gesture=null;});
    const move=()=>{
      const value=repSliderValue(input.value);
      let side=gesture?.role||role;
      if(gesture&&!gesture.role)side=gesture.role=value<gesture.start?'min':'max';
      else if(!gesture&&single)side=value<Number(min.value)?'min':'max';
      if(side==='min')setInputValue(min,String(Math.min(value,Number(max.value)||0)));
      else setInputValue(max,String(Math.max(value,Number(min.value)||0)));
      error.textContent='';render();
    };
    input.addEventListener('input',move);
    input.addEventListener('keydown',event=>{
      const direction=['ArrowRight','ArrowUp'].includes(event.key)?1:['ArrowLeft','ArrowDown'].includes(event.key)?-1:0;
      if(!direction)return;event.preventDefault();input.value=String(Math.max(0,Math.min(26,Number(input.value)+direction)));move();
    });
  }
  element.addEventListener('click',event=>{const action=event.target.closest('[data-rep-action]')?.dataset.repAction;if(action==='cancel'||event.target===element)close();else if(action==='save')apply();else if(action==='clear')apply(true);else if(action==='failure')apply(false,'UF');else if(action==='time')setMode(mode==='time'?'reps':'time');else if(action==='reps')setMode('reps');});
  element.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Enter'&&event.target.matches('input[type="number"]')){event.preventDefault();apply();}});
  return {open,close};
}
