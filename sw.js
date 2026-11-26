/* إسلامي توبة: عمل دون إنترنت. غيّر رقم النسخة عند كل تحديث. */
var VERSION='v9';
var PREFIX='islami-tawba:'+self.registration.scope+':';
var CACHE=PREFIX+VERSION;
var CORE=['./','./index.html','./manifest.webmanifest','./og-image.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(CORE.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return (k.indexOf(PREFIX)===0||k==='islami-tawba-v1')&&k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
function netFirst(req){
  return new Promise(function(res){
    var done=false,t=setTimeout(function(){caches.match(req,{ignoreSearch:true}).then(function(m){if(m&&!done){done=true;res(m)}})},4000);
    fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(function(r){
      clearTimeout(t);
      if(r&&r.ok){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}
      if(!done){done=true;res(r)}
    }).catch(function(){
      clearTimeout(t);
      caches.match(req,{ignoreSearch:true}).then(function(m){if(!done){done=true;res(m||caches.match('./index.html')||Response.error())}})
    });
  });
}
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET'||r.url.indexOf(self.location.origin)!==0)return;
  if(r.mode==='navigate'){e.respondWith(netFirst(r));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
    var f=fetch(r).then(function(x){if(x&&x.ok){var cp=x.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return x}).catch(function(){return m});
    return m||f;
  }));
});
