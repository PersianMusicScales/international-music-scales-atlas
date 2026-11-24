export const modeNames=['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian']
const major=[200,200,100,200,200,200,100]
export const modes=modeNames.map((name,i)=>({
 id:'mode-'+name.toLowerCase(),name,geo_id:'western',category:'Diatonic modes',
 tradition:'Western diatonic modes',source_ids:[],circle_ready:true,notes_count:7,
 intervals_cents:[...major.slice(i),...major.slice(0,i)]
}))
export const solfege=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si']
