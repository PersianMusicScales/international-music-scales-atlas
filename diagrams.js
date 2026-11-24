import {positions,fmt,names,references,signed} from './theory.js'
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const point=(p,r)=>[180+r*Math.sin(p*Math.PI/600),180-r*Math.cos(p*Math.PI/600)]
const arc=(a,b,r)=>'M'+point(a,r).join(' ')+' A'+r+' '+r+' 0 '+(b-a>600?1:0)+' 1 '+point(b,r).join(' ')
const colors=['#378473','#bb7046','#627aa2','#a98d49','#497c8d','#a2617b','#778b57','#7869a0']
export function diagram(m,tonic=0,pref='Sharps',ref='Major',overlay,ring=true){
 const pos=positions(m.intervals_cents)
 if(!m.circle_ready)return '<div class="strip"><strong>Open span · '+fmt(pos.at(-1))+'¢</strong><svg viewBox="0 0 360 72" role="img" aria-label="Open interval strip">'+m.intervals_cents.map((d,i)=>'<rect x="'+(5+350*pos[i]/pos.at(-1))+'" y="24" width="'+350*d/pos.at(-1)+'" height="23" fill="'+colors[i%8]+'"><title>'+fmt(d)+' cents</title></rect>').join('')+'</svg><span>0¢</span><span>'+fmt(pos.at(-1))+'¢</span></div>'
 const label=(p,r,t,size)=>{let [x,y]=point(p,r);return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" text-anchor="middle" dominant-baseline="central">'+esc(t)+'</text>'}
 return '<svg class="wheel" viewBox="50 50 260 260" role="img" aria-label="'+esc(m.name)+' interval circle in cents">'+ m.intervals_cents.map((d,i)=>'<g tabindex="0"><title>Degree '+(i+1)+' at '+fmt(pos[i])+'¢, step '+fmt(d)+'¢</title><path d="'+arc(pos[i],pos[i+1],103)+'" stroke="'+colors[i%8]+'" stroke-width="34" fill="none"/>'+ (d>85?label(pos[i]+d/2,103,fmt(d)+'¢',d%1===0?12:9).replace('<text','<text class="onarc"'):'')+'</g>').join('')+label(0,0,names(pref)[tonic],33)+label(600,24,m.notes_count+' pitches',12)+'</svg>'
}
export const sequence=rows=>rows.map(r=>'<span class="note"><b>'+esc(r.letter)+'</b><small>'+signed(r.offset)+'¢</small></span>').join('')
