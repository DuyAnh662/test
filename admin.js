// admin.js - Full Version (Fixed Changelog + Liquid Mode)
// Updated: Logic "Ghi đè" Changelog chỉ Insert (không Update).
// Added: Liquid Glass Mode toggle.
// FIXED: Added Confirm Modal and Auto-Expand for Changelog.

window.isLoading = false;

// --- CẤU HÌNH PHÍM TẮT ---
const SHORTCUTS = {
  "kbt": "Không có bài tập",
  "tds": "Toán học - Đại số",
  "thh": "Toán học - Hình học",
  "nv": "Ngữ văn",
  "ta": "Tiếng Anh",
  "vl": "Vật lý",
  "hh": "Hóa học",
  "sh": "Sinh học",
  "ls": "Lịch sử",
  "dl": "Địa lí",
  "gd": "GDCD",
  "tin": "Tin học",
  "cn": "Công nghệ",
  "nhac": "Âm nhạc",
  "mt": "Mĩ thuật",
  "nghi": "Nghỉ",
  "btvn": "Bài tập về nhà: ",
  "KTBC": "Kiểm tra bài cũ",
};

const CONFIG = {
  ADMIN_USERNAME: "admin",
  // Mã HASH SHA-256 của mật khẩu (Ví dụ này là của "123456" - Bạn nên đổi lại theo mật khẩu của bạn)
  ADMIN_PASSWORD_HASH: "329fe68c81dcc05dec93329dd35760318da604549107ec7ccb81d3a7545f54f4",
  TOAST_DURATION: 3000,
};

let pendingAction = null;      // Lưu hành động chờ xác nhận
let programmaticScroll = false; // Cờ để chặn event scroll khi đang tự động cuộn

// --- TIỆN ÍCH (UTILS) ---

// Hàm mã hóa SHA-256
async function sha256Hex(str) {
  if (!crypto.subtle) return "error_no_crypto";
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hàm hiển thị thông báo (Toast)
function showToast(message, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  // Thêm icon cho sinh động
  let icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');
  t.innerHTML = `<span>${icon}</span> ${message}`;
  
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, CONFIG.TOAST_DURATION);
}

// Chuyển giao diện sang Admin Panel
function showAdmin() {
  const loginBox = document.getElementById("login-box");
  const adminPanel = document.getElementById("admin-panel");
  if (loginBox) loginBox.style.display = "none";
  if (adminPanel) adminPanel.style.display = "flex";
  
  // Request notification permission khi vào admin
  try {
    if (window.Notif) window.Notif.ensurePermission().catch(e => console.warn('Notif perm request failed', e));
  } catch (e) { /* ignore */ }
  
  // Load dữ liệu ngay khi vào
  loadData();
}

// --- KHỞI TẠO (DOM READY) ---
document.addEventListener("DOMContentLoaded", () => {
  
  // Các element thường dùng
  const elements = {
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    darkModeToggle: document.getElementById("darkModeToggle"),
    liquidToggle: document.getElementById("liquidToggle"), // Nút Kính Lỏng Mới
    
    pageTitle: document.getElementById("pageTitle"),
    shortcutBtn: document.getElementById("shortcutBtn"),
    mobileShortcutBtn: document.getElementById("mobileShortcutBtn"),
    
    // Inputs
    subject: document.getElementById("subject"),
    btvn_content: document.getElementById("btvn_content"),
    changelog_text: document.getElementById("changelog_text"), // INPUT CHANGELOG
    
    // Modal Confirm
    confirmSend: document.getElementById("confirmSend"),
    cancelSend: document.getElementById("cancelSend"),
    previewSubject: document.getElementById("previewSubject"),
    previewContent: document.getElementById("previewContent"),
    
    // Modal Logout
    confirmLogout: document.getElementById("confirmLogout"),
    cancelLogout: document.getElementById("cancelLogout")
  };

  // 1. XỬ LÝ GIAO DIỆN (THEME)
  
// --- 1. DARK MODE (Xử lý cả PC và Mobile) ---
  function setDarkMode(isDark) {
    if (isDark) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
      // Cập nhật icon cho cả 2 nút
      if (elements.darkModeToggle) elements.darkModeToggle.textContent = "☀️";
      const mobDark = document.getElementById("mobileDarkBtn");
      if (mobDark) mobDark.textContent = "☀️";
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
      if (elements.darkModeToggle) elements.darkModeToggle.textContent = "🌙";
      const mobDark = document.getElementById("mobileDarkBtn");
      if (mobDark) mobDark.textContent = "🌙";
    }
  }
  // Khôi phục trạng thái
  if (localStorage.getItem("darkMode") === "true") setDarkMode(true);
  else setDarkMode(false);
  
  // Bắt sự kiện click cho cả 2 nút
  if (elements.darkModeToggle) elements.darkModeToggle.addEventListener("click", () => setDarkMode(!document.body.classList.contains("dark")));
  document.getElementById("mobileDarkBtn")?.addEventListener("click", () => setDarkMode(!document.body.classList.contains("dark")));


  // --- 2. LIQUID GLASS MODE (Xử lý cả PC và Mobile) ---
  function setLiquidMode(isLiquid) {
    const mobLiq = document.getElementById("mobileLiquidBtn");
    
    if (isLiquid) {
      document.body.classList.add("liquid");
      localStorage.setItem("liquidMode", "true");
      
      // Highlight nút PC
      if (elements.liquidToggle) {
        elements.liquidToggle.style.background = "var(--system-blue)";
        elements.liquidToggle.style.color = "white";
      }
      // Highlight nút Mobile
      if (mobLiq) {
        mobLiq.style.background = "var(--system-blue)";
        mobLiq.style.color = "white";
      }
    } else {
      document.body.classList.remove("liquid");
      localStorage.setItem("liquidMode", "false");
      
      // Bỏ highlight
      if (elements.liquidToggle) {
        elements.liquidToggle.style.background = "";
        elements.liquidToggle.style.color = "";
      }
      if (mobLiq) {
        mobLiq.style.background = "rgba(0,0,0,0.05)"; // Trả về màu mặc định
        mobLiq.style.color = "";
      }
    }
  }
  // Khôi phục trạng thái
  if (localStorage.getItem("liquidMode") === "true") setLiquidMode(true);
  
  // Bắt sự kiện click
  if (elements.liquidToggle) elements.liquidToggle.addEventListener("click", () => setLiquidMode(!document.body.classList.contains("liquid")));
  document.getElementById("mobileLiquidBtn")?.addEventListener("click", () => setLiquidMode(!document.body.classList.contains("liquid")));

  // Render bảng phím tắt
  function renderShortcuts() {
    const tbody = document.getElementById("shortcutTableBody");
    if (!tbody) return;
    tbody.innerHTML = Object.entries(SHORTCUTS)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`)
      .join("");
  }
  
  // 💡 LỜI GỌI HÀM KHẮC PHỤC: Chạy ngay khi DOMContentLoaded
  renderShortcuts();

  // --- REPLACE EXISTING openModal/closeModal and logout bindings WITH THIS BLOCK ---
  // Put this block in admin.js (after renderShortcuts function) to ensure logout modal works reliably.

  function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (!m) {
      console.warn("openModal: modal not found:", modalId);
      return;
    }
    // ensure visible even if CSS/display was unexpected
    m.style.display = 'flex';
    // small timeout to allow layout then add class for animation
    requestAnimationFrame(() => m.classList.add('show'));
  }

  function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (!m) return;
    m.classList.remove('show');
    // keep a small delay before hiding to allow animation to finish
    setTimeout(() => {
      // only hide if still not "show"
      if (!m.classList.contains('show')) m.style.display = 'none';
    }, 240);
  }

  // Robust logout binding (call once)
  (function bindLogoutHandlers() {
    try {
      const logoutBtn = document.getElementById('logoutBtn');
      const mobileLogoutBtn = document.getElementById('mobileLogout');
      const logoutModal = document.getElementById('logoutModal');
      const confirmLogout = document.getElementById('confirmLogout');
      const cancelLogout = document.getElementById('cancelLogout');

      console.log("bindLogoutHandlers: elements:", { logoutBtn, mobileLogoutBtn, logoutModal, confirmLogout, cancelLogout });

      // helper to open logout modal
      const openLogout = (e) => {
        if (e) { e.preventDefault(); try { e.stopPropagation(); } catch(_){} }
        // debug log
        console.log("Logout button clicked -> open logoutModal");
        openModal('logoutModal');
      };

      if (logoutBtn) {
        // remove previous listeners to avoid duplicates
        logoutBtn.onclick = null;
        logoutBtn.removeEventListener && logoutBtn.removeEventListener('click', openLogout);
        logoutBtn.addEventListener('click', openLogout);
      } else {
        console.warn("bindLogoutHandlers: logoutBtn not found");
      }

      if (mobileLogoutBtn) {
        mobileLogoutBtn.onclick = null;
        mobileLogoutBtn.removeEventListener && mobileLogoutBtn.removeEventListener('click', openLogout);
        mobileLogoutBtn.addEventListener('click', openLogout);
      }

      if (confirmLogout) {
        confirmLogout.onclick = null;
        confirmLogout.removeEventListener && confirmLogout.removeEventListener('click', doLogout);
        confirmLogout.addEventListener('click', () => {
          closeModal('logoutModal');
          // small delay so modal animation closes before reload
          setTimeout(() => doLogout(), 180);
        });
      } else {
        console.warn("bindLogoutHandlers: confirmLogout not found");
      }

      if (cancelLogout) {
        cancelLogout.onclick = null;
        cancelLogout.removeEventListener && cancelLogout.removeEventListener('click', () => closeModal('logoutModal'));
        cancelLogout.addEventListener('click', () => closeModal('logoutModal'));
      }

      // Debug helper: allow manual showing if needed from console
      window._showLogoutDebug = () => openModal('logoutModal');

    } catch (err) {
      console.error("bindLogoutHandlers error:", err);
    }
  })();
  
  // Modal handlers
  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.target));
  });
  
  if (elements.shortcutBtn) elements.shortcutBtn.addEventListener("click", () => openModal("shortcutModal"));
  if (elements.mobileShortcutBtn) elements.mobileShortcutBtn.addEventListener("click", () => openModal("shortcutModal"));

  // 3. AUTO EXPAND TEXTAREA (Gõ tắt tự động bung ra)
  document.querySelectorAll(".auto-expand").forEach(textarea => {
    textarea.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") {
        const cursorPos = textarea.selectionStart;
        const text = textarea.value;
        const before = text.slice(0, cursorPos);
        const match = before.match(/(\S+)\s$/); // Tìm từ vừa gõ trước dấu cách
        if (match && SHORTCUTS[match[1]]) {
          const expanded = SHORTCUTS[match[1]];
          // Thay thế từ viết tắt bằng từ đầy đủ
          textarea.value = text.slice(0, cursorPos - match[1].length - 1) + expanded + (e.key === "Enter" ? "\n" : " ") + text.slice(cursorPos);
          // Đặt lại con trỏ chuột đúng vị trí
          const newPos = cursorPos - match[1].length + expanded.length;
          textarea.setSelectionRange(newPos, newPos);
        }
      }
    });
  });

  // 4. SCROLL SPY & NAVIGATION (Logic cuộn trang và active tab)
  // Chỉ chọn các nút có thuộc tính data-tab (Tức là nút chuyển trang, bỏ qua nút thoát)
  const tabs = document.querySelectorAll(".nav-tab[data-tab]");
  const tabContents = document.querySelectorAll(".admin-tab-content");
  const container = document.getElementById("mainScroll");
  const pageTitles = {
    "tab-btvn": "Quản lý Bài Tập",
    "tab-tkb": "Thời Khóa Biểu",
    "tab-changelog": "Lịch Sử Log",
    "tab-data": "Dữ liệu thô"
  };

  function updateActiveUI(sectionId) {
    if (!sectionId) sectionId = "tab-btvn";
    if (elements.pageTitle) elements.pageTitle.textContent = pageTitles[sectionId] || "Admin";
    
    // Update Tabs
    document.querySelectorAll(".nav-tab").forEach(t => {
      if (t.dataset.tab === sectionId) t.classList.add("active");
      else t.classList.remove("active");
    });
    // Update Content opacity (for fade effect)
    tabContents.forEach(c => {
      if (c.id === sectionId) c.classList.add("active");
      else c.classList.remove("active");
    });
  }

  function determineActiveSection() {
    if (programmaticScroll) return; // Bỏ qua nếu đang tự cuộn bằng code
    
    const scrollSource = (window.innerWidth > 768) ? container : window;
    const scrollTop = (window.innerWidth > 768) ? container.scrollTop : window.scrollY;
    const viewHeight = (window.innerWidth > 768) ? container.clientHeight : window.innerHeight;
    const center = scrollTop + viewHeight / 2;

    let best = null;
    tabContents.forEach(s => {
      const rect = s.getBoundingClientRect();
      // Tính toán vị trí tương đối
      let secCenter;
      if (window.innerWidth > 768) {
         secCenter = s.offsetTop + s.offsetHeight / 2; 
      } else {
         secCenter = window.scrollY + rect.top + rect.height / 2;
      }
      
      const dist = Math.abs(secCenter - center);
      if (!best || dist < best.dist) best = { id: s.id, dist };
    });

    if (best) updateActiveUI(best.id);
  }

  function scrollToSection(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    programmaticScroll = true;
    
    if (window.innerWidth <= 768) {
      // Mobile: Scroll window
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    } else {
      // PC: Scroll container
      const targetTop = el.offsetTop - 20; // padding top
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    setTimeout(() => {
      programmaticScroll = false;
      updateActiveUI(elementId);
    }, 600);
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      scrollToSection(tab.dataset.tab);
    });
  });

  // Listeners cho scroll
  if (container) container.addEventListener("scroll", () => setTimeout(determineActiveSection, 100));
  window.addEventListener("scroll", () => setTimeout(determineActiveSection, 100));


  // 5. BTVN LOGIC (Chuẩn bị & Gửi)
  function prepareBTVN(actionType) {
    const subject = elements.subject ? elements.subject.value : "";
    let rawContent = elements.btvn_content ? elements.btvn_content.value : "";
    
    if (!subject || !rawContent) { showToast("Vui lòng nhập đủ thông tin!", "error"); return; }

    // Auto expand lần cuối cho chắc
    const words = rawContent.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (SHORTCUTS[lastWord]) {
      rawContent = rawContent.replace(new RegExp(lastWord + "$"), SHORTCUTS[lastWord]);
    }

    // Điền vào modal
    if (elements.previewSubject) elements.previewSubject.textContent = subject;
    if (elements.previewContent) elements.previewContent.textContent = rawContent;

    // Lưu hành động pending
    pendingAction = {
      action: actionType === 'add' ? 'addBTVN' : 'overwriteBTVN',
      item: { subject, content: rawContent, date: new Date().toISOString() }
    };
    openModal("confirmModal");
  }

  // Buttons click
  document.getElementById("updateBTVN")?.addEventListener("click", () => prepareBTVN('overwrite'));
  document.getElementById("addNewBTVN")?.addEventListener("click", () => prepareBTVN('add'));

  // Modal Confirm Actions (ĐÃ SỬA: Bổ sung logic clear input Changelog)
  elements.confirmSend?.addEventListener("click", async () => {
    if (pendingAction) {
      const actionToPost = pendingAction;
      pendingAction = null;
      closeModal("confirmModal");
      
      try {
        await postData(actionToPost);
        
        // --- LOGIC CLEAR INPUT & SYNC LOG ---
        if (actionToPost.action.includes('BTVN')) {
            await syncChangelogForSubject(actionToPost.item.subject);
            // Clear BTVN input
            if (elements.btvn_content) elements.btvn_content.value = "";
        } else if (actionToPost.action === 'updateChangelog') {
            // Clear Changelog input
            if (elements.changelog_text) elements.changelog_text.value = "";
        }
        // --- END LOGIC CLEAR INPUT & SYNC LOG ---
        
      } catch (err) {
        console.error("Gửi thất bại:", err);
      }
    }
  });
  elements.cancelSend?.addEventListener("click", () => { pendingAction = null; closeModal("confirmModal"); });


  // 6. CHANGELOG LOGIC (ĐÃ SỬA LOGIC GHI ĐÈ & THÊM MODAL CONFIRM)
  function prepareChangelog(overwrite) {
    let rawText = elements.changelog_text ? elements.changelog_text.value : "";
    
    if (!rawText) { showToast("Vui lòng nhập nội dung Changelog!", "error"); return; }
    
    // Auto expand lần cuối cho chắc (Giống logic BTVN)
    const words = rawText.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (SHORTCUTS[lastWord]) {
      rawText = rawText.replace(new RegExp(lastWord + "$"), SHORTCUTS[lastWord]);
    }

    // Điền vào modal
    if (elements.previewSubject) elements.previewSubject.textContent = overwrite ? "CHRONOLOGY: THÊM MỚI (XÓA CŨ)" : "CHRONOLOGY: GHI ĐÈ (GIỮ CŨ)";
    if (elements.previewContent) elements.previewContent.textContent = rawText;

    // Lưu hành động pending
    pendingAction = {
      action: "updateChangelog",
      item: { text: rawText },
      overwrite: overwrite
    };
    openModal("confirmModal");
  }
  
  const btnUpdateLog = document.getElementById("updateChangelog"); // Nút "Ghi đè (Giữ cũ)"
  if (btnUpdateLog) {
    // Thay thế logic gửi trực tiếp bằng logic mở Modal
    btnUpdateLog.addEventListener("click", () => prepareChangelog(false));
  }

  const btnNewLog = document.getElementById("addNewChangelog"); // Nút "Thêm mới (Xóa cũ)"
  if (btnNewLog) {
    // Thay thế logic gửi trực tiếp bằng logic mở Modal
    btnNewLog.addEventListener("click", () => prepareChangelog(true));
  }


  // 7. TKB LOGIC (Tạo hàng & Gửi)
  const subjects = ["Nghỉ", "Toán học - Đại số", "Toán học - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GDCD", "Tin học", "Công nghệ", "GDTC", "HĐTN", "GDĐP", "Mĩ thuật", "Âm nhạc"];
  
  function createRow(buoi, tiet) {
    const div = document.createElement("div"); 
    div.className = "tkb-period-row";
    div.innerHTML = `
      <label>Tiết ${tiet}</label>
      <select class="period-subject" data-buoi="${buoi}" data-tiet="${tiet}">
        ${subjects.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>
    `;
    return div;
  }
  
  const sContainer = document.getElementById("tkb-sang-container");
  const cContainer = document.getElementById("tkb-chieu-container");
  
  // Render 5 tiết sáng/chiều
  if (sContainer && sContainer.children.length === 0) {
     for (let i = 1; i <= 5; i++) sContainer.appendChild(createRow("Sáng", i));
  }
  if (cContainer && cContainer.children.length === 0) {
     for (let i = 1; i <= 5; i++) cContainer.appendChild(createRow("Chiều", i));
  }

  document.getElementById("updateTKB")?.addEventListener("click", () => {
    const day = document.getElementById("tkb_day").value;
    const truc = document.getElementById("tkb_truc").value;
    if (!day || !truc) return showToast("Chưa chọn Thứ hoặc Tổ trực!", "error");
    
    const periods = [];
    document.querySelectorAll(".period-subject").forEach(s => { 
      if (s.value !== "Nghỉ") {
        periods.push({ buoi: s.dataset.buoi, tiet: s.dataset.tiet, subject: s.value });
      }
    });
    
    postData({ 
      action: "updateTKB", 
      item: { day, truc, periods: JSON.stringify(periods) }, 
      overwrite: true 
    });
  });
  
  document.getElementById("updateTrucOnly")?.addEventListener("click", () => {
    const day = document.getElementById("tkb_day").value;
    const truc = document.getElementById("tkb_truc").value;
    if (!day || !truc) return showToast("Chưa chọn Thứ hoặc Tổ trực!", "error");
    
    postData({ action: "updateTrucOnly", item: { day, truc } });
  });


  // 8. DATA VIEWER
  document.getElementById("refreshData")?.addEventListener("click", loadData);

  // 8.5. ADMIN NOTIFICATION HANDLERS (Gửi thông báo tự do)
  try {
    const adminNotifPass = document.getElementById('admin-notif-pass');
    const adminNotifTitle = document.getElementById('admin-notif-title');
    const adminNotifBody = document.getElementById('admin-notif-body');
    const btnAdminTestPerm = document.getElementById('btn-admin-test-perm');
    const btnAdminSendNotif = document.getElementById('btn-admin-send-notif');

    const ADMIN_PASSWORD_PLAIN = '12345678900987645'; // Mật khẩu admin (đã cập nhật)

    if (btnAdminTestPerm) {
      btnAdminTestPerm.addEventListener('click', async () => {
        try {
          // Gọi Notif module từ script.js (nó được expose lên window)
          if (window.Notif) {
            // Force request quyền (không chỉ check)
            const ok = await window.Notif.requestPermission();
            showToast(ok ? '✓ Quyền thông báo: Đã cấp' : '✗ Quyền thông báo: Bị từ chối hoặc chưa cấp', ok ? 'success' : 'error');
          } else {
            showToast('⚠️ Module Notif chưa sẵn sàng', 'error');
          }
        } catch (e) {
          console.warn('Test permission failed', e);
          showToast('❌ Lỗi: ' + e.message, 'error');
        }
      });
    }

    if (btnAdminSendNotif) {
      btnAdminSendNotif.addEventListener('click', async () => {
        const pass = adminNotifPass ? adminNotifPass.value : '';
        const title = adminNotifTitle ? adminNotifTitle.value.trim() : '';
        const body = adminNotifBody ? adminNotifBody.value.trim() : '';

        // Kiểm tra mật khẩu
        if (pass !== ADMIN_PASSWORD_PLAIN) {
          showToast('❌ Mật khẩu sai!', 'error');
          return;
        }

        // Kiểm tra tiêu đề và nội dung
        if (!title || !body) {
          showToast('⚠️ Vui lòng nhập đủ tiêu đề và nội dung', 'error');
          return;
        }

        try {
            // Gửi thông báo qua BroadcastChannel tới index.html
            let sent = false;
            try {
              const bc = new BroadcastChannel('admin-notif');
              bc.postMessage({ title, body, data: { type: 'admin-manual' } });
              sent = true;
              showToast('✓ Đã gửi thông báo tới trang chính!', 'success');
            } catch (e) {
              // Nếu không hỗ trợ BroadcastChannel, gửi local
              if (window.Notif) {
                const ok = await window.Notif.requestPermission();
                if (ok) {
                  window.Notif.show(title, body, { type: 'admin-manual' });
                  showToast('✓ Đã gửi thông báo cục bộ!', 'success');
                  sent = true;
                }
              }
              if (!sent) showToast('❌ Không gửi được thông báo (trình duyệt không hỗ trợ)', 'error');
            }
            // Clear form nếu gửi thành công
            if (sent) {
              adminNotifPass.value = '';
              adminNotifTitle.value = '';
              adminNotifBody.value = '';
            }
        } catch (e) {
          console.error('Send notification failed', e);
          showToast('❌ Lỗi gửi thông báo: ' + e.message, 'error');
        }
      });
    }
  } catch (e) {
    console.warn('Admin notification handlers setup failed', e);
  }


// admin.js - MỤC 9. AUTHENTICATION (Thay thế toàn bộ)

// 9. AUTHENTICATION (Đăng nhập / Đăng xuất)
  if (localStorage.getItem("adminLogged") === "true") showAdmin();

  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      try {
        const h = await sha256Hex(p);
        if (u === CONFIG.ADMIN_USERNAME && h === CONFIG.ADMIN_PASSWORD_HASH) {
          localStorage.setItem("adminLogged", "true");
          showAdmin();
          showToast("Đăng nhập thành công!", "success");
        } else {
          showToast("Sai mật khẩu", "error");
        }
      } catch (err) {
        showToast("Lỗi hệ thống: " + err, "error");
      }
    });
  }

  function doLogout() {
    localStorage.removeItem("adminLogged");
    showToast("Đã đăng xuất", "success");
    setTimeout(() => location.reload(), 500);
  }

  // ---------------------------------------------------------
  // MAIN FUNCTION: POST DATA TO SUPABASE
  // ---------------------------------------------------------
  async function postData(data) {
    if (window.isLoading) return;
    window.isLoading = true;
    showToast("Đang gửi dữ liệu...", "info");

    try {
      if (typeof supabase === 'undefined') throw new Error("Supabase chưa được tải!");
      const { action, item, overwrite } = data;

      // LOGIC SỬA CHÍNH Ở ĐÂY:
      if (action === "updateChangelog") {
        if (overwrite) {
          // Nút "Thêm mới (Xóa cũ)": Xóa hết -> Thêm mới
          console.log("Action: Delete ALL Changelog & Insert");
          await supabase.from("changelog").delete().not("text", "is", null); // Delete all trick
          await supabase.from("changelog").insert([item]);
          showToast("Đã làm mới toàn bộ Changelog", "success");
        } else {
          // Nút "Ghi đè (Giữ cũ)": CHỈ INSERT, KHÔNG UPDATE
          console.log("Action: Insert into Changelog (Keep history)");
          await supabase.from("changelog").insert([item]);
          showToast("Đã thêm log mới thành công", "success");
        }
      } 
      else if (action === "addBTVN") {
        await supabase.from("btvn").insert([item]);
        showToast("Thêm BTVN thành công", "success");
      } 
      else if (action === "overwriteBTVN") {
        await supabase.from("btvn").delete().eq("subject", item.subject);
        await supabase.from("btvn").insert([item]);
        showToast("Cập nhật BTVN thành công", "success");
      } 
      else if (action === "updateTKB") {
        await supabase.from("tkb").delete().eq("day", item.day);
        const rows = JSON.parse(item.periods).map(p => ({ 
            day: item.day, buoi: p.buoi, tiet: p.tiet, subject: p.subject, truc: item.truc 
        }));
        if (rows.length) await supabase.from("tkb").insert(rows);
        showToast("Cập nhật TKB thành công", "success");
      } 
      else if (action === "updateTrucOnly") {
        await supabase.from("tkb").update({ truc: item.truc }).eq("day", item.day);
        showToast("Cập nhật Tổ trực thành công", "success");
      }

      // Tải lại dữ liệu để xem
      await loadData();
      
    } catch (err) {
      console.error(err);
      showToast("Lỗi: " + (err.message || "Không rõ"), "error");
    } finally {
      window.isLoading = false;
    }
  }

  // Helper: Auto Sync Log (1h/10h rule)
  async function syncChangelogForSubject(subjectText) {
    if (typeof supabase === 'undefined') return;
    try {
      const res = await supabase.from("changelog").select("*").order("created_at", { ascending: false }).limit(1);
      const latest = (res.data && res.data.length) ? res.data[0] : null;

      const now = new Date();
      const contentWithTs = `${subjectText} — ${now.toLocaleTimeString('vi-VN')}`;

      // Nếu không có log nào hoặc log cũ quá 10 tiếng -> Insert mới
      if (!latest || (now - new Date(latest.created_at) > 10 * 3600 * 1000)) {
         await supabase.from("changelog").insert([{ text: contentWithTs }]);
      } 
      // Nếu log cũ quá 1 tiếng (nhưng chưa đến 10 tiếng) -> Cập nhật log đó (append hoặc replace tùy bạn, ở đây mình insert mới cho an toàn lịch sử)
      else if (now - new Date(latest.created_at) > 3600 * 1000) {
         await supabase.from("changelog").insert([{ text: contentWithTs }]);
      }
      // Nếu dưới 1 tiếng -> Không làm gì (tránh spam log)
    } catch (e) {
      console.warn("Auto sync log failed", e);
    }
  }

  // Helper: Load Data
  async function loadData() {
    if (typeof supabase === 'undefined') return;
    const v = document.getElementById("dataViewer");
    if (v) v.textContent = "Đang tải dữ liệu...";
    try {
      const [b, t, c] = await Promise.all([
        supabase.from("btvn").select("*"),
        supabase.from("tkb").select("*"),
        supabase.from("changelog").select("*").order('created_at', { ascending: false }).limit(5)
      ]);
      if (v) v.textContent = JSON.stringify({ btvn: b.data, tkb: t.data, recent_logs: c.data }, null, 2);
    } catch (err) {
      if (v) v.textContent = "Lỗi tải data viewer";
    }
  }

  // Initial Load
  loadData();

}); // End DOMContentLoaded