const CACHE='joys-world-v30';
const ASSETS=['./styles.css?v=30','./app.js?v=30','./manifest.webmanifest','./icon.svg','./assets/joy-estate.jpg','./assets/joy-portrait.webp','./assets/joy-body.webp','./assets/joy-chamber.webp','./assets/door-latch.wav?v=20','./assets/joy-house-jazz.mp3'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./',copy));
          return response;
        })
        .catch(()=>caches.match('./'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      });
      return cached||network;
    })
  );
});
