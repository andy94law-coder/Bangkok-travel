// 1. 定義快取的名稱與版本
const CACHE_NAME = 'bangkok-pwa-v1';

// 2. 定義需要被快取的檔案路徑
// ⭐️ 關鍵：因為專案在子目錄，所有路徑都要包含 /bangkok-travel/
const urlsToCache = [
  '/bangkok-travel/',
  '/bangkok-travel/index.html',
  '/bangkok-travel/style.css',
  '/bangkok-travel/manifest.json',
  // 如果您有 icon 圖片，請記得將其路徑也加入，例如：
  // '/bangkok-travel/assets/icon-512x512.png' 
];

// 3. 監聽安裝事件：在 Service Worker 安裝時快取檔案
self.addEventListener('install', function(event) {
  // 等待快取完成
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker 快取所有檔案');
        return cache.addAll(urlsToCache);
      })
  );
});

// 4. 監聽獲取請求事件：攔截所有網路請求並嘗試從快取中回應
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 找到快取，直接回應快取內容
        if (response) {
          return response;
        }
        
        // 快取中沒有，則嘗試發出網路請求
        return fetch(event.request);
      }
    )
  );
});

// 5. 監聽啟用事件：清理舊版本的快取
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 刪除不在白名單中的舊快取
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
