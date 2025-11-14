window.isLoading = false;

const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwEVbGj72KB2zZQbrTaqWqEGAVVirGBuel-NjOlKgq230fdOx31ciN0783sO1EQTq16/exechttps://script.google.com/macros/s/AKfycbxObu-YqqCMTR-M2uNR4n2lGMUCSCQ09-NxEAlDSrwAAHFxYMyaT7TNeLMxg8ZThIsi/exec",
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD_HASH: "329fe68c81dcc05dec93329dd35760318da604549107ec7ccb81d3a7545f54f4",
  TOAST_DURATION: 3000,
};


  // Hàm băm SHA-256 trả về hex string
  async function sha256Hex(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Ví dụ dùng trong xử lý login (giả sử bạn đã cache các element DOM)
  async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value; // vẫn lấy input người dùng

    const enteredHash = await sha256Hex(password);

    if (username === CONFIG.ADMIN_USERNAME && enteredHash === CONFIG.ADMIN_PASSWORD_HASH) {
      localStorage.setItem("adminLogged", "true");
      showAdmin();
      showToast("Đăng nhập thành công", "success"); // <--- Và ở đây
    } else {
      document.getElementById('loginMsg').textContent = "Sai tài khoản hoặc mật khẩu!";
      showToast("Sai tài khoản hoặc mật khẩu", "error"); // <--- Và ở đây
    }
  }
// ===============================================
// KẾT THÚC CODE ĐƯỢC CHUYỂN SANG
// ===============================================


// Code cũ của admin.js bắt đầu từ đây
document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const elements = {
    loginBox: document.getElementById("login-box"),
    adminPanel: document.getElementById("admin-panel"),
    loginMsg: document.getElementById("loginMsg"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    // ... (các elements khác của bạn)
    darkModeToggle: document.getElementById("darkModeToggle"),
    modeIcon: document.getElementById("modeIcon"),
    btvnForm: document.getElementById("btvnForm"),
    subject: document.getElementById("subject"),
    btvn_content: document.getElementById("btvn_content"),
    updateBTVN: document.getElementById("updateBTVN"),
    addNewBTVN: document.getElementById("addNewBTVN"),
    tkbForm: document.getElementById("tkbForm"),
    tkb_day: document.getElementById("tkb_day"),
    tkb_truc: document.getElementById("tkb_truc"),
    tkbSangContainer: document.getElementById("tkb-sang-container"),
    tkbChieuContainer: document.getElementById("tkb-chieu-container"),
    updateTKB: document.getElementById("updateTKB"),
    addNewTKB: document.getElementById("addNewTKB"),
    changelogForm: document.getElementById("changelogForm"),
    changelog_text: document.getElementById("changelog_text"),
    updateChangelog: document.getElementById("updateChangelog"),
    addNewChangelog: document.getElementById("addNewChangelog"),
    refreshData: document.getElementById("refreshData"),
    dataViewer: document.getElementById("dataViewer"),
    updateTrucOnly: document.getElementById("updateTrucOnly")
  };

  // ----- DARK MODE -----
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    elements.modeIcon.textContent = "☀️";
  }
  elements.darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      elements.modeIcon.textContent = "☀️";
      localStorage.setItem("darkMode", "true");
      showToast("Đã chuyển sang chế độ tối", "info");
    } else {
      elements.modeIcon.textContent = "🌙";
      localStorage.setItem("darkMode", "false");
      showToast("Đã chuyển sang chế độ sáng", "info");
    }
  });
// ===============================================
  // ===== CODE MỚI: XỬ LÝ CHUYỂN TAB =====
  // ===============================================
  const tabs = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".admin-tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // 1. Lấy mục tiêu
      const targetId = tab.dataset.tab;
      const targetContent = document.getElementById(targetId);

      // 2. Xóa active khỏi tất cả tab và nội dung
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      // 3. Thêm active vào tab và nội dung được click
      tab.classList.add("active");
      if (targetContent) {
        targetContent.classList.add("active");
        
        // Thêm animation fade-in
        targetContent.classList.remove("fade-in");
        void targetContent.offsetWidth; // Thủ thuật trigger reflow
        targetContent.classList.add("fade-in");
      }
    });
  });
  // ===============================================
  // ===== HẾT CODE XỬ LÝ TAB =====
  // ===============================================
  // ----- LOGIN -----
  if (localStorage.getItem("adminLogged") === "true") {
    showAdmin();
  }
  elements.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin(); // Gọi hàm handleLogin (giờ đã ở chung file)
  });
  elements.logoutBtn.addEventListener("click", handleLogout);

  function handleLogout() {
    localStorage.removeItem("adminLogged");
    showToast("Đã đăng xuất", "info");
    setTimeout(() => location.reload(), 1000);
  }

  // HÀM NÀY GIỜ ĐÃ CÓ THỂ ĐƯỢC GỌI TỪ handleLogin
  function showAdmin() {
    elements.loginBox.style.display = "none";
    elements.adminPanel.style.display = "block";
    document.querySelectorAll('.card').forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }

  // HÀM NÀY GIỜ ĐÃ CÓ THỂ ĐƯỢC GỌI TỪ handleLogin
  function showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  }

  // ----- BTVN -----
  function getBTVNData() {
    // Thêm trường 'date' với ngày giờ hiện tại
    const currentDate = new Date().toISOString(); 
    return {
      subject: elements.subject.value,
      content: elements.btvn_content.value,
      date: currentDate,
    };
  }
  elements.updateBTVN.addEventListener("click", () => {
    const data = getBTVNData();
    if (!data.subject || !data.content) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    postData({ action: "overwriteBTVN", item: data });
  });
  elements.addNewBTVN.addEventListener("click", () => {
    const data = getBTVNData();
    if (!data.subject || !data.content) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    postData({ action: "addBTVN", item: data });
  });

  // ----- TKB (Giữ nguyên logic TKB của bạn) -----
  const subjectOptions = [
    { value: "Nghỉ", text: "Nghỉ" }, { value: "Toán học - Đại số", text: "Toán học - Đại số" },
    { value: "Toán học - Hình học", text: "Toán học - Hình học" }, { value: "Ngữ văn", text: "Ngữ văn" },
    { value: "Tiếng Anh", text: "Tiếng Anh" }, { value: "Vật lý", text: "Vật lý" },
    { value: "Hóa học", text: "Hóa học" }, { value: "Sinh học", text: "Sinh học" },
    { value: "Lịch sử", text: "Lịch sử" }, { value: "Địa lí", text: "Địa lí" },
    { value: "GDCD", text: "GDCD" }, { value: "Tin học", text: "Tin học" },
    { value: "Công nghệ", text: "Công nghệ" }, { value: "GDTC", text: "GDTC" },
    { value: "HĐTN", text: "HĐTN" }, { value: "GDĐP", text: "GDĐP" },
    { value: "Mĩ thuật", text: "Mĩ Thuật" }, { value: "Âm nhạc", text: "Âm nhạc" }
  ];
  function createPeriodRow(buoi, tiet) {
    const periodRow = document.createElement("div");
    periodRow.className = "tkb-period-row fade-in";
    const label = document.createElement("label");
    label.textContent = `Tiết ${tiet}`;
    const select = document.createElement("select");
    select.className = "period-subject";
    select.dataset.buoi = buoi;
    select.dataset.tiet = tiet;
    subjectOptions.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });
    select.value = "Nghỉ";
    periodRow.appendChild(label);
    periodRow.appendChild(select);
    return periodRow;
  }
  function initTKBGrid() {
    for (let i = 1; i <= 5; i++) {
      elements.tkbSangContainer.appendChild(createPeriodRow("Sáng", i));
    }
    for (let i = 1; i <= 5; i++) {
      elements.tkbChieuContainer.appendChild(createPeriodRow("Chiều", i));
    }
  }
function handleUpdateTrucOnly() {
    const day = elements.tkb_day.value;
    const truc = elements.tkb_truc.value;

    if (!day) {
      showToast("Vui lòng chọn Thứ", "error");
      return;
    }
    if (!truc) {
      showToast("Vui lòng chọn Tổ trực", "error");
      return;
    }
    
    // Gọi postData với action mới
    postData({
      action: "updateTrucOnly",
      item: { day, truc }
    });
  }
  // ===================================

  elements.updateTKB.addEventListener("click", () => saveAllPeriods(true));
  elements.updateTrucOnly.addEventListener("click", handleUpdateTrucOnly); // <-- THÊM DÒNG NÀY
  if (elements.addNewTKB) {
    elements.addNewTKB.addEventListener("click", () => saveAllPeriods(false));
    elements.addNewTKB.style.display = "none";
  }

  async function saveAllPeriods(isOverwrite) {
    const day = elements.tkb_day.value;
    const truc = elements.tkb_truc.value;

    if (!day) {
      showToast("Vui lòng chọn Thứ", "error");
      return;
    }
    if (!truc) {
      showToast("Vui lòng chọn Tổ trực", "error");
      return;
    }

    const periods = [];
    const allSubjectSelects = elements.tkbForm.querySelectorAll(".period-subject");
    allSubjectSelects.forEach(select => {
      const subject = select.value;
      if (subject !== "Nghỉ") {
        periods.push({
          buoi: select.dataset.buoi,
          tiet: select.dataset.tiet,
          subject: subject
        });
      }
    });

    if (periods.length === 0) {
      showToast("Bạn chưa chọn môn học nào (tất cả đều đang 'Nghỉ')", "info");
    }

    postData({
      action: "updateTKB",
      item: { day, truc, periods: JSON.stringify(periods) },
      overwrite: isOverwrite
    });
  }

// ----- CHANGELOG -----
  function getChangelogData() {
    return { text: elements.changelog_text.value };
  }
  elements.updateChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    // Sửa ở đây: Nút "Ghi đè" giờ sẽ thêm mới (KHÔNG xóa)
    postData({ action: "updateChangelog", item: data, overwrite: false });
  });
  elements.addNewChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    // Sửa ở đây: Nút "Thêm mới" giờ sẽ GHI ĐÈ (XÓA rồi thêm)
    postData({ action: "updateChangelog", item: data, overwrite: true });
  });

  // ----- DATA VIEWER -----
  elements.refreshData.addEventListener("click", loadData);

  // ----- GỬI VÀ TẢI DỮ LIỆU (SUPABASE) -----
  async function postData(data) {
    if (window.isLoading) {
      showToast("Đang xử lý yêu cầu trước đó, vui lòng đợi...", "info");
      return;
    }
    window.isLoading = true;

    try {
      let result;
      
      // FIX LỖI: Kiểm tra supabase có tồn tại không
      if (typeof supabase === 'undefined') {
          throw new Error("supabase is not defined. Script không tải được?");
      }

      switch (data.action) {
        case "addBTVN": {
          const { error } = await supabase.from("btvn").insert([data.item]);
          if (error) throw error;
          result = { action: data.action };
          break;
        }
        case "overwriteBTVN": {
          await supabase.from("btvn").delete().eq("subject", data.item.subject);
          const { error } = await supabase.from("btvn").insert([data.item]);
          if (error) throw error;
          result = { action: data.action };
          break;
        }
        case "updateTrucOnly": {
          const { item } = data;
          // Cập nhật cột 'truc' cho tất cả các hàng có 'day' trùng khớp
          const { error } = await supabase
            .from("tkb")
            .update({ truc: item.truc })
            .eq("day", item.day);
            
          if (error) throw error;
          result = { action: data.action };
          break;
        }
        case "updateTKB": {
          const item = data.item;
          const day = item.day;
          const periods = JSON.parse(item.periods || "[]");
          const truc = item.truc;

          if (data.overwrite) {
            await supabase.from("tkb").delete().eq("day", day);
          }

          const values = periods.map(p => ({
            day, buoi: p.buoi, tiet: p.tiet, subject: p.subject, truc,
          }));

          if (values.length > 0) {
            const { error } = await supabase.from("tkb").insert(values);
            if (error) throw error;
          } else if (data.overwrite) {
            showToast("Đã cập nhật ngày trống (Nghỉ)", "info");
          }
          result = { action: data.action };
          break;
        }
        case "updateChangelog": {
          const item = data.item;
          if (data.overwrite) {
            await supabase.from("changelog").delete().not("text", "is", null);
          }
          const { error } = await supabase.from("changelog").insert([{ text: item.text }]);
          if (error) throw error;
          result = { action: data.action };
          break;
        }
        default:
          throw new Error("Unknown action: " + data.action);
      }
      showToast("✅ Thành công (" + (data.action || "done") + ")", "success");
      loadData();
    } catch (error) {
      console.error("Supabase Error:", error);
      // Đây là lỗi bạn thấy trong hình 1
      showToast("⚠️ Lỗi gửi dữ liệu: " + error.message, "error");
    } finally {
      window.isLoading = false;
    }
  }

  async function loadData() {
    // FIX LỖI: Kiểm tra supabase có tồn tại không
    if (typeof supabase === 'undefined') {
        elements.dataViewer.textContent = "Lỗi: supabase is not defined. Không thể tải script.";
        return;
    }
      
    const dataViewer = elements.dataViewer;
    dataViewer.textContent = "Đang tải dữ liệu...";
    try {
      const [btvnRes, tkbRes, changelogRes] = await Promise.all([
        supabase.from("btvn").select("*"),
        supabase.from("tkb").select("*"),
        supabase.from("changelog").select("*")
      ]);
      const data = {
        btvn: btvnRes.data || [],
        tkb: tkbRes.data || [],
        changelog: changelogRes.data || []
      };
      dataViewer.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error(error);
      dataViewer.textContent = "Lỗi tải dữ liệu: " + error.message;
    }
  }

  // ----- TẢI DỮ LIỆU BAN ĐẦU -----
  loadData();
  initTKBGrid();
});
// ===============================================
// KẾT THÚC CODE CỦA admin.js
// ===============================================