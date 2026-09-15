const estateEntrance=document.getElementById('estate-entrance');
const estateGate=document.getElementById('estate-gate');
const houseJazz=document.getElementById('house-jazz');
const ambienceToggle=document.getElementById('ambience-toggle');
let enteringEstate=false;

const doorLatch=new Audio('./assets/door-latch.wav?v=20');
doorLatch.preload='auto';
doorLatch.volume=.82;
let ambienceMuted=localStorage.getItem('joyAmbienceMuted')==='true';
let ambienceFadeFrame=0;
let ambienceWasPlaying=false;

function setAmbienceControl(){
  ambienceToggle.classList.toggle('muted',ambienceMuted);
  ambienceToggle.setAttribute('aria-pressed',String(ambienceMuted));
  ambienceToggle.setAttribute('aria-label',ambienceMuted?'Play house ambience':'Mute house ambience');
}
function primeAmbience(){
  if(ambienceMuted||!houseJazz.paused)return;
  houseJazz.volume=0;
  houseJazz.play().catch(()=>{});
}
function fadeAmbience(target,duration=2600){
  cancelAnimationFrame(ambienceFadeFrame);
  const start=performance.now();
  const initial=houseJazz.volume;
  const step=now=>{
    const progress=Math.min(1,(now-start)/duration);
    const eased=progress*progress*(3-2*progress);
    houseJazz.volume=initial+(target-initial)*eased;
    if(progress<1)ambienceFadeFrame=requestAnimationFrame(step);
    else if(target===0)houseJazz.pause();
  };
  ambienceFadeFrame=requestAnimationFrame(step);
}

function playDoorClick(){
  try{
    doorLatch.pause();
    doorLatch.currentTime=0;
    doorLatch.play().catch(()=>{});
  }catch(error){}
}
function enterEstate(){
  if(enteringEstate)return;
  enteringEstate=true;
  playDoorClick();
  primeAmbience();
  if(reduceMotion){
    setTimeout(()=>estateEntrance.classList.add('gone'),420);
    setTimeout(()=>estateEntrance.remove(),760);
    setTimeout(()=>{if(!ambienceMuted)fadeAmbience(.065)},720);
    return;
  }
  setTimeout(()=>estateEntrance.classList.add('door-open'),430);
  setTimeout(()=>estateEntrance.remove(),930);
  setTimeout(()=>{if(!ambienceMuted)fadeAmbience(.065)},780);
}
estateGate?.addEventListener('click',enterEstate,{once:true});

ambienceToggle?.addEventListener('click',()=>{
  ambienceMuted=!ambienceMuted;
  localStorage.setItem('joyAmbienceMuted',String(ambienceMuted));
  setAmbienceControl();
  if(ambienceMuted)fadeAmbience(0,420);
  else{primeAmbience();fadeAmbience(.065,1200)}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    ambienceWasPlaying=!houseJazz.paused;
    cancelAnimationFrame(ambienceFadeFrame);
    houseJazz.pause();
  }else if(ambienceWasPlaying&&!ambienceMuted){
    houseJazz.volume=0;
    houseJazz.play().then(()=>fadeAmbience(.065,1200)).catch(()=>{});
  }
});
setAmbienceControl();

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
// JOY_BASE_LOCKED: all coordinates are measured against the immutable 420×938 base.
// These are dedicated worn assets, never product thumbnails or mannequin shapes.
const fittedStage=model.querySelector('.joy-fitted-layers');
const fittedPaths={
  top:{
    silk:'M133 173 Q143 203 149 218 Q195 248 241 213 L250 174 L262 179 Q271 229 254 286 Q239 327 254 367 Q203 383 128 365 Q146 326 136 290 Q120 245 125 186Z',
    black:'M133 173 L143 175 Q147 217 165 224 Q208 241 240 214 L248 174 L258 176 Q271 223 255 285 Q242 325 255 368 Q195 383 128 365 Q144 325 135 286 Q119 236 125 186Z',
    rust:'M132 174 Q151 188 194 229 Q225 197 250 174 L263 180 Q270 238 250 291 L256 369 Q199 388 127 366 Q145 319 136 284 Q121 235 125 188Z',
    ivory:'M132 173 Q146 189 193 198 Q233 191 249 173 L268 178 Q276 226 257 279 Q243 321 256 367 Q200 381 127 364 Q145 321 136 279 Q121 224 124 187Z'
  },
  bottom:{
    trousers:'M127 361 Q189 378 254 365 Q271 402 270 453 Q281 545 301 614 Q321 688 354 805 L326 812 Q295 733 273 679 Q250 634 239 584 L196 462 Q184 449 177 472 Q184 543 178 593 Q174 650 195 788 L164 797 Q133 701 126 638 Q110 573 105 522 Q82 435 99 396Z',
    midi:'M127 361 Q190 378 254 365 Q273 417 278 469 Q277 558 293 660 Q219 688 119 666 Q113 570 99 478 Q87 422 104 390Z',
    wrap:'M127 361 Q190 378 254 365 Q271 409 277 461 L316 738 Q242 773 132 746 Q120 636 105 524 Q86 428 103 391Z',
    column:'M127 361 Q191 378 254 365 Q274 420 276 470 Q282 590 310 712 L333 824 Q239 855 153 831 L118 670 Q102 562 97 481 Q89 418 105 390Z'
  }
};
function wornAsset(category,id){
  const item=piece(category,id), tone=item.tone;
  const defs=`<defs><linearGradient id="cloth-${category}" x1="0" x2="1"><stop stop-color="${tone}"/><stop offset=".38" stop-color="${tone}"/><stop offset=".57" stop-color="${tone}" stop-opacity=".83"/><stop offset="1" stop-color="${tone}"/></linearGradient><mask id="hands-${category}"><rect width="420" height="938" fill="white"/><path d="M99 350 Q116 337 137 347 L158 371 L151 391 L115 383 L96 370Z M286 464 Q303 464 315 493 L317 526 L301 548 L286 537 L280 506Z" fill="black"/></mask></defs>`;
  let drawing='';
  if(category==='top'){
    drawing=`<g mask="url(#hands-top)"><path d="${fittedPaths.top[id]}" fill="url(#cloth-top)"/><g fill="none" stroke="${id==='ivory'?'#9f8972':'#b2937b'}" stroke-opacity=".25" stroke-width="1.5"><path d="M139 275 Q155 299 144 343 M250 273 Q237 300 249 345 M132 359 Q190 375 251 361"/>${id==='rust'?'<path d="M153 190 Q213 239 251 281 L135 338 M135 339 Q187 349 251 335"/>':'<path d="M149 220 Q197 248 240 216 M154 229 Q195 253 231 230"/>'}</g>${id==='ivory'?'<path d="M123 177 Q99 170 87 194 Q70 238 36 285 Q26 304 41 325 L89 367 L104 348 L60 302 Q101 256 121 218Z M262 177 Q292 177 298 211 L309 330 L309 467 L287 471 L277 336 L265 235Z" fill="url(#cloth-top)"/><path d="M40 294 Q53 299 65 303 M281 329 L303 334 M87 355 L98 343 M289 458 L307 455" fill="none" stroke="#9f8972" stroke-opacity=".35" stroke-width="2"/>':''}</g>`;
  } else if(category==='bottom'){
    drawing=`<g mask="url(#hands-bottom)"><path d="${fittedPaths.bottom[id]}" fill="url(#cloth-bottom)"/><g fill="none" stroke="${id==='midi'||id==='wrap'?'#d99887':'#8b7e79'}" stroke-opacity=".22" stroke-width="1.6"><path d="M126 366 Q191 381 254 370"/>${id==='trousers'?'<path d="M145 400 Q141 482 148 554 L175 779 M236 401 Q250 489 260 557 L339 798 M181 385 L179 438"/>':id==='wrap'?'<path d="M242 382 Q201 465 182 562 L163 751 M258 451 Q259 583 293 732"/>':'<path d="M142 401 Q127 487 150 636 M235 402 Q253 528 260 655"/>'}</g></g>`;
  } else if(category==='shoes'){
    const feet=['M169 825 Q182 817 198 829 L203 863 Q208 884 188 886 Q155 886 157 867Z','M332 862 Q345 854 361 869 L375 894 Q390 924 364 928 Q338 931 333 912Z'];
    drawing=feet.map((d,i)=>`<path d="${d}" fill="${id==='sandal'?'#925b3b':id==='loafer'?'#25191a':'#211819'}"/><path d="${i===0?'M160 873 Q178 888 199 875':'M339 917 Q359 934 379 916'}" fill="none" stroke="${id==='loafer'?'#0d090a':'#b69a59'}" stroke-width="2"/>${id==='sandal'?`<path d="${i===0?'M163 857 Q181 868 200 856 M169 832 L194 845':'M334 893 Q354 906 371 896 M339 873 L363 888'}" fill="none" stroke="#c6a76b" stroke-width="4"/>`:`<path d="${i===0?'M169 829 Q183 836 196 829 Q199 850 193 859 Q179 869 166 855Z':'M337 867 Q351 877 360 869 L369 892 Q358 903 343 894Z'}" fill="#925b3b"/>`}${id==='loafer'?`<path d="${i===0?'M163 860 L197 863':'M340 898 L372 907'}" stroke="#ad8b50" stroke-width="3"/>`:''}`).join('');
  } else if(category==='bag'){
    drawing=id==='clutch'?'<path d="M311 471 L360 479 L356 512 L309 506Z" fill="#b49656" stroke="#e1c889" stroke-width="1.5"/><path d="M312 478 L357 485" stroke="#745628"/>':`<g>${id==='crossbody'?'<path d="M138 178 Q191 263 272 386 L325 459" stroke="#1c1515" stroke-width="7" fill="none"/><path d="M139 178 Q192 263 273 386 L326 459" stroke="#b08b4a" stroke-width=".8" fill="none"/>':'<path d="M310 477 Q302 448 321 449 Q341 452 332 481" fill="none" stroke="#62462f" stroke-width="5"/>'}<path d="M303 473 L346 480 L353 530 Q329 543 300 530Z" fill="${id==='crossbody'?'#211b1b':'#472b26'}" stroke="#836440" stroke-width="1.4"/><path d="M306 483 L344 489 L342 507 L306 501Z" fill="none" stroke="#9d7c4b" stroke-opacity=".4"/><rect x="322" y="493" width="8" height="5" rx="1" fill="#c6a15c"/></g>`;
  } else {
    drawing=[154,234].map(x=>id==='minimal'?`<circle cx="${x}" cy="136" r="2.4" fill="#c8ac67"/>`:id==='drops'?`<path d="M${x} 134 L${x} 151" stroke="#bba064" stroke-width="1.5"/><ellipse cx="${x}" cy="152" rx="2" ry="4" fill="#d9c186"/>`:`<ellipse cx="${x}" cy="141" rx="3" ry="5" fill="none" stroke="#c9aa61" stroke-width="1.5"/>`).join('');
  }
  return `<svg class="joy-worn joy-worn-${category}" data-worn="${category}" viewBox="0 0 420 938" preserveAspectRatio="none">${defs}${drawing}</svg>`;
}
function renderWorn(category){
  let layer=fittedStage.querySelector(`[data-worn="${category}"]`);
  const template=document.createElement('template');template.innerHTML=wornAsset(category,selections[category]);
  if(layer)layer.replaceWith(template.content.firstChild);else fittedStage.append(template.content.firstChild);
}
function fitGarment(category){
  renderWorn(category);
  fittedStage.querySelector(`[data-worn="${category}"]`).classList.add('couture-fit');
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
    if(announce)fitGarment(category);else renderWorn(category);
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
