export function showNotif(msg){
  // Notifications are also used by the main menu, before the game HUD exists.
  // Keep a global host so menu actions never appear to do nothing.
  const c=document.getElementById('notifs') || document.getElementById('global-notifs'); if(!c) return;
  const d=document.createElement('div'); d.className='notif'; d.textContent=msg; c.appendChild(d); setTimeout(()=>d.remove(),2600);
}
