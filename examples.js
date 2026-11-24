// Each example is constructed from arithmetic in this file.
function equal(divisions) {
  return {id:'equal-'+divisions,name:divisions+' equal divisions',steps:Array(divisions).fill(1200/divisions),
    explanation:'The octave is divided into '+divisions+' equal steps of 1200 / '+divisions+' cents.'}
}
const examples=[equal(5),equal(7),equal(12),
  {id:'major',name:'Major scale in 12 equal divisions',steps:[2,2,1,2,2,2,1].map(n=>100*n),
    explanation:'The example uses the whole- and half-step sequence W W H W W W H, with a 100-cent half step.'},
  {id:'open',name:'Three steps of 19-tone equal temperament',steps:Array(3).fill(1200/19),open:true,
    explanation:'Three consecutive steps of a 19-part octave illustrate an open span. The endpoint is 3600 / 19 cents.'}]
export const models=examples.map(x=>({...x,intervals_cents:x.steps,notes_count:x.steps.length+(x.open?1:0),circle_ready:!x.open}))
