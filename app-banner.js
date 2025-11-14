// app-banner.js - Phiên bản Pro (Check Mobile, Check Installed, Debug Mode)

// ---------------------------------------------------------------------
// 🚀 CHẾ ĐỘ DEBUG CHO DEV 🚀
//
// Đặt là 'true' để popup hiện MỖI LẦN tải trang (dùng để test).
// Đặt là 'false' cho chế độ bình thường (hiện 1 tuần/lần).
//
const DEBUG_APP_POPUP = true;
//
// ---------------------------------------------------------------------


/**
 * 🕵️ Helper: Kiểm tra xem có phải thiết bị di động không
 * (Yêu cầu 1: Không hiện trên PC)
 */
function isMobileDevice() {
    // Thêm 'iPad' và 'tablet' để bắt cả máy tính bảng
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
}

/**
 * 🕵️ Helper: Kiểm tra xem app đã được cài đặt (PWA/Homescreen) chưa
 * (Yêu cầu 2: Không hiện khi đã cài)
 */
function isAppInstalled() {
    // 1. Kiểm tra PWA (Chrome, Edge, Samsung Internet...)
    const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // 2. Kiểm tra iOS "Add to Home Screen" hoặc MobileConfig
    // 'standalone' là thuộc tính riêng của Safari/iOS
    const isStandaloneIOS = window.navigator.standalone === true; 
    
    return isStandalonePWA || isStandaloneIOS;
}


// --- Logic PWA (Giữ nguyên) ---
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA installed', evt);
    try { 
        localStorage.setItem('appAnnouncementLastShown', String(Date.now())); 
        const banner = document.getElementById('app-announcement');
        if (banner) hideAppPopup();
    } catch(e){}
});

// --- Helpers cho Popup (Giữ nguyên) ---
if (!window.showA2HSGuide) {
    window.showA2HSGuide = function(){
        const g = document.getElementById('a2hs-guide');
        if(!g) return;
        g.classList.add('open');
        g.setAttribute('aria-hidden','false');
        if (!document.body.classList.contains('popup-open')) {
             document.body.classList.add('popup-open');
        }
    };
}
if (!window.hideA2HSGuide) {
    window.hideA2HSGuide = function(){
        const g = document.getElementById('a2hs-guide');
        if(!g) return;
        g.classList.remove('open');
        g.setAttribute('aria-hidden','true');
        document.body.classList.remove('popup-open');
    };
}

function showAppPopup() {
    const banner = document.getElementById('app-announcement');
    if (banner) {
        banner.classList.add('open');
        banner.classList.remove('hidden');
        document.body.classList.add('popup-open');
    }
}
function hideAppPopup() {
    const banner = document.getElementById('app-announcement');
    if (banner) {
        banner.classList.remove('open');
        banner.classList.add('hidden');
        document.body.classList.remove('popup-open');
    }
}
// --- Kết thúc Helpers ---


document.addEventListener('DOMContentLoaded', () => {
    // Popup Hướng dẫn Android (A2HS)
    const a2hsClose = document.getElementById('a2hs-close');
    const a2hsOk = document.getElementById('a2hs-ok');
    if (a2hsClose) a2hsClose.addEventListener('click', () => window.hideA2HSGuide());
    if (a2hsOk) a2hsOk.addEventListener('click', () => window.hideA2HSGuide());

    // Popup Hướng dẫn iOS
    const iosGuidePopup = document.getElementById('ios-guide-popup');
    const iosGuideClose = document.getElementById('ios-guide-close');
    if (iosGuidePopup && iosGuideClose) {
        iosGuideClose.addEventListener('click', () => {
            iosGuidePopup.classList.remove('open');
            document.body.classList.remove('popup-open');
        });
    }

    // --- Logic Popup chính (1 tuần/lần) ---
    const KEY = 'appAnnouncementLastShown';
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const banner = document.getElementById('app-announcement');
    const btnIOS = document.getElementById('btn-ios');
    const btnAndroid = document.getElementById('btn-android');
    const dismissBtn = document.getElementById('dismiss-banner');

    function getLastShown(){ try { return parseInt(localStorage.getItem(KEY) || '0', 10); } catch(e){ return 0; } }
    function setLastShown(ts){ try { localStorage.setItem(KEY, String(ts)); } catch(e){} }
    function shouldShow(){ const last = getLastShown(); return (Date.now() - last) >= WEEK_MS || last === 0; }

    // Xử lý nút iOS (Mở popup hướng dẫn)
    if (btnIOS && iosGuidePopup) {
        btnIOS.addEventListener('click', (e) => {
            e.preventDefault();
            hideAppPopup();
            iosGuidePopup.classList.add('open');
            document.body.classList.add('popup-open');
            setLastShown(Date.now());
        });
    }

    // Xử lý nút Android (Ưu tiên PWA, fallback A2HS Guide)
    if (btnAndroid) {
        btnAndroid.addEventListener('click', async (e) => {
            e.preventDefault();
            setLastShown(Date.now());
            hideAppPopup();

            if (deferredInstallPrompt) {
                try {
                    deferredInstallPrompt.prompt();
                    const choice = await deferredInstallPrompt.userChoice;
                    console.log('A2HS choice', choice && choice.outcome);
                } catch (err) {
                    console.warn('A2HS userChoice not available', err);
                    window.showA2HSGuide(); // Fallback nếu prompt lỗi
                }
                deferredInstallPrompt = null;
                return;
            }
            window.showA2HSGuide();
        });
    }

    // Xử lý nút Đóng (X)
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            setLastShown(Date.now());
            hideAppPopup();
        });
    }

    // --- KIỂM TRA VÀ HIỂN THỊ POPUP (LOGIC NÂNG CAO) ---
    if (banner) {
        
        // (Yêu cầu Dev) Bật chế độ DEBUG?
        if (DEBUG_APP_POPUP) {
            console.log("APP BANNER (DEBUG): Bật chế độ test, buộc hiển thị popup.");
            setTimeout(showAppPopup, 500); // Hiện nhanh hơn để test
        } 
        
        // (Yêu cầu 2) Đã cài đặt rồi?
        else if (isAppInstalled()) {
            console.log("APP BANNER: App đã được cài đặt (standalone/PWA). Không hiển thị popup.");
            banner.classList.add('hidden');
        } 
        
        // (Yêu cầu 1) Không phải di động?
        else if (!isMobileDevice()) {
            console.log("APP BANNER: Đây là máy tính (PC). Không hiển thị popup.");
            banner.classList.add('hidden');
        } 
        
        // Chế độ bình thường: (Chưa cài) + (Là di động)
        // Giờ mới kiểm tra logic 1 tuần/lần
        else if (shouldShow()) {
            console.log("APP BANNER: OK (Mobile, chưa cài, đúng lịch 1 tuần/lần). Hiển thị popup.");
            setTimeout(showAppPopup, 1000);
        } 
        
        // Đã xem trong tuần này rồi
        else {
            console.log("APP BANNER: Đã hiển thị trong tuần này. Bỏ qua.");
            banner.classList.add('hidden');
        }
    }

    // Debug helpers (Giữ nguyên)
    window.__appBanner = {
        reset: function(){ localStorage.removeItem(KEY); alert('Banner timer reset.'); },
        forceShow: function(){ showAppPopup(); },
        forceHide: function(){ hideAppPopup(); setLastShown(Date.now()); }
    };
});