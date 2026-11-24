// All public functions operate on stored cents. Format only at the view boundary.
export const references = {Major:[0,200,400,500,700,900,1100], Dorian:[0,200,300,500,700,900,1000]}
const natural=[0,2,4,5,7,9,11], letters='CDEFGAB'
export const sharpNames=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B']
export const flatNames=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B']
export const names=pref=>pref==='Flats'?flatNames:sharpNames
export const positions=steps=>steps.reduce((p,d)=>[...p,p.at(-1)+d],[0])
export const fmt=n=>Number(n.toFixed(3)).toString()
export const signed=n=>(n>0?'+':'')+fmt(n)
export function nearest(p){return Math.ceil(p/100-0.5-1e-12)*100}
function subsets(count){
 const out=[]
 function visit(path,next){if(path.length===count){out.push(path);return}for(let d=next;d<7;d++)visit([...path,d],d+1)}
 visit([0],1);return out
}
export function analyze(m,tonic=0,pref='Sharps',ref='Major',alternative=0){
 const pitches=positions(m.intervals_cents)
 if(m.circle_ready)pitches.pop()
 const noteNames=names(pref), first=letters.indexOf(noteNames[tonic][0]),template=references[ref]||references.Major
 const eligible=m.circle_ready && [5,6,7].includes(pitches.length)
 const candidates=eligible?subsets(pitches.length).map(ds=>({ds,cost:ds.reduce((s,d,i)=>s+(pitches[i]-template[d])**2,0)})).sort((a,b)=>a.cost-b.cost):[]
 const degrees=candidates[alternative]?.ds||candidates[0]?.ds
 const rows=pitches.map((p,i)=>{
  const abs=tonic*100+p,near=nearest(abs),degree=degrees?.[i],idx=first+(degree??0)
  const baseline=degree===undefined?near:100*(natural[idx%7]+12*Math.floor(idx/7))
  const offset=abs-baseline, accidental=Math.sign(offset)*Math.floor(Math.abs(offset)/50+0.5)*50
  const target=ref==='Nearest 12-TET'||degree===undefined?near-tonic*100:template[degree]
  const letter=degree===undefined?noteNames[((near/100)%12+12)%12]:letters[idx%7]
  return {p,degree,letter,offset,accidental,residual:offset-accidental,nearest:near-tonic*100,nearResidual:abs-near,nearName:noteNames[(near/100)%12],target,deviation:p-target}
 })
 const affected=rows.filter(r=>Math.abs(r.offset)>1e-6)
 const conventional=eligible&&pitches.length===7&&['FCGDAEB','BEADGCF'].some((order,idx)=>{
  const pattern=order.slice(0,affected.length)
  return affected.every(r=>pattern.includes(r.letter)&&Math.abs(r.offset-(idx?-100:100))<1e-6)
 })
 const signature=conventional?'Conventional key signature':eligible&&pitches.length===7?'Custom accidental pattern':'No unique Western key signature'
 return {rows,signature,candidates,omitted:degrees?[...letters].filter(l=>!rows.some(r=>r.letter===l)):[],affected}
}
