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
const roomNames={salon:'The Private Salon',wardrobe:'Joy’s Wardrobe',money:'The Money Room',retreat:'The Retreat',treasure:'The Treasure Room'};
let roomMoving=false;
async function showRoom(id){
  if(roomMoving||document.getElementById(id)?.classList.contains('active'))return;
  roomMoving=true;
  if(id!=='retreat')stopQuietMoment();
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
// One canonical palette, consumed by both garments and product swatches.
const wardrobePalette=Object.freeze([
  {id:'white',name:'Pure White',hex:'#ffffff'},
  {id:'ivory',name:'Ivory / Cream',hex:'#e1d3bf'},
  {id:'black',name:'Black',hex:'#171416'},
  {id:'espresso',name:'Espresso',hex:'#2b1b1a'},
  {id:'chocolate',name:'Chocolate',hex:'#4a3029'},
  {id:'taupe',name:'Taupe',hex:'#918176'},
  {id:'camel',name:'Camel',hex:'#b38b60'},
  {id:'stone',name:'Stone / Beige',hex:'#c7b9a6'},
  {id:'charcoal',name:'Charcoal',hex:'#242022'},
  {id:'rose',name:'Rose',hex:'#713247'},
  {id:'blush',name:'Blush',hex:'#c99b9c'},
  {id:'burgundy',name:'Burgundy / Wine',hex:'#582338'},
  {id:'rust',name:'Rust',hex:'#a55031'},
  {id:'navy',name:'Navy',hex:'#263044'},
  {id:'olive',name:'Olive',hex:'#626449'}
]);
const paletteById=Object.freeze(Object.fromEntries(wardrobePalette.map(c=>[c.id,c])));
const garmentColors={top:'espresso',bottom:'charcoal'};
const wardrobe={
  top:[
    {id:'silk',name:'Silk top',note:'Draped neckline',material:'silk',defaultColor:'espresso'},
    {id:'rust',name:'Wrap top',note:'Soft sculpted waist',material:'silk',defaultColor:'rust'},
    {id:'ivory',name:'Blouse',note:'Architectural sleeve',material:'crepe',defaultColor:'ivory'},
    {id:'black',name:'Bodice',note:'Gathered & fitted',material:'satin',defaultColor:'black'}
  ],
  bottom:[
    {id:'trousers',name:'Tailored trouser',note:'Long clean line',material:'wool',defaultColor:'charcoal'},
    {id:'midi',name:'Midi skirt',note:'Fluid movement',material:'silk',defaultColor:'rose'},
    {id:'wrap',name:'Wrap skirt',note:'Warm & effortless',material:'crepe',defaultColor:'rust'},
    {id:'column',name:'Column skirt',note:'Evening silhouette',material:'satin',defaultColor:'black'}
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
const occasionColors={
  'Date night':{top:'black',bottom:'black'},
  'Sunday elegance':{top:'ivory',bottom:'rose'},
  'City day':{top:'espresso',bottom:'charcoal'},
  'Celebration':{top:'rust',bottom:'rust'},
  'Power meeting':{top:'ivory',bottom:'charcoal'}
};
let occasionTitle=occasionLooks['Date night'].title;
const categoryLabels={top:'Top',bottom:'Bottom',shoes:'Shoes',bag:'Bag',jewelry:'Jewels'};
const model=document.getElementById('joy-model');
const options=document.getElementById('wardrobe-options');
const composerTitle=document.getElementById('composer-title');
const composerSummary=document.getElementById('composer-summary');
let activeCategory='top';

function piece(category,id){return wardrobe[category].find(item=>item.id===id)}
function mixColor(hex,target,amount){
  const a=hex.slice(1).match(/../g).map(v=>parseInt(v,16));
  const b=target.slice(1).match(/../g).map(v=>parseInt(v,16));
  return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*amount).toString(16).padStart(2,'0')).join('');
}
function materialColors(tone,material='wool'){
  const response={silk:{light:.16,dark:.14},satin:{light:.21,dark:.18},crepe:{light:.07,dark:.11},wool:{light:.035,dark:.085}}[material];
  return {highlight:mixColor(tone,'#f6eee3',response.light),shadow:mixColor(tone,'#130f12',response.dark)};
}
function renderColors(){
  const panel=document.getElementById('garment-colors');
  panel.hidden=!(activeCategory in garmentColors);
  if(panel.hidden){panel.innerHTML='';return;}
  const selected=paletteById[garmentColors[activeCategory]];
  panel.innerHTML=`<div class="fabric-color-heading"><span>COLOR</span><small>${selected.name}</small></div><div class="fabric-swatches" role="group" aria-label="${categoryLabels[activeCategory]} color">${wardrobePalette.map(c=>`<button type="button" class="fabric-swatch" data-color="${c.id}" aria-label="${c.name}" aria-pressed="${c.id===selected.id}" title="${c.name}" style="--fabric-color:${c.hex}"><span aria-hidden="true"></span></button>`).join('')}</div>`;
  panel.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{
    garmentColors[activeCategory]=button.dataset.color;
    occasionTitle='Joy’s Personal Mix';
    fitGarment(activeCategory);renderOptions();updateComposer();
  }));
}
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
    midi:'M127 361 Q190 378 254 365 Q273 417 278 469 Q283 558 315 660 Q219 688 119 666 Q113 570 99 478 Q87 422 104 390Z',
    wrap:'M127 361 Q190 378 254 365 Q271 409 277 461 Q301 588 347 738 Q242 773 132 746 Q120 636 105 524 Q86 428 103 391Z',
    column:'M127 361 Q191 378 254 365 Q274 420 276 470 Q299 590 341 712 L365 824 Q239 855 153 831 L118 670 Q102 562 97 481 Q89 418 105 390Z'
  }
};
function wornAsset(category,id){
  const item=piece(category,id), tone=garmentColors[category]?paletteById[garmentColors[category]].hex:item.tone;
  const material=materialColors(tone,item.material);
  const defs=`<defs><linearGradient id="cloth-${category}" x1="0" x2="1"><stop stop-color="${material.shadow}"/><stop offset=".38" stop-color="${tone}"/><stop offset=".57" stop-color="${material.highlight}"/><stop offset="1" stop-color="${material.shadow}"/></linearGradient><mask id="hands-${category}"><rect width="420" height="938" fill="white"/><path d="M99 350 Q116 337 137 347 L158 371 L151 391 L115 383 L96 370Z M286 464 Q303 464 315 493 L317 526 L301 548 L286 537 L280 506Z" fill="black"/></mask></defs>`;
  let drawing='';
  if(category==='top'){
    drawing=`<g mask="url(#hands-top)"><path d="${fittedPaths.top[id]}" fill="url(#cloth-top)"/><g fill="none" stroke="${id==='ivory'?'#9f8972':'#b2937b'}" stroke-opacity=".25" stroke-width="1.5"><path d="M139 275 Q155 299 144 343 M250 273 Q237 300 249 345 M132 359 Q190 375 251 361"/>${id==='rust'?'<path d="M153 190 Q213 239 251 281 L135 338 M135 339 Q187 349 251 335"/>':'<path d="M149 220 Q197 248 240 216 M154 229 Q195 253 231 230"/>'}</g>${id==='ivory'?'<path d="M123 177 Q99 170 87 194 Q70 238 36 285 Q26 304 41 325 L89 367 L104 348 L60 302 Q101 256 121 218Z M262 177 Q292 177 298 211 L309 330 L309 467 L287 471 L277 336 L265 235Z" fill="url(#cloth-top)"/><path d="M40 294 Q53 299 65 303 M281 329 L303 334 M87 355 L98 343 M289 458 L307 455" fill="none" stroke="#9f8972" stroke-opacity=".35" stroke-width="2"/>':''}</g>`;
  } else if(category==='bottom'){
    drawing=`<g mask="url(#hands-bottom)"><path d="${fittedPaths.bottom[id]}" fill="url(#cloth-bottom)"/><g fill="none" stroke="${id==='midi'||id==='wrap'?'#d99887':'#8b7e79'}" stroke-opacity=".22" stroke-width="1.6"><path d="M126 366 Q191 381 254 370"/>${id==='trousers'?'<path d="M145 400 Q141 482 148 554 L175 779 M236 401 Q250 489 260 557 L339 798 M181 385 L179 438"/>':id==='wrap'?'<path d="M242 382 Q201 465 182 562 L163 751 M258 451 Q259 583 293 732"/>':'<path d="M142 401 Q127 487 150 636 M235 402 Q253 528 260 655"/>'}</g></g>`;
  } else if(category==='shoes'){
    // Independent measured foot perspectives. Openings expose the locked feet,
    // rather than painting replacement ankles or duplicating the base footwear.
    const left='M164 845 Q162 858 158 864 Q153 879 165 882 Q186 891 200 881 Q208 876 202 861 L197 843 Q184 851 164 845Z';
    const right='M335 881 Q337 897 334 902 Q331 919 345 926 Q366 934 380 925 Q387 919 379 903 L363 881 Q352 890 335 881Z';
    const openingL='M165 841 Q177 852 197 842 L198 857 Q182 867 164 855Z';
    const openingR='M335 876 Q348 889 362 878 L370 898 Q354 910 338 895Z';
    drawing=`<defs><linearGradient id="shoe-leather" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${id==='loafer'?'#392624':'#292527'}"/><stop offset=".45" stop-color="${id==='loafer'?'#211716':'#141315'}"/><stop offset="1" stop-color="#0d0c0e"/></linearGradient><mask id="pump-openings"><rect width="420" height="938" fill="white"/><path d="${openingL} ${openingR}" fill="black"/></mask></defs><ellipse cx="181" cy="885" rx="25" ry="3.5" fill="#080609" opacity=".32"/><ellipse cx="360" cy="928" rx="25" ry="3.5" fill="#080609" opacity=".32"/>`;
    if(id==='sandal'){
      drawing+=`<path d="${left} ${right}" fill="#895437"/><path d="M159 876 Q178 889 199 877 M338 920 Q359 937 380 921" fill="none" stroke="#34251e" stroke-width="3"/><g fill="none" stroke="#bca06a" stroke-width="3.2" stroke-linecap="round"><path d="M159 866 Q178 873 201 865 M166 846 Q177 854 198 847 M336 904 Q355 917 379 910 M337 884 Q350 896 368 888"/></g><path d="M181 854 L179 869 M354 896 L357 913" fill="none" stroke="#8e7448" stroke-width="2"/>`;
    }else{
      drawing+=`<g mask="url(#pump-openings)"><path d="${left}" fill="url(#shoe-leather)"/><path d="${right}" fill="url(#shoe-leather)"/></g><g fill="none" stroke="#6f6260" stroke-opacity=".4" stroke-width="1"><path d="M159 870 Q162 880 180 882 Q194 884 201 875 M337 911 Q342 924 360 927 Q373 928 381 920"/><path d="M164 857 Q181 869 199 858 M337 896 Q355 912 372 900"/></g><path d="M159 878 Q180 890 200 879 M337 922 Q360 936 380 924" fill="none" stroke="#0b090b" stroke-width="2.4"/>${id==='loafer'?'<path d="M161 866 Q179 870 202 867 M337 907 Q356 918 379 912" fill="none" stroke="#4b3430" stroke-width="5"/><path d="M175 868 L185 868 M352 914 L361 916" stroke="#9f875a" stroke-width="1.8"/>':''}`;
    }
  } else if(category==='bag'){
    drawing=id==='clutch'?`<defs><linearGradient id="clutch-gold" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#aa9364"/><stop offset=".36" stop-color="#c1ab79"/><stop offset=".64" stop-color="#b19a68"/><stop offset="1" stop-color="#897344"/></linearGradient></defs><g mask="url(#hands-bag)"><path d="M296 493 L349 508 Q354 510 353 515 L347 550 L290 536 L288 532Z" fill="#4c3b24" opacity=".22"/><path d="M294 491 L347 505 L343 544 L287 529Z" fill="url(#clutch-gold)" stroke="#8d784e" stroke-width="1.2"/><path d="M347 505 L353 510 L349 546 L343 544Z" fill="#806b42"/><path d="M287 529 L343 544 L349 546 L293 533Z" fill="#6b5635"/><path d="M296 494 L345 507 L343 516 L292 503Z" fill="#c9b585" opacity=".42"/><path d="M291 509 L342 522 M290 512 L341 525" stroke="#e2d3ac" stroke-width=".6" opacity=".2"/><path d="M296 493 L347 506" stroke="#ddc99b" stroke-width="1"/><path d="M322 501 L329 503 L329 506 L322 504Z" fill="#6e5a38"/></g>`:`<g>${id==='crossbody'?'<path d="M138 178 Q191 263 272 386 L325 459" stroke="#1c1515" stroke-width="7" fill="none"/><path d="M139 178 Q192 263 273 386 L326 459" stroke="#b08b4a" stroke-width=".8" fill="none"/>':'<path d="M310 477 Q302 448 321 449 Q341 452 332 481" fill="none" stroke="#62462f" stroke-width="5"/>'}<path d="M303 473 L346 480 L353 530 Q329 543 300 530Z" fill="${id==='crossbody'?'#211b1b':'#472b26'}" stroke="#836440" stroke-width="1.4"/><path d="M306 483 L344 489 L342 507 L306 501Z" fill="none" stroke="#9d7c4b" stroke-opacity=".4"/><rect x="322" y="493" width="8" height="5" rx="1" fill="#c6a15c"/></g>`;
  } else {
    // Approved portrait already contains studs: minimal adds no duplicate marker.
    // Earlobe contacts are measured from the locked portrait, not the old head.
    drawing=id==='minimal'?'':[{x:154,y:133-16*938/425,rx:2.6},{x:258,y:139-16*938/425,rx:2.1}].map(({x,y,rx})=>id==='drops'?`<path d="M${x} ${y} L${x-.4} ${y+8}" stroke="#bba064" stroke-width="1"/><ellipse cx="${x-.4}" cy="${y+10}" rx="1.7" ry="3" fill="#c6ad71"/>`:`<path d="M${x} ${y} C${x-rx*2} ${y+2},${x-rx*2} ${y+9},${x} ${y+9} C${x+rx*2} ${y+9},${x+rx*2} ${y+2},${x} ${y}" fill="none" stroke="#baa063" stroke-width="1.2"/>`).join('');
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
  options.innerHTML=wardrobe[activeCategory].map(item=>`<button class="piece ${selections[activeCategory]===item.id?'active':''}" data-piece="${item.id}"><i class="piece-thumb ${activeCategory}-${item.id}" style="--swatch:${activeCategory in garmentColors?paletteById[garmentColors[activeCategory]].hex:item.tone}"></i><span><b>${item.name}</b><small>${item.note}</small></span><em>${selections[activeCategory]===item.id?'SELECTED':'ADD'}</em></button>`).join('');
  options.querySelectorAll('.piece').forEach(button=>button.addEventListener('click',()=>{
    occasionTitle='Joy’s Personal Mix';
    selections[activeCategory]=button.dataset.piece;
    model.dataset[activeCategory]=button.dataset.piece;
    fitGarment(activeCategory); renderOptions(); updateComposer();
  }));
  renderColors();
}
function updateComposer(){
  const top=piece('top',selections.top), bottom=piece('bottom',selections.bottom), shoes=piece('shoes',selections.shoes);
  const names=[paletteById[garmentColors.top].name+' '+top.name,paletteById[garmentColors.bottom].name+' '+bottom.name,piece('bag',selections.bag).name,piece('jewelry',selections.jewelry).name];
  composerTitle.textContent=occasionTitle;
  composerSummary.textContent=names.join(' · ');
}
const occasionSelect=document.getElementById('occasion');
function applyOccasion(name,announce=true){
  const edit=occasionLooks[name];
  occasionTitle=edit.title;
  Object.assign(garmentColors,occasionColors[name]);
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
  Object.keys(garmentColors).forEach(category=>{garmentColors[category]=wardrobePalette[Math.floor(Math.random()*wardrobePalette.length)].id});
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
  saved.unshift({version:2,title:composerTitle.textContent,occasion:document.getElementById('occasion').value,pieces:{...selections},colors:{...garmentColors}});
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

// Retreat: optional, interruption-free atmosphere. Reuse the single house-jazz instance.
const retreatScene=document.querySelector('.retreat-scene');
const retreatWhispers={candlelight:'Let the day soften around you.',moonlight:'A quiet sky. A little room to dream.',warmth:'You are allowed to take up this peaceful space.'};
document.querySelectorAll('.retreat-moods [data-mood]').forEach(button=>button.addEventListener('click',()=>{
  retreatScene.dataset.mood=button.dataset.mood;
  document.getElementById('retreat-whisper').textContent=retreatWhispers[button.dataset.mood];
  document.querySelectorAll('.retreat-moods [data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
let quietTimer=0,quietActive=false;
const breathToggle=document.getElementById('breath-toggle');
const breathCaption=document.getElementById('breath-caption');
function stopQuietMoment(){
  clearTimeout(quietTimer);quietActive=false;
  document.querySelector('.retreat-moment')?.classList.remove('breathing','breath-in');
  breathToggle?.setAttribute('aria-pressed','false');
  if(breathToggle)breathToggle.textContent='BEGIN A QUIET MOMENT';
  if(breathCaption)breathCaption.textContent='Stay as long as you like.';
}
function quietPhase(inhale){
  if(!quietActive)return;
  document.querySelector('.retreat-moment').classList.toggle('breath-in',inhale);
  breathCaption.textContent=inhale?'A gentle breath in…':'Let it go, slowly…';
  quietTimer=setTimeout(()=>quietPhase(!inhale),inhale?4000:6000);
}
breathToggle.addEventListener('click',()=>{
  if(quietActive){stopQuietMoment();return;}
  quietActive=true;breathToggle.setAttribute('aria-pressed','true');breathToggle.textContent='RETURN TO STILLNESS';
  document.querySelector('.retreat-moment').classList.add('breathing');quietPhase(true);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopQuietMoment()});
const kindness=['You do not have to earn your rest.','Nothing is required of you in this moment.','Let something small and beautiful be enough.','Your softness belongs here.','There is room for you, exactly as you are.'];
let kindnessIndex=0;
document.getElementById('retreat-note').addEventListener('click',()=>{kindnessIndex=(kindnessIndex+1)%kindness.length;document.getElementById('retreat-kindness').textContent=kindness[kindnessIndex]});

// Treasure Room: device-local IndexedDB, never transmit personal photographs.
let memoryDbPromise,photoUrls=[];
function memoryDb(){
  if(!memoryDbPromise)memoryDbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open('joy-treasures',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('moments',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  }).catch(error=>{memoryDbPromise=null;throw error});
  return memoryDbPromise;
}
async function memoryOperation(mode,action){
  const db=await memoryDb();
  return new Promise((resolve,reject)=>{const tx=db.transaction('moments',mode);let result;const request=action(tx.objectStore('moments'));request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
}
const memoryForm=document.getElementById('treasure-form');
const memoryError=document.getElementById('memory-error');
function toggleMemoryForm(open){memoryForm.hidden=!open;document.getElementById('treasure-add').setAttribute('aria-expanded',String(open));if(open)document.getElementById('memory-title').focus()}
document.getElementById('treasure-add').addEventListener('click',()=>toggleMemoryForm(memoryForm.hidden));
document.getElementById('treasure-cancel').addEventListener('click',()=>toggleMemoryForm(false));
async function renderMemories(){
  const collection=document.getElementById('treasure-collection');
  try{
    const moments=await memoryOperation('readonly',s=>s.getAll());
    if(!moments.length)return;
    photoUrls.forEach(URL.revokeObjectURL);photoUrls=[];collection.replaceChildren();
    moments.sort((a,b)=>b.created-a.created).forEach(moment=>{
      const card=document.createElement('article');card.className='memory-card';
      if(moment.photo){const img=document.createElement('img');const url=URL.createObjectURL(moment.photo);photoUrls.push(url);img.src=url;img.alt=moment.title;img.loading='lazy';card.append(img)}
      const title=document.createElement('h3');title.textContent=moment.title;card.append(title);
      if(moment.words){const text=document.createElement('p');text.textContent=moment.words;card.append(text)}
      collection.append(card);
    });
  }catch(error){memoryError.textContent='Device storage is unavailable. You can still enjoy your letter; no memories have been uploaded.'}
}
memoryForm.addEventListener('submit',async event=>{
  event.preventDefault();memoryError.textContent='';const submit=memoryForm.querySelector('[type="submit"]');submit.disabled=true;
  try{
    const photo=document.getElementById('memory-photo').files[0];
    if(photo&&(!['image/jpeg','image/png','image/webp'].includes(photo.type)||photo.size>8*1024*1024))throw Error('Please choose a JPG, PNG or WebP photo smaller than 8 MB.');
    const title=document.getElementById('memory-title').value.trim();if(!title)throw Error('Give your moment a little title.');
    await memoryOperation('readwrite',s=>s.put({id:crypto.randomUUID(),created:Date.now(),title,words:document.getElementById('memory-words').value.trim(),photo:photo||null}));
    memoryForm.reset();toggleMemoryForm(false);await renderMemories();notify('A little treasure, kept close.');
  }catch(error){memoryError.textContent=error.message||'This moment could not be saved. Please keep your original photo.'}finally{submit.disabled=false}
});
renderMemories();
addEventListener('pagehide',()=>{stopQuietMoment();photoUrls.forEach(URL.revokeObjectURL)});
addEventListener('pageshow',event=>{if(event.persisted)renderMemories()});

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
