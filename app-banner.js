// app-banner.js - Phiên bản nâng cấp (Popup Modal + Hướng dẫn iOS)

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Chúng ta không cần thêm class 'pwa-install-available' nữa
    // vì logic PWA đã nằm trong nút Android
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA installed', evt);
    // Ẩn popup ngay lập tức nếu user vừa cài đặt
    try { 
        localStorage.setItem('appAnnouncementLastShown', String(Date.now())); 
        const banner = document.getElementById('app-announcement');
        if (banner) hideAppPopup();
    } catch(e){}
});

// --- Helpers cho Popup ---
// (Các hàm show/hideA2HSGuide đã có sẵn trong index.html và script.js,
// nhưng chúng ta định nghĩa lại ở đây để đảm bảo file này chạy độc lập)
if (!window.showA2HSGuide) {
    window.showA2HSGuide = function(){
        const g = document.getElementById('a2hs-guide');
        if(!g) return;
        g.classList.add('open');
        g.setAttribute('aria-hidden','false');
        // Đảm bảo body bị khóa
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

// Hàm helper mới cho popup chính
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
    
    // Popup chính
    const banner = document.getElementById('app-announcement');
    
    // Các nút trong popup chính
    const btnIOS = document.getElementById('btn-ios');
    const btnAndroid = document.getElementById('btn-android');
    const dismissBtn = document.getElementById('dismiss-banner');

    function getLastShown(){ try { return parseInt(localStorage.getItem(KEY) || '0', 10); } catch(e){ return 0; } }
    function setLastShown(ts){ try { localStorage.setItem(KEY, String(ts)); } catch(e){} }
    function shouldShow(){ const last = getLastShown(); return (Date.now() - last) >= WEEK_MS || last === 0; }

    // Xử lý nút iOS (MỚI)
    if (btnIOS && iosGuidePopup) {
        btnIOS.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Ẩn popup chính, hiện popup iOS
            hideAppPopup();
            iosGuidePopup.classList.add('open');
            document.body.classList.add('popup-open'); // Body vẫn bị khóa

            // Đánh dấu đã xem
            setLastShown(Date.now());
        });
    }

    // Xử lý nút Android (LOGIC CŨ - RẤT TỐT, GIỮ NGUYÊN)
    if (btnAndroid) {
        btnAndroid.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Đánh dấu đã xem
            setLastShown(Date.now());
            
            // Ẩn popup chính
            hideAppPopup();

            // Nếu trình duyệt CÓ hỗ trợ PWA (deferredInstallPrompt đã được lưu từ đầu)
            if (deferredInstallPrompt) {
                try {
                    deferredInstallPrompt.prompt();
                    const choice = await deferredInstallPrompt.userChoice;
                    console.log('A2HS choice', choice && choice.outcome);
                } catch (err) {
                    console.warn('A2HS userChoice not available', err);
                    window.showA2HSGuide(); // Fallback nếu prompt lỗi
                }
                deferredInstallPrompt = null; // Chỉ cho 1 lần
                return;
            }

            // Fallback: Nếu không hỗ trợ PWA, hiện hướng dẫn A2HS thủ công
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

    // --- KIỂM TRA VÀ HIỂN THỊ POPUP ---
    if (banner) {
        if (shouldShow()) {
            // Dùng setTimeout để đảm bảo trang tải xong
            setTimeout(showAppPopup, 1000);
        } else {
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