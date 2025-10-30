// script.js - Phiên bản Redesign (Tối ưu hóa + Fix lỗi + Tính năng Ngày mai)

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
    canvasInitialized: false // Cờ cho lazy-init canvas
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

// --- Data functions (Giữ nguyên logic) ---
const SUBJECT_LIST = [
    "Toán - Đại số", "Toán - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
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
        "Toán - Đại số", "Toán - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
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
        'Địa lí': '📘', 'Toán - Đại số': '➗', 'Toán - Hình học': '📐', 'Ngữ văn': '✍',
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
    const tomorrowDayIndex = (d.getDay() + 1) % 7; // 0 = CN, 1 = T2, ...
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
});