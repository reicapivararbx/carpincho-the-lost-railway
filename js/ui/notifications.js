export function notify(msg){
  const el=document.getElementById('notifs'); if(!el) return;
  const n=document.createElement('div'); n.className='notif'; n.textContent=msg; el.appendChild(n); setTimeout(()=>n.remove(),2500);
}
