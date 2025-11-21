/* * LIQUID GLASS OS 2.2 - ULTIMATE UPDATE */

// --- CẤU HÌNH ƯU TIÊN MÔN HỌC ---
const SUBJECT_PRIORITY = [
    "toán", "đại số", "hình học",
    "ngữ văn", "văn",
    "tiếng anh", "anh",
    "khtn", "vật lí", "lý", "hóa học", "hóa", "sinh học", "sinh",
    "khxh", "lịch sử", "sử", "địa lí", "địa", "gdcd",
    "tin học", "tin",
    "công nghệ",
    "thể dục", "gdtc",
    "nghệ thuật", "âm nhạc", "mĩ thuật",
    "hđtn", "gdđp", "shl", "chào cờ"
];

// State Management
const state = {
    tkb: [],
    btvn: [],
    updates: [],
    theme: localStorage.getItem('theme') || 'blue',
    isDark: localStorage.getItem('dark') === 'true',
    isLiquid: localStorage.getItem('liquid') !== 'false',
    isAutoRefresh: localStorage.getItem('autoRefresh') === 'true',
    tomorrowSubjects: [] 
};

let autoRefreshInterval = null;

// DOM Cache
const E = {
    loading: document.getElementById('loading-screen'),
    tabs: document.querySelectorAll('.tab-item'),
    panels: document.querySelectorAll('.tab-panel'),
    btvnContainer: document.getElementById('container-btvn'),
    tkbContainer: document.getElementById('container-tkb-today'),
    updatesContainer: document.getElementById('container-updates'),
    fullWeekContent: document.getElementById('content-full-week'),
    themeToggle: document.getElementById('btn-theme-toggle'),
    switchDark: document.getElementById('switch-darkmode'),
    switchLiquid: document.getElementById('switch-liquid'),
    switchAutoRefresh: document.getElementById('switch-autorefresh'),
    dockRefreshBtn: document.querySelector('[data-action="refresh"]'),
    dockContainer: document.querySelector('.glass-dock')
};

const getSubjectIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('toán'))      return '<i class="fas fa-calculator"></i>';
    if (n.includes('đại số'))    return '<i class="fas fa-square-root-variable"></i>';
    if (n.includes('hình'))      return '<i class="fas fa-draw-polygon"></i>';
    if (n.includes('văn'))       return '<i class="fas fa-feather-alt"></i>';
    if (n.includes('anh'))       return '<i class="fas fa-language"></i>';
    if (n.includes('lý') || n.includes('vật lí')) return '<i class="fas fa-atom"></i>';
    if (n.includes('hóa'))       return '<i class="fas fa-flask"></i>';
    if (n.includes('sinh'))      return '<i class="fas fa-dna"></i>';
    if (n.includes('sử'))        return '<i class="fas fa-landmark"></i>';
    if (n.includes('địa'))       return '<i class="fas fa-globe-asia"></i>';
    if (n.includes('gdcd'))      return '<i class="fas fa-balance-scale"></i>';
    if (n.includes('tin'))       return '<i class="fas fa-laptop-code"></i>';
    if (n.includes('công nghệ')) return '<i class="fas fa-microchip"></i>';
    if (n.includes('thể dục') || n.includes('gdtc')) return '<i class="fas fa-running"></i>';
    if (n.includes('gdđp'))      return '<i class="fas fa-map-marked-alt"></i>';
    if (n.includes('mĩ thuật'))  return '<i class="fas fa-palette"></i>';
    if (n.includes('âm nhạc'))   return '<i class="fas fa-music"></i>';
    if (n.includes('hđtn'))      return '<i class="fas fa-users"></i>';
    if (n.includes('chào cờ'))   return '<i class="fas fa-flag"></i>';
    if (n.includes('shl'))       return '<i class="fas fa-clipboard-list"></i>';
    return '<i class="fas fa-book"></i>';
};

async function initApp() {
    applyTheme();
    applyAutoRefreshState();
    setupEventListeners();
    
    try {
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast("Lỗi kết nối dữ liệu!");
    } finally {
        setTimeout(() => {
            E.loading.style.opacity = '0';
            setTimeout(() => E.loading.remove(), 500);
        }, 800);
    }
}

async function fetchData(isSilent = false) {
    const [resBtvn, resTkb, resLog] = await Promise.all([
        window.supabase.from('btvn').select('*'),
        window.supabase.from('tkb').select('*').order('tiet', { ascending: true }),
        window.supabase.from('changelog').select('*').order('created_at', { ascending: false })
    ]);

    state.btvn = resBtvn.data || [];
    state.tkb = resTkb.data || [];
    state.updates = resLog.data || [];

    renderBTVN();
    renderTKB();
    renderUpdates();
    
    if(isSilent) console.log("Auto-refresh: " + new Date().toLocaleTimeString());
}

// --- RENDER FUNCTIONS ---

function renderBTVN() {
    E.btvnContainer.innerHTML = '';
    if (!state.btvn.length) {
        E.btvnContainer.innerHTML = `<div class="text-center" style="color:var(--text-sec); margin-top:20px;">Không có bài tập nào! 🎉</div>`;
        return;
    }

    const grouped = state.btvn.reduce((acc, item) => {
        const subj = item.subject || 'Khác';
        if (!acc[subj]) acc[subj] = [];
        acc[subj].push(item);
        return acc;
    }, {});

    // Sort keys by priority
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        let idxA = SUBJECT_PRIORITY.indexOf(a.toLowerCase());
        let idxB = SUBJECT_PRIORITY.indexOf(b.toLowerCase());
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    const frag = document.createDocumentFragment();
    sortedKeys.forEach(subj => {
        const items = grouped[subj];
        const card = document.createElement('div');
        card.className = 'subject-card';
        
        const cleanSubj = subj.toLowerCase();
        if (state.tomorrowSubjects.includes(cleanSubj)) card.classList.add('highlight-tomorrow');

        let listHtml = items.map(i => `<li class="btvn-item">${i.content || i.note}</li>`).join('');
        card.innerHTML = `
            <div class="subject-title">${getSubjectIcon(subj)} ${subj}</div>
            <ul>${listHtml}</ul>
        `;
        frag.appendChild(card);
    });
    E.btvnContainer.appendChild(frag);
}

function renderTKB() {
    const now = new Date();
    let day = now.getDay();
    const hour = now.getHours();

    let showDay = day;
    let isNextDay = false;

    if (day >= 1 && day <= 5 && hour >= 16) { showDay = day + 1; isNextDay = true; }
    if (day === 6 || day === 0) { showDay = 1; isNextDay = true; }

    const dayName = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][showDay];
    const dayData = state.tkb.filter(item => Number(item.day) === showDay);

    const morning = dayData.filter(i => {
        const b = (i.buoi || '').toLowerCase().trim();
        if (b.includes('chiều')) return false;
        if (b.includes('sáng')) return true;
        return i.tiet <= 5;
    }).sort((a, b) => a.tiet - b.tiet);

    const afternoon = dayData.filter(i => {
        const b = (i.buoi || '').toLowerCase().trim();
        if (b.includes('sáng')) return false;
        if (b.includes('chiều')) return true;
        return i.tiet > 5;
    }).sort((a, b) => a.tiet - b.tiet);

    state.tomorrowSubjects = dayData.map(i => (i.subject || '').toLowerCase());
    if(document.querySelectorAll('.subject-card').length > 0) renderBTVN();

    let html = `<div class="session-title" style="color:var(--primary); font-size:1.1em;">📅 ${isNextDay ? 'Ngày mai: ' : 'Hôm nay: '} ${dayName}</div>`;

    const renderSession = (title, data) => {
        if (!data.length) return '';
        const icon = title === 'Sáng' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-cloud-sun"></i>';
        let rows = data.map(i => `
            <tr>
                <td style="width:50px; font-weight:bold; color:var(--text-sec); text-align:center;">Tiết ${i.tiet}</td>
                <td><span style="color:var(--primary); margin-right:5px;">${getSubjectIcon(i.subject)}</span><b style="color:var(--text-main);">${i.subject}</b></td>
            </tr>
        `).join('');
        return `<div class="session-title" style="margin-top:12px; color:var(--primary);">${icon} Buổi ${title}</div>
            <div class="card" style="padding:0; overflow:hidden;"><table class="tkb-table" style="width:100%;"><tbody>${rows}</tbody></table></div>`;
    };

    html += renderSession('Sáng', morning);
    html += renderSession('Chiều', afternoon);
    
    if(!morning.length && !afternoon.length) {
        html += `<div class="card" style="text-align:center; padding:30px; color:var(--text-sec);">
                <i class="fas fa-mug-hot" style="font-size:24px; margin-bottom:10px; display:block;"></i>Không có lịch học.
            </div>`;
    }
    E.tkbContainer.innerHTML = html;
    renderFullWeek();
}

function renderFullWeek() {
    const days = [1,2,3,4,5,6];
    let html = '';
    days.forEach(d => {
        const dData = state.tkb.filter(i => Number(i.day) === d);
        if(!dData.length) return;
        const dName = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d];
        html += `<div class="session-title" style="margin-top:20px; border-bottom:1px solid var(--glass-border)">${dName}</div>
        <div class="tkb-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">`;
        dData.forEach(i => {
            html += `<div style="font-size:13px; padding:8px; background:rgba(255,255,255,0.1); border-radius:8px;">
                <span style="color:var(--text-sec)">T${i.tiet}</span> <b>${i.subject}</b>
            </div>`;
        });
        html += `</div>`;
    });
    E.fullWeekContent.innerHTML = html;
}

function renderUpdates() {
    if (!state.updates.length) {
        E.updatesContainer.innerHTML = '<div class="text-center" style="color:var(--text-sec); padding:20px;">Chưa có thông báo mới.</div>';
        return;
    }
    E.updatesContainer.innerHTML = state.updates.map(u => {
        const content = u.content || u.text || '';
        let dateDisplay = '';
        if (u.created_at) {
            const date = new Date(u.created_at);
            dateDisplay = date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        }
        return `<div class="card">
            <div style="font-weight:600; margin-bottom:6px; color:var(--primary);"><i class="fas fa-bullhorn"></i> Thông báo</div>
            <div style="font-size:14px; line-height:1.5; color:var(--text-main); white-space: pre-wrap;">${content}</div>
            <div style="font-size:11px; color:var(--text-sec); margin-top:10px; text-align:right; font-style:italic;">${dateDisplay}</div>
        </div>`;
    }).join('');
}

// --- INTERACTIONS ---

function setupEventListeners() {
    // Liquid Tab Logic
    const indicator = document.querySelector('.tab-indicator');
    function moveIndicator(el) {
        if(!el || !indicator) return;
        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    }
    setTimeout(() => moveIndicator(document.querySelector('.tab-item.active')), 200);

    E.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            E.tabs.forEach(t => t.classList.remove('active'));
            E.panels.forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            moveIndicator(e.currentTarget);
            setTimeout(() => document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active'), 50);
        });
    });
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.tab-item.active')));

    // Theme & Settings
    E.themeToggle.addEventListener('click', () => { state.isDark = !state.isDark; applyTheme(); });
    E.switchDark.addEventListener('change', (e) => { state.isDark = e.target.checked; applyTheme(); });
    E.switchLiquid.addEventListener('change', (e) => { state.isLiquid = e.target.checked; document.body.classList.toggle('no-liquid', !state.isLiquid); localStorage.setItem('liquid', state.isLiquid); });
    
    if(E.switchAutoRefresh) {
        E.switchAutoRefresh.addEventListener('change', (e) => {
            state.isAutoRefresh = e.target.checked;
            localStorage.setItem('autoRefresh', state.isAutoRefresh);
            applyAutoRefreshState();
        });
    }

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            state.theme = dot.dataset.color;
            applyTheme();
        });
    });

    // Modals
    document.querySelectorAll('[data-action="settings"]').forEach(btn => btn.addEventListener('click', () => openModal('modal-settings')));
    document.getElementById('btn-full-week').addEventListener('click', () => openModal('modal-tkb'));
    document.querySelectorAll('.btn-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => { if(e.target === el || el.classList.contains('btn-close')) closeModal(); });
    });

    // Manual Refresh
    E.dockRefreshBtn.addEventListener('click', async (e) => {
        if(state.isAutoRefresh) return; 
        const icon = e.currentTarget.querySelector('i');
        icon.classList.add('fa-spin');
        await fetchData();
        setTimeout(() => icon.classList.remove('fa-spin'), 1000);
        showToast('Đã làm mới!');
    });
}

function applyTheme() {
    document.body.classList.toggle('dark', state.isDark);
    localStorage.setItem('dark', state.isDark);
    if(E.switchDark) E.switchDark.checked = state.isDark;

    document.body.className = document.body.className.replace(/theme-\w+/, '').trim();
    document.body.classList.add(`theme-${state.theme}`);
    localStorage.setItem('theme', state.theme);
    document.querySelectorAll('.color-dot').forEach(d => d.classList.toggle('active', d.dataset.color === state.theme));

    document.body.classList.toggle('no-liquid', !state.isLiquid);
    if(E.switchLiquid) E.switchLiquid.checked = state.isLiquid;
}

function applyAutoRefreshState() {
    if(E.switchAutoRefresh) E.switchAutoRefresh.checked = state.isAutoRefresh;
    const dock = document.querySelector('.glass-dock');

    if (state.isAutoRefresh) {
        // SINGLE MODE: Dock co lại, ẩn refresh, nút setting ra giữa
        if(dock) dock.classList.add('single-mode');
        if (!autoRefreshInterval) autoRefreshInterval = setInterval(() => fetchData(true), 30000);
        showToast('Đã bật Tự động làm mới');
    } else {
        if(dock) dock.classList.remove('single-mode');
        if (autoRefreshInterval) { clearInterval(autoRefreshInterval); autoRefreshInterval = null; }
    }
}

function openModal(id) { const m = document.getElementById(id); if(m) m.classList.add('open'); }
function closeModal() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); }
function showToast(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:20px; z-index:9999; font-size:14px; backdrop-filter:blur(10px); animation: fadeInDown 0.3s ease;`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity='0'; setTimeout(() => div.remove(), 300); }, 2000);
}
document.addEventListener('DOMContentLoaded', initApp);