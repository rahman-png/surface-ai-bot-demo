const clinics = {
  SB: { name: "Setiabudi", phone: "+62 21 555 0101" },
  CITOS: { name: "Cilandak Town Square", phone: "+62 21 555 0102" },
  LMP: { name: "Lippo Mall Puri", phone: "+62 21 555 0103" },
  TSM: { name: "Trans Studio Mall Cibubur", phone: "+62 21 555 0104" },
};

const admins = {
  SB: { name: "Rani", emoji: "👩🏻‍💼", color: "#efb19c", greeting: "Saya siap membantu tim Setiabudi menentukan prioritas hari ini." },
  CITOS: { name: "Nara", emoji: "👩🏽‍⚕️", color: "#9bc6d5", greeting: "Saya membantu tim CITOS membaca antrean dan peluang pelanggan." },
  LMP: { name: "Luma", emoji: "🧕🏻", color: "#c7b5db", greeting: "Saya siap merangkum follow-up untuk tim Lippo Mall Puri." },
  TSM: { name: "Tami", emoji: "👩🏾‍💻", color: "#e7c66f", greeting: "Saya membantu tim TSM menyelesaikan tugas harian dengan teratur." },
};

const names = [
  "Nadia P.", "Maya A.", "Citra W.", "Anisa R.", "Dewi L.", "Sarah K.",
  "Putri M.", "Rina T.", "Laras B.", "Sinta F.", "Alia H.", "Niken S.",
  "Kezia D.", "Ayu N.", "Farah I.", "Tasya G.", "Vina C.", "Intan J.",
  "Raisa U.", "Meutia E.", "Dinda Q.", "Wulan Y.", "Tiara O.", "Bella Z."
];

const reasons = [
  { type: "overdue", title: "Chat malam belum dibalas", detail: "Masuk 21.38 · menanyakan jadwal treatment" },
  { type: "overdue", title: "Chat pagi belum dibalas", detail: "Masuk 08.12 · menanyakan harga konsultasi" },
  { type: "aftercare", title: "Aftercare hari ke-3", detail: "Cek kondisi kulit setelah treatment" },
  { type: "risk", title: "Berisiko tidak kembali", detail: "Terakhir berkunjung 94 hari lalu" },
  { type: "reactivation", title: "Waktunya kembali", detail: "Jadwal treatment rutin sudah terlewati" },
  { type: "opportunity", title: "Paket hampir habis", detail: "Tersisa 1 sesi dari paket aktif" },
  { type: "opportunity", title: "Ulang tahun minggu ini", detail: "Kirim sapaan dan benefit ulang tahun" },
];

function makeData() {
  const result = {};
  Object.keys(clinics).forEach((clinic, clinicIndex) => {
    result[clinic] = Array.from({ length: 20 }, (_, i) => {
      const reason = reasons[(i + clinicIndex) % reasons.length];
      return {
        id: `${clinic}-${i + 1}`,
        name: names[(i + clinicIndex * 5) % names.length],
        phone: `08•• •••• ${String(1100 + clinicIndex * 100 + i).slice(-4)}`,
        lastVisit: `${12 + (i % 17)} Sep 2026`,
        reasonType: reason.type,
        reason: reason.title,
        detail: reason.detail,
        status: "pending",
        outcome: null,
      };
    });
  });
  return result;
}

const state = {
  clinic: localStorage.getItem("surface-clinic") || "SB",
  filter: "all",
  data: JSON.parse(localStorage.getItem("surface-demo-data") || "null") || makeData(),
  history: JSON.parse(localStorage.getItem("surface-demo-history") || "[]"),
  activeTaskId: null,
  conversations: {},
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (value) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const outcomeLabels = { replied: "Sudah membalas", booked: "Berhasil booking", no_response: "Tidak merespons", later: "Follow-up nanti" };
const typeLabels = { overdue: "Belum dibalas", aftercare: "Aftercare", risk: "At risk", reactivation: "Reaktivasi", opportunity: "Peluang" };

function save() {
  localStorage.setItem("surface-clinic", state.clinic);
  localStorage.setItem("surface-demo-data", JSON.stringify(state.data));
  localStorage.setItem("surface-demo-history", JSON.stringify(state.history));
}

function tasks() { return state.data[state.clinic]; }
function isDone(task) { return task.status === "done"; }

function render() {
  const current = clinics[state.clinic];
  const admin = admins[state.clinic];
  $("#clinicSelect").value = state.clinic;
  $("#clinicCode").textContent = state.clinic;
  const outstandingChats = tasks().filter((task) => task.reasonType === "overdue" && !isDone(task)).length;
  $("#heroTitle").textContent = outstandingChats ? `${outstandingChats} chat pelanggan menunggu balasan.` : "Chat tertunda sudah selesai.";
  $("#briefingIntro").textContent = outstandingChats ? `Tim ${current.name} mengerjakan pesan tertunda lebih dulu, lalu mengikuti urutan di bawah.` : `Tim ${current.name} dapat melanjutkan aftercare dan follow-up terjadwal.`;
  $("#adminName").textContent = `${admin.name} · ${current.name}`;
  $("#adminGreeting").textContent = admin.greeting;
  $("#adminPortrait").style.setProperty("--portrait-bg", admin.color);
  $("#adminPortrait span").textContent = admin.emoji;
  $("#chatAdminName").textContent = `${admin.name} · ${current.name}`;
  $("#chatAdminPortrait").style.setProperty("--portrait-bg", admin.color);
  $("#chatAdminPortrait span").textContent = admin.emoji;
  renderMetrics();
  renderTasks();
  renderCustomers();
  renderInbox();
  renderHistory();
  renderConversation();
}

function conversation() {
  if (!state.conversations[state.clinic]) {
    state.conversations[state.clinic] = [{ role: "admin", text: `Selamat pagi, saya ${admins[state.clinic].name}. Tanyakan prioritas, progres, chat yang belum dibalas, atau pelanggan tertentu di ${clinics[state.clinic].name}.` }];
  }
  return state.conversations[state.clinic];
}

function renderConversation() {
  const messages = conversation();
  $("#chatMessages").innerHTML = messages.map((message) => `<div class="message ${message.role}">${escapeHTML(message.text)}<time>${escapeHTML(message.time || "Sekarang")}</time></div>`).join("");
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
}

function adminAnswer(question) {
  const q = question.toLowerCase();
  const all = tasks();
  const pending = all.filter((t) => !isDone(t));
  const overdue = pending.filter((t) => t.reasonType === "overdue");
  const first = overdue[0] || pending[0];
  const matchingCustomer = all.find((t) => q.includes(t.name.toLowerCase().replace(".", "")) || q.includes(t.name.toLowerCase()));
  if (matchingCustomer) return `${matchingCustomer.name} dijadwalkan untuk “${matchingCustomer.reason}”. ${matchingCustomer.detail}. Status saat ini: ${isDone(matchingCustomer) ? outcomeLabels[matchingCustomer.outcome] : "belum dikerjakan"}.`;
  if (q.includes("prioritas") || q.includes("kerjakan") || q.includes("mulai")) return `Mulai dari ${overdue.length} chat yang belum dibalas. Setelah itu lanjutkan aftercare, pelanggan berisiko, lalu peluang paket dan ulang tahun. Total tugas tersisa: ${pending.length}.`;
  if (q.includes("chat") || q.includes("balas") || q.includes("inbox")) return overdue.length ? `Ada ${overdue.length} chat yang masuk antara pukul 20.00 sampai 10.00 dan belum dibalas. Yang pertama adalah ${overdue[0].name}: ${overdue[0].detail}.` : "Semua chat prioritas sudah dibalas. Tim bisa melanjutkan follow-up terjadwal.";
  if (q.includes("pertama") || q.includes("siapa")) return first ? `Pelanggan pertama yang perlu ditangani adalah ${first.name}. Alasannya: ${first.reason.toLowerCase()} — ${first.detail}.` : "Semua tugas hari ini sudah selesai.";
  if (q.includes("progres") || q.includes("selesai") || q.includes("sisa")) return `${all.length - pending.length} dari 20 tugas sudah selesai. Masih ada ${pending.length} tugas untuk tim ${state.clinic}.`;
  if (q.includes("tidak respon") || q.includes("no response")) return "Catat hasil sebagai “Tidak merespons”. Pelanggan tersebut akan dilewati sementara dan tidak masuk daftar berikutnya selama masa cooldown.";
  if (q.includes("aftercare")) { const count = pending.filter((t) => t.reasonType === "aftercare").length; return `Ada ${count} tugas aftercare yang belum selesai. Gunakan percakapan singkat untuk mengecek kondisi pelanggan setelah treatment.`; }
  if (q.includes("risiko") || q.includes("kembali")) { const count = pending.filter((t) => ["risk", "reactivation"].includes(t.reasonType)).length; return `Ada ${count} pelanggan berisiko atau perlu diaktifkan kembali. Hubungi setelah semua chat yang belum dibalas selesai.`; }
  return `Saya menemukan ${pending.length} tugas aktif untuk ${clinics[state.clinic].name}. Coba tanyakan “Apa prioritas hari ini?”, “Berapa chat belum dibalas?”, atau sebutkan nama pelanggan.`;
}

function sendQuestion(question) {
  const clean = question.trim();
  if (!clean) return;
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  conversation().push({ role: "user", text: clean, time });
  conversation().push({ role: "admin", text: adminAnswer(clean), time });
  renderConversation();
}

function openChat() {
  $("#chatPanel").classList.add("open");
  $("#chatBackdrop").classList.add("open");
  $("#chatPanel").setAttribute("aria-hidden", "false");
  $("#chatPanel").removeAttribute("inert");
  setTimeout(() => $("#chatInput").focus(), 200);
}

function closeChat() {
  $("#chatPanel").classList.remove("open");
  $("#chatBackdrop").classList.remove("open");
  $("#chatPanel").setAttribute("aria-hidden", "true");
  $("#chatPanel").setAttribute("inert", "");
}

function renderMetrics() {
  const all = tasks();
  const done = all.filter(isDone).length;
  const counts = (type) => all.filter((t) => t.reasonType === type && !isDone(t)).length;
  $("#doneCount").textContent = done;
  $("#remainingCount").textContent = `${20 - done} tugas tersisa`;
  $("#progressRing").style.setProperty("--progress", `${done / 20 * 360}deg`);
  $("#overdueCount").textContent = counts("overdue");
  $("#riskCount").textContent = counts("risk") + counts("reactivation");
  $("#aftercareCount").textContent = counts("aftercare");
  $("#opportunityCount").textContent = counts("opportunity");
  const overdue = all.filter((t) => t.reasonType === "overdue" && !isDone(t)).length;
  $("#navInboxCount").textContent = overdue;
}

function getVisibleTasks() {
  const all = tasks();
  if (state.filter === "done") return all.filter(isDone);
  if (state.filter === "overdue") return all.filter((t) => t.reasonType === "overdue" && !isDone(t));
  if (state.filter === "followup") return all.filter((t) => t.reasonType !== "overdue" && !isDone(t));
  return [...all].sort((a, b) => {
    const doneOrder = Number(isDone(a)) - Number(isDone(b));
    if (doneOrder) return doneOrder;
    return Number(b.reasonType === "overdue") - Number(a.reasonType === "overdue");
  });
}

function taskCard(task, rank) {
  return `<article class="task-card ${task.reasonType === "overdue" ? "overdue" : ""} ${isDone(task) ? "done" : ""}" data-id="${task.id}">
    <div class="rank">${isDone(task) ? "✓" : String(rank).padStart(2, "0")}</div>
    <div class="customer"><strong>${task.name}</strong><small>${task.phone} · ${state.clinic}</small></div>
    <div class="reason"><span class="tag ${task.reasonType === "overdue" ? "overdue" : ""}">${isDone(task) ? outcomeLabels[task.outcome] : typeLabels[task.reasonType]}</span><strong>${task.reason}</strong><small>${task.detail}</small></div>
    <div class="card-actions">${isDone(task) ? `<button class="undo-action" data-id="${task.id}">Batalkan</button>` : `<button class="open-chat" data-id="${task.id}">Buka chat</button><button class="log-action" data-id="${task.id}">Catat hasil</button>`}</div>
  </article>`;
}

function renderTasks() {
  const visible = getVisibleTasks();
  $("#taskList").innerHTML = visible.length ? visible.map((t, i) => taskCard(t, i + 1)).join("") : `<div class="empty">Tidak ada tugas dalam kategori ini.</div>`;
}

function renderCustomers(query = "") {
  const q = query.toLowerCase();
  const rows = tasks().filter((t) => `${t.name} ${t.phone}`.toLowerCase().includes(q));
  $("#customerTable").innerHTML = rows.map((t) => `<tr><td><strong>${t.name}</strong><br><small>${t.phone}</small></td><td>${t.lastVisit}</td><td><span class="tag ${t.reasonType === "overdue" ? "overdue" : ""}">${typeLabels[t.reasonType]}</span></td><td>${isDone(t) ? outcomeLabels[t.outcome] : "Hari ini"}</td></tr>`).join("");
}

function renderInbox() {
  const inbox = tasks().filter((t) => t.reasonType === "overdue" && !isDone(t));
  $("#inboxList").innerHTML = inbox.length ? inbox.map((t, i) => taskCard(t, i + 1)).join("") : `<div class="empty">Semua chat prioritas sudah ditangani.</div>`;
}

function renderHistory() {
  const today = state.history.filter((item) => item.clinic === state.clinic);
  $("#historyList").innerHTML = today.length ? today.map((item) => `<div class="history-row"><span class="history-dot"></span><div><strong>${item.name}</strong><small> · ${outcomeLabels[item.outcome]}</small></div><time>${item.time}</time></div>`).join("") : `<div class="empty">Belum ada aktivitas yang dicatat untuk klinik ini.</div>`;
}

function switchView(view) {
  $$(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  $$(".view").forEach((el) => el.classList.remove("active"));
  $(`#${view}View`).classList.add("active");
  $(".sidebar").classList.remove("open");
}

function openOutcome(id) {
  const task = tasks().find((t) => t.id === id);
  if (!task) return;
  state.activeTaskId = id;
  $("#dialogCustomer").textContent = task.name;
  $("#actionDialog").showModal();
}

function recordOutcome(outcome) {
  const task = tasks().find((t) => t.id === state.activeTaskId);
  if (!task) return;
  task.status = "done";
  task.outcome = outcome;
  state.history.unshift({ clinic: state.clinic, taskId: task.id, name: task.name, outcome, time: new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()) });
  save(); render(); toast(`${task.name}: ${outcomeLabels[outcome]}`);
}

function undo(id) {
  const task = tasks().find((t) => t.id === id);
  if (!task) return;
  task.status = "pending"; task.outcome = null;
  state.history = state.history.filter((item) => item.taskId !== id);
  save(); render(); toast("Aktivitas dibatalkan");
}

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function makeBriefingText() {
  const pending = tasks().filter((t) => !isDone(t));
  const urgent = pending.filter((t) => t.reasonType === "overdue");
  const followups = pending.filter((t) => t.reasonType !== "overdue");
  return `☀️ MORNING BRIEFING — ${clinics[state.clinic].name.toUpperCase()}\n${new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}\n\nPrioritas hari ini: ${pending.length} pelanggan\n• ${urgent.length} chat malam/pagi belum dibalas\n• ${followups.length} follow-up terjadwal\n\nMulai dari chat yang belum dibalas, lalu lanjutkan sesuai urutan Customer Book. Catat setiap hasil: replied, booked, no response, atau follow-up later.\n\nTarget: selesai sebelum klinik tutup. Semangat tim ${state.clinic}!`;
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-item"); if (nav) switchView(nav.dataset.view);
  const filter = event.target.closest("[data-filter]");
  if (filter) { state.filter = filter.dataset.filter; $$("[data-filter]").forEach((el) => el.classList.toggle("active", el === filter)); renderTasks(); }
  const log = event.target.closest(".log-action"); if (log) openOutcome(log.dataset.id);
  const chat = event.target.closest(".open-chat"); if (chat) { toast("Simulasi membuka percakapan WhatsApp"); openOutcome(chat.dataset.id); }
  const cancel = event.target.closest(".undo-action"); if (cancel) undo(cancel.dataset.id);
});

$("#clinicSelect").addEventListener("change", (event) => { state.clinic = event.target.value; save(); render(); });
$("#customerSearch").addEventListener("input", (event) => renderCustomers(event.target.value));
$("#menuButton").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
$("#askAdminButton").addEventListener("click", openChat);
$("#closeChatButton").addEventListener("click", closeChat);
$("#chatBackdrop").addEventListener("click", closeChat);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && $("#chatPanel").classList.contains("open")) closeChat(); });
$("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); sendQuestion($("#chatInput").value); $("#chatInput").value = ""; });
$("#quickQuestions").addEventListener("click", (event) => { const button = event.target.closest("[data-question]"); if (button) sendQuestion(button.dataset.question); });
$("#startButton").addEventListener("click", () => { const first = tasks().find((t) => t.reasonType === "overdue" && !isDone(t)) || tasks().find((t) => !isDone(t)); if (first) { document.querySelector(`[data-id="${first.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => openOutcome(first.id), 350); } else toast("Semua tugas hari ini selesai"); });
$("#copyBriefingButton").addEventListener("click", async () => { await navigator.clipboard.writeText(makeBriefingText()); toast("Briefing berhasil disalin"); });
$("#resetButton").addEventListener("click", () => { state.data = makeData(); state.history = []; save(); render(); toast("Data contoh direset"); });
$$('[data-outcome]').forEach((button) => button.addEventListener("click", () => recordOutcome(button.dataset.outcome)));

$("#todayLabel").textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
$("#briefingDate").textContent = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(new Date());
render();
