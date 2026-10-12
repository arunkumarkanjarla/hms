
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.append(t)}t.textContent=msg;t.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.hidden=true,2600)}
function read(key){try{return JSON.parse(localStorage.getItem('careaxis_hms_'+key)||'[]')}catch(e){return []}}
function write(key,data){localStorage.setItem('careaxis_hms_'+key,JSON.stringify(data))}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
document.addEventListener('DOMContentLoaded',()=>{
 const login=$('#roleLogin');if(login)login.addEventListener('submit',e=>{e.preventDefault();location.href='apps/'+$('#roleSelect').value+'/home.html'});
 const form=$('[data-entry-form]');if(form)form.addEventListener('submit',e=>{e.preventDefault();let key=form.dataset.store;let item=Object.fromEntries(new FormData(form));item.ref='CA-'+Date.now().toString().slice(-7);item.savedAt=new Date().toLocaleString();let arr=read(key);arr.unshift(item);write(key,arr);form.reset();toast('Entry saved on this device');renderSaved()});
 function renderSaved(){const target=$('#savedEntries');if(!target)return;let arr=read(target.dataset.store);target.innerHTML=arr.length?arr.slice(0,12).map(item=>{let title=Object.entries(item).find(([k,v])=>v && !['ref','savedAt','status'].includes(k));return `<div class="record"><div class="recordtop"><b>${esc(title?title[1]:'Saved entry')}</b><span class="badge">${esc(item.status||'Saved locally')}</span></div><small>${esc(item.ref)} · ${esc(item.savedAt)}</small></div>`}).join(''):'<div class="empty">Your saved entries will appear here.</div>'}
 renderSaved();
 const search=$('[data-filter]');if(search)search.addEventListener('input',()=>$$('[data-record]').forEach(el=>el.hidden=!el.innerText.toLowerCase().includes(search.value.toLowerCase())));
 $$('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
 $$('[data-export]').forEach(b=>b.addEventListener('click',()=>{let rows=read(b.dataset.export),keys=[...new Set(rows.flatMap(Object.keys))];if(!rows.length){toast('There are no saved entries to export yet');return}let csv=[keys.join(','),...rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(','))].join('\r\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='hms-mobile-records.csv';a.click();URL.revokeObjectURL(a.href)}));
 $$('[data-clear]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Clear entries saved on this browser for this screen?')){write(b.dataset.clear,[]);renderSaved();toast('Local entries cleared')}}));
});
