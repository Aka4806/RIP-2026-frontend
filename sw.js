const VERSION = "9001b690c44c4172";
const ASSETS = ["assets/index-C3_GO--U.js","assets/index-DQyoJR8e.css","icons/icon-192.png","icons/icon-512.png","index.html","manifest.webmanifest","media/default.mp4","media/default.png","media/user/bitmap_100k.mp4","media/user/bitmap_100k.png","media/user/bitmap_1m.mp4","media/user/bitmap_1m.png","media/user/btree_100k.mp4","media/user/btree_100k.png","media/user/btree_10m.mp4","media/user/btree_10m.png","media/user/btree_1m.mp4","media/user/btree_1m.png","media/user/hash_100k.mp4","media/user/hash_100k.png"];
const scope = self.registration.scope
const rootPath = new URL(scope).pathname
const cachePrefix = `sql-index-lab:${scope}:`
const cacheName = cachePrefix + VERSION
const assets = new Set(ASSETS.map((path) => new URL(path, scope).href))
const shell = new URL('index.html', scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll([...assets].map((url) => new Request(url, { cache: 'reload' }))),
      ),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith(cachePrefix) && name !== cacheName) await caches.delete(name)
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const path = new URL(request.url).pathname
  if (request.mode === 'navigate' && (path === rootPath || path === rootPath + 'index.html')) {
    event.respondWith(
      caches.open(cacheName).then(async (cache) => (await cache.match(shell)) || fetch(request)),
    )
  } else if (assets.has(request.url)) {
    event.respondWith(readAsset(request))
  }
})

async function readAsset(request) {
  const cache = await caches.open(cacheName)
  const full = await cache.match(request.url)
  if (!full) return fetch(request)
  const range = request.headers.get('Range')
  if (!range) return full

  // Browser seek requests must receive a byte range even when offline.
  const bytes = await full.blob()
  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.size - Number(match?.[2]))
  const end = match?.[1] && match[2] ? Math.min(Number(match[2]), bytes.size - 1) : bytes.size - 1
  if (!match || (!match[1] && !match[2]) || start > end || start >= bytes.size) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${bytes.size}` },
    })
  }
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': bytes.type,
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${bytes.size}`,
      'Accept-Ranges': 'bytes',
    },
  })
}
