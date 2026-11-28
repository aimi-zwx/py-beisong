"use strict";
const CATS = ["全部", "大模型", "芯片硬件", "手机数码", "开源工具", "行业动态"];
const HUE = {"大模型": [235, 285], "芯片硬件": [175, 215], "手机数码": [330, 15], "开源工具": [140, 185], "行业动态": [25, 50]};
const HOT_WORDS = ["大模型", "AI", "芯片", "开源", "智能体", "视频", "API", "NPU", "端侧", "多模态", "笔记本", "手机", "本地", "机器人", "OpenAI", "DeepSeek"];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const state = {day: null, cat: "全部", src: "全部", q: "", saved: false};
let days = [], GH = [], marks = store.get("ainews-marks", {}), reads = store.get("ainews-reads", {});
const cache = {};

async function getJSON(path) {
  const r = await fetch(path, {cache: "no-cache"});
  if (!r.ok) throw new Error(path + " " + r.status);
  return r.json();
}
async function loadDay(date) {
  if (!cache[date]) {
    try { cache[date] = await getJSON(`data/${date}.json`); }
    catch (e) { cache[date] = {date, digest: "", articles: []}; }
  }
  return cache[date];
}
const fmtDay = d => { const p = d.split("-"); return {m: +p[1] + " 月", d: +p[2], w: "周" + "日一二三四五六"[new Date(d + "T00:00:00").getDay()]}; };

function cover(a, cls) {
  const c = HUE[a.category] ? a.category : "行业动态", id = a.id || a.title;
  let s = 0; for (let i = 0; i < id.length; i++) s += id.charCodeAt(i) * (i + 1);
  const r = k => { const x = Math.sin(s * 97 + k * 13.7) * 10000; return x - Math.floor(x); };
  const h = HUE[c], g = "g" + s; let o = "";
  if (c === "大模型") {
    const P = []; for (let i = 0; i < 8; i++) P.push([30 + r(i) * 260, 25 + r(i + 9) * 130]);
    for (let i = 0; i < 7; i++) o += `<line x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[i + 1][0]}" y2="${P[i + 1][1]}"/>`;
    for (let i = 0; i < 8; i++) o += `<circle cx="${P[i][0]}" cy="${P[i][1]}" r="${5 + r(i + 20) * 8}" fill="#fff" fill-opacity=".85"/>`;
  } else if (c === "芯片硬件") {
    for (let i = 0; i < 6; i++) { const p = 95 + i * 26; o += `<line x1="${p}" y1="38" x2="${p}" y2="52"/><line x1="${p}" y1="128" x2="${p}" y2="142"/>`; if (i < 4) { const q = 55 + i * 24; o += `<line x1="120" y1="${q}" x2="104" y2="${q}"/><line x1="200" y1="${q}" x2="216" y2="${q}"/>`; } }
    o += '<rect x="120" y="52" width="80" height="76" rx="8" fill="#fff" fill-opacity=".18"/><rect x="140" y="72" width="40" height="36" rx="4" fill="#fff" fill-opacity=".85" stroke="none"/>';
  } else if (c === "手机数码") {
    o += `<circle cx="${60 + r(1) * 60}" cy="${40 + r(2) * 100}" r="${40 + r(3) * 30}" fill="#fff" fill-opacity=".12" stroke="none"/><rect x="127" y="22" width="66" height="136" rx="12" fill="#0b1220" fill-opacity=".55"/><rect x="134" y="36" width="52" height="102" rx="5" fill="#fff" fill-opacity=".85" stroke="none"/><circle cx="160" cy="148" r="3" fill="#fff" stroke="none"/>`;
    for (let i = 0; i < 3; i++) o += `<rect x="140" y="${46 + i * 28}" width="${20 + r(i + 5) * 26}" height="8" rx="4" fill="#2b4fd8" fill-opacity=".6" stroke="none"/>`;
  } else if (c === "开源工具") {
    o += '<text x="160" y="104" font-size="64" text-anchor="middle" fill="#fff" fill-opacity=".9" stroke="none" font-family="monospace" font-weight="700">&lt;/&gt;</text>';
    for (let i = 0; i < 4; i++) o += `<rect x="${30 + r(i) * 20}" y="${122 + i * 12}" width="${70 + r(i + 4) * 150}" height="5" rx="2.5" fill="#fff" fill-opacity=".35" stroke="none"/>`;
  } else {
    let pts = ""; for (let i = 0; i < 7; i++) { const hh = 30 + r(i) * 90; o += `<rect x="${40 + i * 34}" y="${150 - hh}" width="22" height="${hh}" rx="3" fill="#fff" fill-opacity="${.3 + i * .09}" stroke="none"/>`; pts += `${51 + i * 34},${140 - hh - 10} `; }
    o += `<polyline points="${pts}" stroke-width="3"/>`;
  }
  return `<svg class="${cls}" viewBox="0 0 320 180" role="img" aria-label="${c}插图"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h[0]},68%,46%)"/><stop offset="1" stop-color="hsl(${h[1]},70%,28%)"/></linearGradient></defs><rect width="320" height="180" fill="url(#${g})"/><g fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round">${o}</g></svg>`;
}
function picture(a, cls) {
  const u = safeUrl(a.image);
  return u ? `<img class="${cls}" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-id="${esc(a.id)}">` : cover(a, cls);
}
const star = a => `<button class="save" type="button" data-id="${esc(a.id)}" aria-pressed="${!!marks[a.id]}" aria-label="收藏">${marks[a.id] ? "★" : "☆"}</button>`;
const link = (a, cls, txt) => `<a class="${cls}${cls === "t" && reads[a.id] ? " read" : ""}" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener noreferrer" data-read="${esc(a.id)}">${txt}</a>`;
const when = a => (a.time || "").slice(11, 16);

async function pool() {
  if (state.saved) return Object.values(marks).sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  if (state.q.trim()) {
    const all = await Promise.all(days.map(d => loadDay(d.date)));
    return all.flatMap(d => d.articles);
  }
  return state.day ? (await loadDay(state.day)).articles : [];
}
function hot(list) {
  const t = list.map(a => a.title + a.summary).join("");
  return HOT_WORDS.map(w => [w, t.split(w).length - 1]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
}
function ghHtml() {
  if (!GH.length) return "";
  const n = Math.floor(Date.parse(state.day + "T00:00:00Z") / 86400000);
  let h = '<section class="gh"><h3>今日 GitHub 推荐</h3><div class="ghg">';
  for (let k = 0; k < Math.min(3, GH.length); k++) {
    const p = GH[(n * 3 + k) % GH.length];
    h += `<div class="ghc"><a href="https://github.com/${esc(p.name)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a><span class="meta"><span class="tag">${esc(p.tag)}</span></span><p>${esc(p.desc)}</p></div>`;
  }
  return h + "</div></section>";
}
function hero(a) {
  return `<article class="hero">${picture(a, "cover")}<div class="body"><div class="meta"><span class="tag">头条 · ${esc(a.category)}</span></div><h3>${link(a, "t", esc(a.title))}</h3><p class="sum">${a.ai_summary ? '<span class="tag ai">AI 摘要</span> ' + esc(a.ai_summary) : esc(a.summary)}</p><div class="meta"><span>${esc(a.source)} ${when(a)}</span>${link(a, "go", "前往原文")}${star(a)}</div></div></article>`;
}
function card(a) {
  const d = state.saved || state.q.trim() ? " · " + (a.time || "").slice(5, 10) : "";
  return `<article class="card">${picture(a, "cover")}<div class="body"><h3>${link(a, "t", esc(a.title))}</h3><p class="sum">${a.ai_summary ? '<span class="tag ai">AI 摘要</span> ' + esc(a.ai_summary) : esc(a.summary)}</p><div class="meta"><span class="tag">${esc(a.category)}</span><span>${esc(a.source)} ${when(a)}${d}</span>${link(a, "go", "前往原文")}${star(a)}</div></div></article>`;
}
let renderSeq = 0;
async function render() {
  const my = ++renderSeq;
  const base = await pool(), q = state.q.trim().toLowerCase();
  if (my !== renderSeq) return;
  const srcs = [...new Set(base.map(a => a.source))];
  $("src").innerHTML = '<option value="全部">全部来源</option>' + srcs.map(s => `<option${s === state.src ? " selected" : ""}>${esc(s)}</option>`).join("");
  if (state.src !== "全部" && !srcs.includes(state.src)) state.src = "全部";
  const bySrc = base.filter(a => state.src === "全部" || a.source === state.src);
  const nSaved = Object.keys(marks).length;
  $("cats").innerHTML = CATS.map(c => `<button class="chip" type="button" aria-pressed="${!state.saved && c === state.cat}" data-c="${c}">${c}<i>${c === "全部" ? bySrc.length : bySrc.filter(a => a.category === c).length}</i></button>`).join("") +
    `<button class="chip" type="button" aria-pressed="${state.saved}" data-saved="1">★ 收藏<i>${nSaved}</i></button>`;
  $("rail").innerHTML = days.map(d => { const f = fmtDay(d.date); return `<button class="day" type="button" data-d="${d.date}"${!state.saved && !q && d.date === state.day ? ' aria-current="true"' : ""}><b>${f.d}</b><small>${f.m} ${f.w} · ${d.count} 条</small></button>`; }).join("");
  let items = bySrc.filter(a => (state.cat === "全部" || a.category === state.cat) && (!q || (a.title + a.summary).toLowerCase().includes(q)));
  let title = state.saved ? "我的收藏" : q ? `搜索“${esc(state.q.trim())}”` : state.day ? (f => `${f.m} ${f.d} 日 ${f.w}`)(fmtDay(state.day)) : "暂无内容";
  let h = `<h2>${title}</h2><p class="count">共 ${items.length} 条${state.cat !== "全部" ? "（" + esc(state.cat) + "）" : ""}</p>`;
  const plain = !state.saved && !q && state.cat === "全部" && state.src === "全部" && state.day;
  if (plain) {
    const day = await loadDay(state.day);
    if (my !== renderSeq) return;
    if (day.digest) h += `<div class="digest"><b>今日简报</b>${esc(day.digest)}</div>`;
    const hw = hot(base);
    if (hw.length) h += `<div class="hotw"><span>今日热词</span>${hw.map(x => `<button class="hw" type="button" data-w="${esc(x[0])}">${esc(x[0])} ${x[1]}</button>`).join("")}</div>`;
    h += ghHtml();
  }
  if (!days.length) h += '<p class="empty">还没有新闻数据。请先到 GitHub 的 Actions 页面手动运行一次“每日更新新闻”，等它跑完再刷新本页。</p>';
  else if (!items.length) h += `<p class="empty">${state.saved ? "还没有收藏。点新闻卡片右下角的星标，就会保存在这里。" : "没有符合条件的新闻。试试清空搜索词，或切换到“全部”分类和来源。"}</p>`;
  else {
    if (plain) h += hero(items.shift());
    h += `<div class="grid">${items.map(card).join("")}</div>`;
  }
  $("feed").innerHTML = h;
}
$("cats").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  if (b.dataset.saved) state.saved = !state.saved; else { state.cat = b.dataset.c; state.saved = false; }
  render();
});
$("rail").addEventListener("click", e => {
  const b = e.target.closest(".day"); if (!b) return;
  state.day = b.dataset.d; state.saved = false; state.q = ""; $("q").value = ""; render();
});
$("src").addEventListener("change", e => { state.src = e.target.value; render(); });
let qTimer; $("q").addEventListener("input", e => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = e.target.value; if (state.q.trim()) state.saved = false; render(); }, 200); });
$("feed").addEventListener("click", e => {
  const w = e.target.closest(".hw");
  if (w) { state.q = w.dataset.w; state.saved = false; $("q").value = state.q; render(); return; }
  const s = e.target.closest(".save");
  if (s) {
    const id = s.dataset.id;
    if (marks[id]) delete marks[id];
    else { const a = (cache[state.day] ? cache[state.day].articles : []).concat(Object.values(cache).flatMap(d => d.articles)).find(x => x.id === id); if (a) marks[id] = a; }
    store.set("ainews-marks", marks); render(); return;
  }
  const r = e.target.closest("[data-read]");
  if (r) { reads[r.dataset.read] = 1; store.set("ainews-reads", reads); document.querySelectorAll(`a.t[data-read="${r.dataset.read}"]`).forEach(n => n.classList.add("read")); }
});
$("feed").addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG") return;
  const a = {id: img.dataset.id, category: (img.closest("article").querySelector(".tag") || {}).textContent.replace("头条 · ", "")};
  img.outerHTML = cover(a, "cover");
}, true);
$("theme").addEventListener("click", function () {
  const r = document.documentElement, dark = r.dataset.theme === "dark" || (!r.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  r.dataset.theme = dark ? "light" : "dark"; this.textContent = dark ? "切换深色" : "切换浅色";
});
(async function init() {
  try { GH = await getJSON("data/github_pool.json"); } catch (e) {}
  try { days = (await getJSON("data/index.json")).days || []; } catch (e) {}
  state.day = days.length ? days[0].date : null;
  if (days.length) $("updated").textContent = "每天自动汇总中文科技媒体的 AI 与数码新闻 · 最近更新：" + days[0].date;
  render();
})();
