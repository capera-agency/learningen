// Service Worker per sincronizzazione offline
const CACHE_NAME = 'learning-manager-v1';
const API_CACHE_NAME = 'learning-manager-api-v1';
const STATIC_CACHE_NAME = 'learning-manager-static-v1';

// Risorse da cachare subito
const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installazione...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Cache risorse statiche');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[Service Worker] Alcune risorse non sono state cachate:', err);
            });
        })
    );
    self.skipWaiting();
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Attivazione...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== API_CACHE_NAME && 
                        cacheName !== STATIC_CACHE_NAME) {
                        console.log('[Service Worker] Rimozione cache vecchia:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Strategia: Network First con fallback a Cache per API
// Cache First per risorse statiche
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora richieste non GET
    if (request.method !== 'GET') {
        return;
    }

    // API calls - Network First con fallback a cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clona la risposta per cacharla
                    const responseClone = response.clone();
                    caches.open(API_CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback a cache se offline
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Se non c'è cache, ritorna risposta offline
                        return new Response(
                            JSON.stringify({ 
                                error: 'Offline', 
                                message: 'Connessione non disponibile. I dati verranno sincronizzati quando tornerà la connessione.' 
                            }),
                            {
                                status: 503,
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    });
                })
        );
        return;
    }

    // Risorse statiche - Cache First
    if (url.pathname.startsWith('/static/') || 
        url.origin.includes('cdn.jsdelivr.net')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request).then((response) => {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                });
            })
        );
        return;
    }

    // HTML - Network First con fallback
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(STATIC_CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match('/').then((cachedResponse) => {
                        return cachedResponse || new Response('Offline', { status: 503 });
                    });
                })
        );
        return;
    }
});

// Background Sync per sincronizzare quando torna online
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

// Funzione per sincronizzare dati offline
async function syncOfflineData() {
    // Questa funzione sarà chiamata da offline-sync.js
    // per sincronizzare le operazioni in coda
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_OFFLINE_DATA' });
    });
}

// Messaggi dal client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CACHE_API') {
        const { url, data } = event.data;
        caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(url, new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            }));
        });
    }
});

