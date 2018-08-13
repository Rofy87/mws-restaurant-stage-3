import DBHelper from './js/dbhelper';
const appCache = 'mws-static-cache-v1';
const imgsCache = 'mws-asset-cache-v1';
const allCaches = [appCache, imgsCache];
const urlsToCache = [
    '/',
    '/css/styles.css',
    '/index.html',
    '/restaurant.html',
    'js/main_bundle.js',
    'js/restaurant_bundle.js',
];


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(appCache).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});


self.addEventListener('fetch', function(event) {
    var requestUrl = new URL(event.request.url);

    if (requestUrl.pathname.startsWith('/images/') || requestUrl.pathname.includes('staticmap')) {
        event.respondWith(servePhoto(event.request));
        return;
    }
    event.respondWith( 
        caches.match(event.request , { ignoreSearch:true }).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

function servePhoto(request) {

    return caches.open(imgsCache).then(function(cache) {
        return cache.match(request.url).then(function(response) {
            if (response) return response;

            return fetch(request).then(function(networkResponse) {
                cache.put(request.url, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

self.addEventListener('sync', function(event) {
    if (event.tag == 'offline') {
        event.waitUntil(DBHelper.sendOfflineReviewsToDatabse());
    }
});

self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
      return Promise.all(cacheNames.filter(function (cacheName) {
        return cacheName.startsWith('mws-') && !allCaches.includes(cacheName);
      }).map(function (cacheName) {
        return caches['delete'](cacheName);
      }));
    }));
  });
