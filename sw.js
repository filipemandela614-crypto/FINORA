const CACHE='finora-v3';
const ASSETS=['./','./index.html','./app.html','./manifest.json','./icon-192.svg','./icon-512.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/app.html')){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(async res=>{
   const text=await res.text();
   const fixed=text
    .replace(/\.mobile\{display:flex;position:fixed;bottom:0;left:0;right:0;background:#09121ded;backdrop-filter:blur\(14px\);border-top:1px solid var\(--l\);z-index:4\}/, '.mobile{display:flex;position:fixed;bottom:0;left:0;right:0;background:#09121ded;backdrop-filter:blur(14px);border-top:1px solid var(--l);z-index:4;overflow-x:auto;scrollbar-width:none}.mobile::-webkit-scrollbar{display:none}')
    .replace(/\.mobile button\{flex:1;text-align:center;font-size:10px;padding:10px 2px\}/, '.mobile button{flex:0 0 88px;min-width:88px;text-align:center;font-size:10px;padding:10px 2px;white-space:nowrap}')
    .replace("Object.keys(names).slice(0,5)","Object.keys(names)");
   const out=new Response(fixed,{status:res.status,statusText:res.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}});
   const cache=await caches.open(CACHE); await cache.put(e.request,out.clone()); return out;
  }).catch(()=>caches.match(e.request)));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./index.html'))));
});
