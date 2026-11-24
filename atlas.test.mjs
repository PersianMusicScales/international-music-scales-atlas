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
import {readFileSync} from 'node:fs'
import {wheel,rotateModel,rotateTonic,notation} from './wheel.js'
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)))
test('Every geographic model is selectable and transposable through 24 ring positions',()=>{
 assert.equal(catalog.scales.length,216)
 for(const m of catalog.scales){
  assert.ok(catalog.regions.find(g=>g.id===m.geo_id).model_ids.includes(m.id))
  for(let t=0;t<12;t+=.5){
   assert.doesNotMatch(notation(m,t,'Sharps','Major'),/undefined|NaN/)
   const drawing=wheel(m,t,'Sharps','Major');assert.equal(drawing.includes('class="dial"'),m.circle_ready)
  }
 }
 assert.equal(rotateTonic(11.5,1),0)
 const major=models.find(m=>m.id==='major')
 assert.match(notation(major,2,'Sharps','Major'),/F♯ · C♯/)
 assert.deepEqual(rotateModel(major,1).intervals_cents,[200,100,200,200,200,100,200])
})
import {modes} from './modes.js'
test('Dorian signatures follow tonic, and Shur preserves its research tuning',()=>{
 const dorian=modes.find(m=>m.name==='Dorian')
 for(const [tonic,signature] of [[0,'B♭ · E♭'],[2,'All natural'],[4,'F♯ · C♯']])
  assert.ok(notation(dorian,tonic,'Sharps','Major').includes(signature))
 const shur=catalog.scales.find(m=>m.name==='Shur')
 for(const t of [0,2,11])assert.deepEqual(analyze(shur,t).rows.map(r=>r.p),positions(shur.intervals_cents).slice(0,-1))
})
