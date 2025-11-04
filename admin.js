// admin.js - Tối ưu hiệu suất và trải nghiệm người dùng
document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const elements = {
    loginBox: document.getElementById("login-box"),
    adminPanel: document.getElementById("admin-panel"),
    loginMsg: document.getElementById("loginMsg"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    // Dark mode elements
    darkModeToggle: document.getElementById("darkModeToggle"),
    modeIcon: document.getElementById("modeIcon"),
    // BTVN elements
    btvnForm: document.getElementById("btvnForm"),
    subject: document.getElementById("subject"),
    btvn_content: document.getElementById("btvn_content"),
    updateBTVN: document.getElementById("updateBTVN"),
    addNewBTVN: document.getElementById("addNewBTVN"),
    // TKB elements (ĐÃ THAY ĐỔI)
    tkbForm: document.getElementById("tkbForm"),
    tkb_day: document.getElementById("tkb_day"),
    tkb_truc: document.getElementById("tkb_truc"),
    tkbSangContainer: document.getElementById("tkb-sang-container"), // MỚI
    tkbChieuContainer: document.getElementById("tkb-chieu-container"), // MỚI
    updateTKB: document.getElementById("updateTKB"),
    addNewTKB: document.getElementById("addNewTKB"),
    // (Đã xóa addPeriod và periodsContainer)
    // Changelog elements
    changelogForm: document.getElementById("changelogForm"),
    changelog_text: document.getElementById("changelog_text"),
    updateChangelog: document.getElementById("updateChangelog"),
    addNewChangelog: document.getElementById("addNewChangelog"),
    // Data viewer
    refreshData: document.getElementById("refreshData"),
    dataViewer: document.getElementById("dataViewer")
  };

  // Hàm băm SHA-256 trả về chuỗi hex
  async function sha256Hex(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // ----- DARK MODE -----
  // Kiểm tra chế độ đã lưu trong localStorage
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    elements.modeIcon.textContent = "☀️";
  }

  // Xử lý sự kiện chuyển đổi chế độ
  elements.darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    
    // Cập nhật icon và lưu trạng thái
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

  // ----- LOGIN -----
  // (Giữ nguyên logic Login, Logout, showAdmin)
  if (localStorage.getItem("adminLogged") === "true") {
    showAdmin();
  }
  elements.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
  elements.logoutBtn.addEventListener("click", handleLogout);

  async function handleLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      elements.loginMsg.textContent = "Vui lòng nhập tên đăng nhập và mật khẩu!";
      showToast("Vui lòng nhập đủ thông tin", "error");
      return;
    }

    const enteredHash = await sha256Hex(password);

    if (username === CONFIG.ADMIN_USERNAME && enteredHash === CONFIG.ADMIN_PASSWORD_HASH) {
      localStorage.setItem("adminLogged", "true");
      showAdmin();
      showToast("Đăng nhập thành công", "success");
    } else {
      elements.loginMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
      showToast("Sai tài khoản hoặc mật khẩu", "error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminLogged");
    showToast("Đã đăng xuất", "info");
    setTimeout(() => location.reload(), 1000);
  }

  function showAdmin() {
    elements.loginBox.style.display = "none";
    elements.adminPanel.style.display = "block";
    document.querySelectorAll('.card').forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }

  // ----- TOAST -----
  // (Giữ nguyên logic showToast)
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
  // (Giữ nguyên logic BTVN)
  function getBTVNData() {
    return {
      subject: elements.subject.value,
      content: elements.btvn_content.value,
      note: ""
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

  // ----- TKB (ĐÃ VIẾT LẠI HOÀN TOÀN) -----
  
  // Danh sách môn học TKB để tái sử dụng
  const subjectOptions = [
    { value: "Nghỉ", text: "Nghỉ" }, // 'Nghỉ' là trạng thái mặc định
    { value: "Toán học - Đại số", text: "Toán học - Đại số" },
    { value: "Toán học - Hình học", text: "Toán học - Hình học" },
    { value: "Ngữ văn", text: "Ngữ văn" },
    { value: "Tiếng Anh", text: "Tiếng Anh" },
    { value: "Vật lý", text: "Vật lý" },
    { value: "Hóa học", text: "Hóa học" },
    { value: "Sinh học", text: "Sinh học" },
    { value: "Lịch sử", text: "Lịch sử" },
    { value: "Địa lí", text: "Địa lí" },
    { value: "GDCD", text: "GDCD" },
    { value: "Tin học", text: "Tin học" },
    { value: "Công nghệ", text: "Công nghệ" },
    { value: "GDTC", text: "GDTC" },
    { value: "HĐTN", text: "HĐTN" },
    { value: "GDĐP", text: "GDĐP" },
    { value: "Mĩ thuật", text: "Mĩ Thuật" },
    { value: "Âm nhạc", text: "Âm nhạc" }
  ];

  /**
   * Tạo một hàng tiết học (gồm Label "Tiết X" và Select môn học)
   * @param {string} buoi - "Sáng" hoặc "Chiều"
   * @param {number} tiet - 1, 2, 3, 4, 5
   */
  function createPeriodRow(buoi, tiet) {
    const periodRow = document.createElement("div");
    periodRow.className = "period-row-new fade-in"; // Dùng class mới
    
    // Tạo nhãn (Tiết 1, Tiết 2...)
    const label = document.createElement("label");
    label.textContent = `Tiết ${tiet}`;
    
    // Tạo ô chọn môn học
    const select = document.createElement("select");
    select.className = "period-subject";
    // Thêm thông tin vào dataset để dễ dàng lấy ra khi lưu
    select.dataset.buoi = buoi;
    select.dataset.tiet = tiet; 
    
    // Thêm các option môn học vào
    subjectOptions.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });
    
    // Mặc định chọn "Nghỉ"
    select.value = "Nghỉ"; 
    
    periodRow.appendChild(label);
    periodRow.appendChild(select);
    return periodRow;
  }

  /**
   * Khởi tạo 10 ô tiết học (5 sáng, 5 chiều)
   */
  function initTKBGrid() {
    // 5 tiết sáng
    for (let i = 1; i <= 5; i++) {
      elements.tkbSangContainer.appendChild(createPeriodRow("Sáng", i));
    }
    // 5 tiết chiều
    for (let i = 1; i <= 5; i++) {
      elements.tkbChieuContainer.appendChild(createPeriodRow("Chiều", i));
    }
  }

  // Gán sự kiện cho các nút lưu TKB
  elements.updateTKB.addEventListener("click", () => saveAllPeriods(true));
  elements.addNewTKB.addEventListener("click", () => saveAllPeriods(false));

  /**
   * Thu thập dữ liệu từ grid TKB mới và gửi đi
   * @param {boolean} overwrite - True: Cập nhật, False: Thêm mới
   */
  async function saveAllPeriods(overwrite) {
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
    // Lấy tất cả các ô <select> môn học trong form TKB
    const allSubjectSelects = elements.tkbForm.querySelectorAll(".period-subject");
    
    allSubjectSelects.forEach(select => {
      const subject = select.value;
      
      // Chỉ lưu những tiết có môn học (khác "Nghỉ")
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
      // Vẫn cho phép gửi đi để cập nhật 1 ngày trống
    }

    // Gửi dữ liệu
    postData({
      action: "updateTKB",
      item: { day, truc, periods: JSON.stringify(periods) },
      overwrite: overwrite
    });
  }

  // ----- CHANGELOG -----
  // (Giữ nguyên logic Changelog)
  function getChangelogData() {
    return { text: elements.changelog_text.value };
  }
  elements.updateChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    postData({ action: "updateChangelog", item: data, overwrite: true });
  });
  elements.addNewChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    postData({ action: "updateChangelog", item: data, overwrite: false });
  });

  // ----- DATA VIEWER -----
  elements.refreshData.addEventListener("click", loadData);

  // ----- COMMON -----
  // (Giữ nguyên logic postData và loadData)
  async function postData(data) {
    if (window.isLoading) {
      showToast("Đang xử lý yêu cầu trước đó, vui lòng đợi...", "info");
      return;
    }
    window.isLoading = true;
    try {
      const formData = new FormData();
      formData.append("action", data.action);
      formData.append("overwrite", data.overwrite ? "true" : "false");

      if (data.item) {
        for (let key in data.item) {
          formData.append(key, data.item[key] ?? "");
        }
      }
      showToast("Đang xử lý...", "info");
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      console.log("RESPONSE:", result);
      if (result.status === "success") {
        showToast("✅ " + (result.result?.action || "Thành công"), "success");
        loadData();
      } else {
        showToast("❌ " + (result.message || "Lỗi không rõ"), "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("⚠️ Gửi thất bại: " + error.message, "error");
    } finally {
      window.isLoading = false;
    }
  }

  async function loadData() {
    const dataViewer = elements.dataViewer;
    dataViewer.textContent = "Đang tải dữ liệu...";
    try {
      const response = await fetch(CONFIG.SCRIPT_URL + "?action=getAll");
      const data = await response.json();
      dataViewer.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      dataViewer.textContent = "Lỗi: " + error.message;
    }
  }

  // ----- TẢI DỮ LIỆU BAN ĐẦU -----
  loadData();
  initTKBGrid(); // <--- Chạy hàm khởi tạo TKB mới
});