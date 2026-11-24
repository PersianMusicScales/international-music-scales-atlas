import {positions} from './theory.js'
export function frequencies(model,tonic){
 const hz=440*2**((60+tonic-69)/12)
 return positions(model.intervals_cents).map(cents=>hz*2**(cents/1200))
}
export function player(onChange){
 let context,voices=[],generation=0,timer
 function stop(){
  generation++;clearTimeout(timer)
  for(const voice of voices){try{voice.stop()}catch{}}
  voices=[];onChange(false)
 }
 return {stop,retune(semitones){
  for(const voice of voices)voice.frequency.value*=2**(semitones/12)
 },async start(model,tonic){
  stop();const token=generation
  context??=new AudioContext();await context.resume()
  if(token!==generation)return
  const notes=frequencies(model,tonic),start=context.currentTime+.03
  notes.forEach((hz,i)=>{
   const osc=context.createOscillator(),gain=context.createGain(),at=start+i*.32
   osc.type='triangle';osc.frequency.value=hz;osc.connect(gain);gain.connect(context.destination)
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.13,at+.022);gain.gain.exponentialRampToValueAtTime(.0001,at+.31)
   osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start(at);osc.stop(at+.32);voices.push(osc)
  })
  onChange(true);timer=setTimeout(stop,(notes.length*.32+.05)*1000)
 }}
}
