// app-banner.js - Phiên bản Hybrid (Có Selector + Fix DEBUG MODE)

// ---------------------------------------------------------------------
// 🚀 CHẾ ĐỘ DEBUG CHO DEV 🚀
//
// - true:  Popup hiện MỖI LẦN tải trang (Bất chấp đã cài hay chưa, PC hay Mobile).
// - false: Chế độ hoạt động thật.
//
const DEBUG_MODE = false; // SỬA: Dùng biến này theo yêu cầu của bạn
// ---------------------------------------------------------------------

let deferredPrompt; // Biến lưu sự kiện cài đặt của Chrome

// 1. Kiểm tra đã cài app chưa
function isAppInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator.standalone === true) return true;
    return false;
}

// 2. Lắng nghe sự kiện từ Chrome (Android/PC)
window.addEventListener('beforeinstallprompt', (e) => {
    // Chặn Chrome hiện bảng mặc định xấu xí
    e.preventDefault();
    // Lưu sự kiện lại để dùng khi người dùng bấm nút Android
    deferredPrompt = e;
    console.log("✅ Android Install Prompt Captured");
    
    // Nếu có module thông báo, hỏi quyền (ý định: người dùng sẽ cài app nên nên hỏi quyền ngay)
    try { if (window.Notif) window.Notif.ensurePermission(); } catch(err) {}
    
    // Nếu chưa cài và KHÔNG ở chế độ DEBUG (vì DEBUG đã được xử lý ở load event)
    if (!isAppInstalled() && !DEBUG_MODE) {
        showSelectorPopup();
    }
});

// 3. Logic hiển thị Popup chọn (Selector)
function showSelectorPopup() {
    const popup = document.getElementById('popup-selector');
    if(popup) popup.classList.add('active');
}

function closeSelectorPopup() {
    document.getElementById('popup-selector').classList.remove('active');
}

// --- XỬ LÝ KHI BẤM NÚT ---

// A. KHI CHỌN ANDROID
async function handleAndroidClick() {
    console.log("User selected Android");
    
    if (deferredPrompt) {
        // 1. Ẩn popup chọn của mình đi
        closeSelectorPopup();
        
        // 2. Kích hoạt bảng cài đặt gốc của Chrome
        deferredPrompt.prompt();
        
        // 3. Kiểm tra xem họ có đồng ý cài không
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        // Nếu họ đồng ý cài (accepted) -> yêu cầu quyền Notification
        if (outcome === 'accepted') {
            try { if (window.Notif) await window.Notif.ensurePermission(); } catch(err) {}
        }
        deferredPrompt = null; // Dùng xong thì xóa
    } else {
        // Fallback: Nếu không bắt được deferredPrompt (ví dụ: trình duyệt không phải Chrome/Edge)
        alert("Vui lòng mở bằng trình duyệt Chrome/Samsung Internet có hỗ trợ PWA để cài đặt.");
    }
}

// B. KHI CHỌN IOS
function handleIOSClick() {
    console.log("User selected iOS");
    // 1. Ẩn bảng chọn
    closeSelectorPopup();
    // 2. Hiện bảng hướng dẫn iOS
    document.getElementById('popup-ios-guide').classList.add('active');
}

function closeIOSPopup() {
    document.getElementById('popup-ios-guide').classList.remove('active');
}

function backToSelector() {
    closeIOSPopup();
    document.getElementById('popup-selector').classList.add('active');
}

// 4. Kiểm tra Mobile
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Kiểm tra Android, iOS, và các thiết bị mobile khác
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

// 5. Logic Kích hoạt Chính (Chạy khi trang tải xong)
window.addEventListener('load', () => {
    
    // 💥 FIX: Ưu tiên 1: DEBUG MODE (Force Show) 💥
    if (DEBUG_MODE) {
        console.warn("🚧 DEBUG MODE: Popup đang hiển thị bắt buộc.");
        // Delay 0.5 giây cho web load xong rồi mới hiện popup
        setTimeout(showSelectorPopup, 500);
        return; // Thoát, không cần kiểm tra điều kiện khác
    }
    
    // Nếu đã cài rồi -> Thoát
    if (isAppInstalled()) {
        console.log("✅ App đã được cài đặt. Selector ẩn.");
        try { if (window.Notif) window.Notif.ensurePermission(); } catch(err) {}
        return;
    }
    
    // ⚠️ CHỈ hiển thị bảng chọn trên MOBILE, KHÔNG hiển thị trên PC
    if (!isMobileDevice()) {
        console.log("💻 PC detected: Selector ẩn (chỉ cho mobile).");
        return;
    }
    
    // Ưu tiên 2: Kiểm tra iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        console.log("🍎 iOS detected: Showing selector.");
        // Delay một chút cho web load xong rồi mới hiện popup
        setTimeout(showSelectorPopup, 1000);
    }
    
    // (Đối với Android, việc hiển thị sẽ được kích hoạt bởi sự kiện 'beforeinstallprompt' ở mục 2)
});