// Stores the app on the device so it opens without a connection.
// The build stamp changes with every release, which is what tells the browser to fetch a new copy.
const BUILD = "2026-11-25.3158abb";
const PREFIX = "ds-prep-";
const CACHE = PREFIX + BUILD;
const FILES = ["index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // "reload" skips the browser's own cache, so a new release never stores stale files
      .then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    // every way of opening the app gets the one stored page
    event.respondWith(
      caches.match("index.html", { cacheName: CACHE }).then((hit) => hit || fetch(request)));
    return;
  }
  event.respondWith(
    caches.match(request, { cacheName: CACHE, ignoreSearch: true }).then((hit) => hit || fetch(request)));
});
