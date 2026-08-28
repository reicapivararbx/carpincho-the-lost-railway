export function openMenu(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const e=document.getElementById(id); if(e) e.classList.add('active');
}
