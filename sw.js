const CACHE='nexoventia-shell-v9';
const SHELL=['./','./index.html','./styles.css','./app.js','./logo.svg','./manifest.webmanifest'];
const EXTERNAL_CACHE_HOSTS=['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nexoventia-shell-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET')return;
  const local=url.origin===self.location.origin;
  const external=EXTERNAL_CACHE_HOSTS.includes(url.hostname);
  if(!local&&!external)return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
    return response;
  }).catch(()=>caches.match(request).then(hit=>hit||(local?caches.match('./index.html'):Promise.reject(new Error('Offline asset not cached')))));
});