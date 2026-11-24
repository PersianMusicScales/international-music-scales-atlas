import {player} from './sound.js'
import {modes,solfege} from './modes.js'
import {esc} from './diagrams.js'
import {fmt,names} from './theory.js'
import {wheel,notation,rotateTonic,rotateModel,tonicName} from './wheel.js?v=world4'
import {mountGlobe} from './globe.js?v=journey3'
const by=id=>document.getElementById(id)
const query=new URLSearchParams(location.search)
const response=await fetch(new URL('./catalog.json',import.meta.url))
if(!response.ok)throw Error('Could not load tuning catalog')
const {scales,regions,sources}=await response.json()
const all=[...scales,...modes]
const lookup=id=>all.find(m=>m.id===id)
const label=m=>[m.name,m.local_script,m.variant,m.tuning_model].filter(Boolean).join(' · ')
function select(id,choices,value){
 const el=by(id);el.replaceChildren(...choices.map(([k,v])=>new Option(v,k)))
 if(choices.some(([k])=>String(k)===String(value)))el.value=value
}
const groups=[...regions,{id:'western',label:'Western diatonic modes'}]
const requested=lookup(query.get('model'))
select('region',[['','Choose a region'],...groups.map(g=>[g.id,g.label])],requested?.geo_id||query.get('region'))
select('comparison',[['','None'],...all.map(m=>[m.id,label(m)])],query.get('comparison'))
for(const id of ['reference','spelling'])if([...by(id).options].some(o=>o.value===query.get(id)))by(id).value=query.get(id)
function tonics(value){select('tonic',Array.from({length:24},(_,i)=>[i/2,tonicName(i/2,by('spelling').value)]),value)}
tonics(query.get('tonic')??0)
let active=null,region='',menuTimer,playing=false
const audio=player(isPlaying=>{playing=isPlaying;by('play').textContent=isPlaying?'■ Stop':'▶ Play scale'})
function storeView(push=false){
 const url=new URL(location.href);url.search='';url.hash=''
 if(region)url.searchParams.set('region',region)
 if(active){
  url.searchParams.set('model',active.id)
  for(const k of ['tonic','degree','reference','comparison','spelling'])if(by(k).value)url.searchParams.set(k,by(k).value)
 }
 history[push?'pushState':'replaceState'](null,'',url)
}
const globe=mountGlobe(by('earth'),regions,id=>chooseRegion(id,true))
function chooseRegion(id,push=false,animate=true){
 const group=groups.find(g=>g.id===id);if(!group)return
 closePanel();clearTimeout(menuTimer);audio.stop();active=null;region=id
 by('detail').hidden=true;by('atlas').hidden=false;by('region-list').open=false;by('region').value=id
 const models=all.filter(m=>m.geo_id===id)
 select('model',[['','Choose a scale'],...models.map(m=>[m.id,label(m)])],'')
 by('scale-label').hidden=!models.length;by('coverage').textContent=models.length?'':'Research coverage only. No numerical tuning is available yet.'
 by('region-title').textContent=group.label;by('picker').hidden=true
 if(id==='western')globe.reset();else globe.focus(id)
 const delay=animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?420:0
 menuTimer=setTimeout(()=>{by('picker').hidden=false;(models.length?by('model'):by('dismiss')).focus({preventScroll:true})},delay)
 storeView(push);window.scrollTo(0,0)
}
function home(push=false){
 clearTimeout(menuTimer);active=null;region='';audio.stop();globe.reset()
 by('picker').hidden=true;by('region-list').open=false;by('region').value='';by('atlas').hidden=false;by('detail').hidden=true;storeView(push)
}
function openScale(m,degree=0,push=true){
 clearTimeout(menuTimer);audio.stop();active=m;region=m.geo_id
 select('degree',Array.from({length:m.circle_ready?m.notes_count:1},(_,i)=>[i,i===0?'1 · documented order':String(i+1)]),degree)
 by('degree').disabled=!m.circle_ready;by('detail').hidden=false;by('atlas').hidden=true
 for(const [button,panel] of [['info','explanation'],['signature','score']]){by(button).setAttribute('aria-expanded','false');by(panel).hidden=true}
 by('settings').open=false;render();storeView(push);window.scrollTo(0,0);by('title').focus({preventScroll:true})
}
function current(){return rotateModel(active,Number(by('degree').value))}
function render(){
 if(!active)return
 const m=current(),t=Number(by('tonic').value),pref=by('spelling').value,ref=by('reference').value,other=lookup(by('comparison').value)
 const degree=Number(by('degree').value)
 const name=active.geo_id==='western'?modes[(modes.indexOf(active)+degree)%7].name:active.name
 by('title').textContent=tonicName(t,pref)+' '+name+(degree&&active.geo_id!=='western'?' · rotation '+(degree+1):'')
 by('subtitle').textContent=[active.local_script,active.tradition,active.category,active.variant].filter(Boolean).join(' · ')
 by('panels').innerHTML='<div '+(m.circle_ready?'class="interactive-wheel" tabindex="0" aria-label="Diatonic ring. Use left and right arrows to transpose."':'')+'>'+wheel(m,t,pref,ref)+'</div>'
 by('steps').textContent='Steps in cents · '+m.intervals_cents.map(fmt).join(' · ')
 by('score').querySelector('.content').innerHTML=notation(m,t,pref,ref)
 const refs=active.source_ids.map(id=>sources.find(s=>s.id===id)).filter(Boolean)
 by('explanation').querySelector('.content').innerHTML='<h2>About this tuning</h2><p>'+esc([active.name,active.tradition,active.tuning_model].filter(Boolean).join(' · '))+'</p><p>'+(m.circle_ready?'Read clockwise from the top. Each colored arc spans one step between successive scale notes. Its width shows the interval size in cents (100¢ = one equal-tempered semitone). The inner letters are diatonic reference notes. Drag them to change the tonic. Signature lists the sounding notes and their exact alterations.':'This open span ends at its documented final pitch.')+'</p>'+refs.map(s=>'<p><a href="'+esc(s.url)+'">'+esc(s.citation)+'</a></p>').join('')+(refs.length?'<small>Source interpretation under review.</small>':'')
 by('comparison-panel').innerHTML=other?'<h3>'+esc(other.name)+'</h3>'+wheel(other,t,pref,ref)+notation(other,t,pref,ref):''
}
by('model').onchange=e=>{const m=lookup(e.target.value);if(m)openScale(m)}
by('region').onchange=e=>{if(e.target.value)chooseRegion(e.target.value,true)}
by('return').onclick=()=>chooseRegion(region,true,false)
by('dismiss').onclick=()=>home(true)
let opened
function closePanel(restore=false,fade=false){
 if(!opened)return
 const {button,panel}=opened
 const finish=()=>{if(opened?.panel!==panel)panel.hidden=true}
 if(fade&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  panel.animate([{opacity:1},{opacity:0}],{duration:110})
  setTimeout(finish,110)
 }else panel.hidden=true
 button.setAttribute('aria-expanded','false')
 opened=null
 if(restore)button.focus({preventScroll:true})
}
function positionPanel(){
 if(!opened)return
 const {button,panel}=opened,box=button.getBoundingClientRect(),gap=10
 const above=box.top-gap,below=innerHeight-box.bottom-gap
 const down=below>=above
 panel.style.maxHeight=Math.max(44,(down?below:above)-gap)+'px'
 panel.style.left=Math.max(gap,Math.min(box.left,document.documentElement.clientWidth-panel.offsetWidth-gap))+'px'
 panel.style.top=(down?box.bottom+gap:Math.max(gap,box.top-gap-panel.offsetHeight))+'px'
}
for(const [id,target] of [['info','explanation'],['signature','score']]){
 const button=by(id),panel=by(target)
 button.onclick=()=>{
  if(opened?.button===button){closePanel(true,true);return}
  closePanel();opened={button,panel};panel.hidden=false
  button.setAttribute('aria-expanded','true')
  positionPanel();panel.querySelector('.close').focus({preventScroll:true})
 }
 panel.querySelector('.close').onclick=()=>closePanel(true,true)
}
document.addEventListener('pointerdown',event=>{
 if(opened&&!opened.button.contains(event.target)&&!opened.panel.contains(event.target))closePanel(false,!event.target.closest('#signature,#info'))
})
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanel(true,true)})
const panelResize=new ResizeObserver(positionPanel)
for(const panel of document.querySelectorAll('.overlay'))panelResize.observe(panel)
window.addEventListener('resize',positionPanel)
window.addEventListener('scroll',positionPanel)
by('play').onclick=async()=>{if(playing){audio.stop();return}try{await audio.start(current(),Number(by('tonic').value))}catch{by('play').textContent='Retry playback'}}
for(const id of ['degree','tonic','spelling','reference','comparison'])by(id).onchange=()=>{
 if(id==='spelling')tonics(by('tonic').value)
 audio.stop();render();storeView()
}
function sync(){audio.stop();storeView()}
function transpose(delta){by('tonic').value=rotateTonic(Number(by('tonic').value),delta);sync();render()}
by('left').onclick=()=>transpose(-1);by('right').onclick=()=>transpose(1)
by('panels').onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();transpose(e.key==='ArrowRight'?1:-1);by('panels').firstElementChild.focus({preventScroll:true})}}
let drag
const angle=(e,c)=>Math.atan2(e.clientX-c.x,c.y-e.clientY)
by('panels').onpointerdown=e=>{
 const dial=e.target.closest('.interactive-wheel .dial');if(!dial||e.button!==0)return
 const box=dial.closest('svg').getBoundingClientRect(),c={x:box.left+box.width/2,y:box.top+box.height/2}
 drag={c,angle:angle(e,c),travel:0,base:Number(by('tonic').value),id:e.pointerId}
 by('panels').setPointerCapture(e.pointerId);e.preventDefault()
}
by('panels').onpointermove=e=>{
 if(!drag||e.pointerId!==drag.id)return
 const a=angle(e,drag.c),delta=a-drag.angle
 drag.travel+=Math.atan2(Math.sin(delta),Math.cos(delta));drag.angle=a
 const t=rotateTonic(drag.base,-Math.round(drag.travel*12/Math.PI))
 if(t!==Number(by('tonic').value)){by('tonic').value=t;render();sync()}
}
by('panels').onlostpointercapture=()=>{drag=null}

by('minus').onclick=()=>globe.zoom(1/1.2);by('plus').onclick=()=>globe.zoom(1.2);by('reset').onclick=()=>home(true)
window.addEventListener('pagehide',audio.stop)
window.addEventListener('popstate',()=>location.reload())
if(requested)openScale(requested,query.get('degree'),false)
else if(groups.some(g=>g.id===query.get('region')))chooseRegion(query.get('region'),false,false)
