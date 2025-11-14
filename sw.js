// minimal service worker - đặt cùng thư mục với index.html
self.addEventListener('install', event => {
  self.skipWaiting();
  // bạn có thể cache các tài nguyên nếu muốn
});

self.addEventListener('activate', event => {
  clientsClaim();
});

self.addEventListener('fetch', event => {
  // minimal: không can thiệp, nhưng SW đã đăng ký thành công
});