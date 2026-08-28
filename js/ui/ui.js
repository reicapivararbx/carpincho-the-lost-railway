export function showNotif(msg){
  const c=document.getElementById('notifs'); if(!c) return;
  const d=document.createElement('div'); d.className='notif'; d.textContent=msg; c.appendChild(d); setTimeout(()=>d.remove(),2600);
}
