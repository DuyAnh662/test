// script.js - Phiên bản Redesign (Tối ưu hóa + Fix lỗi + Tính năng Ngày mai + Chủ đề đặc biệt)

// Constants
const API_URL = "https://script.google.com/macros/s/AKfycbw5sjUwJfwRtKBQQu5FgYrmgSjoQ22vvnmlv99H7YJHTVgVZRXm1vWB7fFJg8B2O2M7/exec";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEVbGj72KB2zZQbrTaqWqEGAVVirGBuel-NjOlKgq230fdOx31ciN0783sO1EQTq16/exec";

// Default data
const defaultData = {
    tkb: {
        0: ["Nghỉ"], 1: ["Null"], 2: ["Null"], 3: ["Null"], 4: ["Null"], 5: ["Null"], 6: ["Nghỉ"]
    },
    truc: {
        0: "Chủ nhật: Không trực", 1: "Null", 2: "Null", 3: "Null", 4: "Null", 5: "Null", 6: "Null",
    }
};

const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

// Cấu hình các dịp đặc biệt
const specialEvents = [
    {
        name: "Tết Nguyên Đán",
        startDate: { month: 1, day: 29 }, // Ngày bắt đầu (tháng, ngày)
        endDate: { month: 1, day: 7 }, // Ngày kết thúc (tháng, ngày)
        theme: "tet", // Tên chủ đề
        showFireworks: true, // Hiển thị pháo hoa
        disableMeteors: true, // Tắt sao băng
        popup: {
            title: "Chúc Mừng Năm Mới!",
            content: "Chúc bạn và gia đình một năm mới an khang, thịnh vượng và vạn sự như ý!"
        },
        background: {
            day: "linear-gradient(135deg, rgba(139, 0, 0, 0.8) 0%, rgba(255, 214, 10, 0.8) 100%)", // Nền ban ngày
            night: "linear-gradient(135deg, rgba(139, 0, 0, 0.9) 0%, rgba(255, 140, 66, 0.8) 100%)", // Nền ban đêm
            patterns: ["hoa-mai", "hoa-dao", "dong-tien", "phao", "mam-qua"] // Họa tiết trang trí
        }
    },
    {
        name: "Sinh nhật",
        startDate: { month: 5, day: 12 }, // Ngày bắt đầu (tháng, ngày)
        endDate: { month: 5, day: 12 }, // Ngày kết thúc (tháng, ngày)
        theme: "birthday",
        showFireworks: true,
        disableMeteors: false,
        popup: {
            title: "Chúc Mừng Sinh Nhật Tường Vy!",
            content: "Hôm nay là sinh nhật của Tường Vy! Hãy cùng gửi lời chúc tốt đẹp nhất đến họ nhé!"
        },
        background: {
            day: "linear-gradient(135deg, #ff99cc 0%, #cc99ff 100%)",
            night: "linear-gradient(135deg, #660066 0%, #993399 100%)",
            patterns: ["balloon", "cake", "gift"]
        }
    },
    {
        name: "Sinh nhật",
        startDate: { month: 12, day: 6 }, // Ngày bắt đầu (tháng, ngày)
        endDate: { month: 12, day: 6 }, // Ngày kết thúc (tháng, ngày)
        theme: "birthday",
        showFireworks: true,
        disableMeteors: false,
        popup: {
            title: "Chúc Mừng Sinh Nhật Huyền!",
            content: "Hôm nay là sinh nhật của Huyền! Hãy cùng gửi lời chúc tốt đẹp nhất đến họ nhé!"
        },
        background: {
            day: "linear-gradient(135deg, #ff99cc 0%, #cc99ff 100%)",
            night: "linear-gradient(135deg, #660066 0%, #993399 100%)",
            patterns: ["balloon", "cake", "gift"]
        }
    },
    {
        name: "Sinh nhật",
        startDate: { month: 9, day: 2 }, // Ngày bắt đầu (tháng, ngày)
        endDate: { month: 9, day: 2 }, // Ngày kết thúc (tháng, ngày)
        theme: "birthday",
        showFireworks: true,
        disableMeteors: false,
        popup: {
            title: "Chúc Mừng Sinh Nhật Khánh Anh!",
            content: "Hôm nay là sinh nhật của Khánh Anh! Hãy cùng gửi lời chúc tốt đẹp nhất đến họ nhé!"
        },
        background: {
            day: "linear-gradient(135deg, #ff99cc 0%, #cc99ff 100%)",
            night: "linear-gradient(135deg, #660066 0%, #993399 100%)",
            patterns: ["balloon", "cake", "gift"]
        }
    },
    {
        name: "Sinh nhật",
        startDate: { month: 3, day: 8 }, // Ngày bắt đầu (tháng, ngày)
        endDate: { month: 3, day: 8 }, // Ngày kết thúc (tháng, ngày)
        theme: "birthday",
        showFireworks: true,
        disableMeteors: false,
        popup: {
            title: "Chúc Mừng Sinh Nhật Phương!",
            content: "Hôm nay là sinh nhật của Phương! Hãy cùng gửi lời chúc tốt đẹp nhất đến họ nhé!"
        },
        background: {
            day: "linear-gradient(135deg, #ff99cc 0%, #cc99ff 100%)",
            night: "linear-gradient(135deg, #660066 0%, #993399 100%)",
            patterns: ["balloon", "cake", "gift"]
        }
    },
    {
        name: "Cá tháng Tư",
        startDate: { month: 4, day: 1 },
        endDate: { month: 4, day: 1 },
        theme: "april-fools",
        showFireworks: false,
        disableMeteors: false,
        popup: {
            title: "Cá Tháng Tư!",
            content: "Hôm nay là ngày 1 tháng Tư! Hãy cẩn thận với những trò đùa nhé!",
            showForSeconds: 10, // Hiển thị popup trong 10 giây
            secondPopup: {
                title: "Đùa thôi cá tháng tư ui!",
                content: "Chúc bạn một ngày 1 tháng Tư vui vẻ!"
            }
        },
        background: {
            day: "linear-gradient(135deg, #ff3366 0%, #ffcc33 100%)",
            night: "linear-gradient(135deg, #cc0033 0%, #cc9900 100%)",
            patterns: ["joke", "fish"]
        }
    },
    {
        name: "Halloween",
        startDate: { month: 10, day: 31 },
        endDate: { month: 10, day: 31 },
        theme: "halloween",
        showFireworks: false,
        disableMeteors: false,
        popup: {
            title: "Happy Halloween!",
            content: "Chúc bạn một mùa Halloween vui vẻ và đáng nhớ!"
        },
        background: {
            day: "linear-gradient(135deg, #ff6600 0%, #993300 100%)",
            night: "linear-gradient(135deg, #330033 0%, #660033 100%)",
            patterns: ["pumpkin", "ghost", "witch"]
        },
        isDarkMode: true // Halloween luôn là dark mode
    },
    {
        name: "Giáng Sinh",
        startDate: { month: 12, day: 24 },
        endDate: { month: 12, day: 25 },
        theme: "christmas",
        showFireworks: true,
        disableMeteors: true,
        popup: {
            title: "Merry Christmas!",
            content: "Chúc bạn và gia đình một mùa Giáng Sinh an lành và ấm áp!"
        },
        background: {
            day: "linear-gradient(135deg, #009900 0%, #cc0000 100%)",
            night: "linear-gradient(135deg, #003300 0%, #660000 100%)",
            patterns: ["snow", "tree", "santa"]
        }
    }
];

// Global state
const state = {
    currentData: {
        tkb: defaultData.tkb,
        truc: defaultData.truc,
        btvn: [],
        changelog: [],
        notices: []
    },
    isLoading: false,
    refreshTimer: null,
    autoRefreshInterval: null,
    isAutoRefreshEnabled: false,
    lastData: null,
    animationFrameId: null,
    meteorInterval: null,
    stars: [],
    meteors: [],
    canvasInitialized: false, // Cờ cho lazy-init canvas
    currentEvent: null, // Dịp đặc biệt hiện tại
    fireworksInterval: null
};

// Cache DOM elements
const elements = {
    sky: document.getElementById("sky"),
    loadingScreen: document.getElementById("loadingScreen"),
    themeLoading: document.getElementById("themeLoading"),
    menuBtn: document.getElementById("menuBtn"),
    menuPanel: document.getElementById("menuPanel"),
    menuDark: document.getElementById("menuDark"),
    menuLiquid: document.getElementById("menuLiquid"),
    menuPopup: document.getElementById("menuPopup"),
    popup: document.getElementById("popup"),
    popupClose: document.getElementById("popupClose"),
    popupCard: document.getElementById("popupCard"),
    btvnContainer: document.getElementById("btvnContainer"),
    noticesContainer: document.getElementById("noticesContainer"),
    tkbContainer: document.getElementById("tkbContainer"),
    showFullBtn: document.getElementById("showFullBtn"),
    fullTKB: document.getElementById("fullTKB"), // (Giữ lại nếu logic modal TKB full cần)
    changelogContainer: document.getElementById("changelogContainer"),
    colorThemes: document.querySelectorAll(".color-theme"),
    refreshBtn: document.getElementById("refreshBtn"),
    tkbFullPopup: document.getElementById("tkbFullPopup"),
    tkbFullClose: document.getElementById("tkbFullClose"),
    tkbFullContent: document.getElementById("tkbFullContent"),
    eventPopup: document.getElementById("eventPopup"),
    eventPopupClose: document.getElementById("eventPopupClose"),
    eventPopupTitle: document.getElementById("eventPopupTitle"),
    eventPopupContent: document.getElementById("eventPopupContent"),
    fireworksContainer: document.getElementById("fireworks-container")
};

// RequestIdleCallback polyfill
if (!('requestIdleCallback' in window)) {
    window.requestIdleCallback = cb => setTimeout(cb, 50);
}

// --- Tối ưu hóa Canvas (Lazy-loading) ---

function createStars() {
    const canvas = elements.sky;
    if (!canvas) return;
    state.stars = [];
    for (let i = 0; i < 200; i++) {
        state.stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5,
            opacity: Math.random(),
            blinkSpeed: 0.005 + Math.random() * 0.01
        });
    }
}

function resizeCanvas() {
    const canvas = elements.sky;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
}

function initCanvas() {
    const canvas = elements.sky;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function createMeteor() {
        state.meteors.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            length: Math.random() * 80 + 40,
            speed: Math.random() * 12 + 8,
            opacity: 1,
            angle: Math.random() * Math.PI / 4 + Math.PI / 4
        });
    }

    window.addEventListener("resize", debounce(resizeCanvas, 120));
    resizeCanvas();

    function drawSky() {
        if (document.hidden) {
            state.animationFrameId = requestAnimationFrame(drawSky);
            return;
        }
        const isDarkMode = document.body.classList.contains("dark");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isDarkMode) {
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (const star of state.stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
                ctx.fill();
                star.opacity += (Math.random() - 0.5) * star.blinkSpeed;
                star.opacity = Math.min(1, Math.max(0.3, star.opacity));
            }
            for (let i = state.meteors.length - 1; i >= 0; i--) {
                const m = state.meteors[i];
                ctx.strokeStyle = `rgba(255,255,255,${m.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x - m.length * Math.cos(m.angle), m.y - m.length * Math.sin(m.angle));
                ctx.stroke();
                m.x += m.speed * Math.cos(m.angle);
                m.y += m.speed * Math.sin(m.angle);
                m.opacity -= 0.02;
                if (m.opacity <= 0) state.meteors.splice(i, 1);
            }
            if (state.meteorInterval === null && (!state.currentEvent || !state.currentEvent.disableMeteors)) {
                state.meteorInterval = setInterval(createMeteor, 5000);
            }
        } else {
            if (state.meteorInterval !== null) {
                clearInterval(state.meteorInterval);
                state.meteorInterval = null;
                state.meteors.length = 0;
            }
        }
        state.animationFrameId = requestAnimationFrame(drawSky);
    }
    drawSky();
}

function ensureCanvasInit() {
    if (state.canvasInitialized) return;
    state.canvasInitialized = true;
    initCanvas();
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    if (!document.body.classList.contains("dark")) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particlesContainer.appendChild(particle);
        }
    }
}

// --- Pháo hoa ---
function createFirework() {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // Vị trí ngẫu nhiên
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5; // Chỉ ở nửa trên màn hình
    
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    
    // Màu ngẫu nhiên
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Tạo các hạt pháo hoa
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        
        // Góc và tốc độ ngẫu nhiên
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 2 + Math.random() * 4;
        
        particle.style.backgroundColor = color;
        particle.style.width = `${4 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        
        // Animation
        particle.style.animation = `firework-explode ${1 + Math.random()}s ease-out forwards`;
        particle.style.transform = `translate(${Math.cos(angle) * velocity * 20}px, ${Math.sin(angle) * velocity * 20}px)`;
        
        firework.appendChild(particle);
    }
    
    elements.fireworksContainer.appendChild(firework);
    
    // Xóa pháo hoa sau khi animation kết thúc
    setTimeout(() => {
        if (elements.fireworksContainer.contains(firework)) {
            elements.fireworksContainer.removeChild(firework);
        }
    }, 2000);
}

function startFireworks() {
    if (state.fireworksInterval) return;
    
    // Tạo pháo hoa ban đầu
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createFirework(), i * 500);
    }
    
    // Tạo pháo hoa định kỳ
    state.fireworksInterval = setInterval(() => {
        createFirework();
    }, 2000);
}

function stopFireworks() {
    if (state.fireworksInterval) {
        clearInterval(state.fireworksInterval);
        state.fireworksInterval = null;
    }
    
    // Xóa tất cả pháo hoa hiện có
    while (elements.fireworksContainer.firstChild) {
        elements.fireworksContainer.removeChild(elements.fireworksContainer.firstChild);
    }
}

// --- Kiểm tra dịp đặc biệt ---
function checkSpecialEvent() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() trả về 0-11
    const currentDay = today.getDate();
    const currentHour = today.getHours();
    
    // Kiểm tra xem có phải ban đêm không (từ 18h đến 6h sáng)
    const isNightTime = currentHour >= 18 || currentHour < 6;
    
    // Tìm dịp đặc biệt hiện tại
    for (const event of specialEvents) {
        const startDate = event.startDate;
        const endDate = event.endDate;
        
        // Kiểm tra xem ngày hiện tại có nằm trong khoảng thời gian của dịp đặc biệt không
        let isEventActive = false;
        
        if (startDate.month === endDate.month) {
            // Cùng tháng
            isEventActive = currentMonth === startDate.month && 
                           currentDay >= startDate.day && 
                           currentDay <= endDate.day;
        } else if (startDate.month < endDate.month) {
            // Tháng bắt đầu < tháng kết thúc (không qua năm)
            isEventActive = (currentMonth === startDate.month && currentDay >= startDate.day) ||
                           (currentMonth > startDate.month && currentMonth < endDate.month) ||
                           (currentMonth === endDate.month && currentDay <= endDate.day);
        } else {
            // Tháng bắt đầu > tháng kết thúc (qua năm)
            isEventActive = (currentMonth === startDate.month && currentDay >= startDate.day) ||
                           (currentMonth > startDate.month || currentMonth < endDate.month) ||
                           (currentMonth === endDate.month && currentDay <= endDate.day);
        }
        
        if (isEventActive) {
            state.currentEvent = event;
            applyEventTheme(event, isNightTime);
            
            // Hiển thị popup cho sự kiện
            if (event.popup) {
                showEventPopup(event);
            }
            
            // Bắt đầu pháo hoa nếu có yêu cầu
            if (event.showFireworks && isNightTime) {
                startFireworks();
            } else {
                stopFireworks();
            }
            
            return event;
        }
    }
    
    // Không có dịp đặc biệt nào
    if (state.currentEvent) {
        state.currentEvent = null;
        resetTheme();
        stopFireworks();
    }
    
    return null;
}

function applyEventTheme(event, isNightTime) {
    // Áp dụng nền cho dịp đặc biệt
    const background = isNightTime ? event.background.night : event.background.day;
    document.body.style.background = background;
    
    // Thêm class cho chủ đề đặc biệt
    document.body.classList.add(`event-${event.theme}`);
    
    // Thêm họa tiết trang trí
    addEventPatterns(event);
    
    // Tắt canvas sao băng nếu có yêu cầu
    if (event.disableMeteors) {
        const canvas = document.getElementById('sky');
        if (canvas) {
            canvas.style.display = 'none';
        }
    }
    
    // Nếu là Halloween, luôn áp dụng dark mode
    if (event.isDarkMode) {
        document.body.classList.add("dark");
        // Vô hiệu hóa nút chuyển dark mode
        if (elements.menuDark) {
            elements.menuDark.disabled = true;
            elements.menuDark.style.opacity = "0.5";
            elements.menuDark.style.cursor = "not-allowed";
        }
    }
}

function resetTheme() {
    // Xóa class của chủ đề đặc biệt
    specialEvents.forEach(event => {
        document.body.classList.remove(`event-${event.theme}`);
    });
    
    // Khôi phục nền mặc định
    document.body.style.background = '';
    
    // Hiển thị lại canvas sao băng
    const canvas = document.getElementById('sky');
    if (canvas) {
        canvas.style.display = '';
    }
    
    // Xóa họa tiết trang trí
    removeEventPatterns();
    
    // Kích hoạt lại nút chuyển dark mode
    if (elements.menuDark) {
        elements.menuDark.disabled = false;
        elements.menuDark.style.opacity = "";
        elements.menuDark.style.cursor = "";
    }
}

function addEventPatterns(event) {
    // Xóa họa tiết cũ trước khi thêm mới
    removeEventPatterns();
    
    // Tạo container cho họa tiết
    const patternsContainer = document.createElement('div');
    patternsContainer.className = 'event-patterns';
    patternsContainer.id = 'event-patterns';
    
    // Thêm các họa tiết theo chủ đề
    event.background.patterns.forEach(pattern => {
        for (let i = 0; i < 5; i++) {
            const patternElement = document.createElement('div');
            patternElement.className = `event-pattern pattern-${pattern}`;
            patternElement.style.left = `${Math.random() * 100}%`;
            patternElement.style.top = `${Math.random() * 100}%`;
            patternElement.style.animationDelay = `${Math.random() * 5}s`;
            patternsContainer.appendChild(patternElement);
        }
    });
    
    document.body.appendChild(patternsContainer);
}

function removeEventPatterns() {
    const patternsContainer = document.getElementById('event-patterns');
    if (patternsContainer) {
        document.body.removeChild(patternsContainer);
    }
}

function showEventPopup(event) {
    elements.eventPopupTitle.textContent = event.popup.title;
    elements.eventPopupContent.textContent = event.popup.content;
    elements.eventPopup.classList.add('open');
    document.body.classList.add('popup-open');
    document.body.style.overflow = "hidden";
    
    // Nếu có popup thứ hai (ví dụ: Cá tháng Tư)
    if (event.popup.secondPopup && event.popup.showForSeconds) {
        setTimeout(() => {
            elements.eventPopup.classList.remove('open');
            document.body.classList.remove('popup-open');
            document.body.style.overflow = "";
            
            // Hiển thị popup thứ hai sau một khoảng thời gian ngắn
            setTimeout(() => {
                elements.eventPopupTitle.textContent = event.popup.secondPopup.title;
                elements.eventPopupContent.textContent = event.popup.secondPopup.content;
                elements.eventPopup.classList.add('open');
                document.body.classList.add('popup-open');
                document.body.style.overflow = "hidden";
                
                // Tự động đóng popup sau 5 giây
                setTimeout(() => {
                    elements.eventPopup.classList.remove('open');
                    document.body.classList.remove('popup-open');
                    document.body.style.overflow = "";
                }, 5000);
            }, 500);
        }, event.popup.showForSeconds * 1000);
    }
}

// --- Navigation (Thiết kế mới) ---
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.header-nav button[role="tab"]');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(targetTab) {
        if (!targetTab) return;
        const tabId = targetTab.getAttribute('aria-controls');

        tabButtons.forEach(btn => {
            const isActive = btn === targetTab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        tabPanels.forEach(panel => {
            const isActive = panel.id === tabId;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('aria-hidden', !isActive);
        });

        localStorage.setItem('activeTab', tabId);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });

    const savedTabId = localStorage.getItem('activeTab') || 'btvn-panel';
    const savedTab = document.querySelector(`.header-nav button[aria-controls="${savedTabId}"]`);
    
    if (savedTab) {
        switchTab(savedTab);
    } else {
        switchTab(tabButtons[0]); // Default về tab đầu tiên
    }
}

// --- Menu (Giữ nguyên logic) ---
function initMenu() {
    elements.menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = elements.menuBtn.getAttribute("aria-expanded") === "true";
        elements.menuBtn.setAttribute("aria-expanded", !isExpanded);
        elements.menuPanel.setAttribute("aria-hidden", isExpanded);
        elements.menuPanel.style.display = isExpanded ? "none" : "block";
    });

    document.addEventListener("click", (ev) => {
        if (!elements.menuPanel.contains(ev.target) && ev.target !== elements.menuBtn) {
            elements.menuBtn.setAttribute("aria-expanded", "false");
            elements.menuPanel.setAttribute("aria-hidden", "true");
            elements.menuPanel.style.display = "none";
        }
    });

    elements.menuDark.addEventListener("click", () => {
        // Kiểm tra xem có phải Halloween không
        if (state.currentEvent && state.currentEvent.isDarkMode) {
            return; // Không cho phép thay đổi dark mode khi là Halloween
        }
        
        showThemeLoading();
        setTimeout(() => {
            const isDarkMode = document.body.classList.contains("dark");
            if (isDarkMode) {
                const savedColorTheme = localStorage.getItem("colorTheme") || "blue";
                applyColorTheme(savedColorTheme);
                elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
                localStorage.setItem("theme", "light");
            } else {
                applyColorTheme("black");
                elements.menuDark.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i><span>Light Mode</span>';
            }
            hideThemeLoading();
        }, 500);
    });

    elements.menuLiquid.addEventListener("click", () => {
        showThemeLoading();
        setTimeout(() => {
            document.body.classList.toggle("normal-mode");
            localStorage.setItem("liquidMode", document.body.classList.contains("normal-mode") ? "normal" : "liquid");
            applyThemeFromStorage();
            hideThemeLoading();
        }, 500);
    });

    elements.menuPopup.addEventListener("click", () => {
        openPopup(true);
    });

    const menuAutoRefresh = document.getElementById("menuAutoRefresh");
    if (menuAutoRefresh) {
        menuAutoRefresh.addEventListener("click", toggleAutoRefresh);
    }

    elements.colorThemes.forEach(btn => {
        btn.addEventListener("click", () => {
            // Kiểm tra xem có phải Halloween không
            if (state.currentEvent && state.currentEvent.isDarkMode) {
                return; // Không cho phép thay đổi chủ đề khi là Halloween
            }
            
            const theme = btn.dataset.theme;
            showThemeLoading();
            setTimeout(() => {
                if (document.body.classList.contains("dark")) {
                    elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
                }
                applyColorTheme(theme);
                hideThemeLoading();
            }, 500);
        });
    });
}

// --- Theme (Đã tối ưu) ---
function applyColorTheme(theme) {
    document.body.classList.add("changing-theme");
    document.body.classList.remove("theme-pink", "theme-blue", "theme-green", "theme-fresh", "theme-popular", "theme-white", "theme-aquaviolet", "theme-mint", "dark");
    const isDarkMode = document.body.classList.contains("dark");

    if (theme === "black") {
        if (!isDarkMode) document.body.classList.add("dark");
        ensureCanvasInit(); // Lazy-load canvas
    } else {
        if (isDarkMode) document.body.classList.remove("dark");
        document.body.classList.add(`theme-${theme}`);
    }

    elements.colorThemes.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
        btn.setAttribute("aria-checked", btn.dataset.theme === theme);
    });

    if (theme !== "black") {
        localStorage.setItem("colorTheme", theme);
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    setTimeout(() => {
        document.body.classList.remove("changing-theme");
        window.requestAnimationFrame(() => {});
    }, 50);
}

function applyThemeFromStorage() {
    const savedTheme = localStorage.getItem("theme");
    const savedColorTheme = localStorage.getItem("colorTheme") || "blue";

    if (savedTheme === "dark") {
        ensureCanvasInit(); // Phải gọi trước khi apply
        applyColorTheme("black");
        elements.menuDark.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i><span>Light Mode</span>';
    } else {
        applyColorTheme(savedColorTheme);
        elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
    }

    if (localStorage.getItem("liquidMode") === "normal") {
        document.body.classList.add("normal-mode");
        elements.menuLiquid.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>Giao diện thường</span>';
    } else {
        document.body.classList.remove("normal-mode");
        elements.menuLiquid.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>Liquid Glass</span>';
    }
}

function showThemeLoading() {
    elements.themeLoading.classList.add("active");
}
function hideThemeLoading() {
    elements.themeLoading.classList.remove("active");
}

// --- Popups (Giữ nguyên logic) ---
function initPopup() {
    elements.popupClose.addEventListener("click", closePopup);
    elements.popup.addEventListener("click", (e) => {
        if (e.target === elements.popup) closePopup();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.popup.classList.contains("open")) {
            closePopup();
        }
    });
    
    // Popup cho dịp đặc biệt
    elements.eventPopupClose.addEventListener("click", closeEventPopup);
    elements.eventPopup.addEventListener("click", (e) => {
        if (e.target === elements.eventPopup) closeEventPopup();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.eventPopup.classList.contains("open")) {
            closeEventPopup();
        }
    });
}
function openPopup(force = false) {
    const today = new Date().toLocaleDateString('vi-VN');
    if (force) {
        elements.popup.classList.add("open");
        document.body.classList.add("popup-open");
        document.body.style.overflow = "hidden";
        return;
    }
    const lastShown = localStorage.getItem('popupShownDate');
    if (lastShown !== today) {
        elements.popup.classList.add("open");
        localStorage.setItem('popupShownDate', today);
        document.body.classList.add("popup-open");
        document.body.style.overflow = "hidden";
    }
}
function closePopup() {
    elements.popup.classList.remove("open");
    document.body.classList.remove("popup-open");
    document.body.style.overflow = "";
}

function closeEventPopup() {
    elements.eventPopup.classList.remove("open");
    document.body.classList.remove("popup-open");
    document.body.style.overflow = "";
}

// --- Data functions (Giữ nguyên logic) ---
const SUBJECT_LIST = [
    "Toán học - Đại số", "Toán học - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
    "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GDCD",
    "Tin học", "Công nghệ", "GDTC", "GDĐP", "Mĩ thuật", "Âm nhạc", "HĐTN"
];

function ensureAllSubjects(btvnArray) {
    const grouped = {};
    btvnArray.forEach(item => {
        const subject = item.subject?.trim() || "Khác";
        if (!grouped[subject]) grouped[subject] = [];
        grouped[subject].push(item);
    });
    SUBJECT_LIST.forEach(sub => {
        if (!grouped[sub]) {
            grouped[sub] = [{ subject: sub, content: "(Chưa có bài tập)", date: "", note: "" }];
        }
    });
    return Object.values(grouped).flat();
}

async function fetchData() {
    if (state.isLoading) return null;
    state.isLoading = true;
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAll`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data?.result) return null;
        data.result.btvn = ensureAllSubjects(data.result.btvn || []);
        return data.result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    } finally {
        state.isLoading = false;
    }
}

// --- Render functions (Đã tối ưu + Thêm tính năng mới) ---

/**
 * TỐI ƯU: Sử dụng DocumentFragment
 * FIX: Đã xóa logic hiển thị 'metaDiv' (item.date)
 * MỚI: Thêm tham số 'tomorrowsSubjectsSet' để đánh dấu môn ngày mai
 */
function renderBTVN(data, tomorrowsSubjectsSet = new Set()) {
    const container = elements.btvnContainer;
    const btvnData = (data && data.btvn) ? data.btvn : [];
    container.textContent = ''; // Xóa nhanh

    if (!btvnData.length) {
        const p = document.createElement('p');
        p.textContent = 'Chưa có bài tập.';
        container.appendChild(p);
        return;
    }

    const subjects = btvnData.reduce((acc, item) => {
        const key = (item.subject || 'Khác').trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const SUBJECT_ORDER = [
        "Toán học - Đại số", "Toán học - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
        "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GDCD", "Tin học", "Công nghệ",
        "GDTC", "GDĐP", "Mĩ thuật", "Âm nhạc", "HĐTN"
    ];

    const frag = document.createDocumentFragment();

    SUBJECT_ORDER.forEach(subjectName => {
        const group = subjects[subjectName];
        if (group) { // Chỉ render nếu có dữ liệu
            const card = document.createElement('section');
            card.className = 'subject-card scroll-fade';
            card.setAttribute('data-subject', subjectName);

            // --- TÍNH NĂNG MỚI ---
            // Kiểm tra xem môn này có trong danh sách ngày mai không
            const isTomorrow = tomorrowsSubjectsSet.has(subjectName);
            if (isTomorrow) {
                card.classList.add('is-tomorrow');
            }
            // --- KẾT THÚC TÍNH NĂNG MỚI ---

            const header = document.createElement('h3');
            header.className = 'subject-title';
            header.innerHTML = `${getSubjectIcon(subjectName)} ${subjectName}`;
            card.appendChild(header);

            const list = document.createElement('ul');
            list.className = 'subject-list';

            group.forEach(item => {
                const li = document.createElement('li');
                li.className = 'btvn-item scroll-fade';

                const contentDiv = document.createElement('div');
                contentDiv.className = 'btvn-content';
                contentDiv.textContent = item.content || item.note || '(Không có nội dung)';
                
                li.appendChild(contentDiv);
                list.appendChild(li);
            });

            card.appendChild(list);
            frag.appendChild(card);
        }
    });

    container.appendChild(frag);

    // Kích hoạt lại IntersectionObserver
    setTimeout(() => {
        const scrollElements = container.querySelectorAll('.scroll-fade');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        scrollElements.forEach(el => observer.observe(el));
    }, 100);
}

// TỐI ƯU: Sử dụng DocumentFragment
function renderTKB(data) {
    const container = elements.tkbContainer;
    if (!data?.tkb) {
        container.innerHTML = "<p>Không có dữ liệu TKB.</p>";
        return;
    }

    const d = getVNDateObj();
    let day = d.getDay();
    const hour = d.getHours();
    const minute = d.getMinutes();
    let showDay = day;

    if (day === 1 || day === 3 || day === 5) {
        if (hour > 16 || (hour === 16 && minute >= 45)) showDay = (day + 1) % 7;
    } else if (day === 2 || day === 4) {
        if (hour >= 10) showDay = (day + 1) % 7;
    } else if (day === 6) {
        showDay = 1;
    } else if (day === 0) {
        showDay = 1;
    }
    if (showDay === 0 || showDay === 6 || !data.tkb[showDay] || data.tkb[showDay].length === 0) {
    showDay = 1; // Mặc định hiển thị thứ Hai
    }

    let targetDate = new Date(d);
    if (showDay <= day) targetDate.setDate(d.getDate() + ((showDay + 7 - day) % 7));
    else targetDate.setDate(d.getDate() + (showDay - day));
    const formattedDate = targetDate.toLocaleDateString("vi-VN");

    container.textContent = ''; // Xóa nhanh
    const frag = document.createDocumentFragment();

    const infoP = document.createElement('p');
    infoP.innerHTML = `Hôm nay: <strong>${dayNames[d.getDay()]}</strong>, ${d.toLocaleDateString('vi-VN')} — Hiển thị TKB <strong>${dayNames[showDay]}</strong>, ngày ${formattedDate}`;
    frag.appendChild(infoP);

    const noteDiv = document.createElement('div');
    noteDiv.className = 'inline-note';
    noteDiv.textContent = '❗Lưu ý: Hiển thị TKB hôm sau tùy theo khung giờ quy định.';
    frag.appendChild(noteDiv);

    const dayContainer = document.createElement('div');
    dayContainer.className = 'day-container scroll-fade';

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = dayNames[showDay];
    dayContainer.appendChild(dayHeader);

    const sessionContainer = document.createElement('div');
    sessionContainer.className = 'session-container';

    // Buổi sáng
    sessionContainer.appendChild(Object.assign(document.createElement('div'), {
        className: 'session-header morning-header', textContent: 'Buổi sáng'
    }));
    const morningTable = document.createElement('table');
    morningTable.className = 'session-table';
    morningTable.innerHTML = '<thead><tr><th>Tiết</th><th>Môn / Nội dung</th></tr></thead>';
    const morningTbody = document.createElement('tbody');
    if (data.tkb[showDay]) {
        data.tkb[showDay].filter(p => p.buoi === "Sáng").forEach(p => {
            const tr = morningTbody.insertRow();
            tr.innerHTML = `<td>${p.tiet}</td><td>${p.subject}</td>`;
        });
    }
    morningTable.appendChild(morningTbody);
    sessionContainer.appendChild(morningTable);

    // Buổi chiều
    sessionContainer.appendChild(Object.assign(document.createElement('div'), {
        className: 'session-header afternoon-header', textContent: 'Buổi chiều'
    }));
    const afternoonTable = document.createElement('table');
    afternoonTable.className = 'session-table';
    afternoonTable.innerHTML = '<thead><tr><th>Tiết</th><th>Môn</th></tr></thead>';
    const afternoonTbody = document.createElement('tbody');
    if (data.tkb[showDay]) {
        data.tkb[showDay].filter(p => p.buoi === "Chiều").forEach(p => {
            const tr = afternoonTbody.insertRow();
            tr.innerHTML = `<td>${p.tiet}</td><td>${p.subject}</td>`;
        });
    }
    afternoonTable.appendChild(afternoonTbody);
    sessionContainer.appendChild(afternoonTable);

    dayContainer.appendChild(sessionContainer);
    frag.appendChild(dayContainer);

    // Lịch trực
    const trucP = document.createElement('p');
    trucP.style.marginTop = '10px';
    trucP.innerHTML = `<b>Lịch trực: </b> <span id="todayTruc">${data.tkb[showDay]?.[0]?.truc || 'Không có dữ liệu'}</span>`;
    frag.appendChild(trucP);

    container.appendChild(frag);

    // Kích hoạt Observer
    setTimeout(() => {
        const scrollElements = container.querySelectorAll('.scroll-fade');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        scrollElements.forEach(el => observer.observe(el));
    }, 100);
}

// TỐI ƯU: Sử dụng DocumentFragment
function renderChangelog(data) {
    const container = elements.changelogContainer;
    if (!data?.changelog?.length) {
        container.innerHTML = "<p>Chưa có dữ liệu changelog.</p>";
        return;
    }

    const parsedLogs = data.changelog.map(line => {
        const parts = line.split(" - ");
        const header = parts[0] || "";
        const content = parts.slice(1).join(" - ") || "";
        const dateMatch = header.match(/\[(.*?)\]/);
        const numMatch = header.match(/#(\d+)/);
        const date = dateMatch ? dateMatch[1] : "";
        const version = numMatch ? `#${numMatch[1]}` : "";
        return { date, version, content: content.trim() };
    });

    const grouped = {};
    parsedLogs.forEach(log => {
        const key = `${log.date} ${log.version}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(log.content);
    });

    container.textContent = ''; // Xóa nhanh
    const frag = document.createDocumentFragment();

    const section = document.createElement('div');
    section.className = 'changelog-section';

    const title = document.createElement('h3');
    title.textContent = '📝 Nhật ký thay đổi';
    section.appendChild(title);

    Object.keys(grouped).forEach(key => {
        const [date, version] = key.split(" ");
        const card = document.createElement('div');
        card.className = 'changelog-card scroll-fade';

        const header = document.createElement('div');
        header.className = 'changelog-header';
        header.innerHTML = `<span class="changelog-version">❗ ${version}</span>` +
            (date ? `<span class="changelog-date">📅 ${date}</span>` : "");
        card.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'changelog-list';
        grouped[key].forEach(item => {
            const li = document.createElement('li');
            li.className = 'scroll-fade';
            li.textContent = `🔹 ${item}`;
            list.appendChild(li);
        });
        card.appendChild(list);
        section.appendChild(card);
    });

    frag.appendChild(section);
    container.appendChild(frag);

    // Kích hoạt Observer
    setTimeout(() => {
        const scrollElements = container.querySelectorAll('.scroll-fade');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        scrollElements.forEach(el => observer.observe(el));
    }, 100);
}

function renderNotices(data) {
    const container = elements.noticesContainer;
    if (!data?.notices?.length) {
        container.style.display = "none";
        return;
    }
    let html = '<strong>THÔNG BÁO:</strong><ul>';
    data.notices.forEach(notice => {
        html += `<li>${notice}</li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
    container.style.display = "block";
}

function getSubjectIcon(subject) {
    const icons = {
        'Địa lí': '📘', 'Toán học - Đại số': '➗', 'Toán học - Hình học': '📐', 'Ngữ văn': '✍',
        'Tiếng Anh': '🇬🇧', 'Vật lý': '🔬', 'Hóa học': '⚗', 'Sinh học': '🧬',
        'Lịch sử': '📜', 'Địa lí': '🌍', 'GDCD': '👥', 'Tin học': '💻',
        'Công nghệ': '🔧', 'GDTC': '⚽', 'GDĐP': '🏠', 'Mĩ thuật': '🎨',
        'Âm nhạc': '🎶', 'HĐTN': '🤝'
    };
    return icons[subject] || '📚';
}

// --- Load Data (Đã cập nhật) ---
async function loadAllData() {
    const data = await fetchData();
    const result = data?.result || data || {};

    if (result && (result.btvn || result.tkb)) {
        state.currentData = {
            tkb: result.tkb || defaultData.tkb,
            truc: result.truc || defaultData.truc,
            btvn: result.btvn || [],
            changelog: result.changelog || [],
            notices: result.notices || []
        };
        state.lastData = JSON.parse(JSON.stringify(state.currentData));
    } else {
        // Fallback
        state.currentData = {
            tkb: defaultData.tkb, truc: defaultData.truc, btvn: [], changelog: [], notices: []
        };
        state.lastData = JSON.parse(JSON.stringify(state.currentData));
    }
    
    // --- TÍNH NĂNG MỚI ---
    // Tính toán danh sách môn học ngày mai
    const d = getVNDateObj();
    let tomorrowDayIndex = (d.getDay() + 1) % 7; // 0 = CN, 1 = T2, ...
    // Bỏ qua CN, Thứ 7 → cho về Thứ 2
    if (tomorrowDayIndex === 0 || tomorrowDayIndex === 6) {
    tomorrowDayIndex = 1;
    }
    const tomorrowsTKB = state.currentData.tkb[tomorrowDayIndex] || [];
    // Dùng Set để loại bỏ các môn trùng lặp
    const tomorrowsSubjectsSet = new Set(tomorrowsTKB.map(item => item.subject.trim()));
    // --- KẾT THÚC TÍNH NĂNG MỚI ---

    // Render
    renderBTVN(state.currentData, tomorrowsSubjectsSet); // Gửi danh sách cho hàm render
    renderTKB(state.currentData);
    renderChangelog(state.currentData);
    renderNotices(state.currentData);
}

async function renderTodayTKB() {
    renderTKB(state.currentData);
}

function getVNDateObj() {
    const s = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    return new Date(s);
}

// --- Tối ưu hóa Helpers ---
function debounce(fn, wait = 120) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    }
}
function throttle(fn, limit = 200) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last >= limit) {
            last = now;
            fn.apply(this, args);
        }
    }
}
function shallowHash(obj) {
    return [
        (obj.btvn || []).length, (obj.tkb || []).length,
        (obj.notices || []).length, (obj.changelog || []).length
    ].join('|');
}
function hasDataChanged(newData, oldData) {
    if (!oldData) return true;
    return shallowHash(newData) !== shallowHash(oldData);
}

// --- Auto Refresh (Đã cập nhật) ---
async function autoRefreshData() {
    try {
        const data = await fetchData();
        if (data && hasDataChanged(data, state.lastData)) {
            state.lastData = JSON.parse(JSON.stringify(data));
            state.currentData = {
                tkb: data.tkb || defaultData.tkb,
                truc: data.truc || defaultData.truc,
                btvn: data.btvn || [],
                changelog: data.changelog || [],
                notices: data.notices || []
            };

            // --- TÍNH NĂNG MỚI (Lặp lại logic) ---
            const d = getVNDateObj();
            const tomorrowDayIndex = (d.getDay() + 1) % 7;
            const tomorrowsTKB = state.currentData.tkb[tomorrowDayIndex] || [];
            const tomorrowsSubjectsSet = new Set(tomorrowsTKB.map(item => item.subject.trim()));
            // --- KẾT THÚC TÍNH NĂNG MỚI ---

            // Update UI
            renderBTVN(state.currentData, tomorrowsSubjectsSet); // Gửi danh sách
            renderTKB(state.currentData);
            renderChangelog(state.currentData);
            renderNotices(state.currentData);
        }
    } catch (error) {
        console.error("Lỗi khi làm mới tự động:", error);
    }
}

function toggleAutoRefresh() {
    state.isAutoRefreshEnabled = !state.isAutoRefreshEnabled;
    if (state.isAutoRefreshEnabled) {
        state.autoRefreshInterval = setInterval(autoRefreshData, 20000);
        document.getElementById("menuAutoRefresh").innerHTML =
            '<i class="fas fa-pause-circle" aria-hidden="true"></i><span>Tắt làm mới tự động</span>';
        if (elements.refreshBtn) elements.refreshBtn.style.display = "none";
        showNotification("Đã bật làm mới tự động");
    } else {
        if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
        state.autoRefreshInterval = null;
        document.getElementById("menuAutoRefresh").innerHTML =
            '<i class="fas fa-sync-alt" aria-hidden="true"></i><span>Bật làm mới tự động</span>';
        if (elements.refreshBtn) elements.refreshBtn.style.display = "flex";
        showNotification("Đã tắt làm mới tự động");
    }
    localStorage.setItem('autoRefreshEnabled', state.isAutoRefreshEnabled);
}

// --- Notification (Giữ nguyên) ---
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// --- Event Listeners (Logic modal TKB giữ nguyên) ---
function initEventListeners() {
    // Show full TKB modal
    elements.showFullBtn.addEventListener("click", function() {
        const isExpanded = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", !isExpanded);
        if (isExpanded) {
            closeTkbFullPopup();
            return;
        }
        showTkbFullPopup();
    });

    elements.tkbFullClose.addEventListener("click", closeTkbFullPopup);
    elements.tkbFullPopup.addEventListener("click", (e) => {
        if (e.target === elements.tkbFullPopup) closeTkbFullPopup();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.tkbFullPopup.classList.contains("open")) {
            closeTkbFullPopup();
        }
    });

    // Orientation change
    window.addEventListener("orientationchange", debounce(function () {
        if (state.canvasInitialized) resizeCanvas();
        setTimeout(renderTodayTKB, 300);
    }, 120));

    document.addEventListener("touchstart", function () {}, { passive: true });
}

// (Hàm showTkbFullPopup và closeTkbFullPopup giữ nguyên từ file cũ)
function showTkbFullPopup() {
    let html = '';
    for (let k = 1; k <= 5; k++) {
        html += `<div class="day-container scroll-fade"><div class="day-header">${dayNames[k]}</div><div class="session-container">`;
        // Morning
        html += `<div class="session-header morning-header">🌅 Buổi sáng</div><table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (state.currentData.tkb[k]) {
            state.currentData.tkb[k].filter(p => p.buoi === "Sáng").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;
        // Afternoon
        html += `<div class="session-header afternoon-header">🌆 Buổi chiều</div><table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (state.currentData.tkb[k]) {
            state.currentData.tkb[k].filter(p => p.buoi === "Chiều").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;
        // Truc
        html += `<div class="truc-container"><strong>🧹 Lịch trực: </strong><span>${state.currentData.tkb[k]?.[0]?.truc || 'Không có dữ liệu'}</span></div>`;
        html += `</div></div>`;
    }

    elements.tkbFullContent.innerHTML = html;
    elements.tkbFullPopup.classList.add("open");
    document.body.classList.add("popup-open");
    document.body.style.overflow = "hidden";
    elements.showFullBtn.setAttribute("aria-expanded", "true");
    elements.showFullBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Ẩn toàn bộ';

    // Kích hoạt Observer
    setTimeout(() => {
        const scrollElements = elements.tkbFullContent.querySelectorAll('.scroll-fade');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        scrollElements.forEach(el => observer.observe(el));
    }, 100);
}

function closeTkbFullPopup() {
    elements.tkbFullPopup.classList.remove("open");
    document.body.classList.remove("popup-open");
    document.body.style.overflow = "";
    elements.showFullBtn.setAttribute("aria-expanded", "false");
    elements.showFullBtn.innerHTML = '<i class="fas fa-calendar-week" aria-hidden="true"></i> Xem toàn bộ TKB';
}

// Refresh button
function initRefreshButton() {
    if (!elements.refreshBtn) return;
    elements.refreshBtn.addEventListener("click", async () => {
        if (state.isLoading) return;
        const icon = elements.refreshBtn.querySelector('i');
        if (icon) icon.classList.add('fa-spin');
        await loadAllData();
        if (icon) icon.classList.remove('fa-spin');
    });
}

// Scroll animations
function initScrollFade() {
    const elementsToFade = document.querySelectorAll('.scroll-fade');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    elementsToFade.forEach(el => observer.observe(el));
}

// --- Initialize App ---
function initApp() {
    applyThemeFromStorage(); // Sẽ lazy-load canvas nếu cần

    const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
    const isAutoRefresh = savedAutoRefresh === null || savedAutoRefresh === 'true';
    if (isAutoRefresh) enableAutoRefresh();
    else disableAutoRefresh();

    createParticles();
    initMenu();
    initPopup();
    initTabNavigation(); // Gọi hàm nav mới
    initEventListeners();
    
    openPopup(false);

    loadAllData().then(() => {
        // Check render
        const checkRendered = () => {
            const containers = [elements.btvnContainer, elements.tkbContainer, elements.changelogContainer];
            return containers.every(container => container.innerHTML.trim() !== "Đang tải dữ liệu...");
        };
        const waitForRender = () => {
            if (checkRendered()) hideLoadingScreen();
            else setTimeout(waitForRender, 100);
        };
        waitForRender();
    });
    
    initRefreshButton();
    state.refreshTimer = setInterval(renderTodayTKB, 60 * 1000);
    
    // Kiểm tra dịp đặc biệt
    checkSpecialEvent();
    
    // Cập nhật dịp đặc biệt mỗi phút
    setInterval(checkSpecialEvent, 60000);
    
    if (isMobileDevice()) optimizeForMobile();
    
    document.body.classList.add("loaded");
}

// (Các hàm helper còn lại giữ nguyên)
function enableAutoRefresh() {
    state.isAutoRefreshEnabled = true;
    state.autoRefreshInterval = setInterval(autoRefreshData, 20000);
    updateAutoRefreshButton(true);
    if (elements.refreshBtn) elements.refreshBtn.style.display = "none";
    localStorage.setItem('autoRefreshEnabled', 'true');
}
function disableAutoRefresh() {
    state.isAutoRefreshEnabled = false;
    if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
    state.autoRefreshInterval = null;
    updateAutoRefreshButton(false);
    if (elements.refreshBtn) elements.refreshBtn.style.display = "flex";
    localStorage.setItem('autoRefreshEnabled', 'false');
}
function updateAutoRefreshButton(enabled) {
    const menuAutoRefresh = document.getElementById("menuAutoRefresh");
    if (menuAutoRefresh) {
        menuAutoRefresh.innerHTML = enabled 
            ? '<i class="fas fa-pause-circle" aria-hidden="true"></i><span>Tắt làm mới tự động</span>'
            : '<i class="fas fa-sync-alt" aria-hidden="true"></i><span>Bật làm mới tự động</span>';
    }
}
function hideLoadingScreen() {
    elements.loadingScreen.style.opacity = "0";
    setTimeout(() => {
        elements.loadingScreen.style.display = "none";
    }, 400);
}
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function optimizeForMobile() {
    document.body.classList.add("mobile-device");
    elements.popupCard.style.cssText = `max-height: 80vh; overflow-y: auto; -webkit-overflow-scrolling: touch;`;
    elements.menuPanel.style.cssText = `max-height: 70vh; overflow-y: auto;`;
}

// Initialize app
document.addEventListener("DOMContentLoaded", initApp);

// Cleanup
window.addEventListener("beforeunload", () => {
    if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    if (state.meteorInterval) clearInterval(state.meteorInterval);
    if (state.refreshTimer) clearInterval(state.refreshTimer);
    if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
    if (state.fireworksInterval) clearInterval(state.fireworksInterval);
});