document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("login-box");
  const adminPanel = document.getElementById("admin-panel");
  const loginMsg = document.getElementById("loginMsg");

  // ----- LOGIN -----
  if (localStorage.getItem("adminLogged") === "true") showAdmin();

  document.getElementById("loginBtn").onclick = () => {
    const u = val("username"), p = val("password");
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
      localStorage.setItem("adminLogged", "true");
      showAdmin();
      showToast("Đăng nhập thành công", "success");
    } else {
      loginMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
      showToast("Sai tài khoản hoặc mật khẩu", "error");
    }
  };

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("adminLogged");
    showToast("Đã đăng xuất", "info");
    setTimeout(()=>location.reload(),1000);
  };

  function showAdmin(){ loginBox.style.display="none"; adminPanel.style.display="block"; }

  // ----- TOAST -----
  function showToast(msg, type="info"){
    document.querySelectorAll(".toast").forEach(t=>t.remove());
    const t=document.createElement("div"); 
    t.className=`toast ${type}`;
    t.innerText=msg; 
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add("show"),10);
    setTimeout(()=>{t.classList.remove("show"); setTimeout(()=>t.remove(),300)},3000);
  }

  // ----- BTVN -----
  function getBTVN(){ 
    return { 
      subject:val("subject"),
      content:val("btvn_content"),
      note:""};
  }
// 🔁 Cập nhật (ghi đè) — xóa toàn bộ môn đó rồi ghi mới
document.getElementById("updateBTVN").onclick = ()=> {
  const d=getBTVN(); 
  if(!d.subject||!d.content) return showToast("Thiếu dữ liệu","error");
  postData({ action: "overwriteBTVN", item: d });
};

// ➕ Thêm mới — chỉ thêm dòng mới, không xóa gì
document.getElementById("addNewBTVN").onclick = ()=> {
  const d=getBTVN(); 
  if(!d.subject||!d.content) return showToast("Thiếu dữ liệu","error");
  postData({ action: "addBTVN", item: d });
};
  // ----- TKB -----
  document.getElementById("addPeriod").onclick=addPeriod;
  document.getElementById("updateTKB").onclick=()=>saveAllPeriods(true);   // ghi đè từng tiết
  document.getElementById("addNewTKB").onclick=()=>saveAllPeriods(false); // xoá cả ngày

  function addPeriod(){
    const c=document.getElementById("periodsContainer");
    const r=document.createElement("div"); 
    r.className="period-row";
    r.innerHTML=`
      <select class="period-buoi">
        <option value="Sáng">Sáng</option>
        <option value="Chiều">Chiều</option>
      </select>
      <select class="period-tiet">
        ${[1,2,3,4,5].map(i=>`<option value="${i}">Tiết ${i}</option>`).join("")}
      </select>
      <select class="period-subject">
        <option value="">-- Môn học --</option>
        <option>Toán</option><option>Ngữ văn</option><option>Tiếng Anh</option>
        <option>Vật lý</option><option>Hóa học</option><option>Sinh học</option>
        <option>Lịch sử</option><option>Địa lý</option><option>GDCD</option>
        <option>Tin học</option><option>Công nghệ</option><option>Thể dục</option><option>Nghỉ</option>
      </select>
      <button type="button" class="removePeriod">❌</button>
    `;
    r.querySelector(".removePeriod").onclick=()=>r.remove();
    c.appendChild(r);
  }

  async function saveAllPeriods(overwrite){
    const day=val("tkb_day");
    const truc=val("tkb_truc"); // dropdown tổ trực
    const rows=document.querySelectorAll(".period-row");

    if(!day||rows.length===0) return showToast("Chọn thứ và nhập ít nhất 1 tiết","error");
    if(!truc) return showToast("Chọn tổ trực cho ngày này","error");

    // Gom dữ liệu tiết
    let periods = [];
    rows.forEach(row=>{
      const buoi=row.querySelector(".period-buoi").value;
      const tiet=row.querySelector(".period-tiet").value;
      const subject=row.querySelector(".period-subject").value;
      if(subject) periods.push({ buoi, tiet, subject });
    });

    postData({
      action:"updateTKB",
      item:{ day, truc, periods: JSON.stringify(periods) },
      overwrite: overwrite
    });
  }

  // ----- CHANGELOG -----
  function getCL(){ return {text:val("changelog_text")}; }

  document.getElementById("updateChangelog").onclick=()=> {
    const d=getCL(); if(!d.text) return showToast("Nhập changelog","error");
    postData({action:"updateChangelog",item:d,overwrite:true});
  };

  document.getElementById("addNewChangelog").onclick=()=> {
    const d=getCL(); if(!d.text) return showToast("Nhập changelog","error");
    postData({action:"updateChangelog",item:d,overwrite:false});
  };

  // ----- COMMON -----
  function val(id){return document.getElementById(id).value;}

// Thay postData trong admin.js bằng:
async function postData(d){
  try {
    const f = new FormData();
    f.append("action", d.action);
    f.append("overwrite", d.overwrite ? "true" : "false");

    if (d.item) {
      for (let k in d.item) {
        f.append(k, d.item[k] ?? "");
      }
    }

    // ✅ Debug in ra toàn bộ FormData
    for (let [k,v] of f.entries()) {
      console.log("FORMDATA:", k, "=", v);
    }

    const r = await fetch(SCRIPT_URL, { method:"POST", body:f });
    const j = await r.json();
    console.log("RESPONSE:", j);

    if (j.status === "success") {
      showToast("✅ " + (j.result?.action || "Thành công"), "success");
    } else {
      showToast("❌ " + (j.message || "Lỗi không rõ"), "error");
    }
    loadData();
  } catch (e) {
    showToast("⚠️ Gửi thất bại: " + e.message, "error");
  }
}
  async function loadData(){
    const v=document.getElementById("dataViewer"); v.textContent="Đang tải...";
    try{const r=await fetch(SCRIPT_URL+"?action=getAll");const j=await r.json();v.textContent=JSON.stringify(j,null,2);}
    catch(e){v.textContent="Lỗi: "+e.message;}
  }
  loadData();
});