// Kết hợp cả hai API URL
const API_URL = "https://script.google.com/macros/s/AKfycbw5sjUwJfwRtKBQQu5FgYrmgSjoQ22vvnmlv99H7YJHTVgVZRXm1vWB7fFJg8B2O2M7/exec";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-w7uCCpBZadyJ1lSUoeFlKZlNcV0sGiAAn0hJJdpK06J2CQfzeIf2c72xRmqQbBOv/exec";

// Dữ liệu mặc định (từ file 1)
const defaultTKB = {
    0: ["nghỉ"],
    1: ["null"],
    2: ["null"],
    3: ["null"],
    4: ["null"],
    5: ["null"],
    6: ["Nghỉ"]
};

const defaultTruc = {
    0: "Chủ nhật: Không trực",
    1: "Tổ 2",
    2: "Tổ 3",
    3: "Tổ 4",
    4: "Tổ 1",
    5: "Tổ 2",
    6: "Tổ 3",
};

const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

// Biến toàn cục để lưu dữ liệu từ API
let currentData = {
    tkb: defaultTKB,
    truc: defaultTruc,
    btvn: [],
    changelog: [],
    notices: []
};

/* -------------------------
Canvas bầu trời sao - chỉ hoạt động trong dark mode
------------------------- */
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---- Tạo sao ----
const stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        opacity: Math.random()
    });
}

// ---- Sao băng ----
const meteors = [];
let meteorInterval = null;

function createMeteor() {
    meteors.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 12 + 8,
        opacity: 1
    });
}

// ---- Vẽ bầu trời ----
function drawSky() {
    const isDarkMode = document.body.classList.contains("dark");

    // Xóa canvas trước khi vẽ
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chỉ vẽ khi dark mode được bật
    if (isDarkMode) {
        // Nền trời
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vẽ sao
        for (let s of stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
            ctx.fill();
            s.opacity += (Math.random() - 0.5) * 0.05;
            if (s.opacity < 0) s.opacity = 0;
            if (s.opacity > 1) s.opacity = 1;
        }

        // Vẽ sao băng
        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            ctx.strokeStyle = `rgba(255,255,255,${m.opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.length, m.y - m.length);
            ctx.stroke();

            m.x += m.speed;
            m.y += m.speed;
            m.opacity -= 0.05;

            if (m.opacity <= 0) {
                meteors.splice(i, 1);
            }
        }

        // Bắt đầu tạo sao băng nếu chưa có interval
        if (meteorInterval === null) {
            meteorInterval = setInterval(createMeteor, 1200);
        }
    } else {
        // Dừng tạo sao băng khi không ở dark mode
        if (meteorInterval !== null) {
            clearInterval(meteorInterval);
            meteorInterval = null;
            meteors.length = 0; // Xóa tất cả sao băng
        }
    }

    requestAnimationFrame(drawSky);
}

// Bắt đầu vẽ bầu trời
drawSky();

/* -------------------------
Menu
------------------------- */
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.style.display = menuPanel.style.display === 'block' ? 'none' : 'block';
});
window.addEventListener('click', (ev) => {
    if (!menuPanel.contains(ev.target) && ev.target !== menuBtn) menuPanel.style.display = 'none';
});

// Dark toggle in menu:
const menuDark = document.getElementById('menuDark');
document.getElementById("menuPopup").addEventListener("click", () => {
    openPopup(true); // mở popup cưỡng bức khi bấm trong menu
});

// Liquid/Normal toggle
const menuLiquid = document.getElementById('menuLiquid');

function applyThemeFromStorage() {
    // Áp dụng dark mode
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        menuDark.textContent = '☀️ Light Mode';
        // Tự động chuyển sang chủ đề đen khi bật dark mode
        applyColorTheme('black');
    } else {
        document.body.classList.remove('dark');
        menuDark.textContent = '🌙 Dark Mode';
        // Quay lại chủ đề đã lưu trước đó khi tắt dark mode
        const savedTheme = localStorage.getItem('colorTheme') || 'blue';
        applyColorTheme(savedTheme);
    }

    // Áp dụng liquid/normal mode
    if (localStorage.getItem('liquidMode') === 'normal') {
        document.body.classList.add('normal-mode');
        menuLiquid.textContent = '✨ Đang hiển thị giao diện thường';
    } else {
        document.body.classList.remove('normal-mode');
        menuLiquid.textContent = '✨ Đang hiển thị Liquid Glass';
    }
}

menuDark.addEventListener('click', () => {
    showThemeLoading();

    setTimeout(() => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        applyThemeFromStorage();
        hideThemeLoading();
    }, 500);
});

menuLiquid.addEventListener('click', () => {
    showThemeLoading();

    setTimeout(() => {
        document.body.classList.toggle('normal-mode');
        localStorage.setItem('liquidMode', document.body.classList.contains('normal-mode') ? 'normal' : 'liquid');
        applyThemeFromStorage();
        hideThemeLoading();
    }, 500);
});

// Xử lý màu chủ đề
function applyColorTheme(theme) {
    // Xóa tất cả các class màu chủ đề
    document.body.classList.remove('theme-pink', 'theme-blue', 'theme-green', 'theme-fresh', 'theme-popular', 'theme-white', 'theme-black', 'theme-aquaviolet');

    // Thêm class màu chủ đề được chọn
    if (theme) {
        document.body.classList.add(`theme-${theme}`);
    }

    // Cập nhật trạng thái active cho các nút màu
    document.querySelectorAll('.color-theme').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    // Lưu màu chủ đề vào localStorage (chỉ khi không ở dark mode)
    if (!document.body.classList.contains('dark')) {
        localStorage.setItem('colorTheme', theme);
    }
}

// Hiệu ứng loading khi chuyển chủ đề
function showThemeLoading() {
    const themeLoading = document.getElementById('themeLoading');
    themeLoading.classList.add('active');
}

function hideThemeLoading() {
    const themeLoading = document.getElementById('themeLoading');
    themeLoading.classList.remove('active');
}

// Thêm sự kiện click cho các nút màu
document.querySelectorAll('.color-theme').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        showThemeLoading();

        setTimeout(() => {
            applyColorTheme(theme);
            hideThemeLoading();
        }, 500);
    });
});

/* -------------------------
Popup logic (1 lần/ngày)
------------------------- */
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popupClose');

function openPopup(force = false) {
    const today = new Date().toLocaleDateString('vi-VN');
    const disabled = localStorage.getItem('popupDisabled') === 'true'; // nếu user tắt hoàn toàn (không dùng ở đây)

    if (force) {
        popup.classList.add('open');
        // Ngăn scroll trang khi popup mở
        document.body.classList.add('popup-open');
        return;
    }

    if (disabled) return;

    const lastShown = localStorage.getItem('popupShownDate');
    if (lastShown !== today) {
        popup.classList.add('open');
        localStorage.setItem('popupShownDate', today);
        // Ngăn scroll trang khi popup mở
        document.body.classList.add('popup-open');
    }
}

// Đóng popup khi click vào nút đóng
popupClose.addEventListener('click', () => {
    popup.classList.remove('open');
    // Cho phép scroll trang lại khi popup đóng
    document.body.classList.remove('popup-open');
});

// Đóng popup khi click bên ngoài popup
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.classList.remove('open');
        // Cho phép scroll trang lại khi popup đóng
        document.body.classList.remove('popup-open');
    }
});

// Đóng popup khi nhấn phím Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('open')) {
        popup.classList.remove('open');
        // Cho phép scroll trang lại khi popup đóng
        document.body.classList.remove('popup-open');
    }
});

/* -------------------------
Tải dữ liệu từ API
------------------------- */
async function fetchData() {
    try {
        const res = await fetch(SCRIPT_URL + "?action=getAll");
        const j = await res.json();
        // Nếu có "result" thì trả về result
        return j.result || j;
    } catch (e) {
        console.error(e);
        return null;
    }
}
// Hàm render BTVN từ API
function renderBTVN(data) {
    const container = document.getElementById('btvnContainer');
    if (!data?.btvn?.length) {
        container.innerHTML = "<p>Chưa có bài tập.</p>";
        return;
    }

    let html = "";
    const subjects = {};
    
    // Nhóm bài theo môn học
    data.btvn.forEach(item => {
        if (!subjects[item.subject]) {
            subjects[item.subject] = [];
        }
        subjects[item.subject].push(item);
    });

    // Render theo từng môn
    Object.keys(subjects).forEach(subject => {
        html += `<h2 class="animate-item">${getSubjectIcon(subject)} ${subject}</h2>`;
        html += '<ul class="animate-item">';
        
        subjects[subject].forEach(item => {
            html += `<li>${item.content}</li>`;
        });
        
        html += '</ul>';
    });

    container.innerHTML = html;
}

// Hàm render TKB từ API
function renderTKB(data) {
    const container = document.getElementById('tkbContainer');
    if (!data?.tkb) {
        container.innerHTML = "<p>Không có dữ liệu TKB.</p>";
        return;
    }

    const d = getVNDateObj();
    let day = d.getDay();
    const hour = d.getHours();

    if (hour < 7) day = (day - 1 + 7) % 7;

    let showDay;
    if (day === 5 || day === 6 || day === 0) showDay = 1;
    else showDay = (day + 1) % 7;

    let tomorrowDate = new Date(d);
    if (day === 5) tomorrowDate.setDate(d.getDate() + ((1 + 7 - day) % 7));
    else if (day === 6) tomorrowDate.setDate(d.getDate() + ((1 + 7 - day) % 7));
    else if (day === 0) tomorrowDate.setDate(d.getDate() + 1);
    else tomorrowDate.setDate(d.getDate() + 1);

    const formattedDate = tomorrowDate.toLocaleDateString("vi-VN");

    let html = `<p>Hôm nay: <strong>${dayNames[d.getDay()]}</strong>, ${d.toLocaleDateString('vi-VN')} — Hiển thị TKB <strong>${dayNames[showDay]}</strong>, ngày ${formattedDate}</p>`;
    html += `<div class="inline-note">❗Lưu ý: Sau 7:00 sáng TKB sẽ chuyển sang ngày tiếp theo.</div>`;

    html += `<div class="day-container">`;
    html += `<div class="day-header">${dayNames[showDay]}</div>`;
    html += `<div class="session-container">`;

    // Buổi sáng
    html += `<div class="session-header morning-header">Buổi sáng</div>`;
    html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn / Nội dung</th></tr></thead><tbody>`;
    if (data.tkb[showDay]) {
        data.tkb[showDay]
            .filter(p => p.buoi === "Sáng")
            .forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
    }
    html += `</tbody></table>`;

    // Buổi chiều
    html += `<div class="session-header afternoon-header">Buổi chiều</div>`;
    html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn / Nội dung</th></tr></thead><tbody>`;
    if (data.tkb[showDay]) {
        data.tkb[showDay]
            .filter(p => p.buoi === "Chiều")
            .forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
    }
    html += `</tbody></table>`;

    html += `</div></div>`;
    html += `<p style="margin-top:10px;"><b>Lịch trực: </b> <span id="todayTruc">${data.tkb[showDay]?.[0]?.truc || 'Không có dữ liệu'}</span></p>`;

    container.innerHTML = html;
}
// Hàm render changelog từ API
function renderChangelog(data) {
    const container = document.getElementById('changelogContainer');
    if (!data?.changelog?.length) {
        container.innerHTML = "<p>Chưa có dữ liệu changelog.</p>";
        return;
    }

    let html = '<div class="changelog animate-item">';
    html += '<strong>Những thay đổi gần đây</strong>';
    html += '<ul>';
    
    data.changelog.forEach(item => {
        html += `<li>${item}</li>`;
    });
    
    html += '</ul></div>';
    container.innerHTML = html;
}

// Hàm render thông báo từ API
function renderNotices(data) {
    const container = document.getElementById('noticesContainer');
    if (!data?.notices?.length) {
        container.style.display = 'none';
        return;
    }

    let html = '<strong>THÔNG BÁO:</strong>';
    html += '<ul>';
    
    data.notices.forEach(notice => {
        html += `<li>${notice}</li>`;
    });
    
    html += '</ul>';
    container.innerHTML = html;
    container.style.display = 'block';
}

// Hàm lấy icon cho môn học
function getSubjectIcon(subject) {
    const icons = {
        'Địa lí': '📘',
        'Toán học': '➗',
        'Ngữ văn': '✍',
        'Sinh học': '🧬',
        'GDĐP': '🏠',
        'Lịch sử': '📜',
        'Vật lý': '🔬',
        'HĐTN, HN': '🤝',
        'Mĩ thuật': '🎨',
        'Hóa học': '⚗',
        'Tiếng Anh': '🇬🇧',
        'Công dân': '👥',
        'Công nghệ': '🔧',
        'Âm nhạc': '🎶',
        'Tin học': '💻'
    };
    return icons[subject] || '📚';
}

// Hàm tải và hiển thị toàn bộ dữ liệu
async function loadAllData() {
    const data = await fetchData();
    if (data) {
        // Cập nhật dữ liệu toàn cục
        currentData = {
            tkb: data.tkb || defaultTKB,
            truc: data.truc || defaultTruc,
            btvn: data.btvn || [],
            changelog: data.changelog || [],
            notices: data.notices || []
        };
        
        renderBTVN(currentData);
        renderTKB(currentData);
        renderChangelog(currentData);
        renderNotices(currentData);
    } else {
        // Sử dụng dữ liệu mặc định nếu không tải được từ API
        currentData = {
            tkb: defaultTKB,
            truc: defaultTruc,
            btvn: [],
            changelog: [],
            notices: []
        };
        
        renderBTVN(currentData);
        renderTKB(currentData);
        renderChangelog(currentData);
        renderNotices(currentData);
    }
}

// Giữ nguyên hàm renderTodayTKB từ File 1 nhưng sửa để sử dụng dữ liệu từ API
async function renderTodayTKB() {
    renderTKB(currentData);
}

document.getElementById('showFullBtn').addEventListener('click', async function() {
    const full = document.getElementById('fullTKB');
    if (full.style.display === 'block') {
        full.style.display = 'none';
        this.textContent = '📅 Xem toàn bộ TKB';
        return;
    }

    let html = `<div style="margin-bottom:8px;"><strong>📅 Thời khóa biểu cả tuần</strong></div>`;
    for (let k = 1; k <= 6; k++) {
        html += `<div class="day-container">`;
        html += `<div class="day-header">${dayNames[k]}</div>`;
        html += `<div class="session-container">`;

        // Buổi sáng
        html += `<div class="session-header morning-header">Buổi sáng</div>`;
        html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (currentData.tkb[k]) {
            currentData.tkb[k].filter(p => p.buoi === "Sáng").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;

        // Buổi chiều
        html += `<div class="session-header afternoon-header">Buổi chiều</div>`;
        html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (currentData.tkb[k]) {
            currentData.tkb[k].filter(p => p.buoi === "Chiều").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;

        html += `<div class="truc-container" style="margin-top: 12px; padding: 8px; background: var(--table-header-bg); border-radius: 8px;">`;
        html += `<strong style="color: var(--table-header-text);">🧹 Lịch trực: </strong>`;
        html += `<span>${currentData.tkb[k]?.[0]?.truc || 'Không có dữ liệu'}</span>`;
        html += `</div>`;

        html += `</div></div><div class="day-divider"></div>`;
    }

    full.innerHTML = html;
    full.style.display = 'block';
    this.textContent = '❌ Ẩn toàn bộ';
});
// Helper function: get VN date/time (works cross-browser)
function getVNDateObj() {
    const s = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    return new Date(s);
}

/* -------------------------
Small accessibility: close menu with ESC
------------------------- */
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('menuPanel').style.display = 'none';
        document.getElementById('popup').classList.remove('open');
        document.body.classList.remove('popup-open');
    }
});

// Xử lý sự kiện xoay màn hình
window.addEventListener('orientationchange', function() {
    // Cập nhật lại kích thước canvas bầu trời sao
    resizeCanvas();

    // Cập nhật lại vị trí các phần tử
    setTimeout(function() {
        renderTodayTKB();
    }, 300);
});

// Thêm sự kiện touch để cải thiện trải nghiệm trên thiết bị cảm ứng
document.addEventListener('touchstart', function() {}, {
    passive: true
});

// Hàm khởi tạo
window.addEventListener('load', () => {
    applyThemeFromStorage();
    openPopup(false);
    
    // Ẩn màn hình loading
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
    
    // Tải dữ liệu từ API
    loadAllData();
    
    // Cập nhật TKB mỗi phút
    setInterval(renderTodayTKB, 60 * 1000);
    
    // Áp dụng hiệu ứng xuất hiện cho các phần tử
    const fadeElements = document.querySelectorAll('.fade-in-text');
    fadeElements.forEach((element, index) => {
        setTimeout(function() {
            element.style.animationDelay = `${index * 0.1}s`;
        }, 100);
    });

    const animateElements = document.querySelectorAll('.animate-item');
    animateElements.forEach((element, index) => {
        setTimeout(function() {
            element.style.animationDelay = `${0.2 + index * 0.05}s`;
        }, 100);
    });

    // Tối ưu hóa cho thiết bị di động
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Thêm class mobile vào body để áp dụng CSS riêng
        document.body.classList.add('mobile-device');

        // Tối ưu hóa popup cho thiết bị di động
        const popupCard = document.getElementById('popupCard');
        if (popupCard) {
            // Đảm bảo popup có thể cuộn
            popupCard.style.maxHeight = '80vh';
            popupCard.style.overflowY = 'auto';
            popupCard.style.webkitOverflowScrolling = 'touch';
        }

        // Tối ưu hóa các bảng để cuộn ngang nếu cần
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.marginBottom = '10px';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // Tăng kích thước các nút bấm cho dễ thao tác
        const buttons = document.querySelectorAll('button, .menu-btn, #showFullBtn');
        buttons.forEach(button => {
            button.style.minHeight = '44px'; // Kích thước tối thiểu theo khuyến nghị của Apple
            button.style.minWidth = '44px';
        });

        // Tối ưu hóa menu cho thiết bị di động
        const menuPanel = document.getElementById('menuPanel');
        if (menuPanel) {
            menuPanel.style.maxHeight = '70vh';
            menuPanel.style.overflowY = 'auto';
        }
    }
});