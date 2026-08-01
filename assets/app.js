/* ===== 手机端工作台 app.js ===== */
(function () {
  "use strict";

  const START = new Date(2026, 7, 1); // 2026-08-01 (本地时区)
  const TOTAL_DAYS = 90;

  const DATA = {
    fitness: null, hotspot: null, news: null, review: null, english: null,
  };
  let currentTab = "fitness";

  /* ---------- 工具 ---------- */
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function todayStr() {
    const d = new Date();
    const w = ["周日","周一","周二","周三","周四","周五","周六"][d.getDay()];
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${w}`;
  }
  function greeting() {
    const h = new Date().getHours();
    if (h < 6) return "夜深了，注意休息 🌙";
    if (h < 11) return "早上好，开启充实的一天 ☀️";
    if (h < 14) return "中午好，记得吃午饭 🍱";
    if (h < 18) return "下午好，保持节奏 💪";
    return "晚上好，记得复盘今天 📝";
  }
  function dayIndex() {
    const now = new Date();
    const ms = now - START;
    let d = Math.floor(ms / 86400000) + 1;
    if (d < 1) d = 1;
    if (d > TOTAL_DAYS) d = TOTAL_DAYS;
    return d;
  }
  async function getJSON(name) {
    const r = await fetch(`data/${name}.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`${name} ${r.status}`);
    return r.json();
  }

  /* ---------- 渲染：健身 ---------- */
  function renderFitness() {
    const f = DATA.fitness;
    if (!f) return `<div class="empty">健身计划数据未加载</div>`;
    const day = dayIndex();
    const p = f.plan[day - 1];
    const prof = f.profile;
    const prog = Math.round((day / TOTAL_DAYS) * 100);

    const phases = f.phases.map(ph =>
      `<div class="ph ${ph.id === p.phase ? "on" : ""}">${esc(ph.name)}<br><small>${esc(ph.phase_weeks)}</small></div>`
    ).join("");

    let body;
    if (p.training) {
      const exs = p.exercises.map(e =>
        `<li><span class="ex-name">${esc(e.name)}</span><span class="ex-meta">${e.sets}组 × ${esc(e.reps)} · 休${esc(e.rest)}</span></li>`
      ).join("");
      body = `
        <h3>今日训练 · ${esc(p.focus)}</h3>
        <ul class="ex-list">${exs}</ul>
        <h3>有氧</h3>
        <div class="s">${esc(p.cardio)}（约 ${p.cardio_min} 分钟）</div>
        <h3>今日饮食</h3>
        <div class="nutri">
          <div><div class="n">${p.nutrition.calories}</div><div class="l">千卡</div></div>
          <div><div class="n">${p.nutrition.protein}g</div><div class="l">蛋白质</div></div>
          <div><div class="n">${p.nutrition.carb}g</div><div class="l">碳水</div></div>
          <div><div class="n">${p.nutrition.fat}g</div><div class="l">脂肪</div></div>
        </div>`;
    } else {
      body = `
        <h3>${esc(p.focus)}</h3>
        <div class="s">${esc(p.cardio)}</div>`;
    }

    return `
      <div class="card">
        <h2>🎯 90天薄肌计划</h2>
        <div class="goal-grid">
          <div class="g"><div class="k">身高</div><div class="v">${prof.height_cm} cm</div></div>
          <div class="g"><div class="k">体重目标</div><div class="v">${prof.start_weight_kg}→${prof.target_weight_kg} kg</div></div>
          <div class="g"><div class="k">体脂目标</div><div class="v">${prof.start_bf}%→${prof.target_bf}%</div></div>
          <div class="g"><div class="k">当前阶段</div><div class="v">第${p.phase}阶段</div></div>
        </div>
        <div class="progress-bar"><span style="width:${prog}%"></span></div>
        <div style="font-size:12px;color:var(--muted);margin-top:6px;">进度 第 ${day} / ${TOTAL_DAYS} 天（${prog}%）</div>
        <div class="phase-tabs">${phases}</div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="today-badge">第 ${day} 天 · ${esc(p.weekday)} · ${esc(p.date)}</span>
          <span style="font-size:12.5px;color:var(--muted);">${esc(p.phase_name)}</span>
        </div>
        <div style="font-size:12.5px;color:var(--muted);margin-bottom:6px;">${esc(p.phase_desc)}</div>
        ${body}
        <div class="tip-box">💡 ${esc(p.tip)}</div>
      </div>`;
  }

  /* ---------- 渲染：热点 ---------- */
  function renderHotspot() {
    const d = DATA.hotspot;
    if (!d) return `<div class="empty">热点数据未加载</div>`;
    const items = d.items.map(it => {
      const heat = it.heat === "爆" ? `<span class="heat-badge">🔥爆</span>`
        : it.heat === "热" ? `<span class="heat-badge hot">热</span>`
        : `<span class="heat-badge mid">一般</span>`;
      return `<div class="item">
        <div class="t">${esc(it.title)}</div>
        <div class="s">${esc(it.summary)}</div>
        <div class="meta"><span class="chip">${esc(it.tag)}</span>${heat}<span class="src">${esc(it.source)}</span></div>
      </div>`;
    }).join("");
    return `<div class="card"><h2>🔥 当日热点</h2><div style="font-size:12px;color:var(--muted);margin-bottom:8px;">更新于 ${esc(d.date)} · 每日自动刷新</div>${items}</div>`;
  }

  /* ---------- 渲染：新闻 ---------- */
  function renderNews() {
    const d = DATA.news;
    if (!d) return `<div class="empty">新闻数据未加载</div>`;
    const items = d.items.map(it => {
      let cls = "gray", label = it.impact;
      if (/利空/.test(it.impact)) { cls = "down"; label = "利空"; }
      else if (/利好/.test(it.impact)) { cls = "up"; label = "利好"; }
      const sec = (it.sectors || []).map(s => `<span class="chip">${esc(s)}</span>`).join("");
      return `<div class="item">
        <div class="t">${esc(it.title)}</div>
        <div class="s">${esc(it.summary)}</div>
        <div class="meta"><span class="chip ${cls}">${esc(label)}</span>${sec}<span class="src">${esc(it.source)}</span></div>
      </div>`;
    }).join("");
    return `
      <div class="card">
        <h2>📰 每日重要新闻（股市）</h2>
        <div class="outlook"><b>今日研判：</b>${esc(d.market_outlook)}</div>
        ${items}
        <div style="font-size:11.5px;color:var(--muted);margin-top:8px;">数据更新于 ${esc(d.date)} · 仅供分析参考，不构成投资建议</div>
      </div>`;
  }

  /* ---------- 渲染：复盘 ---------- */
  function renderReview() {
    const d = DATA.review;
    if (!d) return `<div class="empty">复盘数据未加载</div>`;
    const idx = d.indices.map(i => {
      const up = i.chg_pct >= 0;
      const sign = up ? "+" : "";
      return `<div class="idx">
        <div class="nm">${esc(i.name)}</div>
        <div class="cl">${i.close.toLocaleString()}</div>
        <div class="ch ${up ? "up" : "down"}">${sign}${i.chg_pct}% · ${i.amount_yi}亿</div>
      </div>`;
    }).join("");
    const hot = d.hot_sectors.map(s => `<div class="item"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.desc)}</div></div>`).join("");
    const down = d.decline_sectors.map(s => `<div class="item"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.desc)}</div></div>`).join("");
    const stocks = (d.hot_stocks || []).map(s => `<span class="chip">${esc(s.name)}</span>`).join(" ");
    const heat = (d.sector_heat || []).map(h => {
      const cls = h.heat >= 88 ? "" : h.heat >= 84 ? "hot" : "mid";
      return `<div class="heat-item"><span style="width:120px;">${esc(h.name)}</span><span class="bar"><span style="width:${h.heat}%"></span></span><span class="val ${h.chg_pct>=0?'up':'down'}">${h.heat}</span></div>`;
    }).join("");
    const views = (d.institution_views || []).map(v => `<div class="item"><div class="t">${esc(v.from)}</div><div class="s">${esc(v.view)}</div></div>`).join("");
    const s = d.sentiment || {};

    return `
      <div class="card">
        <h2>📊 每日复盘（${esc(d.date)} 收盘）</h2>
        <div class="idx-row">${idx}</div>
        <div class="sentiment">
          <div><div class="n up">${s.up_count ?? "-"}</div><div class="l">上涨</div></div>
          <div><div class="n down">${s.down_count ?? "-"}</div><div class="l">下跌</div></div>
          <div><div class="n up">${s.limit_up ?? "-"}</div><div class="l">涨停</div></div>
          <div><div class="n">${s.total_amount_yi ?? "-"}亿</div><div class="l">成交额</div></div>
        </div>
      </div>
      <div class="card">
        <h2>盘面总结</h2>
        <div class="s">${esc(d.summary)}</div>
      </div>
      <div class="card">
        <h2>🔥 强热板块</h2>${hot}
        ${heat ? `<h3>板块热度</h3>${heat}` : ""}
      </div>
      <div class="card">
        <h2>📉 调整板块</h2>${down}
      </div>
      <div class="card">
        <h2>⭐ 活跃个股</h2><div>${stocks}</div>
      </div>
      <div class="card">
        <h2>🏛 机构观点</h2>${views}
      </div>
      <div style="font-size:11.5px;color:var(--muted);text-align:center;margin-top:-4px;">${esc(d.note || "")}</div>`;
  }

  /* ---------- 渲染：英语 ---------- */
  function renderEnglish() {
    const d = DATA.english;
    if (!d) return `<div class="empty">英语数据未加载</div>`;
    const words = d.words.map(w => `
      <div class="word">
        <div><span class="w">${esc(w.word)}</span><span class="p">${esc(w.phon)}</span><span class="pos">${esc(w.pos)}</span></div>
        <div class="d">${esc(w.def)}</div>
        <div class="e">${esc(w.example)}</div>
      </div>`).join("");
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2 style="margin:0;">📚 雅思每日30词</h2>
          <span class="today-badge">Day ${d.day}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin:4px 0 6px;">${esc(d.date)} · 每日自动更新</div>
        <div class="word-grid">${words}</div>
      </div>
      <div class="card">
        <h2>📖 今日阅读</h2>
        <button class="toggle-btn" id="trBtn">显示/隐藏中文翻译</button>
        <div class="article-box">
          <div style="font-weight:700;margin-bottom:6px;">${esc(d.article.title)}</div>
          <div id="enBody">${esc(d.article.body)}</div>
          <div class="tr" id="trBody" style="display:none;">${esc(d.article.translation)}</div>
        </div>
      </div>`;
  }

  /* ---------- 调度 ---------- */
  const RENDERERS = {
    fitness: renderFitness, hotspot: renderHotspot, news: renderNews,
    review: renderReview, english: renderEnglish,
  };

  function render() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="section active">${RENDERERS[currentTab]()}</div>`;
    const trBtn = document.getElementById("trBtn");
    if (trBtn) trBtn.addEventListener("click", () => {
      const t = document.getElementById("trBody");
      t.style.display = t.style.display === "none" ? "block" : "none";
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll("#nav button").forEach(b =>
      b.classList.toggle("active", b.dataset.tab === tab));
    render();
  }

  async function init() {
    document.getElementById("todayDate").textContent = todayStr();
    document.getElementById("greeting").textContent = greeting();
    document.querySelectorAll("#nav button").forEach(b =>
      b.addEventListener("click", () => switchTab(b.dataset.tab)));

    const names = ["fitness", "hotspot", "news", "review", "english"];
    await Promise.all(names.map(async n => {
      try { DATA[n] = await getJSON(n); }
      catch (e) { console.warn("load failed:", n, e); }
    }));
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
