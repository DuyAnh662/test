self.addEventListener("install", event => {
  console.log("Service worker installed.");
});

self.addEventListener("fetch", event => {
  // Cho phép web hoạt động offline (tùy bạn muốn thêm logic gì)
});