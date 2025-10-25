// script.js - Phiên bản hoàn chỉnh đã sửa lỗi với đầy đủ hiệu ứng

// Constants
const API_URL = "https://script.google.com/macros/s/AKfycbw5sjUwJfwRtKBQQu5FgYrmgSjoQ22vvnmlv99H7YJHTVgVZRXm1vWB7fFJg8B2O2M7/exec";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_jnFFS0Adq6yBqm5VQHjy2Ap59kqFclYDiJlHYkEwmvV21QQZzp-ZvJ27xumt3IDR/exec";

// Default data
const defaultData = {
    tkb: {
        0: ["Nghỉ"],
        1: ["Null"],
        2: ["Null"],
        3: ["Null"],
        4: ["Null"],
        5: ["Null"],
        6: ["Nghỉ"]
    },
    truc: {
        0: "Chủ nhật: Không trực",
        1: "Null",
        2: "Null",
        3: "Null",
        4: "Null",
        5: "Null",
        6: "Null",
    }
};

const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

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
    meteors: []
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
    fullTKB: document.getElementById("fullTKB"),
    changelogContainer: document.getElementById("changelogContainer"),
    colorThemes: document.querySelectorAll(".color-theme"),
    refreshBtn: document.getElementById("refreshBtn"),
    // Thêm các phần tử mới cho modal TKB Full
    tkbFullPopup: document.getElementById("tkbFullPopup"),
    tkbFullClose: document.getElementById("tkbFullClose"),
    tkbFullContent: document.getElementById("tkbFullContent")
};

// RequestIdleCallback polyfill
if (!('requestIdleCallback' in window)) {
    window.requestIdleCallback = cb => setTimeout(cb, 50);
}

// Canvas functions - Tối ưu
function initCanvas() {
    const canvas = elements.sky;
    const ctx = canvas.getContext("2d");
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    }
    
    function createStars() {
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
    
    window.addEventListener("resize", resizeCanvas);
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
            
            // Draw stars
            for (const star of state.stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
                ctx.fill();
                
                star.opacity += (Math.random() - 0.5) * star.blinkSpeed;
                star.opacity = Math.min(1, Math.max(0.3, star.opacity));
            }
            
            // Draw meteors
            for (let i = state.meteors.length - 1; i >= 0; i--) {
                const m = state.meteors[i];
                ctx.strokeStyle = `rgba(255,255,255,${m.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(
                    m.x - m.length * Math.cos(m.angle),
                    m.y - m.length * Math.sin(m.angle)
                );
                ctx.stroke();
                
                m.x += m.speed * Math.cos(m.angle);
                m.y += m.speed * Math.sin(m.angle);
                m.opacity -= 0.02;
                if (m.opacity <= 0) state.meteors.splice(i, 1);
            }
            
            if (state.meteorInterval === null) {
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

// Tạo hiệu ứng hạt nổi
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    // Chỉ tạo particles ở light mode
    if (!document.body.classList.contains("dark")) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Kích thước ngẫu nhiên
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Vị trí ngẫu nhiên
            particle.style.left = `${Math.random() * 100}%`;
            
            // Độ trễ ngẫu nhiên
            particle.style.animationDelay = `${Math.random() * 15}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
}

// Tab Navigation - Tối ưu
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn-fixed');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabIndicator = document.querySelector('.tab-indicator-fixed');
    const tabNavigationFixed = document.getElementById('tabNavigationFixed');
    const tabExpandBtn = document.getElementById('tabExpandBtn');
    
    const tabState = {
        tabTimeout: null,
        isTabInteracted: false,
        TAB_HIDE_DELAY: 8000,
        TAB_MINIMIZE_DELAY: 15000
    };
    
    function updateIndicator(activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        
        tabIndicator.style.cssText = `
            left: ${tabRect.left - containerRect.left}px;
            width: ${tabRect.width}px;
            height: 3px;
            border-radius: 3px 3px 0 0;
        `;
    }
    
    function switchTab(targetTab) {
        tabButtons.forEach(btn => {
            const isActive = btn === targetTab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });
        
        const tabId = targetTab.getAttribute('data-tab');
        tabPanels.forEach(panel => {
            const isActive = panel.id === `${tabId}-panel`;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('aria-hidden', !isActive);
        });
        
        updateIndicator(targetTab);
        localStorage.setItem('activeTab', tabId);
        resetTabTimer();
    }
    
    function resetTabTimer() {
        clearTimeout(tabState.tabTimeout);
        tabState.isTabInteracted = true;
        showFullTab();
        
        tabState.tabTimeout = setTimeout(() => {
            minimizeTab();
        }, tabState.TAB_HIDE_DELAY);
    }
    
    function showFullTab() {
        tabNavigationFixed.classList.remove('minimized', 'hidden');
        tabExpandBtn.classList.remove('visible');
    }
    
    function minimizeTab() {
        tabNavigationFixed.classList.remove('hidden');
        tabNavigationFixed.classList.add('minimized');
        tabExpandBtn.classList.remove('visible');
        
        tabState.tabTimeout = setTimeout(() => {
            hideTab();
        }, tabState.TAB_MINIMIZE_DELAY);
    }
    
    function hideTab() {
        tabNavigationFixed.classList.remove('minimized');
        tabNavigationFixed.classList.add('hidden');
        tabExpandBtn.classList.add('visible');
    }
    
    // Event listeners
    tabNavigationFixed.addEventListener('mouseenter', resetTabTimer);
    tabNavigationFixed.addEventListener('mouseleave', () => {
        if (tabState.isTabInteracted) {
            tabState.tabTimeout = setTimeout(() => {
                minimizeTab();
            }, tabState.TAB_HIDE_DELAY);
        }
    });
    
    tabExpandBtn.addEventListener('click', resetTabTimer);
    tabNavigationFixed.addEventListener('touchstart', resetTabTimer, { passive: true });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });
    
    // Initialize
    const activeTab = document.querySelector('.tab-btn-fixed.active');
    if (activeTab) {
        updateIndicator(activeTab);
    }
    
    window.addEventListener('resize', () => {
        const currentActiveTab = document.querySelector('.tab-btn-fixed.active');
        if (currentActiveTab) {
            updateIndicator(currentActiveTab);
        }
    });
    
    const savedTabId = localStorage.getItem('activeTab');
    if (savedTabId) {
        const savedTab = document.querySelector(`.tab-btn-fixed[data-tab="${savedTabId}"]`);
        if (savedTab) {
            switchTab(savedTab);
        }
    }
    
    resetTabTimer();
}

// Menu functions - Tối ưu
function initMenu() {
    // Toggle menu
    elements.menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = elements.menuBtn.getAttribute("aria-expanded") === "true";
        elements.menuBtn.setAttribute("aria-expanded", !isExpanded);
        elements.menuPanel.setAttribute("aria-hidden", isExpanded);
        elements.menuPanel.style.display = isExpanded ? "none" : "block";
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (ev) => {
        if (!elements.menuPanel.contains(ev.target) && ev.target !== elements.menuBtn) {
            elements.menuBtn.setAttribute("aria-expanded", "false");
            elements.menuPanel.setAttribute("aria-hidden", "true");
            elements.menuPanel.style.display = "none";
        }
    });
    
    // Dark mode toggle
    elements.menuDark.addEventListener("click", () => {
        showThemeLoading();
        
        setTimeout(() => {
            const isDarkMode = document.body.classList.contains("dark");
            
            if (isDarkMode) {
                // Chuyển từ dark mode sang light mode
                const savedColorTheme = localStorage.getItem("colorTheme") || "blue";
                applyColorTheme(savedColorTheme);
                elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
                localStorage.setItem("theme", "light");
            } else {
                // Chuyển từ light mode sang dark mode
                applyColorTheme("black");
                elements.menuDark.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i><span>Light Mode</span>';
                localStorage.setItem("theme", "dark");
            }
            
            hideThemeLoading();
        }, 500);
    });
    
    // Liquid/Normal mode toggle
    elements.menuLiquid.addEventListener("click", () => {
        showThemeLoading();
        
        setTimeout(() => {
            document.body.classList.toggle("normal-mode");
            localStorage.setItem("liquidMode", document.body.classList.contains("normal-mode") ? "normal" : "liquid");
            applyThemeFromStorage();
            hideThemeLoading();
        }, 500);
    });
    
    // Popup toggle
    elements.menuPopup.addEventListener("click", () => {
        openPopup(true);
    });
    
    // Auto refresh toggle
    const menuAutoRefresh = document.getElementById("menuAutoRefresh");
    if (menuAutoRefresh) {
        menuAutoRefresh.addEventListener("click", toggleAutoRefresh);
    }
    
    // Color theme selection
    elements.colorThemes.forEach(btn => {
        btn.addEventListener("click", () => {
            const theme = btn.dataset.theme;
            showThemeLoading();
            
            setTimeout(() => {
                // Nếu đang ở dark mode, chuyển về light mode trước
                if (document.body.classList.contains("dark")) {
                    elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
                }
                
                // Áp dụng màu chủ đề mới
                applyColorTheme(theme);
                hideThemeLoading();
            }, 500);
        });
        
        // Keyboard navigation
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// Theme functions - ĐÃ SỬA LỖI
function applyColorTheme(theme) {
    console.log("Áp dụng màu chủ đề:", theme);
    
    // Thêm lớp changing-theme để tắt các hiệu ứng trong khi chuyển đổi
    document.body.classList.add("changing-theme");
    
    // Xóa tất cả các class màu chủ đề
    document.body.classList.remove("theme-pink", "theme-blue", "theme-green", "theme-fresh", "theme-popular", "theme-white", "theme-aquaviolet", "theme-mint", "dark");
    
    // Xóa class dark nếu có
    const isDarkMode = document.body.classList.contains("dark");
    
    if (theme === "black") {
        // Chuyển sang dark mode
        if (!isDarkMode) {
            document.body.classList.add("dark");
        }
        console.log("Đã chuyển sang dark mode");
    } else {
        // Chuyển sang light mode với màu theme
        if (isDarkMode) {
            document.body.classList.remove("dark");
        }
        document.body.classList.add(`theme-${theme}`);
        console.log("Đã chuyển sang light mode với màu:", theme);
    }
    
    // Cập nhật trạng thái active cho các nút màu
    elements.colorThemes.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-checked", "false");
        if (btn.dataset.theme === theme) {
            btn.classList.add("active");
            btn.setAttribute("aria-checked", "true");
        }
    });
    
    // Lưu màu chủ đề vào localStorage
    if (theme !== "black") {
        localStorage.setItem("colorTheme", theme);
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
    
    // Đợi một chút để CSS được áp dụng
    setTimeout(() => {
        // Xóa lớp changing-theme để bật lại các hiệu ứng
        document.body.classList.remove("changing-theme");
        
        // Buộc trình duyệt cập nhật lại giao diện
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        console.log("Đã áp dụng màu chủ đề thành công");
    }, 50);
}

function applyThemeFromStorage() {
    console.log("Áp dụng theme từ storage");
    
    const savedTheme = localStorage.getItem("theme");
    const savedColorTheme = localStorage.getItem("colorTheme") || "blue";
    
    console.log("Theme đã lưu:", savedTheme, "Màu đã lưu:", savedColorTheme);
    
    if (savedTheme === "dark") {
        // Dark mode
        applyColorTheme("black");
        elements.menuDark.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i><span>Light Mode</span>';
    } else {
        // Light mode - áp dụng màu chủ đề đã lưu
        applyColorTheme(savedColorTheme);
        elements.menuDark.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
    }

    // Áp dụng liquid/normal mode
    if (localStorage.getItem("liquidMode") === "normal") {
        document.body.classList.add("normal-mode");
        elements.menuLiquid.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>Đang hiển thị giao diện thường</span>';
    } else {
        document.body.classList.remove("normal-mode");
        elements.menuLiquid.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>Đang hiển thị Liquid Glass</span>';
    }
}

function showThemeLoading() {
    console.log("Hiển thị loading");
    elements.themeLoading.classList.add("active");
}

function hideThemeLoading() {
    console.log("Ẩn loading");
    elements.themeLoading.classList.remove("active");
    forceUpdateUI();
}

function forceUpdateUI() {
    // Tạo một sự kiện thay đổi để buộc trình duyệt cập nhật
    const event = new Event('change');
    document.body.dispatchEvent(event);
    
    // Hoặc sử dụng cách này
    const originalDisplay = document.body.style.display;
    document.body.style.display = 'none';
    setTimeout(() => {
        document.body.style.display = originalDisplay;
    }, 10);
}

// Popup functions - Tối ưu
function initPopup() {
    elements.popupClose.addEventListener("click", closePopup);
    
    // Close popup when clicking outside
    elements.popup.addEventListener("click", (e) => {
        if (e.target === elements.popup) {
            closePopup();
        }
    });
    
    // Close popup when pressing Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.popup.classList.contains("open")) {
            closePopup();
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

// Data functions - Tối ưu
const SUBJECT_LIST = [
  "Toán - Đại số", "Toán - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
  "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GDCD",
  "Tin học", "Công nghệ", "GDTC", "GDĐP", "Mĩ thuật", "Âm nhạc", "HĐTN"
];

function ensureAllSubjects(btvnArray) {
  const map = {};
  btvnArray.forEach(item => { map[item.subject] = item; });

  return SUBJECT_LIST.map(sub => {
    if (map[sub]) return map[sub];
    return { subject: sub, content: "(Chưa có bài tập)", date: "", note: "" };
  });
}

async function fetchData() {
  if (state.isLoading) return null;
  
  state.isLoading = true;

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getAll`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data?.result) return null;

    // Add missing subjects
    data.result.btvn = ensureAllSubjects(data.result.btvn || []);

    return data.result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  } finally {
    state.isLoading = false;
  }
}

// Render functions - Tối ưu
function renderBTVN(data) {
    const container = elements.btvnContainer;
    
    const btvnData = data?.btvn ?? [];
    
    if (!btvnData.length) {
        container.innerHTML = "<p>Chưa có bài tập.</p>";
        return;
    }

    // Group by subject
    const subjects = btvnData.reduce((acc, item) => {
        if (!acc[item.subject]) {
            acc[item.subject] = [];
        }
        acc[item.subject].push(item);
        return acc;
    }, {});

    // Generate HTML - ĐÃ SỬA LỖI
    const html = Object.entries(subjects).map(([subject, items]) => {
        const itemsHtml = items.map(item => `<li class="scroll-fade">${item.content}</li>`).join('');
        return `
            <h2 class="animate-item scroll-fade">${getSubjectIcon(subject)} ${subject}</h2>
            <ul class="animate-item">${itemsHtml}</ul>
        `;
    }).join('');

    container.innerHTML = html;
    
    // Khởi tạo hiệu ứng scroll fade cho các phần tử mới
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

    // Default to today
    let showDay = day;

    // Rules for showing next day's schedule
    if (day === 1 || day === 3 || day === 5) {
        // Mon, Wed, Fri -> After 4:45 PM show next day
        if (hour > 16 || (hour === 16 && minute >= 45)) {
            showDay = (day + 1) % 7;
        }
    } else if (day === 2 || day === 4) {
        // Tue, Thu -> After 10:00 AM show next day
        if (hour >= 10) {
            showDay = (day + 1) % 7;
        }
    } else if (day === 6) {
        showDay = 1;
    } else if (day === 0) {
        // Sun always show Monday
        showDay = 1;
    }

    // Calculate display date
    let targetDate = new Date(d);
    if (showDay <= day) targetDate.setDate(d.getDate() + ((showDay + 7 - day) % 7));
    else targetDate.setDate(d.getDate() + (showDay - day));

    const formattedDate = targetDate.toLocaleDateString("vi-VN");

    let html = `<p>Hôm nay: <strong>${dayNames[d.getDay()]}</strong>, ${d.toLocaleDateString('vi-VN')} — Hiển thị TKB <strong>${dayNames[showDay]}</strong>, ngày ${formattedDate}</p>`;
    html += `<div class="inline-note">❗Lưu ý: Hiển thị TKB hôm sau tùy theo khung giờ quy định.</div>`;

    html += `<div class="day-container scroll-fade">`;
    html += `<div class="day-header">${dayNames[showDay]}</div>`;
    html += `<div class="session-container">`;

    // Morning session
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

    // Afternoon session
    html += `<div class="session-header afternoon-header">Buổi chiều</div>`;
    html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
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
    
    // Khởi tạo hiệu ứng scroll fade cho các phần tử mới
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

function renderChangelog(data) {
  const container = elements.changelogContainer;
  if (!data?.changelog?.length) {
    container.innerHTML = "<p>Chưa có dữ liệu changelog.</p>";
    return;
  }

  // Parse logs
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

  // Group by date or version
  const grouped = {};
  parsedLogs.forEach(log => {
    const key = `${log.date} ${log.version}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log.content);
  });

  // Generate HTML
  let html = `
    <div class="changelog-section">
      <h3 style="margin-bottom:10px;">📝 Nhật ký thay đổi</h3>
  `;

  Object.keys(grouped).forEach(key => {
    const [date, version] = key.split(" ");
    html += `
      <div class="changelog-card scroll-fade">
        <div class="changelog-header">
          <span class="changelog-version">❗ ${version}</span>
          ${date ? `<span class="changelog-date">📅 ${date}</span>` : ""}
        </div>
        <ul class="changelog-list">
          ${grouped[key].map(item => `<li class="scroll-fade">🔹 ${item}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
  
  // Khởi tạo hiệu ứng scroll fade cho các phần tử mới
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

    let html = '<strong>THÔNG BÁO:</strong>';
    html += '<ul>';
    
    data.notices.forEach(notice => {
        html += `<li>${notice}</li>`;
    });
    
    html += '</ul>';
    container.innerHTML = html;
    container.style.display = "block";
}

function getSubjectIcon(subject) {
    const icons = {
        'Địa lí': '📘',
        'Toán - Đại số': '➗',
        'Toán - Hình học': '📐',
        'Ngữ văn': '✍',
        'Tiếng Anh': '🇬🇧',
        'Vật lý': '🔬',
        'Hóa học': '⚗',
        'Sinh học': '🧬',
        'Lịch sử': '📜',
        'Địa lí': '🌍',
        'GDCD': '👥',
        'Tin học': '💻',
        'Công nghệ': '🔧',
        'GDTC': '⚽',
        'GDĐP': '🏠',
        'Mĩ thuật': '🎨',
        'Âm nhạc': '🎶',
        'HĐTN': '🤝'
    };
    return icons[subject] || '📚';
}

// Load all data - Tối ưu
async function loadAllData() {
    const data = await fetchData();
    if (data) {
        // Update global state
        state.currentData = {
            tkb: data.tkb || defaultData.tkb,
            truc: data.truc || defaultData.truc,
            btvn: data.btvn || [],
            changelog: data.changelog || [],
            notices: data.notices || []
        };
        
        // Save data for comparison
        state.lastData = JSON.parse(JSON.stringify(state.currentData));
        
        // Render data
        renderBTVN(state.currentData);
        renderTKB(state.currentData);
        renderChangelog(state.currentData);
        renderNotices(state.currentData);
    } else {
        // Use default data if API fails
        state.currentData = {
            tkb: defaultData.tkb,
            truc: defaultData.truc,
            btvn: [],
            changelog: [],
            notices: []
        };
        
        // Save data for comparison
        state.lastData = JSON.parse(JSON.stringify(state.currentData));
        
        // Render data
        renderBTVN(state.currentData);
        renderTKB(state.currentData);
        renderChangelog(state.currentData);
        renderNotices(state.currentData);
    }
}

// Render today's TKB
async function renderTodayTKB() {
    renderTKB(state.currentData);
}

// Helper function: get VN date/time
function getVNDateObj() {
    const s = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    return new Date(s);
}

// Auto refresh functionality - Tối ưu
function hasDataChanged(newData, oldData) {
    if (!oldData) return true;
    
    // Compare BTVN
    if (JSON.stringify(newData.btvn) !== JSON.stringify(oldData.btvn)) return true;
    
    // Compare TKB
    if (JSON.stringify(newData.tkb) !== JSON.stringify(oldData.tkb)) return true;
    
    // Compare notices
    if (JSON.stringify(newData.notices) !== JSON.stringify(oldData.notices)) return true;
    
    // Compare changelog
    if (JSON.stringify(newData.changelog) !== JSON.stringify(oldData.changelog)) return true;
    
    return false;
}

async function autoRefreshData() {
    try {
        const data = await fetchData();
        if (data && hasDataChanged(data, state.lastData)) {
            // Update data if changed
            state.lastData = JSON.parse(JSON.stringify(data));
            state.currentData = {
                tkb: data.tkb || defaultData.tkb,
                truc: data.truc || defaultData.truc,
                btvn: data.btvn || [],
                changelog: data.changelog || [],
                notices: data.notices || []
            };
            
            // Update UI
            renderBTVN(state.currentData);
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
        // Enable auto refresh
        state.autoRefreshInterval = setInterval(autoRefreshData, 20000);
        document.getElementById("menuAutoRefresh").innerHTML = 
            '<i class="fas fa-pause-circle" aria-hidden="true"></i><span>Tắt làm mới tự động</span>';
        
        // Hide manual refresh button
        if (elements.refreshBtn) {
            elements.refreshBtn.style.display = "none";
        }
        
        // Show notification
        showNotification("Đã bật làm mới tự động mỗi 20 giây");
    } else {
        // Disable auto refresh
        if (state.autoRefreshInterval) {
            clearInterval(state.autoRefreshInterval);
            state.autoRefreshInterval = null;
        }
        document.getElementById("menuAutoRefresh").innerHTML = 
            '<i class="fas fa-sync-alt" aria-hidden="true"></i><span>Bật làm mới tự động</span>';
        
        // Show manual refresh button
        if (elements.refreshBtn) {
            elements.refreshBtn.style.display = "flex";
        }
        
        // Show notification
        showNotification("Đã tắt làm mới tự động");
    }
    
    // Save state to localStorage
    localStorage.setItem('autoRefreshEnabled', state.isAutoRefreshEnabled);
}

// Show notification - Tối ưu
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listeners - Tối ưu
function initEventListeners() {
// Handle show full TKB button - Hiển thị trong modal
elements.showFullBtn.addEventListener("click", function() {
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !isExpanded);
    
    if (isExpanded) {
        // Nếu modal đang mở, đóng nó và đặt lại trạng thái nút
        closeTkbFullPopup();
        return;
    }

    // Hiển thị modal TKB Full
    showTkbFullPopup();
});
    // Thêm sự kiện đóng modal TKB Full
    elements.tkbFullClose.addEventListener("click", closeTkbFullPopup);
    
    // Close popup when clicking outside
    elements.tkbFullPopup.addEventListener("click", (e) => {
        if (e.target === elements.tkbFullPopup) {
            closeTkbFullPopup();
        }
    });
    
    // Close popup when pressing Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.tkbFullPopup.classList.contains("open")) {
            closeTkbFullPopup();
        }
    });
    
    // Handle orientation change
    window.addEventListener("orientationchange", function() {
        resizeCanvas();
        setTimeout(function() {
            renderTodayTKB();
        }, 300);
    });
    
    // Add touch event for better mobile experience
    document.addEventListener("touchstart", function() {}, {
        passive: true
    });
}

// Hàm hiển thị modal TKB Full
function showTkbFullPopup() {
    // Tạo nội dung TKB full
    let html = '';
    
    for (let k = 1; k <= 5; k++) {
        html += `<div class="day-container scroll-fade">`;
        html += `<div class="day-header">${dayNames[k]}</div>`;
        html += `<div class="session-container">`;

        // Morning
        html += `<div class="session-header morning-header">🌅 Buổi sáng</div>`;
        html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (state.currentData.tkb[k]) {
            state.currentData.tkb[k].filter(p => p.buoi === "Sáng").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;

        // Afternoon
        html += `<div class="session-header afternoon-header">🌆 Buổi chiều</div>`;
        html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
        if (state.currentData.tkb[k]) {
            state.currentData.tkb[k].filter(p => p.buoi === "Chiều").forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
        }
        html += `</tbody></table>`;

        html += `<div class="truc-container">`;
        html += `<strong>🧹 Lịch trực: </strong>`;
        html += `<span>${state.currentData.tkb[k]?.[0]?.truc || 'Không có dữ liệu'}</span>`;
        html += `</div>`;

        html += `</div></div>`;
    }

    // Thêm nội dung vào modal
    elements.tkbFullContent.innerHTML = html;
    
    // Hiển thị modal
    elements.tkbFullPopup.classList.add("open");
    document.body.classList.add("popup-open");
    document.body.style.overflow = "hidden";
    
    // Cập nhật trạng thái nút
    elements.showFullBtn.setAttribute("aria-expanded", "true");
    elements.showFullBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Ẩn toàn bộ';
    
    // Khởi tạo hiệu ứng scroll fade cho các phần tử mới
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

// Hàm đóng modal TKB Full và đặt lại trạng thái nút
function closeTkbFullPopup() {
    elements.tkbFullPopup.classList.remove("open");
    document.body.classList.remove("popup-open");
    document.body.style.overflow = "";
    
    // Đặt lại trạng thái nút về "Xem toàn bộ TKB"
    elements.showFullBtn.setAttribute("aria-expanded", "false");
    elements.showFullBtn.innerHTML = '<i class="fas fa-calendar-week" aria-hidden="true"></i> Xem toàn bộ TKB';
}

// Refresh button - Tối ưu
function initRefreshButton() {
    if (!elements.refreshBtn) return;

    elements.refreshBtn.addEventListener("click", async () => {
        if (state.isLoading) return;
        
        // Add spin effect to icon
        const icon = elements.refreshBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
        
        await loadAllData();
        
        // Remove spin effect
        if (icon) {
            icon.classList.remove('fa-spin');
        }
    });
}

// Scroll animations - Tối ưu
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

// Initialize app - Tối ưu
function initApp() {
    // Apply theme
    applyThemeFromStorage();
    
    // Initialize auto refresh
    const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
    const isAutoRefresh = savedAutoRefresh === null || savedAutoRefresh === 'true';
    
    if (isAutoRefresh) {
        enableAutoRefresh();
    } else {
        disableAutoRefresh();
    }
    
    // Initialize components
    initCanvas();
    createParticles();
    initMenu();
    initPopup();
    initTabNavigation();
    initEventListeners();
    
    // Open popup if needed
    openPopup(false);

    // Load data
    loadAllData().then(() => {
        const checkRendered = () => {
            const containers = [
                elements.btvnContainer,
                elements.tkbContainer,
                elements.changelogContainer
            ];
            
            return containers.every(container => 
                container.innerHTML.trim() !== "Đang tải dữ liệu..."
            );
        };
        
        const waitForRender = () => {
            if (checkRendered()) {
                hideLoadingScreen();
            } else {
                setTimeout(waitForRender, 100);
            }
        };
        
        waitForRender();
    });
    
    // Initialize refresh button
    initRefreshButton();
    
    // Set up timer for TKB refresh
    state.refreshTimer = setInterval(renderTodayTKB, 60 * 1000);
    
    // Optimize animations
    requestIdleCallback(() => {
        optimizeAnimations();
    });
    
    // Mobile optimizations
    if (isMobileDevice()) {
        optimizeForMobile();
    }
    
    // Mark app as loaded
    document.body.classList.add("loaded");
}

// Helper functions - Tối ưu
function enableAutoRefresh() {
    state.isAutoRefreshEnabled = true;
    state.autoRefreshInterval = setInterval(autoRefreshData, 20000);
    updateAutoRefreshButton(true);
    
    if (elements.refreshBtn) {
        elements.refreshBtn.style.display = "none";
    }
    
    localStorage.setItem('autoRefreshEnabled', 'true');
}

function disableAutoRefresh() {
    state.isAutoRefreshEnabled = false;
    
    if (state.autoRefreshInterval) {
        clearInterval(state.autoRefreshInterval);
        state.autoRefreshInterval = null;
    }
    
    updateAutoRefreshButton(false);
    
    if (elements.refreshBtn) {
        elements.refreshBtn.style.display = "flex";
    }
    
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

function optimizeAnimations() {
    const fadeEls = document.querySelectorAll('.fade-in-text');
    fadeEls.forEach((el, i) => el.style.animationDelay = `${i * 0.1}s`);
    
    const animEls = document.querySelectorAll('.animate-item');
    animEls.forEach((el, i) => el.style.animationDelay = `${0.2 + i * 0.05}s`);
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function optimizeForMobile() {
    document.body.classList.add("mobile-device");
    
    // Optimize popup
    elements.popupCard.style.cssText = `
        max-height: 80vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    `;
    
    // Optimize tables
    document.querySelectorAll('table').forEach(table => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
            overflow-x: auto;
            margin-bottom: 10px;
        `;
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
    
    // Optimize buttons
    document.querySelectorAll('button, .menu-btn, #showFullBtn').forEach(button => {
        button.style.cssText = `
            min-height: 44px;
            min-width: 44px;
        `;
    });
    
    // Optimize menu
    elements.menuPanel.style.cssText = `
        max-height: 70vh;
        overflow-y: auto;
    `;
}

// Debug function
function debugTheme() {
    console.log("=== DEBUG THEME ===");
    console.log("Body classes:", document.body.className);
    console.log("Computed background:", getComputedStyle(document.body).background);
    console.log("Computed color:", getComputedStyle(document.body).color);
    console.log("Theme từ localStorage:", localStorage.getItem("theme"));
    console.log("Color theme từ localStorage:", localStorage.getItem("colorTheme"));
    console.log("=== END DEBUG ===");
}

// Add debug button (development only)
function addDebugButton() {
    const debugBtn = document.createElement("button");
    debugBtn.textContent = "Debug Theme";
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 9999;
        padding: 5px;
        background: red;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    `;
    
    debugBtn.addEventListener("click", debugTheme);
    
    document.body.appendChild(debugBtn);
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Cleanup when page is closed
window.addEventListener("beforeunload", () => {
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }
    if (state.meteorInterval) {
        clearInterval(state.meteorInterval);
    }
    if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
    }
    if (state.autoRefreshInterval) {
        clearInterval(state.autoRefreshInterval);
    }
});