import {modes,solfege} from './modes.js'
import {esc} from './diagrams.js'
import {fmt,names} from './theory.js'
import {wheel,notation,rotateTonic,rotateModel,tonicName} from './wheel.js?v=studio1'
import {mountGlobe} from './globe.js'
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
const requested=lookup(query.get('model'))
select('region',[...regions.map(g=>[g.id,g.label+' · '+g.model_ids.length]),['western','Western diatonic modes']],requested?.geo_id||(regions.some(g=>g.id===query.get('region'))?query.get('region'):'western'))
select('comparison',[['','None'],...all.map(m=>[m.id,label(m)])],query.get('comparison'))
for(const id of ['reference','spelling'])if([...by(id).options].some(o=>o.value===query.get(id)))by(id).value=query.get(id)
function tonics(value){select('tonic',Array.from({length:24},(_,i)=>[i/2,tonicName(i/2,by('spelling').value)]),value)}
tonics(query.get('tonic')??(by('region').value==='western'?2:0))
function regionModels(){return all.filter(m=>m.geo_id===by('region').value)}
function categories(value){
 const ms=regionModels()
 select('category',[['','All categories'],...[...new Set(ms.map(m=>m.category))].map(c=>[c,c])],value)
 by('category').disabled=!ms.length
 by('coverage').textContent=ms.length?ms.length+' tuning models. Locations are navigation aids for these traditions.':'Research coverage only. No numerical scale is available for this entry.'
}
function modelOptions(value){
 const ms=regionModels().filter(m=>!by('category').value||m.category===by('category').value)
 select('model',ms.map(m=>[m.id,label(m)]),value);by('model').disabled=!ms.length
}
function degrees(value){
 const m=lookup(by('model').value)
 select('degree',Array.from({length:m?.circle_ready?m.notes_count:1},(_,i)=>[i,i===0?'1 · documented order':String(i+1)]),value||0)
 by('degree').disabled=!m?.circle_ready
}
categories(query.get('category'));modelOptions(requested?.id||'mode-dorian');degrees(query.get('degree'))
function sync(){
 const url=new URL(location.href)
 for(const id of ['region','category','model','comparison','tonic','reference','spelling','degree']){
  const v=by(id).value;if(v)url.searchParams.set(id,v);else url.searchParams.delete(id)
 }
 history.replaceState(null,'',url)
}
function panel(m,other,primary){
 const t=Number(by('tonic').value),pref=by('spelling').value,ref=by('reference').value
 const rotated=primary?rotateModel(m,Number(by('degree').value)):m
 const derived=rotated!==m&&m.geo_id!=='western'?' · rotation from degree '+(Number(by('degree').value)+1):''
 const wheelHTML=wheel(rotated,t,pref,ref,other)
 const refs=m.source_ids.map(id=>sources.find(s=>s.id===id)).filter(Boolean)
 const displayMode=m.geo_id==='western'?modes[(modes.indexOf(m)+(primary?Number(by('degree').value):0))%7].name:m.name
 const named=tonicName(t,pref)+' '+displayMode
 return '<section><h2 aria-live="polite">'+esc(named)+esc(derived)+'</h2><p>'+esc([m.local_script,m.tradition,m.category,m.variant,m.tuning_model].filter(Boolean).join(' · '))+'</p>'+
 (derived?'<p>Exploratory rotation of the documented interval order.</p>':'')+
 '<div class="instrument"><div '+(primary&&m.circle_ready?'class="interactive-wheel" tabindex="0" aria-label="Rotate diatonic ring with left and right arrow keys"':'')+'>'+wheelHTML+'</div>'+
 '<div class="score">'+notation(rotated,t,pref,ref)+'</div></div><p>Ordered steps (¢) · '+rotated.intervals_cents.map(fmt).join(' · ')+'</p>'+
 refs.map(s=>'<p><a href="'+esc(s.url)+'">'+esc(s.citation)+'</a></p>').join('')+(m.source_ids.length?'<small>Source interpretation under review.</small>':'')+'</section>'
}
function render(){
 const m=lookup(by('model').value),other=lookup(by('comparison').value)
 by('detail').hidden=!m;if(!m)return
 for(const btn of by('keys').children)btn.setAttribute('aria-pressed',String(Number(btn.value)===Number(by('tonic').value)))
 by('instructions').textContent=m.circle_ready?'Drag the inner C–D–E–F–G–A–B ring or use the arrows to change tonic. The outer ring keeps the selected scale’s interval order.':'This model is an open span. The tonic controls transpose its pitches without adding a closing interval.'
 by('panels').innerHTML='<div class="'+(other?'pair':'')+'">'+panel(m,other?.circle_ready?other:null,true)+(other?panel(other,null,false):'')+'</div>'
}
function setRegion(id){
 by('region').value=id;categories();modelOptions();degrees();sync();render();globe.focus(id)
}
const globe=mountGlobe(by('earth'),regions,setRegion)
globe.focus(by('region').value)
for(const [name,id] of [['Dorian','western'],['Shur','iran'],['China','china'],['Arabic maqam','arabic'],['Greece','rebetiko']]){
 const btn=document.createElement('button');btn.textContent=name
 btn.onclick=()=>{if(name==='Greece')by('greekChoices').hidden=!by('greekChoices').hidden;else {setRegion(id);if(id==='western'||id==='iran'){modelOptions(id==='western'?'mode-dorian':'IR-MT-01');degrees();sync();render();by('detail').scrollIntoView()}}}
 by('shortcuts').append(btn)
}
const greek=document.createElement('div');greek.id='greekChoices';greek.hidden=true
for(const id of ['ancient-greek','byzantine','rebetiko']){
 const btn=document.createElement('button');btn.textContent=regions.find(g=>g.id===id).label;btn.onclick=()=>{setRegion(id);greek.hidden=true};greek.append(btn)
}
by('shortcuts').after(greek)
by('region').onchange=e=>setRegion(e.target.value)
for(const id of ['category','model','degree','tonic','spelling','reference','comparison'])by(id).onchange=()=>{
 if(id==='category')modelOptions()
 if(id==='model'||id==='category')degrees()
 if(id==='spelling'){tonics(by('tonic').value);keys()}
 sync();render()
}
function keys(){
 const pref=by('spelling').value;by('keys').replaceChildren()
 names(pref).forEach((name,i)=>{
  const btn=document.createElement('button');btn.value=i;btn.textContent=name;btn.title=name+' · '+solfege[i]
  btn.onclick=()=>{by('tonic').value=i;sync();render()};by('keys').append(btn)
 })
}
keys()
function transpose(delta){by('tonic').value=rotateTonic(Number(by('tonic').value),delta);sync();render()}
by('left').onclick=()=>transpose(-1);by('right').onclick=()=>transpose(1)
by('panels').onkeydown=e=>{if(e.target.matches('.interactive-wheel')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();transpose(e.key==='ArrowRight'?1:-1);document.querySelector('.interactive-wheel').focus({preventScroll:true})}}
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
by('minus').onclick=()=>globe.zoom(1/1.2);by('plus').onclick=()=>globe.zoom(1.2);by('reset').onclick=()=>globe.reset()
render()
