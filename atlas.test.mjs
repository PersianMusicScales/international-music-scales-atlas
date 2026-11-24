import {test} from 'node:test'
import assert from 'node:assert/strict'
import {models} from './examples.js'
import {analyze,positions} from './theory.js'
import {diagram} from './diagrams.js'
test('Five generated examples retain their ordered positions for every tonic',()=>{
 assert.equal(models.length,5)
 for(const m of models){
  const positionsInCents=positions(m.steps)
  assert.equal(Math.abs(positionsInCents.at(-1)-1200)<1e-8,m.circle_ready)
  for(let t=0;t<12;t++)for(const ref of ['Major','Dorian','Nearest 12-TET']){
   assert.deepEqual(analyze(m,t,'Sharps',ref).rows.map(r=>r.p),positionsInCents.slice(0,m.notes_count))
   const svg=diagram(m,t,'Sharps',ref)
   assert.match(svg,m.circle_ready?/interval circle/:/Open interval strip/);assert.doesNotMatch(svg,/NaN|undefined/)
  }
 }
})
