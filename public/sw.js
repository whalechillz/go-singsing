// Service Worker - PWA Support
const CACHE_NAME = 'singsinggolf-v1';
const urlsToCache = [
  '/',
  '/singsing_logo.svg',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // 각 파일을 개별적으로 캐시하여 일부 실패해도 나머지는 캐시되도록 처리
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .catch(err => {
        console.error('Service Worker cache error:', err);
      })
  );
  // 즉시 활성화하여 새 버전이 바로 사용되도록
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API 요청, 외부 리소스, Supabase 요청은 완전히 Service Worker를 우회
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('solapi.com') ||
      event.request.method !== 'GET') {
    // 네트워크 요청만 수행, 캐시 사용 안 함
    return;
  }

  // 정적 리소스만 캐시 처리
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(err => {
          console.warn('Fetch failed:', event.request.url, err);
          // 네트워크 실패 시 기본 응답 반환 (선택사항)
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});