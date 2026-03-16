const CACHE_NAME = "75-challenge-cache-v1";

// The files we want to save to the phone for offline use
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon.png" 
];

// 1. Install Event: Caches the files when the app is first loaded
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Activate Event: Cleans up old caches if you update the version number
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: Serves files from the cache if offline, otherwise uses the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached version if we have it, otherwise fetch from the internet
      return response || fetch(event.request);
    })
  );
});
