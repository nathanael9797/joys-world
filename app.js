const estateEntrance=document.getElementById('estate-entrance');
const estateGate=document.getElementById('estate-gate');
let enteringEstate=false;

const doorLatch=new Audio('./assets/door-latch.wav');
doorLatch.preload='auto';

function playDoorClick(){
  try{
    doorLatch.pause();
    doorLatch.currentTime=0;
    doorLatch.volume=1;
    doorLatch.play().catch(()=>{});
  }catch(error){}
}
function enterEstate(){
  if(enteringEstate)return;
  enteringEstate=true;
  playDoorClick();
  if(reduceMotion){
    estateEntrance.classList.add('gone');
    setTimeout(()=>estateEntrance.remove(),350);
    return;
  }
  setTimeout(()=>estateEntrance.classList.add('door-open'),120);
  setTimeout(()=>estateEntrance.remove(),720);
}
estateGate?.addEventListener('click',enterEstate);

const rooms=[...document.querySelectorAll('.room')];
const nav=[...document.querySelectorAll('[data-room]')];
const toast=document.getElementById('toast');
const attendant=document.getElementById('attendant-layer');
const attendantLine=document.getElementById('attendant-line');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let attendantBusy=false;
let actionCount=0;

const portal=document.getElementById('room-portal');
const portalName=document.getElementById('portal-name');
const roomNames={salon:'The Private Salon',wardrobe:'Joy’s Wardrobe',money:'The Money Room'};
let roomMoving=false;
async function showRoom(id){
  if(roomMoving||document.getElementById(id)?.classList.contains('active'))return;
  roomMoving=true;
  if(!reduceMotion){
    portalName.textContent=roomNames[id]||'Welcome, Madam';
    portal.classList.add('entering');
    await new Promise(resolve=>setTimeout(resolve,650));
  }
  rooms.forEach(room=>room.classList.toggle('active',room.id===id));
  document.querySelectorAll('.dock [data-room]').forEach(button=>button.classList.toggle('active',button.dataset.room===id));
  scrollTo({top:0,behavior:'auto'});
  if(!reduceMotion){
    portal.classList.add('opening');
    await new Promise(resolve=>setTimeout(resolve,900));
    portal.className='room-portal';
    if(id!=='salon')summonAttendant('room');
  }
  roomMoving=false;
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
const wardrobe={
  top:[
    {id:'silk',name:'Espresso silk',note:'Draped neckline',tone:'#2b1b1a'},
    {id:'rust',name:'Rust wrap',note:'Soft sculpted waist',tone:'#a55031'},
    {id:'ivory',name:'Ivory blouse',note:'Architectural sleeve',tone:'#e1d3bf'},
    {id:'black',name:'Midnight bodice',note:'Gathered & fitted',tone:'#171416'}
  ],
  bottom:[
    {id:'trousers',name:'Tailored trouser',note:'Long clean line',tone:'#242022'},
    {id:'midi',name:'Rose midi',note:'Fluid movement',tone:'#713247'},
    {id:'wrap',name:'Rust wrap skirt',note:'Warm & effortless',tone:'#9f4d31'},
    {id:'column',name:'Black column',note:'Evening silhouette',tone:'#151315'}
  ],
  shoes:[
    {id:'heels',name:'Sculpted heel',note:'Metallic accent',tone:'#aa823e'},
    {id:'loafer',name:'Polished loafer',note:'City confidence',tone:'#291818'},
    {id:'sandal',name:'Fine sandal',note:'Barely-there gold',tone:'#c3a15b'}
  ],
  bag:[
    {id:'mini',name:'Espresso mini',note:'Structured leather',tone:'#3a2021'},
    {id:'crossbody',name:'Black crossbody',note:'Hands-free polish',tone:'#171416'},
    {id:'clutch',name:'Gold clutch',note:'Celebration piece',tone:'#b18a45'}
  ],
  jewelry:[
    {id:'hoops',name:'Gold hoops',note:'Joy signature',tone:'#c9a252'},
    {id:'drops',name:'Fine drops',note:'Quiet brilliance',tone:'#e1c983'},
    {id:'minimal',name:'Minimal gold',note:'Clean & modern',tone:'#a8813e'}
  ]
};
const selections={top:'silk',bottom:'trousers',shoes:'heels',bag:'mini',jewelry:'hoops'};
const occasionLooks={
  'Date night':{title:'Midnight Joy',top:'black',bottom:'column',shoes:'heels',bag:'clutch',jewelry:'hoops'},
  'Sunday elegance':{title:'Ivory Sunday',top:'ivory',bottom:'midi',shoes:'sandal',bag:'mini',jewelry:'drops'},
  'City day':{title:'City Poise',top:'silk',bottom:'trousers',shoes:'loafer',bag:'crossbody',jewelry:'minimal'},
  'Celebration':{title:'Rust & Radiance',top:'rust',bottom:'wrap',shoes:'heels',bag:'clutch',jewelry:'drops'},
  'Power meeting':{title:'Quiet Authority',top:'ivory',bottom:'trousers',shoes:'loafer',bag:'mini',jewelry:'minimal'}
};
let occasionTitle=occasionLooks['Date night'].title;
const categoryLabels={top:'Top',bottom:'Bottom',shoes:'Shoes',bag:'Bag',jewelry:'Jewels'};
const model=document.getElementById('joy-model');
const options=document.getElementById('wardrobe-options');
const composerTitle=document.getElementById('composer-title');
const composerSummary=document.getElementById('composer-summary');
let activeCategory='top';

function piece(category,id){return wardrobe[category].find(item=>item.id===id)}
const garmentLayer={top:['.model-top','.model-arms'],bottom:['.model-bottom'],shoes:['.model-shoes'],bag:['.model-bag'],jewelry:['.model-jewelry']};
function fitGarment(category){
  const layers=garmentLayer[category]||[];
  layers.forEach(selector=>{
    const layer=model.querySelector(selector);
    if(!layer)return;
    layer.classList.remove('couture-fit');
    void layer.offsetWidth;
    layer.classList.add('couture-fit');
  });
}
function renderOptions(){
  options.innerHTML=wardrobe[activeCategory].map(item=>`<button class="piece ${selections[activeCategory]===item.id?'active':''}" data-piece="${item.id}"><i class="piece-thumb ${activeCategory}-${item.id}" style="--swatch:${item.tone}"></i><span><b>${item.name}</b><small>${item.note}</small></span><em>${selections[activeCategory]===item.id?'SELECTED':'ADD'}</em></button>`).join('');
  options.querySelectorAll('.piece').forEach(button=>button.addEventListener('click',()=>{
    occasionTitle='Joy’s Personal Mix';
    selections[activeCategory]=button.dataset.piece;
    model.dataset[activeCategory]=button.dataset.piece;
    fitGarment(activeCategory); renderOptions(); updateComposer();
  }));
}
function updateComposer(){
  const top=piece('top',selections.top), bottom=piece('bottom',selections.bottom), shoes=piece('shoes',selections.shoes);
  const names=[top.name,bottom.name,piece('bag',selections.bag).name,piece('jewelry',selections.jewelry).name];
  composerTitle.textContent=occasionTitle;
  composerSummary.textContent=names.join(' · ');
}
const occasionSelect=document.getElementById('occasion');
function applyOccasion(name,announce=true){
  const edit=occasionLooks[name];
  occasionTitle=edit.title;
  Object.keys(selections).forEach(category=>{
    selections[category]=edit[category];
    model.dataset[category]=edit[category];
    if(announce)fitGarment(category);
  });
  renderOptions();updateComposer();
  if(announce)notify(name+' edit composed for Joy.');
}
occasionSelect.addEventListener('change',()=>applyOccasion(occasionSelect.value));
applyOccasion(occasionSelect.value,false);

document.querySelectorAll('.category').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.category').forEach(item=>item.classList.remove('active'));
  button.classList.add('active'); activeCategory=button.dataset.category; renderOptions();
}));
document.getElementById('random-look').addEventListener('click',()=>{
  occasionTitle='Joy’s Personal Mix';
  Object.keys(wardrobe).forEach(category=>{
    const items=wardrobe[category]; selections[category]=items[Math.floor(Math.random()*items.length)].id;
    model.dataset[category]=selections[category];
    fitGarment(category);
  });
  renderOptions();updateComposer();notify('A new edit, composed for Joy.');
});
function renderSaved(){
  const saved=JSON.parse(localStorage.getItem('joySavedLooks')||'[]');
  const panel=document.getElementById('saved-edit');
  panel.hidden=!saved.length;
  document.getElementById('saved-looks').innerHTML=saved.map((look,index)=>`<div class="saved-look"><span><b>${look.title}</b><small>${look.occasion}</small></span><button data-remove="${index}" aria-label="Remove saved look">×</button></div>`).join('');
  panel.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{
    saved.splice(Number(button.dataset.remove),1);localStorage.setItem('joySavedLooks',JSON.stringify(saved));renderSaved();
  }));
}
document.getElementById('save-outfit').addEventListener('click',()=>{
  const saved=JSON.parse(localStorage.getItem('joySavedLooks')||'[]');
  saved.unshift({title:composerTitle.textContent,occasion:document.getElementById('occasion').value,pieces:{...selections}});
  localStorage.setItem('joySavedLooks',JSON.stringify(saved.slice(0,6)));
  renderSaved();summonAttendant('service');notify('Complete look saved to Joy’s edit.');
});
renderOptions();renderSaved();

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
