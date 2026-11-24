import {models} from './examples.js'
import {diagram,sequence} from './diagrams.js'
import {analyze,fmt,sharpNames} from './theory.js'
import {mountGlobe} from './globe.js'
const by=id=>document.getElementById(id)
for(const m of models){by('model').add(new Option(m.name,m.id));by('comparison').add(new Option(m.name,m.id))}
by('comparison').add(new Option('None',''),0);by('comparison').value=''
sharpNames.forEach((n,i)=>by('tonic').add(new Option(n,i)))
const controls=['model','comparison','tonic','reference']
const query=new URLSearchParams(location.search)
for(const id of controls)if(Array.from(by(id).options).some(x=>x.value===query.get(id)))by(id).value=query.get(id)
function render(){
 const tonic=Number(by('tonic').value),reference=by('reference').value
 const first=models.find(m=>m.id===by('model').value),second=models.find(m=>m.id===by('comparison').value)
 const overlay=first.circle_ready&&second?.circle_ready?second:null
 const panel=(m,other)=>{const analysis=analyze(m,tonic,'Sharps',reference);return '<section><h2>'+m.name+'</h2><p>'+m.explanation+'</p>'+diagram(m,tonic,'Sharps',reference,other)+'<h3>Western pitch comparison</h3><p>'+analysis.signature+'</p><div class="notes">'+sequence(analysis.rows)+'</div><p>Ordered steps (¢) · '+m.steps.map(fmt).join(' · ')+'</p><p>Tonic-relative pitches (¢) · '+analysis.rows.map(r=>fmt(r.p)).join(' · ')+'</p></section>'}
 by('detail').innerHTML=(overlay?'<p>Amber dots in the first circle mark pitches of the comparison model.</p>':'')+'<div class="'+(second?'pair':'')+'">'+panel(first,overlay)+(second?panel(second,null):'')+'</div>'
}
for(const id of controls)by(id).onchange=()=>{const url=new URL(location.href);for(const key of controls){if(by(key).value)url.searchParams.set(key,by(key).value);else url.searchParams.delete(key)}history.replaceState(null,'',url);render()}
render()
const globe=mountGlobe(by('earth'),[],()=>{})
by('minus').onclick=()=>globe.zoom(1/1.2);by('plus').onclick=()=>globe.zoom(1.2);by('reset').onclick=()=>globe.reset()
