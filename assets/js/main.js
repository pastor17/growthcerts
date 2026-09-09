(function () {
  "use strict";

  /* ================= 移动端导航开关 ================= */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
  }

  /* ================= 图表（Mermaid）按需加载 ================= */
  (function () {
    var codes = document.querySelectorAll("code.language-mermaid");
    if (!codes.length) return;
    var blocks = [];
    codes.forEach(function (code) {
      var div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = code.textContent;
      var wrap = code.closest(".highlight") || code.closest("pre") || code;
      wrap.replaceWith(div);
      blocks.push(div);
    });
    var s = document.createElement("script");
    s.src = window.__mermaidSrc || "js/mermaid.min.js";
    s.onload = function () {
      if (!window.mermaid) return;
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
          themeVariables: { fontSize: "14px", primaryColor: "#e7edfb", primaryBorderColor: "#2b5bd7", primaryTextColor: "#1b2233", lineColor: "#7e8799" }
        });        mermaid.run({ nodes: blocks }).catch(function (err) {
          console.error("mermaid render failed:", err);
        });
      } catch (e) {}
    };
    document.head.appendChild(s);
  })();

  /* ================= 题库 App ================= */
  var dataEl = document.getElementById("quiz-data");
  var app = document.getElementById("quizApp");
  if (dataEl && app) { initQuiz(app, dataEl); }

  function initQuiz(app, dataEl) {
    var data = {};
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    var bank = Array.isArray(data.bank) ? data.bank : [];
    var chapters = Array.isArray(data.chapters) ? data.chapters : [];
    var cert = data.cert || "";
    if (!bank.length) {
      app.innerHTML = '<div class="quiz-empty"><span class="quiz-empty__emoji">🛠️</span>题库整理中，敬请期待～</div>';
      return;
    }

    /* ---------- 工具 ---------- */
    var LETTERS = "ABCDEFGHIJ";
    var WRONG_KEY = "kzb-wrong:" + cert;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function mdLite(s) {
      return esc(s)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
    }
    function letter(i) { return LETTERS[i] || ("#" + (i + 1)); }

    function loadWrong() { try { return JSON.parse(localStorage.getItem(WRONG_KEY)) || []; } catch (e) { return []; } }
    function saveWrong(ids) { try { localStorage.setItem(WRONG_KEY, JSON.stringify(ids)); } catch (e) {} }
    function addWrong(id) {
      var w = loadWrong();
      if (w.indexOf(id) === -1) { w.push(id); saveWrong(w); }
    }
    function wrongSet() { return loadWrong().filter(function (id) { return id; }); }

    function chapterRef(name) {
      for (var i = 0; i < chapters.length; i++) { if (chapters[i].name === name) return chapters[i]; }
      return null;
    }

    /* 章节列表（按题库出现顺序去重） */
    var chapterList = [];
    (function () {
      var seen = {};
      bank.forEach(function (q) {
        var c = q.chapter || "未分类";
        if (!seen[c]) { seen[c] = true; chapterList.push(c); }
      });
    })();

    var TYPE_NAMES = { single: "单选", multiple: "多选", judge: "判断", fill: "填空" };
    function srcName(q) {
      if (q.source === "zhenti" && q.year) return q.year + " 真题";
      if (q.source === "mock") return "模拟";
      return "章节练习";
    }

    /* ---------- 状态 ---------- */
    var state = {
      mode: "home",        // home | practice | exam | wrong
      title: "",
      qs: [],              // 当前题组
      idx: 0,
      ans: {},             // qid -> 用户答案
      examTime: 0,         // 考试剩余秒数
      timer: null,
      examResult: null
    };

    function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

    function qCorrect(q) { return state.ans[q.id] === q.answer; }
    function answeredCount() {
      var n = 0;
      state.qs.forEach(function (q) { if (state.ans[q.id] != null) n++; });
      return n;
    }
    function correctCount() {
      var n = 0;
      state.qs.forEach(function (q) { if (qCorrect(q)) n++; });
      return n;
    }

    /* ---------- 渲染 ---------- */
    function render() {
      var wrongN = wrongSet().length;
      app.innerHTML =
        '<div class="quiz-app__head">' +
          '<h2 class="quiz-app__title">🎯 题库练习</h2>' +
          '<span class="quiz-app__stats">共收录 <strong>' + bank.length + '</strong> 题</span>' +
        '</div>' +
        '<div class="quiz-modes" role="tablist">' +
          modeBtn("home", "章节练习") +
          modeBtn("exam", "模拟考试") +
          modeBtn("wrong", "错题本", wrongN) +
        '</div>' +
        '<div class="quiz-panel">' + panel() + '</div>';
    }

    function modeBtn(mode, label, count) {
      var active = state.mode === mode ? " is-active" : "";
      var badge = count != null ? ' <span class="quiz-mode__count">(' + count + ')</span>' : "";
      return '<button type="button" class="quiz-mode' + active + '" data-action="mode" data-mode="' + mode + '">' + label + badge + "</button>";
    }

    function panel() {
      if (state.mode === "practice") return state.examResult ? practiceSummary() : practiceView();
      if (state.mode === "exam") return state.examResult ? examSummary() : examView();
      if (state.mode === "wrong") return wrongView();
      return homeView();
    }

    function homeView() {
      return (
        '<p class="quiz-panel__desc">选择一个练习模式：章节练习逐题作答即时判分；模拟考试限时随机组卷；做错的题自动进入错题本（保存在本机浏览器）。</p>' +
        '<div class="quiz-panel__selects">' +
          '<div class="quiz-field"><label for="qzChapter">章节</label>' +
            '<select id="qzChapter">' + chapterOptions("") + "</select></div>" +
          '<button type="button" class="btn btn--primary" data-action="start-practice">开始章节练习</button>' +
        "</div>"
      );
    }

    function chapterOptions(sel) {
      var html = '<option value="">— 全部章节（随机顺序）—</option>';
      chapterList.forEach(function (c) {
        html += '<option value="' + esc(c) + '"' + (c === sel ? " selected" : "") + ">" + esc(c) + "</option>";
      });
      return html;
    }

    /* ---------- 章节练习 ---------- */
    function startPractice(chapterName) {
      stopTimer();
      var qs = chapterName ? bank.filter(function (q) { return (q.chapter || "未分类") === chapterName; }) : bank.slice();
      if (!qs.length) { state.mode = "home"; render(); return; }
      // 打乱顺序，重练不重复
      qs = shuffle(qs);
      state.mode = "practice";
      state.title = chapterName || "全部章节";
      state.qs = qs;
      state.idx = 0;
      state.ans = {};
      state.examResult = null;
      render();
    }

    function practiceView() {
      var q = state.qs[state.idx];
      if (!q) return '<div class="quiz-empty">没有题目</div>';
      var done = answeredCount();
      var pct = Math.round(((state.idx + 1) / state.qs.length) * 100);
      return (
        progressHtml(state.idx + 1, state.qs.length, pct) +
        '<div class="quiz-card">' +
          cardMeta(q) +
          '<p class="q-stem">' + mdLite(q.stem) + "</p>" +
          optionsHtml(q, true) +
          (state.ans[q.id] != null ? analysisHtml(q) : "") +
        "</div>" +
        '<div class="q-nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="prev"' + (state.idx === 0 ? " disabled" : "") + ">← 上一题</button>" +
          '<span class="quiz-progress__label">已答 ' + done + " / " + state.qs.length + " · 答对 " + correctCount() + "</span>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="next"' + (state.idx === state.qs.length - 1 ? " disabled" : "") + ">下一题 →</button>" +
          '<button type="button" class="btn btn--primary btn--sm" data-action="finish-practice">结束练习</button>' +
        "</div>"
      );
    }

    function optionsHtml(q, feedback) {
      var opts = q.options || [];
      var chosen = state.ans[q.id];
      var locked = feedback && chosen != null;
      var html = '<div class="q-options">';
      for (var i = 0; i < opts.length; i++) {
        var key = letter(i);
        var cls = "q-option";
        if (locked) {
          if (key === q.answer) cls += " is-correct";
          else if (key === chosen) cls += " is-wrong";
          else if (chosen == null && q.type === "multiple") cls += " is-correct"; /* 多选漏选高亮 */
        } else if (chosen === key && !feedback) {
          cls += " is-chosen";
        }
        html +=
          '<button type="button" class="' + cls + '" data-action="answer" data-opt="' + key + '"' + (locked ? " disabled" : "") + ">" +
            '<span class="q-option__key">' + key + "</span><span>" + mdLite(opts[i]) + "</span>" +
          "</button>";
      }
      return html + "</div>";
    }

    function explainHtml(q) {
      var ex = q.explain || {};
      if (!Object.keys(ex).length) return "";
      var opts = q.options || [];
      var html = '<div class="q-explain"><span class="q-explain__title">选项点拨（错误项附错误原因）</span><ul>';
      for (var i = 0; i < opts.length; i++) {
        var k = letter(i);
        if (!ex[k]) continue;
        var ok = k === q.answer;
        html +=
          '<li><span class="q-explain__key ' + (ok ? "is-ok" : "is-no") + '">' + (ok ? "✓" : "✗") + " " + k + "</span>" +
          '<span class="q-explain__body"><strong>' + mdLite(opts[i]) + "</strong>——" + mdLite(ex[k]) + "</span></li>";
      }
      return html + "</ul></div>";
    }

    function analysisHtml(q) {
      var ok = qCorrect(q);
      var ref = chapterRef(q.chapter);
      return (
        '<div class="q-analysis ' + (ok ? "q-analysis--correct" : "q-analysis--wrong") + '">' +
          "<strong>" + (ok ? "✅ 回答正确" : "❌ 回答错误") + "</strong>" +
          '<div class="q-analysis__text"><strong>参考答案：' + esc(q.answer) + "。</strong> " + (q.analysis ? mdLite(q.analysis) : "") + "</div>" +
          (ref ? '<div class="q-analysis__ref"><a href="' + ref.url + '" target="_blank" rel="noopener">📖 回看考点：' + esc(ref.title) + "</a></div>" : "") +
          explainHtml(q) +
        "</div>"
      );
    }

    function practiceSummary() {
      var c = correctCount();
      return (
        '<div class="quiz-summary">' +
          '<div class="quiz-summary__score">' + c + "<small> / " + state.qs.length + "</small></div>" +
          "<p>" + (c === state.qs.length ? "太棒了，全部答对！🎉" : c >= state.qs.length * 0.6 ? "不错，继续保持！💪" : "错题已自动进入错题本，回看考点后再来一次～") + "</p>" +
          '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
            '<button type="button" class="btn btn--primary" data-action="retry-practice">重新练习本章</button>' +
            '<button type="button" class="btn btn--ghost" data-action="mode" data-mode="wrong">查看错题本</button>' +
            '<button type="button" class="btn btn--ghost" data-action="mode" data-mode="home">选择其他章节</button>' +
          "</div>" +
        "</div>"
      );
    }

    /* ---------- 模拟考试 ---------- */
    function examView() {
      if (state.qs.length === 0 || state.idx < 0 || !state.qs[state.idx]) return examConfig();
      var q = state.qs[state.idx];
      return (
        '<div class="quiz-progress" style="margin-bottom:6px">' +
          '<span class="quiz-progress__label">第 ' + (state.idx + 1) + " / " + state.qs.length + " 题</span>" +
          '<span class="quiz-timer' + (state.examTime <= 60 ? " is-danger" : "") + '" id="qzTimer">' + fmtTime(state.examTime) + "</span>" +
        "</div>" +
        '<div class="quiz-card">' +
          cardMeta(q) +
          '<p class="q-stem">' + mdLite(q.stem) + "</p>" +
          optionsHtml(q, false) +
        "</div>" +
        '<div class="q-nav">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="prev"' + (state.idx === 0 ? " disabled" : "") + ">← 上一题</button>" +
          '<span class="quiz-progress__label">已作答 ' + answeredCount() + " / " + state.qs.length + "</span>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="next"' + (state.idx === state.qs.length - 1 ? " disabled" : "") + ">下一题 →</button>" +
          '<button type="button" class="btn btn--primary btn--sm" data-action="submit-exam">交卷</button>' +
        "</div>"
      );
    }

    function examConfig() {
      var maxN = bank.length;
      return (
        '<p class="quiz-panel__desc">模拟考试：从题库随机抽题，限时作答，交卷后统一判分并给出解析；做错的题进入错题本。</p>' +
        '<div class="quiz-panel__selects">' +
          '<div class="quiz-field"><label for="qzCount">题量</label>' +
            '<select id="qzCount">' +
              (maxN >= 5 ? '<option value="5">5 题</option>' : "") +
              (maxN >= 10 ? '<option value="10">10 题</option>' : "") +
              (maxN >= 15 ? '<option value="15">15 题</option>' : "") +
              '<option value="' + maxN + '">全部 ' + maxN + " 题</option>" +
            "</select></div>" +
          '<div class="quiz-field"><label for="qzMinutes">时长</label>' +
            '<select id="qzMinutes"><option value="3">3 分钟</option><option value="5" selected>5 分钟</option><option value="10">10 分钟</option></select></div>' +
          '<button type="button" class="btn btn--primary" data-action="start-exam">开始考试</button>' +
        "</div>"
      );
    }

    function startExam() {
      stopTimer();
      var n = parseInt(val("#qzCount"), 10) || bank.length;
      var mins = parseInt(val("#qzMinutes"), 10) || 5;
      state.mode = "exam";
      state.qs = shuffle(bank.slice()).slice(0, Math.min(n, bank.length));
      state.idx = 0;
      state.ans = {};
      state.examTime = mins * 60;
      state.examResult = null;
      state.timer = setInterval(function () {
        state.examTime--;
        var t = document.getElementById("qzTimer");
        if (t) { t.textContent = fmtTime(state.examTime); t.classList.toggle("is-danger", state.examTime <= 60); }
        if (state.examTime <= 0) { finishExam(); }
      }, 1000);
      render();
    }

    function finishExam() {
      if (state.examResult) return;
      stopTimer();
      var c = correctCount();
      wrongSet(); /* ensure exists */
      state.qs.forEach(function (q) { if (state.ans[q.id] != null && state.ans[q.id] !== q.answer) addWrong(q.id); });
      state.examResult = { correct: c, total: state.qs.length, skipped: state.qs.length - answeredCount() };
      render();
    }

    function examSummary() {
      var r = state.examResult;
      if (!r) return "";
      var verdict =
        r.correct === r.total ? "满分！太强了 🎉" :
        r.correct >= r.total * 0.6 ? "通过线之上，继续加油 💪" : "未达标，回看考点后重考一次～";
      var rows = "";
      state.qs.forEach(function (q, i) {
        var chosen = state.ans[q.id];
        var ok = chosen === q.answer;
        rows +=
          '<div class="quiz-wrongitem">' +
            '<div class="quiz-wrongitem__head"><span class="chip">' + (i + 1) + " / " + r.total + "</span><span class='chip'>" + esc(q.chapter) + "</span>" +
            (ok ? '<span class="chip" style="--chip-color:#1f9d63">✅ 正确</span>' : '<span class="chip" style="--chip-color:#d64545">❌ ' + (chosen == null ? "未作答" : "错误") + "</span>") +
            "</div>" +
            '<p class="quiz-wrongitem__stem">' + mdLite(q.stem) + "</p>" +
            '<div class="q-analysis ' + (ok ? "q-analysis--correct" : "q-analysis--wrong") + '">' +
              '<div class="q-analysis__text"><strong>参考答案：' + esc(q.answer) + "。</strong> " + (q.analysis ? mdLite(q.analysis) : "") + "</div>" +
              explainHtml(q) +
            "</div>" +
          "</div>";
      });
      return (
        '<div class="quiz-summary">' +
          '<div class="quiz-summary__score">' + r.correct + "<small> / " + r.total + "</small></div>" +
          "<p>" + verdict + (r.skipped ? "（未作答 " + r.skipped + " 题）" : "") + "</p>" +
          '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
            '<button type="button" class="btn btn--primary" data-action="start-exam">再来一次</button>' +
            '<button type="button" class="btn btn--ghost" data-action="mode" data-mode="wrong">查看错题本</button>' +
          "</div>" +
        "</div>" +
        '<div class="quiz-wronglist">' + rows + "</div>"
      );
    }

    /* ---------- 错题本 ---------- */
    function wrongView() {
      var ids = wrongSet();
      var qs = ids.map(byId).filter(Boolean);
      if (!qs.length) {
        return '<div class="quiz-empty"><span class="quiz-empty__emoji">🌟</span>还没有错题。做错的题会自动收集在这里，方便你集中巩固。</div>';
      }
      var list = "";
      qs.forEach(function (q) {
        var ref = chapterRef(q.chapter);
        list +=
          '<div class="quiz-wrongitem">' +
            '<div class="quiz-wrongitem__head"><span class="chip">' + esc(q.chapter) + "</span>" +
              (ref ? '<a class="chip" style="--chip-color:#3a6fd8" href="' + ref.url + '" target="_blank" rel="noopener">📖 回看考点</a>' : "") +
            "</div>" +
            '<p class="quiz-wrongitem__stem">' + mdLite(q.stem) + "</p>" +
            '<div class="q-analysis q-analysis--wrong">' +
              '<div class="q-analysis__text"><strong>参考答案：' + esc(q.answer) + "。</strong> " + (q.analysis ? mdLite(q.analysis) : "") + "</div>" +
              explainHtml(q) +
            "</div>" +
          "</div>";
      });
      return (
        '<div class="quiz-panel__selects" style="margin-bottom:16px">' +
          '<button type="button" class="btn btn--primary" data-action="retry-wrong">重练全部 ' + qs.length + " 道错题</button>" +
          '<button type="button" class="btn btn--ghost" data-action="clear-wrong">清空错题本</button>' +
          '<span class="quiz-app__stats">答对后错题不会自动移除，可手动清空。</span>' +
        "</div>" +
        '<div class="quiz-wronglist">' + list + "</div>"
      );
    }

    /* ---------- 共用小件 ---------- */
    function cardMeta(q) {
      return (
        '<div class="quiz-card__meta">' +
          '<span class="chip" style="--chip-color:#3a6fd8">' + esc(q.chapter || "未分类") + "</span>" +
          '<span class="chip">' + (TYPE_NAMES[q.type] || esc(q.type)) + "</span>" +
          (q.difficulty ? '<span class="chip">难度 ' + q.difficulty + "</span>" : "") +
          '<span class="chip">' + srcName(q) + "</span>" +
        "</div>"
      );
    }

    function progressHtml(cur, total, pct) {
      return (
        '<div class="quiz-progress">' +
          '<div class="quiz-progress__bar"><div class="quiz-progress__fill" style="width:' + pct + '%"></div></div>' +
          '<span class="quiz-progress__label">' + cur + " / " + total + "</span>" +
        "</div>"
      );
    }

    function fmtTime(s) {
      s = Math.max(0, s);
      var m = Math.floor(s / 60), r = s % 60;
      return (m < 10 ? "0" + m : m) + ":" + (r < 10 ? "0" + r : r);
    }
    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    }
    function val(sel) {
      var el = document.querySelector(sel);
      return el ? el.value : "";
    }
    function byId(id) { for (var i = 0; i < bank.length; i++) { if (bank[i].id === id) return bank[i]; } return null; }

    /* ---------- 事件（委托） ---------- */
    app.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var act = btn.getAttribute("data-action");
      var q = state.qs[state.idx];

      if (act === "mode") {
        var to = btn.getAttribute("data-mode");
        if (state.mode === "exam" && !state.examResult && to !== "exam" && !window.confirm("考试进行中，退出将不记录成绩，确定退出？")) return;
        stopTimer();
        state.mode = to;
        state.examResult = null;
        state.idx = 0;
        render();
      } else if (act === "start-practice") {
        startPractice(val("#qzChapter"));
      } else if (act === "retry-practice") {
        startPractice(state.title && chapterList.indexOf(state.title) !== -1 ? state.title : "");
      } else if (act === "answer") {
        if (state.mode === "practice") {
          if (state.ans[q.id] != null) return;
          var opt = btn.getAttribute("data-opt");
          state.ans[q.id] = opt;
          if (opt !== q.answer) addWrong(q.id);
          render();
        } else if (state.mode === "exam") {
          var opt2 = btn.getAttribute("data-opt");
          state.ans[q.id] = opt2;
          render();
        }
      } else if (act === "prev") {
        if (state.idx > 0) { state.idx--; render(); }
      } else if (act === "next") {
        if (state.idx < state.qs.length - 1) { state.idx++; render(); }
      } else if (act === "finish-practice") {
        state.examResult = { done: true };
        render();
      } else if (act === "start-exam") {
        if (state.mode === "exam" && state.examResult) { startExam(); } else { startExam(); }
      } else if (act === "submit-exam") {
        var left = state.qs.length - answeredCount();
        if (left === 0 || window.confirm("还有 " + left + " 题未作答，确认交卷？")) finishExam();
      } else if (act === "retry-wrong") {
        var ids = wrongSet();
        var qs = ids.map(byId).filter(Boolean);
        if (qs.length) {
          stopTimer();
          state.mode = "practice";
          state.title = "错题重练";
          state.qs = qs;
          state.idx = 0;
          state.ans = {};
          state.examResult = null;
          render();
        }
      } else if (act === "clear-wrong") {
        if (window.confirm("确定清空错题本？")) { saveWrong([]); render(); }
      }
    });

    /* ---------- 初始：支持 ?chapter=xxx 直达某章练习（书→题联动入口） ---------- */
    (function () {
      var m = location.search.match(/[?&]chapter=([^&]+)/);
      if (m) {
        try {
          var name = decodeURIComponent(m[1].replace(/\+/g, " "));
          if (chapterList.indexOf(name) !== -1) { startPractice(name); return; }
        } catch (e) {}
      }
      render();
    })();
  }
})();
