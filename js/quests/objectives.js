export function updateObjective(q,id,amt=1){ const o=q.objectives.find(x=>x.id===id); if(o) o.done=true }
