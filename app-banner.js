// app-banner.js - Phiên bản Pro (Fix typo & Logic hoàn chỉnh)

// ---------------------------------------------------------------------
// 🚀 CHẾ ĐỘ DEBUG CHO DEV 🚀
//
// - true:  Popup hiện MỖI LẦN tải trang (Bất kể PC hay Mobile, đã cài hay chưa).
// - false: Chế độ hoạt động thật (Chỉ hiện trên Mobile + Chưa cài + 1 tuần/lần).
//
const DEBUG_APP_POPUP = false; 
// ---------------------------------------------------------------------

/**
 * 🕵️ Helper: Kiểm tra xem có phải thiết bị di động không
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
}

/**
 * 🕵️ Helper: Kiểm tra xem app đã được cài đặt chưa
 */
function isAppInstalled() {
    // 1. Kiểm tra PWA (Chrome, Edge, Samsung Internet...)
    const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // 2. Kiểm tra iOS (WebClip / Homescreen)
    const isStandaloneIOS = window.navigator.standalone === true; 
    
    return isStandalonePWA || isStandaloneIOS;
}

// --- Logic PWA (Bắt sự kiện cài đặt của Chrome) ---
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA installed', evt);
    // Khi cài xong thì ẩn banner ngay và lưu lại trạng thái
    try { 
        localStorage.setItem('appAnnouncementLastShown', String(Date.now())); 
        hideAppPopup();
    } catch(e){}
});

// --- Helpers điều khiển hiển thị (UI) ---
// Hàm hiển thị hướng dẫn Android thủ công
if (!window.showA2HSGuide) {
    window.showA2HSGuide = function(){
        const g = document.getElementById('a2hs-guide');
        if(!g) return;
        g.classList.add('open'); // Class để hiện popup
        g.setAttribute('aria-hidden','false');
        document.body.classList.add('popup-open'); // Khóa cuộn trang web nền
    };
}

// Hàm ẩn hướng dẫn Android
if (!window.hideA2HSGuide) {
    window.hideA2HSGuide = function(){
        const g = document.getElementById('a2hs-guide');
        if(!g) return;
        g.classList.remove('open');
        g.setAttribute('aria-hidden','true');
        document.body.classList.remove('popup-open');
    };
}

// Hàm hiện Banner chính
function showAppPopup() {
    const banner = document.getElementById('app-announcement');
    if (banner) {
        banner.classList.remove('hidden'); // Xóa class ẩn
        // Đợi 1 chút để CSS animation chạy mượt
        requestAnimationFrame(() => {
            banner.classList.add('open');
        });
    }
}

// Hàm ẩn Banner chính
function hideAppPopup() {
    const banner = document.getElementById('app-announcement');
    if (banner) {
        banner.classList.remove('open');
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 300); // Đợi animation trượt xuống xong mới ẩn
    }
}

// --- KHỞI CHẠY CHÍNH ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Thiết lập các nút đóng/mở cho Popup Hướng dẫn
    const a2hsClose = document.getElementById('a2hs-close');
    const a2hsOk = document.getElementById('a2hs-ok');
    if (a2hsClose) a2hsClose.addEventListener('click', () => window.hideA2HSGuide());
    if (a2hsOk) a2hsOk.addEventListener('click', () => window.hideA2HSGuide());

    const iosGuidePopup = document.getElementById('ios-guide-popup');
    const iosGuideClose = document.getElementById('ios-guide-close');
    if (iosGuidePopup && iosGuideClose) {
        iosGuideClose.addEventListener('click', () => {
            iosGuidePopup.classList.remove('open');
            document.body.classList.remove('popup-open');
        });
    }

    // 2. Logic hiển thị Banner (1 tuần/lần)
    const KEY = 'appAnnouncementLastShown';
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày
    
    const banner = document.getElementById('app-announcement');
    const btnIOS = document.getElementById('btn-ios');
    const btnAndroid = document.getElementById('btn-android');
    const dismissBtn = document.getElementById('dismiss-banner');

    function getLastShown(){ try { return parseInt(localStorage.getItem(KEY) || '0', 10); } catch(e){ return 0; } }
    function setLastShown(ts){ try { localStorage.setItem(KEY, String(ts)); } catch(e){} }
    
    // Kiểm tra xem đã đủ 1 tuần chưa
    function shouldShow(){ 
        const last = getLastShown(); 
        // Nếu chưa bao giờ hiện (0) HOẶC đã qua 7 ngày
        return last === 0 || (Date.now() - last) >= WEEK_MS; 
    }

    // --- Xử lý sự kiện click nút ---
    
    // Nút iOS: Mở popup hướng dẫn cài profile
    if (btnIOS && iosGuidePopup) {
        btnIOS.addEventListener('click', (e) => {
            hideAppPopup(); // Ẩn banner nhỏ
            iosGuidePopup.classList.add('open'); // Hiện hướng dẫn to
            document.body.classList.add('popup-open');
            setLastShown(Date.now()); // Đánh dấu là đã xem
        });
    }

    // Nút Android: Thử cài tự động, nếu không được thì hiện hướng dẫn
    if (btnAndroid) {
        btnAndroid.addEventListener('click', async (e) => {
            setLastShown(Date.now());
            hideAppPopup();

            if (deferredInstallPrompt) {
                // Nếu Chrome hỗ trợ cài tự động
                try {
                    deferredInstallPrompt.prompt();
                    const choice = await deferredInstallPrompt.userChoice;
                    console.log('User choice:', choice.outcome);
                } catch (err) {
                    window.showA2HSGuide();
                }
                deferredInstallPrompt = null;
            } else {
                // Nếu không (hoặc là Firefox/Samsung Internet cũ) -> Hiện hướng dẫn thủ công
                window.showA2HSGuide();
            }
        });
    }

    // Nút Đóng (X)
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            setLastShown(Date.now()); // Lưu lại thời gian đóng để 1 tuần sau mới hiện lại
            hideAppPopup();
        });
    }

    // --- 3. LOGIC QUYẾT ĐỊNH HIỂN THỊ (Quan trọng nhất) ---
    if (banner) {
        // Ưu tiên 1: DEBUG MODE (Dev check)
        // Nếu true -> Hiện luôn, bất chấp mọi thứ.
        if (DEBUG_APP_POPUP) {
            console.warn("🚧 DEBUG MODE: Banner đang hiển thị bắt buộc.");
            setTimeout(showAppPopup, 500);
        } 
        
        // Ưu tiên 2: Nếu App ĐÃ CÀI -> Tuyệt đối không hiện
        else if (isAppInstalled()) {
            console.log("✅ App đã được cài đặt. Banner ẩn.");
        } 
        
        // Ưu tiên 3: Nếu là PC (Máy tính bàn/Laptop) -> Không hiện
        // (Trừ khi bạn muốn PC cũng hiện thì xóa đoạn else if này đi)
        else if (!isMobileDevice()) {
            console.log("💻 Đang dùng PC. Banner ẩn.");
        } 
        
        // Ưu tiên 4: Kiểm tra thời gian (1 tuần/lần)
        else if (shouldShow()) {
            console.log("📱 Mobile & Chưa cài & Đúng lịch -> HIỆN BANNER.");
            // Đợi 2 giây cho web load xong mới hiện lên cho đẹp
            setTimeout(showAppPopup, 2000);
        } 
        
        // Trường hợp còn lại: Đã hiện trong tuần này rồi -> Ẩn
        else {
            console.log("zzz Chưa đến lịch hiển thị lại (1 tuần/lần).");
        }
    }
    
    // Mẹo: Gõ window.__appBanner.reset() trong Console để reset bộ đếm thời gian
    window.__appBanner = {
        reset: function(){ localStorage.removeItem(KEY); alert('Đã reset bộ đếm thời gian!'); },
        forceShow: function(){ showAppPopup(); }
    };
});