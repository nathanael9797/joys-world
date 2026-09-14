const rooms=[...document.querySelectorAll('.room')];
const nav=[...document.querySelectorAll('[data-room]')];
const toast=document.getElementById('toast');
const attendant=document.getElementById('attendant-layer');
const attendantLine=document.getElementById('attendant-line');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let attendantBusy=false;
let actionCount=0;

function showRoom(id){
  rooms.forEach(room=>room.classList.toggle('active',room.id===id));
  document.querySelectorAll('.dock [data-room]').forEach(button=>button.classList.toggle('active',button.dataset.room===id));
  scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
}
nav.forEach(button=>button.addEventListener('click',()=>showRoom(button.dataset.room)));

function notify(message){
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer=setTimeout(()=>toast.classList.remove('show'),2200);
}

const lines=['Right away, Madam.','At once.','Consider it handled.'];
const variants=['variant-stumble','variant-hat','variant-list',''];
function summonAttendant(action){
  actionCount++;
  const shouldAppear=action==='service'||actionCount%2===0;
  if(reduceMotion||!shouldAppear||attendantBusy){
    notify('Consider it handled.');
    return;
  }
  attendantBusy=true;
  attendant.className='attendant-layer show '+variants[Math.floor(Math.random()*variants.length)];
  attendantLine.textContent=lines[Math.floor(Math.random()*lines.length)];
  attendant.setAttribute('aria-hidden','false');
  setTimeout(()=>{
    attendant.className='attendant-layer';
    attendant.setAttribute('aria-hidden','true');
    attendantBusy=false;
  },3500);
}
document.querySelectorAll('.js-attendant').forEach(button=>button.addEventListener('click',()=>summonAttendant(button.dataset.action)));

const status=document.getElementById('sven-status');
const detail=document.getElementById('status-detail');
const panel=document.querySelector('.status-panel');
const market=document.getElementById('market-screen');
const wake=document.getElementById('wake-sven');
const decision=document.getElementById('decision');
const decisionValue=document.getElementById('decision-value');
const decisionNote=document.getElementById('decision-note');
const steps=[
 ['SVEN IS AWAKE','The room is coming online.'],
 ['SCANNING MARKET','Reading simulated price structure.'],
 ['TESTING SETUPS','Comparing demo scenarios.'],
 ['RISK GUARDIAN CHECK','Protecting simulated capital.'],
 ['DECISION READY','The demo analysis is complete.']
];
const outcomes=[
 ['HOLD','No clean edge. Patience protects the room.'],
 ['BUY','Demo setup meets the simulated conditions.'],
 ['SELL','Demo risk balance favors defensive positioning.']
];
let activeStrategy='Balanced';
let demoBalance=10000;
let sessionReturn=0;
const balanceEl=document.getElementById('demo-balance');
const returnEl=document.getElementById('demo-return');
const ticketStrategy=document.getElementById('ticket-strategy');
const ticketSize=document.getElementById('ticket-size');
const ticketConfidence=document.getElementById('ticket-confidence');

document.querySelectorAll('.strategy').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.strategy').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  activeStrategy=button.dataset.strategy;
  notify(activeStrategy+' demo strategy selected.');
}));

function money(value){return new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(value)}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

wake.addEventListener('click',async()=>{
  wake.disabled=true;
  decision.hidden=true;
  panel.classList.add('live');
  market.classList.remove('decision-ready');
  market.classList.add('awake','working');
  const pace=reduceMotion?80:820;
  for(const [title,copy] of steps){
    status.textContent=title;
    detail.textContent=copy;
    await wait(pace);
  }
  const [result,note]=outcomes[Math.floor(Math.random()*outcomes.length)];
  market.classList.remove('working');
  market.classList.add('decision-ready');
  decisionValue.textContent=result;
  decisionNote.textContent=note;
  const confidence=Math.floor(62+Math.random()*27);
  const demoSize=result==='HOLD'?0:Math.round((demoBalance*(activeStrategy==='Defensive'?.004:activeStrategy==='Opportunistic'?.01:.007))/10)*10;
  const movement=result==='HOLD'?0:(Math.random()-.42)*demoSize*.035;
  sessionReturn+=movement;
  demoBalance=10000+sessionReturn;
  balanceEl.textContent=money(demoBalance);
  returnEl.textContent=(sessionReturn>=0?'+ ':'− ')+money(Math.abs(sessionReturn));
  returnEl.classList.toggle('positive',sessionReturn>0);
  returnEl.classList.toggle('negative',sessionReturn<0);
  ticketStrategy.textContent=activeStrategy.toUpperCase();
  ticketSize.textContent=money(demoSize);
  ticketConfidence.textContent=confidence+'%';
  decision.hidden=false;
  wake.querySelector('span').textContent='RUN AGAIN';
  wake.disabled=false;
});

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}