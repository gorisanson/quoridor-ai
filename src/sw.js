"use strict";

/* 
* Service worker script
* Almost copied from: https://developers.google.com/web/fundamentals/primers/service-workers/
*/

const CACHE_NAME = 'quoridor-ai-cache-v1';
const urlsToCache = [
    './',
    './style.css',
    './js/game.js',
    './js/ai.js',
    './js/view.js',
    './js/controller.js',
    './js/worker.js',
    './meta/manifest.json',
    './meta/icons_192.png',
    './meta/icons_512.png',
];

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            //console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});


self.addEventListener('activate', function(event) {
    let cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cacheName) {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

