const scopes = {
  CS: { name: "CS pusat · semua klinik", short: "CS pusat", admin: "Sasha", emoji: "👩🏻‍💼", color: "#e5c0a9" },
  SB: { name: "Setiabudi", short: "Setiabudi", admin: "Rani", emoji: "👩🏻‍💼", color: "#efb19c" },
  CITOS: { name: "Cilandak Town Square", short: "CITOS", admin: "Nara", emoji: "👩🏽‍⚕️", color: "#9bc6d5" },
  LMP: { name: "Lippo Mall Puri", short: "Lippo Mall Puri", admin: "Luma", emoji: "🧕🏻", color: "#c7b5db" },
  TSM: { name: "TSM Cibubur", short: "TSM Cibubur", admin: "Tami", emoji: "👩🏾‍💻", color: "#e7c66f" },
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dayNumber = () => Math.floor(new Date(`${todayKey()}T00:00:00+07:00`).getTime() / 86400000);
const wave = () => dayNumber() % 2 ? "A" : "B";
const dateText = (date) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" }).format(date);
const packageSheet = {
  url: "https://docs.google.com/spreadsheets/d/1jewZj2HxEssuQEaCP30FARxNiTG2ySQ1Rhhoerefxck/edit",
  checked: "15 Oktober 2026",
  period: "15 Oktober 2026–15 Januari 2027",
};
function packageSheetText() { return `Pengingat sisa paket\nBerikut daftar pelanggan Silver, Gold, dan Platinum yang masih memiliki sisa sesi dan paketnya kedaluwarsa ${packageSheet.period}:\n${packageSheet.url}\nData diperiksa ${packageSheet.checked}. Periksa status paket terbaru di backendv2 sebelum menghubungi pelanggan.`; }
const followUpCheck = "Sebelum follow-up, cek chat dan jadwal terbaru. Tunda pesan jika ada keluhan yang belum selesai, pelanggan meminta berhenti, atau sudah menerima follow-up dalam 7 hari terakhir.";
const outcomes = { replied: "Sudah membalas", booked: "Berhasil booking", no_response: "Tidak merespons", later: "Follow-up nanti" };
const categories = {
  chat: { label: "Chat belum dibalas", rank: 0 }, dormant: { label: "Gold / Platinum", rank: 1 }, package: { label: "Sisa paket", rank: 2 },
  appointment: { label: "Konfirmasi jadwal", rank: 0 }, aftercare: { label: "Aftercare", rank: 1 }, recovery: { label: "Bantu jadwal ulang", rank: 2 }, continuation: { label: "Jadwal lanjutan", rank: 2 }, slot: { label: "Slot tersedia", rank: 3 },
};

function demoTasks() {
  const list = [];
  const customerNames = {
    A: { chat: ["Alya P.", "Bima R.", "Citra N.", "Dina S."], dormant: ["Elisa M.", "Farah T.", "Gita L."], package: ["Hana W.", "Intan K."] },
    B: { chat: ["Jasmine A.", "Kezia P.", "Laras D.", "Maya C."], dormant: ["Nadia H.", "Olivia R.", "Putri S."], package: ["Raisa N.", "Sinta F."] },
  };
  const topics = ["bertanya jadwal treatment", "bertanya tentang promo", "ingin mengubah jam kunjungan", "bertanya lokasi klinik"];
  const times = ["22.14", "23.02", "07.38", "09.16"];
  const replies = [
    "Pagi, Kak. Terima kasih sudah menghubungi Surface 😊 Kakak ingin datang ke cabang mana dan hari apa? Aku bantu cek jadwal yang tersedia dulu ya.",
    "Pagi, Kak. Aku cek dulu ketentuan promo yang berlaku supaya informasinya tepat. Kakak tertarik treatment apa?",
    "Pagi, Kak. Aku bantu cek kemungkinan pindah jamnya ya. Kakak ingin datang sekitar pukul berapa? Nanti aku konfirmasi setelah jadwal klinik dicek.",
    "Pagi, Kak. Surface punya cabang di Setiabudi, CITOS, Lippo Mall Puri, dan TSM Cibubur. Kakak ingin datang ke cabang yang mana? Aku kirimkan lokasinya.",
  ];
  for (const group of ["A", "B"]) {
    customerNames[group].chat.forEach((name, i) => list.push({ id: `CS-${group}-CHAT-${i}`, scope: "CS", group, category: "chat", name, clinic: "Belum dipastikan", reason: `Chat masuk ${times[i]} · ${topics[i]}`, detail: "Pesan pelanggan belum dibalas; waktu dan isi ini contoh.", reply: replies[i], source: "WooBlazz · contoh" }));
    customerNames[group].dormant.forEach((name, i) => list.push({ id: `CS-${group}-DORMANT-${i}`, scope: "CS", group, category: "dormant", name, clinic: ["Setiabudi", "CITOS", "Lippo Mall Puri"][i], reason: `${i === 1 ? "Platinum" : "Gold"} · ${120 + i * 32} hari sejak treatment terakhir`, detail: "Belum ada appointment mendatang pada data contoh.", reply: `Halo, Kak ${name.split(" ")[0]}. Apa kabar? Sudah cukup lama sejak kunjungan terakhir Kakak ke Surface. Kalau ingin melanjutkan perawatan, aku bisa bantu cek jadwal yang nyaman. Lebih cocok hari kerja atau akhir pekan?`, source: "backendv2 · contoh" }));
    customerNames[group].package.forEach((name, i) => {
      const remaining = i + 1;
      const expiry = new Date(); expiry.setDate(expiry.getDate() + (i ? 28 : 14));
      list.push({ id: `CS-${group}-PACKAGE-${i}`, scope: "CS", group, category: "package", name, clinic: i ? "TSM Cibubur" : "Setiabudi", reason: `${remaining} sesi tersisa · berlaku hingga ${dateText(expiry)}`, detail: "Paket belum dijadwalkan pada data contoh.", reply: `Halo, Kak ${name.split(" ")[0]}. Paket treatment Kakak masih memiliki ${remaining} sesi yang bisa digunakan hingga ${dateText(expiry)}. Kalau Kakak ingin memakainya, aku bisa bantu carikan jadwal. Ada hari yang Kakak inginkan?`, source: "backendv2 · contoh" });
    });
  }
  const clinicNames = {
    SB: [["Tasya P.", "Wulan D.", "Yuni L.", "Zahra K."], ["Aisyah R.", "Bella M.", "Cindy H.", "Dewi N."]],
    CITOS: [["Eka P.", "Fira T.", "Gina R.", "Hilda S."], ["Indah L.", "Jelita M.", "Karin D.", "Lia W."]],
    LMP: [["Mira N.", "Nina F.", "Ocha L.", "Prita S."], ["Qila D.", "Rani T.", "Salsa M.", "Tiara H."]],
    TSM: [["Uli P.", "Vina K.", "Winda R.", "Yola S."], ["Ziva L.", "Anya M.", "Bunga T.", "Caca F."]],
  };
  Object.keys(clinicNames).forEach((scope) => ["A", "B"].forEach((group, groupIndex) => {
    const [appointment, aftercare, continuation, slot] = clinicNames[scope][groupIndex];
    const clinic = scopes[scope].short;
    list.push({ id: `${scope}-${group}-APPOINTMENT`, scope, group, category: "appointment", name: appointment, clinic, reason: "Appointment hari ini · menunggu konfirmasi", detail: "Periksa tanggal, jam, dan treatment sebelum menghubungi pelanggan.", reply: `Pagi, Kak ${appointment.split(" ")[0]}. Kami ingin mengonfirmasi appointment Kakak di Surface ${clinic} hari ini. Apakah Kakak jadi datang sesuai jadwal yang sudah tercatat?`, source: "backendv2 · contoh" });
    list.push({ id: `${scope}-${group}-AFTERCARE`, scope, group, category: "aftercare", name: aftercare, clinic, reason: "Saatnya cek kondisi setelah treatment", detail: "Tanyakan kondisi pelanggan; teruskan keluhan ke petugas klinik.", reply: `Halo, Kak ${aftercare.split(" ")[0]}. Kami dari Surface ${clinic} ingin menanyakan kabar setelah treatment kemarin. Bagaimana kondisi Kakak hari ini? Kalau ada hal yang mengganggu, ceritakan kepada kami ya.`, source: "Jadwal aftercare · contoh" });
    list.push({ id: `${scope}-${group}-CONTINUATION`, scope, group, category: "continuation", name: continuation, clinic, reason: "Belum ada jadwal treatment lanjutan", detail: "Tawarkan bantuan jadwal sesuai rencana perawatan.", reply: `Halo, Kak ${continuation.split(" ")[0]}. Kami ingin membantu jika Kakak berencana melanjutkan treatment di Surface ${clinic}. Ada hari atau jam yang nyaman untuk Kakak? Kami cek jadwalnya dulu ya.`, source: "backendv2 · contoh" });
    list.push({ id: `${scope}-${group}-SLOT`, scope, group, category: "slot", name: slot, clinic, reason: "Pernah meminta jadwal · ada slot tersedia", detail: "Pastikan slot masih kosong sebelum menawarkan waktu tertentu.", reply: `Halo, Kak ${slot.split(" ")[0]}. Kami dari Surface ${clinic} ingin menindaklanjuti permintaan jadwal Kakak. Apakah Kakak masih mencari waktu treatment minggu ini? Kalau iya, aku bantu cek pilihan jamnya.`, source: "WhatsApp klinik · contoh" });
  }));
  return list;
}

const pool = demoTasks();
const byId = new Map(pool.map((task) => [task.id, task]));
const backend = { configured: false, appointments: null, briefingTasks: null, coverage: null, date: null, loading: false, error: "" };
function isPriority(task) { return categories[task.category].rank === 0 || (backend.configured && task.scope === "CS" && task.category === "package"); }
function clinicCode(name) {
  const value = String(name || "").toLowerCase();
  if (value.includes("setiabudi")) return "SB";
  if (value.includes("cilandak") || value.includes("citos")) return "CITOS";
  if (value.includes("puri") || value.includes("lmp")) return "LMP";
  if (value.includes("cibubur") || value.includes("tsm")) return "TSM";
  return null;
}
function liveAppointmentTask(item) {
  const scope = clinicCode(item.clinic);
  if (!scope || !item.id || !/scheduled|pending/i.test(item.status)) return null;
  const name = item.customer || "Pelanggan";
  const time = item.time || "jam yang tercatat";
  return { id: `B2-${item.id}`, scope, period: "today", category: "appointment", name, clinic: scopes[scope].short, score: 120,
    reason: `Appointment hari ini ${time} · ${item.status}`, detail: "Jadwal dari backendv2. Periksa detail dan status terbaru sebelum menghubungi pelanggan.",
    reply: `Pagi, Kak ${name.split(" ")[0]}. Kami dari Surface ${scopes[scope].short} ingin mengonfirmasi appointment Kakak hari ini pukul ${time}. Apakah Kakak jadi datang sesuai jadwal?`,
    source: "backendv2 · langsung" };
}
const storageKey = "surface-daily-demo-v2";
function readStored() { try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; } }
const stored = readStored();
const retiredChatNote = "Catatan: daftar chat menunggu diisi setelah pemeriksaan manual WooBlazz. Jika belum diperiksa, daftar ini belum tentu lengkap.";
for (const [key, draft] of Object.entries(stored.sendDrafts || {})) if (typeof draft === "string" && draft.includes(retiredChatNote)) stored.sendDrafts[key] = draft.replace(`\n\n${retiredChatNote}`, "");
for (const [key, draft] of Object.entries(stored.sendDrafts || {})) {
  if (!key.endsWith(":CS") || typeof draft !== "string" || !draft.includes("Ingatkan paket yang segera berakhir (")) continue;
  stored.sendDrafts[key] = draft.replace(/\n\nIngatkan paket yang segera berakhir \(\d+\)\n[\s\S]*?(?=\n\n(?:Sapa pelanggan membership yang berisiko|Catat hasil setelah ditangani))/, `\n\n${packageSheetText()}`);
}
const state = { scope: scopes[stored.scope] ? stored.scope : "CS", sendScope: "CS", sendDrafts: stored.sendDrafts || {}, sentBriefings: stored.sentBriefings || {}, filter: "all", records: stored.records || {}, rotation: stored.rotation || {}, chatReminders: stored.chatReminders || {}, activeTaskId: null, conversations: {} };
function save() { localStorage.setItem(storageKey, JSON.stringify({ scope: state.scope, records: state.records, rotation: state.rotation, chatReminders: state.chatReminders, sendDrafts: state.sendDrafts, sentBriefings: state.sentBriefings })); }
function record(task) { return state.records[task.id]; }
function isDone(task) { return record(task)?.date === todayKey() && Boolean(record(task).outcome); }
function suppressed(task) {
  const entry = record(task);
  if (!entry || entry.date === todayKey()) return false;
  const age = dayNumber() - Math.floor(new Date(`${entry.date}T00:00:00+07:00`).getTime() / 86400000);
  if (entry.outcome === "booked") return age >= 0 && age < 30;
  if (entry.outcome === "no_response") return age >= 0 && age < (task.stage === "Lama tidak kembali" ? 90 : 14);
  return false;
}
function rotateMembers(candidates) {
  const ordered = [...candidates].sort((a, b) => Number(a.stage === "Lama tidak kembali") - Number(b.stage === "Lama tidak kembali") || a.id.localeCompare(b.id));
  const today = todayKey();
  const rotation = state.rotation;
  const yesterday = new Date(`${today}T00:00:00+07:00`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(yesterday);
  const priorIds = rotation.date === yesterdayKey ? rotation.ids || [] : [];
  const savedIds = rotation.date === today ? rotation.ids || [] : [];
  const lastShown = rotation.lastShown || {};
  const eligible = ordered.filter((task) => {
    if (priorIds.includes(task.id)) return false;
    if (task.stage !== "Lama tidak kembali" || savedIds.includes(task.id) || !lastShown[task.id]) return true;
    return dayNumber() - Math.floor(new Date(`${lastShown[task.id]}T00:00:00+07:00`).getTime() / 86400000) >= 90;
  });
  const selected = savedIds.map((id) => eligible.find((task) => task.id === id)).filter(Boolean);
  const used = new Set(selected.map((task) => task.id));
  const start = Math.max(0, eligible.findIndex((task) => task.id === rotation.cursor));
  const cycle = [...eligible.slice(start), ...eligible.slice(0, start)];
  for (const task of cycle) {
    if (selected.length >= 3) break;
    if (used.has(task.id)) continue;
    selected.push(task); used.add(task.id);
  }
  const lastIndex = ordered.findIndex((task) => task.id === selected.at(-1)?.id);
  const nextCursor = ordered.length ? ordered[(lastIndex + 1) % ordered.length].id : "";
  if (rotation.date !== today || savedIds.join() !== selected.map((task) => task.id).join() || rotation.cursor !== nextCursor) {
    selected.filter((task) => task.stage === "Lama tidak kembali").forEach((task) => { lastShown[task.id] = today; });
    state.rotation = { date: today, ids: selected.map((task) => task.id), cursor: nextCursor, lastShown };
    save();
  }
  return selected;
}
function verifiedChats(scope) {
  return (state.chatReminders[`${todayKey()}:${scope}`] || []).map((item) => ({ ...item, scope, category: "chat", clinic: scopes[scope].short, source: "WooBlazz · diperiksa manual", reason: `Pesan ${item.time || "malam/pagi"} belum dibalas · ${item.phone}`, detail: "Pesan terakhir dari pelanggan dan masih membutuhkan jawaban. Periksa lagi sebelum membalas.", strategy: "Baca pertanyaan terakhir dan balas sesuai konteks percakapan.", reply: `Halo, Kak ${item.name.split(" ")[0]}. Terima kasih sudah menunggu. Kami bantu jawab pertanyaan Kakak ya.` }));
}
function tasks(scope = state.scope) {
  const source = backend.configured ? (backend.briefingTasks ? [
    ...backend.briefingTasks.filter((task) => !(task.scope !== "CS" && task.category === "appointment" && task.period === "today")),
    ...(backend.appointments || []).map((task) => ({ ...task, phone: backend.briefingTasks.find((item) => item.id === task.id)?.phone || task.phone || "" })),
  ] : (scope === "CS" ? [] : backend.appointments || [])) : pool.filter((task) => task.group === wave());
  const candidates = source.filter((task) => task.scope === scope && !suppressed(task));
  const chats = verifiedChats(scope).filter((task) => !suppressed(task));
  chats.forEach((task) => byId.set(task.id, task));
  if (backend.configured && backend.briefingTasks && scope === "CS") {
    const packages = candidates.filter((task) => task.category === "package").sort((a, b) => Date.parse(a.expiresAt || "9999-12-31") - Date.parse(b.expiresAt || "9999-12-31") || a.id.localeCompare(b.id)).slice(0, 4);
    const members = rotateMembers(candidates.filter((task) => task.category === "dormant"));
    return [...chats, ...packages, ...members];
  }
  return [...chats, ...candidates.sort((a, b) => (b.score || 0) - (a.score || 0) || categories[a.category].rank - categories[b.category].rank)].slice(0, scope === "CS" ? 7 : 5);
}
function taskUrl(task) { const url = new URL(location.href); url.hash = new URLSearchParams({ task: task.id }).toString(); return url.toString(); }
function wooblazzUrl(task) { return /^62\d{8,13}$/.test(task.phone || "") ? `https://crm.wooblazz.com/chat/${task.phone}` : ""; }
function sections(scope = state.scope) {
  return scope === "CS" && backend.configured ? [
    { category: "chat", title: "Balas chat yang menunggu", description: "Daftar ini diperiksa manual di WooBlazz. Baca pesan terakhir lagi sebelum membalas." },
    { category: "package", title: "Ingatkan paket yang segera berakhir", description: "Sisa sesi dan tanggal kedaluwarsa diverifikasi dari backendv2. Pastikan ketentuan paket sebelum menawarkan jadwal." },
    { category: "dormant", title: "Sapa pelanggan membership yang berisiko", description: "Platinum ≥60 hari atau Gold ≥90 hari sejak treatment selesai dan lunas. Yang sudah ≥180 hari dihubungi lebih jarang; mulai dengan mendengarkan, bukan promosi." },
  ] : scope === "CS" ? [
    { category: "chat", title: "Balas chat yang tertunda", description: "Pesan masuk pukul 22.00 kemarin–09.00 hari ini. Jawab pertanyaan terakhir pelanggan lebih dulu." },
    { category: "dormant", title: "Sapa pelanggan Gold dan Platinum", description: "Sudah lama tidak treatment dan belum punya jadwal. Tanyakan kebutuhan mereka lebih dulu." },
    { category: "package", title: "Ingatkan sisa sesi paket", description: "Sebut jumlah kredit dan tanggal kedaluwarsa yang sudah diverifikasi." },
  ] : backend.briefingTasks ? [
    { category: "chat", title: "Balas chat yang menunggu", description: "Daftar ini diperiksa manual di WooBlazz. Baca pesan terakhir lagi sebelum membalas." },
    { category: "appointment", title: "Konfirmasi appointment", description: "Jadwal hari ini atau besok berstatus scheduled. Pastikan status terbaru sebelum menghubungi." },
    { category: "aftercare", title: "Cek kondisi setelah treatment", description: "Kunjungan kemarin yang selesai dan lunas. Dengarkan keluhan dan teruskan ke petugas klinik." },
    { category: "recovery", title: "Bantu jadwal ulang", description: "Appointment hari ini dibatalkan dan belum ditemukan jadwal pengganti besok. Cek alasan sebelum menghubungi." },
  ] : backend.appointments !== null ? [
    { category: "chat", title: "Balas chat yang menunggu", description: "Daftar ini diperiksa manual di WooBlazz." },
    { category: "appointment", title: "Konfirmasi appointment", description: "Jadwal hari ini dari backendv2. Pastikan status terbaru sebelum menghubungi pelanggan." },
  ] : [
    { category: "appointment", title: "Konfirmasi appointment", description: "Pastikan jadwal pelanggan dan kesiapan klinik." },
    { category: "aftercare", title: "Cek kondisi pelanggan", description: "Dengarkan keluhan setelah treatment dan teruskan kepada petugas yang tepat." },
    { category: "continuation", title: "Bantu jadwal lanjutan", description: "Hubungi pelanggan klinik yang belum memiliki appointment berikutnya." },
    { category: "slot", title: "Isi slot yang tersedia", description: "Tawarkan kepada pelanggan yang pernah meminta jadwal setelah slot dipastikan kosong." },
  ];
}
function briefingText(scope = state.scope) {
  const all = tasks(scope);
  const pending = all.filter((task) => !isDone(task) && !(scope === "CS" && backend.configured && task.category === "package"));
  const heading = scope === "CS" ? "CS PUSAT · SEMUA KLINIK" : `KLINIK ${scopes[scope].short.toUpperCase()}`;
  const lines = [`☀️ BRIEFING PAGI — ${heading}`, dateText(new Date()), "", `Pagi, tim! Ada ${pending.length} tugas pelanggan hari ini. Kita kerjakan sesuai urutan berikut:`];
  sections(scope).forEach((section) => {
    if (scope === "CS" && backend.configured && section.category === "package") {
      lines.push("", packageSheetText());
      return;
    }
    const matching = all.filter((task) => task.category === section.category && !isDone(task));
    if (!matching.length) return;
    lines.push("", `${section.title} (${matching.length})`, section.description);
    matching.forEach((task) => lines.push(`• ${task.name}${task.category === "chat" ? ` (${task.phone})` : ""} — ${task.reason}. ${task.strategy || task.detail} ${wooblazzUrl(task) ? `Chat WooBlazz: ${wooblazzUrl(task)}` : `Nomor WooBlazz belum tersedia; detail tugas: ${taskUrl(task)}`}`));
  });
  lines.push("", followUpCheck, "", "Catat hasil setelah ditangani supaya pelanggan tidak dihubungi dua kali. Terima kasih! 🌿");
  return lines.join("\n");
}
const sendKey = (scope) => `${todayKey()}:${scope}`;
function sendReady() { return backend.configured && backend.briefingTasks !== null && backend.date === todayKey(); }
function renderSend() {
  const scope = state.sendScope;
  const ready = sendReady();
  const chatItems = state.chatReminders[sendKey(scope)] || [];
  $("#chatEntryList").innerHTML = chatItems.length ? chatItems.map((item) => `<div class="chat-entry-row"><span><strong>${escapeHTML(item.name)}</strong> · ${escapeHTML(item.phone)} · ${escapeHTML(item.time)}</span><button type="button" data-remove-chat="${escapeHTML(item.id)}" aria-label="Hapus chat ${escapeHTML(item.name)}">Hapus</button></div>`).join("") : "<p>Belum ada chat yang dicatat untuk tim ini hari ini.</p>";
  $$("[data-send-scope]").forEach((tab) => {
    const active = tab.dataset.sendScope === scope;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.querySelector("[data-send-status]").textContent = state.sentBriefings[sendKey(tab.dataset.sendScope)] ? "✓" : "";
  });
  $("#sendPanel").setAttribute("aria-labelledby", `sendTab-${scope}`);
  $("#sendHeading").textContent = `Briefing ${scopes[scope].short}`;
  $("#sendDate").textContent = dateText(new Date());
  const sent = state.sentBriefings[sendKey(scope)];
  $("#sendStatus").textContent = sent ? `Briefing hari ini sudah dikirim · dikonfirmasi ${sent.time} WIB` : "Belum dikonfirmasi terkirim hari ini";
  $("#sendStatus").classList.toggle("is-sent", Boolean(sent));
  $("#sendMessage").disabled = !ready;
  $("#sendMessage").value = ready ? (state.sendDrafts[sendKey(scope)] ?? briefingText(scope)) : `BRIEFING PAGI — ${scope === "CS" ? "CS PUSAT" : `KLINIK ${scopes[scope].short.toUpperCase()}`}\n${dateText(new Date())}\n\nData backendv2 hari ini belum tersedia. Teks briefing akan muncul setelah data berhasil dimuat.`;
  $("#sendMessage").placeholder = backend.configured ? "Menunggu briefing backendv2 hari ini selesai dimuat…" : "Hubungkan backendv2 agar briefing nyata tersedia.";
  $("#sendHint").textContent = !ready ? backend.error || (backend.configured ? "Briefing sedang disusun. Tunggu data hari ini sebelum menyalin." : "Mode contoh tidak dapat dikonfirmasi sebagai pesan terkirim.") : backend.error ? `Periksa data sebelum mengirim: ${backend.error}` : "Perubahan teks tersimpan di browser ini untuk hari ini.";
  $("#sendCopyButton").disabled = !ready;
  $("#sendConfirmButton").disabled = !ready || Boolean(sent);
  $("#sendConfirmButton").textContent = sent ? "Sudah dikonfirmasi" : "Konfirmasi";
  const contacts = ready ? tasks(scope).filter((task) => !isDone(task) && !(scope === "CS" && task.category === "package")) : [];
  $("#sendContactList").innerHTML = !ready ? `<p>Daftar chat muncul setelah briefing backendv2 dimuat.</p>` : contacts.length ? contacts.map((task) => `<div class="send-contact"><span>${escapeHTML(task.name)}<small>${escapeHTML(task.reason)}</small></span>${wooblazzUrl(task) ? `<a href="${wooblazzUrl(task)}" target="_blank" rel="noopener noreferrer" aria-label="Buka chat WooBlazz ${escapeHTML(task.name)}">Buka chat ↗</a>` : `<small>Nomor belum tersedia</small>`}</div>`).join("") : `<p>Tidak ada pelanggan dalam briefing ini.</p>`;
}
function renderBriefing() {
  const all = tasks();
  const pending = all.filter((task) => !isDone(task) && !(state.scope === "CS" && backend.configured && task.category === "package"));
  const title = state.scope === "CS" ? "CS pusat" : `tim ${scopes[state.scope].short}`;
  let html = `<p><strong>Pagi, ${escapeHTML(title)}! ☀️</strong><br>Ada ${pending.length} tugas pelanggan hari ini. Kerjakan sesuai urutan berikut:</p>`;
  sections().forEach((section) => {
    if (state.scope === "CS" && backend.configured && section.category === "package") {
      html += `<section><h3>Pengingat sisa paket</h3><p>Daftar Silver, Gold, dan Platinum dengan sisa sesi yang kedaluwarsa ${escapeHTML(packageSheet.period)}. Data diperiksa ${escapeHTML(packageSheet.checked)}; cek status terbaru sebelum menghubungi pelanggan.</p><a href="${packageSheet.url}" target="_blank" rel="noopener noreferrer">Buka spreadsheet ↗</a></section>`;
      return;
    }
    const matching = all.filter((task) => task.category === section.category && !isDone(task));
    if (!matching.length) return;
    html += `<section><h3>${escapeHTML(section.title)} <span>(${matching.length})</span></h3><p>${escapeHTML(section.description)}</p><ul>`;
    html += matching.map((task) => `<li><span>${escapeHTML(task.name)} — ${escapeHTML(task.reason)}${task.stage ? ` · ${escapeHTML(task.stage)}` : ""}${task.strategy ? `<small>Langkah: ${escapeHTML(task.strategy)}</small>` : ""}</span><a href="${escapeHTML(taskUrl(task))}" data-task-link="${escapeHTML(task.id)}">Buka tugas ↗</a></li>`).join("");
    html += "</ul></section>";
  });
  const coverage = backend.configured && state.scope === "CS" && backend.coverage ? `<p class="demo-link-note">${backend.coverage.membersChecked} anggota diperiksa; ${backend.coverage.membersFailed} gagal dibaca.</p>` : "";
  $("#briefingPreview").innerHTML = html + coverage + `<p>${escapeHTML(followUpCheck)}</p><p class="briefing-footer">Catat hasil setelah ditangani supaya pelanggan tidak dihubungi dua kali. Terima kasih! 🌿</p><p class="demo-link-note">Tautan tugas membuka aplikasi ini. Catatan hasil tersimpan di browser perangkat ini saja.</p>`;
}
function card(task, index) {
  const done = isDone(task);
  const urgent = isPriority(task);
  return `<article class="task-card ${urgent ? "overdue" : ""} ${done ? "done" : ""}" id="task-${escapeHTML(task.id)}">
    <div class="rank">${done ? "✓" : String(index + 1).padStart(2, "0")}</div>
    <div class="customer"><strong>${escapeHTML(task.name)}</strong><small>${escapeHTML(task.clinic)} · ${escapeHTML(task.source)}</small></div>
    <div class="reason"><span class="tag ${urgent ? "overdue" : ""}">${escapeHTML(done ? outcomes[record(task).outcome] : task.stage || categories[task.category].label)}</span><strong>${escapeHTML(task.reason)}</strong><small>${escapeHTML(task.detail)}</small>${task.strategy ? `<small><b>Langkah:</b> ${escapeHTML(task.strategy)}</small>` : ""}</div>
    <div class="card-actions"><button class="open-task" data-id="${escapeHTML(task.id)}">Lihat tugas</button>${done ? `<button class="undo-action" data-id="${escapeHTML(task.id)}">Batalkan</button>` : `<button class="copy-task" data-id="${escapeHTML(task.id)}">Salin tautan</button>`}</div>
  </article>`;
}
function filtered() {
  const all = tasks();
  if (state.filter === "done") return all.filter(isDone);
  if (state.filter === "overdue") return all.filter((task) => isPriority(task) && !isDone(task));
  if (state.filter === "followup") return all.filter((task) => !isPriority(task) && !isDone(task));
  return [...all].sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || categories[a.category].rank - categories[b.category].rank);
}
function renderLists() {
  const visible = filtered();
  $("#taskList").innerHTML = visible.length ? visible.map(card).join("") : `<div class="empty">Tidak ada tugas dalam kategori ini.</div>`;
  renderSearch();
  const urgent = tasks().filter((task) => isPriority(task) && !isDone(task));
  $("#inboxList").innerHTML = urgent.length ? urgent.map(card).join("") : `<div class="empty">Prioritas utama sudah ditangani.</div>`;
}
function renderSearch() {
  const query = $("#customerSearch").value.trim().toLowerCase();
  const matching = tasks().filter((task) => `${task.name} ${task.reason} ${task.clinic}`.toLowerCase().includes(query));
  $("#customerTable").innerHTML = matching.length ? matching.map(card).join("") : `<div class="empty">Tidak ada tugas yang cocok.</div>`;
}
function renderHistory() {
  const done = tasks().filter(isDone).sort((a, b) => (record(b).time || "").localeCompare(record(a).time || ""));
  $("#historyList").innerHTML = done.length ? done.map((task) => `<div class="history-row"><span class="history-dot"></span><div><strong>${escapeHTML(task.name)}</strong><small> · ${escapeHTML(outcomes[record(task).outcome])}</small></div><time>${escapeHTML(record(task).time)}</time></div>`).join("") : `<div class="empty">Belum ada hasil yang dicatat hari ini.</div>`;
}
function renderMetrics() {
  const all = tasks(), pending = all.filter((task) => !isDone(task)), done = all.length - pending.length;
  const count = (category) => pending.filter((task) => task.category === category).length;
  const liveClinic = state.scope !== "CS" && backend.configured;
  $("#doneCount").textContent = done;
  $("#totalCount").textContent = `dari ${all.length}`;
  $("#remainingCount").textContent = `${pending.length} tugas tersisa`;
  $("#progressRing").style.setProperty("--progress", `${all.length ? done / all.length * 360 : 0}deg`);
  $("#overdueCount").textContent = state.scope === "CS" ? count(backend.configured ? "package" : "chat") : count("appointment");
  $("#riskCount").textContent = state.scope === "CS" ? count("dormant") : count("aftercare");
  $("#aftercareCount").textContent = state.scope === "CS" ? count(backend.configured ? "chat" : "package") : count(liveClinic ? "recovery" : "continuation");
  $("#opportunityCount").textContent = state.scope === "CS" || liveClinic ? done : count("slot");
  $("#navInboxCount").textContent = state.scope === "CS" ? count(backend.configured ? "package" : "chat") : count("appointment");
}
function render() {
  const scope = state.scope, admin = scopes[scope], all = tasks();
  const liveClinic = scope !== "CS" && (backend.briefingTasks !== null || backend.appointments !== null);
  const liveCs = scope === "CS" && backend.briefingTasks !== null;
  const urgent = all.filter((task) => isPriority(task) && !isDone(task)).length;
  $("#clinicSelect").value = scope;
  $("#clinicCode").textContent = scope;
  $("#heroTitle").textContent = scope === "CS" ? liveCs ? `${all.length} tugas prioritas CS dari backendv2.` : backend.configured ? "Briefing CS sedang disusun." : `${urgent} chat contoh menunggu balasan pagi ini.` : `${all.length} tugas untuk tim ${admin.short} hari ini.`;
  $("#briefingIntro").textContent = scope === "CS" ? liveCs ? "Prioritaskan sisa paket dan pelanggan Gold/Platinum." : backend.configured ? "Riwayat anggota sedang diperiksa untuk menemukan tindak lanjut yang relevan." : "Data CS masih contoh sampai prioritas backendv2 tersambung." : backend.briefingTasks ? "Konfirmasi jadwal, cek kondisi setelah treatment, dan bantu jadwal ulang dari data backendv2." : liveClinic ? "Appointment hari ini dari backendv2 yang masih perlu konfirmasi." : "Konfirmasi jadwal, cek kondisi pelanggan, lalu isi slot yang tersedia.";
  $("#adminName").textContent = `${admin.admin} · ${admin.short}`;
  $("#adminGreeting").textContent = scope === "CS" ? backend.configured ? "Saya bantu CS pusat mengurutkan paket dan pelanggan membership dari backendv2." : "Saya bantu CS pusat mengurutkan chat, pelanggan lama, dan sisa paket." : `Saya bantu tim ${admin.short} merapikan tugas hari ini.`;
  for (const portrait of [$("#adminPortrait"), $("#chatAdminPortrait")]) { portrait.style.setProperty("--portrait-bg", admin.color); portrait.querySelector("span").textContent = admin.emoji; }
  $("#chatAdminName").textContent = `${admin.admin} · ${admin.short}`;
  const labels = scope === "CS" ? backend.configured ? ["Paket mendekati batas", "Gold & Platinum", "Chat WhatsApp", "Selesai"] : ["Chat tertunda", "Gold & Platinum", "Sisa paket", "Selesai"] : liveClinic ? ["Perlu konfirmasi", "Cek kondisi", "Bantu jadwal ulang", "Selesai"] : ["Konfirmasi jadwal", "Aftercare", "Jadwal lanjutan", "Slot tersedia"];
  const helps = scope === "CS" ? backend.configured ? ["Sisa sesi terverifikasi", "Risiko kunjungan", "Belum terhubung", "Hasil dicatat hari ini"] : ["22.00 kemarin–09.00 hari ini", "Lama tidak treatment", "Kredit belum dipakai", "Hasil dicatat hari ini"] : liveClinic ? ["Hari ini dan besok", "Treatment kemarin", "Pembatalan hari ini", "Catatan di browser ini"] : ["Appointment perlu dipastikan", "Cek kondisi setelah treatment", "Belum ada appointment", "Pelanggan sedang mencari jadwal"];
  ["One", "Two", "Three", "Four"].forEach((word, i) => { $(`#metric${word}Label`).textContent = labels[i]; $(`#metric${word}Help`).textContent = helps[i]; });
  $("#priorityTitle").textContent = scope === "CS" ? backend.configured ? "Paket mendekati kedaluwarsa" : "Chat belum dibalas" : "Appointment perlu konfirmasi";
  $("#priorityHelp").textContent = scope === "CS" ? backend.configured ? "Sisa sesi paket Gold/Platinum yang sudah diverifikasi." : "Pesan pelanggan pukul 22.00 kemarin–09.00 hari ini yang belum dijawab. Data pada layar ini masih contoh." : liveClinic ? "Appointment dari backendv2. Cek status terbaru sebelum menghubungi pelanggan." : "Cek jadwal dan hubungi pelanggan melalui WhatsApp klinik. Data pada layar ini masih contoh.";
  const status = $("#dataStatus");
  status.querySelector("strong").textContent = backend.briefingTasks ? "Briefing backendv2 aktif" : liveClinic ? "Appointment backendv2 aktif" : backend.configured ? "Menyusun briefing" : "Data contoh";
  status.querySelector("small").textContent = backend.error || (backend.loading ? "Memeriksa riwayat membership dan jadwal…" : backend.briefingTasks ? `Diperbarui ${new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(backend.coverage?.fetchedAt || Date.now()))}` : liveClinic ? "Appointment aktif; analisis sedang disusun" : backend.configured ? "Pelanggan backendv2 bisa dicari" : "Backendv2 belum terhubung");
  $("#backendLookup").hidden = !backend.configured;
  $("#refreshDataButton").hidden = !backend.configured;
  $("#refreshDataButton").disabled = backend.loading;
  $("#modePill").textContent = backend.configured ? "LOKAL · BACKENDV2" : location.hostname === "127.0.0.1" || location.hostname === "localhost" ? "DEMO LOKAL" : "DEMO PUBLIK";
  $("#guideLabel").lastChild.textContent = backend.configured ? " Pemandu briefing backendv2" : " Pemandu briefing demo";
  $(".chat-note").textContent = backend.briefingTasks ? "Jawaban mengikuti daftar tugas backendv2 yang tampil; bukan AI klinis." : liveClinic ? "Jawaban mengikuti daftar appointment backendv2 yang tampil; bukan AI klinis." : "Demo lokal · jawaban berasal dari tugas contoh di layar";
  $(".dialog-note").textContent = backend.configured ? "Data dibaca dari backendv2; draf balasan adalah contoh. Periksa status terbaru dan ketentuan sebelum mengirim." : "Data dan balasan ini contoh. Periksa jadwal, harga, dan paket sebelum mengirim pesan.";
  renderMetrics(); renderBriefing(); renderLists(); renderHistory(); renderConversation(); renderSend();
}
function conversation() {
  if (!state.conversations[state.scope]) state.conversations[state.scope] = [{ role: "admin", text: `Pagi! Saya ${scopes[state.scope].admin}. Tanyakan prioritas, jumlah tugas, atau nama pelanggan yang muncul untuk ${scopes[state.scope].short}.` }];
  return state.conversations[state.scope];
}
function renderConversation() { $("#chatMessages").innerHTML = conversation().map((message) => `<div class="message ${message.role}">${escapeHTML(message.text)}<time>${escapeHTML(message.time || "Sekarang")}</time></div>`).join(""); $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight; }
function adminAnswer(question) {
  const q = question.toLowerCase(), all = tasks(), pending = all.filter((task) => !isDone(task));
  const customer = all.find((task) => q.includes(task.name.toLowerCase()) || q.includes(task.name.split(" ")[0].toLowerCase()));
  if (customer) return `${customer.name}: ${customer.reason}. ${customer.detail} Status: ${isDone(customer) ? outcomes[record(customer).outcome] : "belum dikerjakan"}.`;
  if (q.includes("prioritas") || q.includes("kerjakan") || q.includes("mulai")) return pending.length ? `Kerjakan ${categories[pending[0].category].label.toLowerCase()} lebih dulu. Ada ${pending.length} tugas tersisa.` : "Tidak ada tugas yang tersisa dalam briefing hari ini.";
  if (q.includes("chat") || q.includes("balas") || q.includes("inbox")) return backend.configured ? `Ada ${pending.filter((task) => task.category === "chat").length} chat yang dicatat manual dari WooBlazz untuk tim ini. Daftar perlu diperiksa setiap pagi.` : state.scope === "CS" ? `Ada ${pending.filter((task) => task.category === "chat").length} chat contoh pukul 22.00–09.00 yang belum dibalas.` : "Chat WhatsApp klinik belum tersambung.";
  if (q.includes("pertama") || q.includes("siapa")) return pending.length ? `Mulai dari ${pending[0].name}: ${pending[0].reason}.` : "Tidak ada tugas yang tersisa dalam briefing hari ini.";
  if (q.includes("progres") || q.includes("selesai") || q.includes("sisa")) return `${all.length - pending.length} dari ${all.length} tugas selesai. Masih ada ${pending.length} tugas.`;
  if (q.includes("tidak respon") || q.includes("no response")) return "Catat ‘Tidak merespons’. Pelanggan tersebut dilewati selama 14 hari di browser ini.";
  return `Saya menemukan ${pending.length} tugas untuk ${scopes[state.scope].short}. Coba tanyakan prioritas, progres, atau sebutkan nama pelanggan.`;
}
function sendQuestion(question) { const clean = question.trim(); if (!clean) return; const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date()); conversation().push({ role: "user", text: clean, time }, { role: "admin", text: adminAnswer(clean), time }); renderConversation(); }
function openChat() { $("#chatPanel").classList.add("open"); $("#chatBackdrop").classList.add("open"); $("#chatPanel").setAttribute("aria-hidden", "false"); $("#chatPanel").removeAttribute("inert"); setTimeout(() => $("#chatInput").focus(), 150); }
function closeChat() { $("#chatPanel").classList.remove("open"); $("#chatBackdrop").classList.remove("open"); $("#chatPanel").setAttribute("aria-hidden", "true"); $("#chatPanel").setAttribute("inert", ""); }
function closeMobileMenu() { $(".sidebar").classList.remove("open"); $("#sidebarBackdrop").classList.remove("open"); $("#menuButton").setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }
function switchView(view) { $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view)); $$(".view").forEach((item) => item.classList.toggle("active", item.id === `${view}View`)); if (view === "send") renderSend(); closeMobileMenu(); }
function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }
async function backendJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}
async function refreshAppointments() {
  if (!backend.configured) return;
  try {
    const data = await backendJson(`/api/backendv2/appointments?date=${todayKey()}`);
    backend.appointments = data.appointments.map(liveAppointmentTask).filter(Boolean);
    backend.appointments.forEach((task) => byId.set(task.id, task));
    backend.error = "";
  } catch (error) { backend.error = `Backendv2 gagal dimuat: ${error.message}`; }
  render(); openFromHash();
}
async function refreshDailyBriefing(force = false) {
  if (!backend.configured || backend.loading) return;
  backend.loading = true; render();
  try {
    const data = await backendJson(`/api/backendv2/briefing?date=${todayKey()}${force ? "&refresh=1" : ""}`);
    backend.briefingTasks = data.tasks.filter((task) => scopes[task.scope] && categories[task.category]);
    backend.briefingTasks.forEach((task) => byId.set(task.id, task));
    backend.coverage = { ...data.coverage, fetchedAt: data.fetchedAt };
    backend.date = data.date;
    backend.error = data.coverage.membersFailed ? `${data.coverage.membersFailed} dari ${data.coverage.membersChecked} riwayat anggota gagal dibaca; hasil CS belum lengkap.` : "";
    if (force) toast("Data backendv2 sudah diperbarui");
  } catch (error) { backend.error = `Briefing backendv2 gagal disusun: ${error.message}`; }
  backend.loading = false; render(); openFromHash();
}
async function initBackend() {
  try {
    const status = await backendJson("/api/backendv2/status");
    backend.configured = status.configured === true;
    render();
    if (backend.configured) { await refreshAppointments(); refreshDailyBriefing(); }
  } catch { backend.error = location.hostname === "127.0.0.1" || location.hostname === "localhost" ? "Koneksi lokal backendv2 belum tersedia." : "Demo publik memakai data contoh; backendv2 hanya tersedia di aplikasi lokal."; render(); }
}
async function searchBackendCustomers(event) {
  event.preventDefault();
  const query = $("#backendSearchInput").value.trim();
  if (query.length < 2) return;
  $("#backendResults").textContent = "Mencari pelanggan…";
  $("#backendSummary").replaceChildren();
  try {
    const data = await backendJson(`/api/backendv2/customers?search=${encodeURIComponent(query)}`);
    $("#backendResults").innerHTML = data.customers.length ? `<p>${data.total} hasil; ${data.customers.length} ditampilkan.</p><div class="backend-customer-list">${data.customers.map((item) => `<button type="button" data-backend-user="${escapeHTML(item.id)}"><strong>${escapeHTML(item.name || item.code)}</strong><small>${escapeHTML(item.code)} · ${escapeHTML(item.tier || "Tier tidak tercatat")}</small></button>`).join("")}</div>` : "Tidak ada pelanggan yang cocok.";
  } catch (error) { $("#backendResults").textContent = error.message; }
}
async function showBackendCustomer(id) {
  $("#backendSummary").textContent = "Memuat ringkasan pelanggan…";
  try {
    const data = await backendJson(`/api/backendv2/customers/${id}/summary`);
    const last = data.lastCompletedPaidAppointment;
    const lastText = last ? `${last.date} · ${last.clinic || "Klinik tidak tercatat"}` : data.treatmentHistoryComplete ? "Tidak ada treatment selesai dan lunas pada riwayat." : "Riwayat melebihi batas pemeriksaan; treatment terakhir belum dapat dipastikan.";
    const packageHtml = data.packages.length ? `<ul>${data.packages.map((item) => `<li><strong>${escapeHTML(item.name || "Paket")}</strong> · ${escapeHTML(item.remaining)} sesi tersisa · kedaluwarsa ${escapeHTML(item.expiresAt || "tidak tercatat")}</li>`).join("")}</ul>` : "Tidak ada sisa paket aktif yang ditemukan dalam batas pemeriksaan.";
    $("#backendSummary").innerHTML = `<article class="backend-summary"><h3>${escapeHTML(data.customer.name)}</h3><p>Membership: ${escapeHTML(data.customer.tier || "Tidak tercatat")}</p><p>Treatment selesai dan lunas terakhir: ${escapeHTML(lastText)}</p><h4>Sisa paket</h4>${packageHtml}<small>Data dibaca langsung saat ringkasan dibuka. Maksimal 8 paket aktif diperiksa.</small></article>`;
  } catch (error) { $("#backendSummary").textContent = error.message; }
}
function openTask(id) { const task = byId.get(id); if (!task) return; if (!tasks(task.scope).some((item) => item.id === id)) { toast("Tugas ini tidak ada dalam daftar hari ini"); return; } if (task.scope !== state.scope) { state.scope = task.scope; save(); render(); } state.activeTaskId = id; $("#dialogCustomer").textContent = task.name; $("#dialogReason").textContent = `${task.stage || categories[task.category].label} · ${task.reason}. ${task.detail}${task.strategy ? ` Langkah: ${task.strategy}` : ""}`; $("#dialogReply").value = task.reply; if (!$("#actionDialog").open) $("#actionDialog").showModal(); }
function openFromHash() { const id = new URLSearchParams(location.hash.slice(1)).get("task"); if (id && byId.has(id)) { history.replaceState(null, "", `${location.pathname}${location.search}`); switchView("briefing"); openTask(id); } }
async function copyText(value, label) { try { await navigator.clipboard.writeText(value); toast(`${label} disalin`); } catch { toast("Gagal menyalin. Periksa izin clipboard browser."); } }
function recordOutcome(outcome) { const task = byId.get(state.activeTaskId); if (!task) return; state.records[task.id] = { date: todayKey(), outcome, time: new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date()) }; save(); render(); toast(`${task.name}: ${outcomes[outcome]}`); }

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-item"); if (nav) switchView(nav.dataset.view);
  const filter = event.target.closest("[data-filter]"); if (filter) { state.filter = filter.dataset.filter; $$("[data-filter]").forEach((button) => button.classList.toggle("active", button === filter)); renderLists(); }
  const open = event.target.closest(".open-task, [data-task-link]"); if (open) { event.preventDefault(); const id = open.dataset.id || open.dataset.taskLink; if (byId.has(id)) openTask(id); }
  const copy = event.target.closest(".copy-task"); if (copy) copyText(taskUrl(byId.get(copy.dataset.id)), "Tautan tugas");
  const undo = event.target.closest(".undo-action"); if (undo) { delete state.records[undo.dataset.id]; save(); render(); toast("Hasil dibatalkan"); }
  const backendUser = event.target.closest("[data-backend-user]"); if (backendUser) showBackendCustomer(backendUser.dataset.backendUser);
});
$("#clinicSelect").addEventListener("change", (event) => { state.scope = event.target.value; state.filter = "all"; $$("[data-filter]").forEach((button) => button.classList.toggle("active", button.dataset.filter === "all")); save(); render(); });
$("#customerSearch").addEventListener("input", renderSearch);
$("#backendSearchForm").addEventListener("submit", searchBackendCustomers);
$("#menuButton").addEventListener("click", () => { const open = !$(".sidebar").classList.contains("open"); $(".sidebar").classList.toggle("open", open); $("#sidebarBackdrop").classList.toggle("open", open); $("#menuButton").setAttribute("aria-expanded", String(open)); document.body.classList.toggle("menu-open", open); });
$("#sidebarBackdrop").addEventListener("click", closeMobileMenu);
$("#askAdminButton").addEventListener("click", openChat);
$("#closeChatButton").addEventListener("click", closeChat);
$("#chatBackdrop").addEventListener("click", closeChat);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeChat(); closeMobileMenu(); } });
$("#chatForm").addEventListener("submit", (event) => { event.preventDefault(); sendQuestion($("#chatInput").value); $("#chatInput").value = ""; });
$("#quickQuestions").addEventListener("click", (event) => { const button = event.target.closest("[data-question]"); if (button) sendQuestion(button.dataset.question); });
$("#startButton").addEventListener("click", () => { const task = tasks().find((item) => !isDone(item)); if (task) openTask(task.id); else toast(backend.loading ? "Briefing masih disusun" : "Tidak ada tugas yang tersisa hari ini"); });
$("#copyBriefingButton").addEventListener("click", () => copyText(briefingText(), "Briefing dan tautan"));
$("#sendTabs").addEventListener("click", (event) => { const tab = event.target.closest("[data-send-scope]"); if (!tab) return; state.sendScope = tab.dataset.sendScope; renderSend(); tab.focus(); });
$("#sendTabs").addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const order = Object.keys(scopes); const index = order.indexOf(state.sendScope); state.sendScope = event.key === "Home" ? order[0] : event.key === "End" ? order.at(-1) : order[(index + (event.key === "ArrowRight" ? 1 : -1) + order.length) % order.length]; renderSend(); $(`#sendTab-${state.sendScope}`).focus(); });
$("#chatEntryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#chatCustomerName").value.trim();
  const phone = $("#chatCustomerPhone").value.replace(/\D/g, "").replace(/^0/, "62");
  const time = $("#chatCustomerTime").value;
  if (!name || !/^62\d{8,13}$/.test(phone) || !time) { toast("Isi nama, nomor WhatsApp, dan jam pesan yang benar"); return; }
  const key = sendKey(state.sendScope);
  const items = state.chatReminders[key] || [];
  if (items.some((item) => item.phone === phone)) { toast("Nomor ini sudah tercatat untuk tim ini"); return; }
  items.push({ id: `CHAT-${state.sendScope}-${todayKey()}-${phone}`, name, phone, time });
  state.chatReminders[key] = items;
  delete state.sendDrafts[key];
  delete state.sentBriefings[key];
  save(); $("#chatEntryForm").reset(); render(); toast("Chat ditambahkan ke briefing hari ini");
});
$("#chatEntryList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-chat]"); if (!button) return;
  const key = sendKey(state.sendScope);
  state.chatReminders[key] = (state.chatReminders[key] || []).filter((item) => item.id !== button.dataset.removeChat);
  delete state.sendDrafts[key]; delete state.sentBriefings[key]; save(); render();
});
$("#sendMessage").addEventListener("input", (event) => { const key = sendKey(state.sendScope); state.sendDrafts[key] = event.target.value; if (state.sentBriefings[key]) { delete state.sentBriefings[key]; $(`#sendTab-${state.sendScope} [data-send-status]`).textContent = ""; $("#sendStatus").textContent = "Teks diubah · belum dikonfirmasi terkirim"; $("#sendStatus").classList.remove("is-sent"); $("#sendConfirmButton").disabled = false; $("#sendConfirmButton").textContent = "Konfirmasi"; } save(); });
$("#sendCopyButton").addEventListener("click", () => { if (sendReady()) copyText($("#sendMessage").value, "Briefing"); });
$("#sendConfirmButton").addEventListener("click", () => { if (!sendReady() || !$("#sendMessage").value.trim()) return; state.sentBriefings[sendKey(state.sendScope)] = { time: new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date()) }; save(); renderSend(); toast(`Briefing ${scopes[state.sendScope].short} ditandai sudah dikirim`); });
$("#refreshDataButton").addEventListener("click", async () => { await refreshAppointments(); await refreshDailyBriefing(true); });
$("#copyReplyButton").addEventListener("click", () => copyText($("#dialogReply").value, "Draf balasan"));
$("#copyTaskLinkButton").addEventListener("click", () => { const task = byId.get(state.activeTaskId); if (task) copyText(taskUrl(task), "Tautan tugas"); });
$("#resetButton").addEventListener("click", () => { state.records = {}; save(); render(); toast("Hasil demo direset"); });
$$('[data-outcome]').forEach((button) => button.addEventListener("click", () => recordOutcome(button.dataset.outcome)));
window.addEventListener("hashchange", openFromHash);
$("#todayLabel").textContent = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
$("#briefingDate").textContent = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long" }).format(new Date());
render(); openFromHash(); initBackend();
setInterval(() => { if (backend.configured) refreshAppointments(); }, 120000);
setInterval(() => {
  if (!backend.configured || backend.loading) return;
  const age = Date.now() - new Date(backend.coverage?.fetchedAt || 0).getTime();
  if (backend.date !== todayKey() || age >= 60 * 60000) refreshDailyBriefing();
}, 60000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !backend.configured) return;
  refreshAppointments();
  const age = Date.now() - new Date(backend.coverage?.fetchedAt || 0).getTime();
  if (backend.date !== todayKey() || age >= 60 * 60000) refreshDailyBriefing();
});
