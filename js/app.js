/* ---------- 상태 ---------- */
/* 부스용 공용 기기라서 학생 기록은 저장하지 않아요. (천천히 듣기 설정만 기억) */
let S = freshState();
function freshState(){
  return {view: "home", topic: null, level: null, picked: [], focus: null, idx: 0, results: {}, slow: readSlow()};
}
function readSlow(){ try { return localStorage.getItem("seon-speak-slow") === "1"; } catch(e){ return false; } }
function saveSlow(){ try { localStorage.setItem("seon-speak-slow", S.slow ? "1" : "0"); } catch(e){} }

let mic = null;            // 녹음 중인 listen() 컨트롤러
let micState = "idle";     // idle | listening
let lastAudio = null;      // 방금 녹음한 내 목소리
let justScored = false;    // 방금 채점됨 → 점수 애니메이션

const app = document.getElementById("app");
const layer = document.getElementById("layer");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 도우미 ---------- */
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
/* 고유명사 위에 발음 표시 (ruby) */
const deco = text => String(text).split(LEX_RX).length === 1 ? esc(text) :
  String(text).replace(LEX_RX, m => `\u0000${m}\u0001`).split(/(\u0000[^\u0001]*\u0001)/).map(seg => {
    if (!seg.startsWith("\u0000")) return esc(seg);
    const m = seg.slice(1, -1), x = lexOf(m);
    return x.plain ? esc(m) : `<ruby>${esc(m)}<rt>${esc(x.say.toLowerCase())}</rt></ruby>`;
  }).join("");

const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>';
const sayBtn = (text, label = "듣기", cls = "say") => `<button class="${cls}" data-act="say" data-text="${esc(text)}">${SPK}<span>${label}</span></button>`;
const starHTML = (n, pop) => `<span class="stars ${pop ? "pop" : ""}" aria-label="별 ${n}개">${[0,1,2].map(i => `<i class="${i < n ? "on" : ""}" style="--i:${i}">★</i>`).join("")}</span>`;

const topic = () => TOPICS[S.topic];
const allSentences = () => sentencesOf(S.topic, S.level);
const pickedSentences = () => S.picked.map(id => allSentences().find(s => s.id === id)).filter(Boolean);

/* 사진 */
function photoImg(key, cls = ""){
  const p = PHOTOS[key];
  if (!p) return `<span class="ph-empty ${cls}"></span>`;
  return `<img class="${cls}" src="${p.src}" alt="${esc(p.ko)}" loading="lazy" decoding="async">`;
}
function photoFigure(key, cls = ""){
  const p = PHOTOS[key];
  if (!p) return "";
  return `<figure class="photo ${cls}" data-key="${key}">
    <div class="kb">${photoImg(key)}</div>
    <figcaption><b>${esc(p.ko)}</b><small>사진: ${esc(p.author)} · ${esc(p.license)} · Wikimedia Commons</small></figcaption>
  </figure>`;
}

function seon(img, en, ko, extra = ""){
  return `<section class="seon-row in">
    <img class="seon-bob" src="${img}" alt="션이">
    <div class="bubble">
      ${extra}
      <div class="en">${deco(en)}</div>
      <div class="ko">${esc(ko)}</div>
      ${sayBtn(en)}
    </div>
  </section>`;
}

function steps(){
  const order = ["home", "level", "pick", "practice", "result"];
  const cur = order.indexOf(S.view);
  const labels = ["주제", "난이도", "문장", "말하기", "결과"];
  return `<ol class="steps">${labels.map((l, i) => `<li class="${i < cur ? "done" : i === cur ? "cur" : ""}"><b>${i < cur ? "✓" : i + 1}</b><span>${l}</span></li>`).join("")}</ol>`;
}

function crumbs(){
  const parts = [];
  if (S.topic) parts.push(`<span style="--tc:${topic().color}">${topic().label}</span>`);
  if (S.level) parts.push(`<span>${LEVELS[S.level].label}</span>`);
  return parts.length ? `<div class="crumbs in">${parts.join("<b>›</b>")}</div>` : "";
}

/* ---------- 화면 ---------- */
function viewHome(){
  return `
  ${seon(IMG.hello, "Hi! I'm Seon from Busan. Let's speak English and share Busan with the world!",
    "안녕! 나는 부산 친구 션이야. 영어로 부산을 소개하고, 내 발음을 AI에게 들려줘 보자!",
    `<span class="eyebrow">Speaking Challenge</span>`)}
  <h2 class="sec-title in">어떤 주제로 말해 볼까요?</h2>
  <section class="topics">${TOPIC_ORDER.map((k, i) => {
    const T = TOPICS[k];
    return `<button class="tcard in" data-act="topic" data-v="${k}" style="--tc:${T.color};--d:${i}">
      <span class="tphoto">${photoImg(T.cover)}</span>
      <img class="tseon" src="${T.img}" alt="">
      <span class="ttext"><span class="en-sub">${T.en}</span>
      <b>${T.label}</b>
      <small>${T.blurb}</small></span>
    </button>`;
  }).join("")}</section>
  ${envNotice()}`;
}

function viewLevel(){
  const T = topic();
  return `
  ${crumbs()}
  ${seon(T.img, T.bubble[0], T.bubble[1])}
  <h2 class="sec-title in">난이도를 골라 주세요</h2>
  <section class="levels">${LEVEL_ORDER.map((k, i) => {
    const L = LEVELS[k], ex = T.levels[k][0];
    return `<button class="lcard in" data-act="level" data-v="${k}" style="--d:${i}">
      <span class="lphoto">${photoImg(ex[2])}</span>
      <span class="lbody">
        <span class="lstars">${L.stars}</span>
        <b>${L.label}</b><span class="en-sub">${L.en}</span>
        <small>${L.desc}</small>
        <span class="sample">예) ${deco(ex[0])}</span>
      </span>
    </button>`;
  }).join("")}</section>
  <div class="nav"><button class="btn ghost" data-act="go" data-v="home">← 주제 다시 고르기</button></div>`;
}

function viewPick(){
  const list = allSentences();
  if (!S.focus || !list.some(s => s.id === S.focus)) S.focus = list[0].id;
  const f = list.find(s => s.id === S.focus);
  return `
  ${crumbs()}
  ${seon(topic().img, `Pick ${MAX_PICK} sentences you want to say!`, `말하고 싶은 문장을 ${MAX_PICK}개까지 골라 봐! 문장을 누르면 사진이 바뀌어.`)}
  <div class="pickbar in">
    <span class="count" id="count">${countHTML()}</span>
    <button class="btn ghost sm" data-act="random">🎲 랜덤으로 ${MAX_PICK}개</button>
    <button class="btn ghost sm" data-act="clear" id="clearBtn" ${S.picked.length ? "" : "hidden"}>선택 지우기</button>
    <button class="slowtgl ${S.slow ? "on" : ""}" data-act="slow">🐢 천천히 듣기 ${S.slow ? "켜짐" : "꺼짐"}</button>
  </div>
  <div class="pick-grid">
    <section class="plist">${list.map((s, i) => {
      const pos = S.picked.indexOf(s.id);
      return `<div class="pitem in ${pos >= 0 ? "sel" : ""} ${s.id === S.focus ? "focus" : ""}" data-id="${s.id}" style="--d:${i}">
        <button class="pcheck" data-act="pick" data-v="${s.id}" aria-pressed="${pos >= 0}" aria-label="문장 ${i + 1} 고르기">${pos >= 0 ? pos + 1 : ""}</button>
        <span class="pthumb" data-act="pick" data-v="${s.id}">${photoImg(s.photo)}</span>
        <div class="ptext" data-act="pick" data-v="${s.id}">
          <div class="en">${deco(s.en)}</div>
          <div class="ko">${esc(s.ko)}</div>
        </div>
        ${sayBtn(s.en)}
      </div>`;
    }).join("")}</section>
    <aside class="preview-pane in" id="preview">${previewHTML(f)}</aside>
  </div>
  <div class="nav sticky">
    <button class="btn ghost" data-act="go" data-v="level">← 난이도</button>
    <button class="btn big" data-act="start" id="startBtn" ${S.picked.length ? "" : "disabled"}>${startLabel()}</button>
  </div>`;
}
const countHTML = () => `${[...Array(MAX_PICK)].map((_, i) => `<i class="${i < S.picked.length ? "on" : ""}"></i>`).join("")}<b>${S.picked.length}</b> / ${MAX_PICK} 선택`;
const startLabel = () => S.picked.length ? `${S.picked.length}문장 말하기 시작 →` : "문장을 골라 주세요";
function previewHTML(s){
  return `${photoFigure(s.photo, "big swap")}
    <div class="pv-text">
      <div class="en">${deco(s.en)}</div>
      <div class="ko">${esc(s.ko)}</div>
    </div>`;
}

function viewPractice(){
  const list = pickedSentences(), s = list[S.idx], r = S.results[s.id];
  const tips = [...new Set((s.en.match(LEX_RX) || []).map(m => lexOf(m)).filter(x => !x.plain).map(x => x.w))]
    .map(w => { const x = lexOf(w); return `<span class="tip"><b>${esc(x.w)}</b> ${esc(x.ko)} · <i>${esc(x.say.toLowerCase())}</i></span>`; }).join("");
  const last = S.idx === list.length - 1;
  const done = list.filter(x => S.results[x.id]).length;
  return `
  ${crumbs()}
  <div class="progress in"><span style="--w:${Math.round(100 * done / list.length)}%"></span></div>
  <nav class="dots in" aria-label="진행">${list.map((x, i) => {
    const rr = S.results[x.id];
    return `<button data-act="jump" data-v="${i}" class="${i === S.idx ? "cur" : ""} ${rr ? "done" : ""}" aria-label="${i + 1}번 문장">${rr ? rr.best : i + 1}</button>`;
  }).join("")}</nav>
  <section class="stage in" style="--tc:${topic().color}">
    <div class="stage-photo">${photoFigure(s.photo, "banner")}</div>
    <div class="stage-top">
      <img class="seon-sm ${micState === "listening" ? "listening" : ""}" src="${micState === "listening" ? IMG.study : (r && r.last.stars >= 2 ? IMG.please : IMG.study)}" alt="션이">
      <div>
        <span class="eyebrow">문장 ${S.idx + 1} / ${list.length}</span>
        <p class="target ${r && justScored ? "reveal" : ""}" id="target">${r ? resultWords(r.last.words) : deco(s.en)}</p>
        <p class="ko">${esc(s.ko)}</p>
        ${tips ? `<div class="tips"><small>발음 힌트</small>${tips}</div>` : ""}
      </div>
    </div>
    <div class="listen-row">
      <button class="btn ghost" data-act="say" data-text="${esc(s.en)}">${SPK}<span>들어 보기</span></button>
      <button class="slowtgl ${S.slow ? "on" : ""}" data-act="slow">🐢 천천히 ${S.slow ? "켜짐" : "꺼짐"}</button>
    </div>

    <div class="mic-area ${micState}">
      <button class="mic" data-act="mic" ${hasSTT ? "" : "disabled"} aria-label="${micState === "listening" ? "녹음 멈추기" : "녹음 시작"}">
        <span class="wave w1"></span><span class="wave w2"></span><span class="wave w3"></span>
        <span class="ring" id="lvl"></span>${MIC}
      </button>
      <div class="mic-label">${micLabel()}</div>
      <div class="live" id="live"></div>
    </div>

    <div id="result">${r ? resultCard(r) : ""}</div>
  </section>
  <div class="nav">
    ${S.idx > 0 ? `<button class="btn ghost" data-act="jump" data-v="${S.idx - 1}">← 이전 문장</button>` : `<button class="btn ghost" data-act="go" data-v="pick">← 문장 다시 고르기</button>`}
    <button class="btn ${r ? "glow" : "ghost"}" data-act="${last ? "finish" : "jump"}" data-v="${S.idx + 1}">${last ? "결과 보기 🏆" : "다음 문장 →"}</button>
  </div>
  ${envNotice()}`;
}

function micLabel(){
  if (!hasSTT) return "이 브라우저는 음성 인식을 지원하지 않아요";
  if (micState === "listening") return "듣고 있어요… 다 말하면 버튼을 눌러요";
  return S.results[pickedSentences()[S.idx].id] ? "다시 도전하기" : "버튼을 누르고 문장을 말해 보세요";
}

function resultWords(words){
  return words.map((w, i) => `<span class="w ${w.status}" style="--i:${i}">${deco(w.text)}</span>`).join(" ");
}

function resultCard(r){
  const x = r.last;
  const msg = x.stars === 3 ? ["Excellent!", "완벽해! AI가 거의 다 알아들었어!"]
            : x.stars === 2 ? ["Great job!", "아주 잘했어! 빨간 단어만 한 번 더 연습해 볼까?"]
            : x.stars === 1 ? ["Good try!", "좋은 시도야! 천천히 듣고 다시 말해 보자."]
            : ["Let's try again!", "조금 더 크고 또박또박 말해 볼까?"];
  const p0 = justScored && !reduceMotion ? 0 : x.score;
  return `<div class="rcard s${x.stars} ${justScored ? "fresh" : ""}">
    <div class="score" id="scoreRing" data-score="${x.score}" style="--p:${p0}"><span><b id="scoreNum">${p0}</b><small>%</small></span></div>
    <div class="rbody">
      ${starHTML(x.stars, justScored)}
      <div class="rmsg"><b>${msg[0]}</b> ${msg[1]}</div>
      <div class="heard"><small>AI가 들은 문장</small>${x.heard ? esc(x.heard) : "<i>(알아들은 말이 없어요)</i>"}</div>
      <div class="legend"><span class="w ok">맞음</span><span class="w near">비슷함</span><span class="w miss">놓침</span><span class="w ko">한국어 단어 ✓</span>
        ${r.tries > 1 ? `<span class="best">최고 ${r.best}% · ${r.tries}번 도전</span>` : ""}</div>
      ${lastAudio && r.audio ? `<button class="btn ghost sm" data-act="myvoice">▶ 내 목소리 듣기</button>` : ""}
    </div>
  </div>`;
}

function viewResult(){
  const list = pickedSentences();
  const done = list.filter(s => S.results[s.id]);
  const avg = done.length ? Math.round(done.reduce((a, s) => a + S.results[s.id].best, 0) / list.length) : 0;
  const stars = avg >= 90 ? 3 : avg >= 70 ? 2 : avg >= 40 ? 1 : 0;
  return `
  ${crumbs()}
  <section class="final in">
    <div class="big-stamp" style="--tc:${topic().color}"><div><span class="t1">${esc(topic().en.toUpperCase())} · ${esc(LEVELS[S.level].en.toUpperCase())}</span><span class="t2">${done.length === list.length ? "CLEAR" : "GOOD TRY"}</span><span class="t3">BUSAN · ${new Date().getFullYear()}</span></div></div>
    <img class="seon-bob" src="${IMG.please}" alt="기뻐하는 션이">
    <div class="avg"><small>평균 정확도</small><b id="avgNum" data-score="${avg}">${reduceMotion ? avg : 0}%</b>${starHTML(stars, true)}</div>
    <p class="ko">${stars >= 2 ? "Wonderful! 부산을 영어로 멋지게 소개했어요!" : "Good job! 끝까지 말한 것만으로도 최고예요!"}</p>
  </section>
  <section class="rlist">${list.map((s, i) => {
    const r = S.results[s.id];
    return `<div class="ritem in" style="--d:${i + 2}">
      <span class="rthumb">${photoImg(s.photo)}</span>
      <div class="en">${r ? resultWords(r.last.words) : deco(s.en)}</div>
      <span class="sc">${r ? `${r.best}%` : "—"}</span>${r ? starHTML(r.last.stars) : `<button class="btn ghost sm" data-act="jump" data-v="${i}">도전</button>`}
    </div>`;
  }).join("")}</section>
  <div class="nav">
    <button class="btn ghost" data-act="go" data-v="pick">다른 문장 도전</button>
    <button class="btn" data-act="restart">처음으로 (다음 친구)</button>
  </div>`;
}

function envNotice(){
  const notes = [];
  if (!window.isSecureContext) notes.push("마이크는 https 주소에서만 쓸 수 있어요. GitHub Pages 주소로 열어 주세요.");
  if (!hasSTT) notes.push("이 브라우저는 음성 인식을 지원하지 않아요. <b>Chrome</b>(또는 Edge, iPad Safari)으로 열어 주세요.");
  if (!hasTTS) notes.push("이 기기에서는 영어 듣기를 지원하지 않아요.");
  return notes.map(n => `<div class="note">${n}</div>`).join("");
}

/* ---------- 렌더링 ---------- */
function render(animate = false){
  stopSpeak();
  app.classList.toggle("enter", animate && !reduceMotion);
  app.innerHTML = S.view === "home" ? viewHome()
    : S.view === "level" ? viewLevel()
    : S.view === "pick" ? viewPick()
    : S.view === "practice" ? viewPractice()
    : viewResult();
  document.getElementById("homeBtn").hidden = S.view === "home";
  document.getElementById("steps").innerHTML = steps();
  afterRender();
}
function afterRender(){
  if (S.view === "practice" && justScored){
    const ring = document.getElementById("scoreRing"), num = document.getElementById("scoreNum");
    if (ring) countUp(+ring.dataset.score, v => { num.textContent = v; ring.style.setProperty("--p", v); });
    const r = S.results[pickedSentences()[S.idx].id];
    if (r && r.last.stars === 3) confetti();
    justScored = false;
  }
  if (S.view === "result"){
    const el = document.getElementById("avgNum");
    if (el){ const v = +el.dataset.score; countUp(v, x => el.textContent = x + "%"); if (v >= 70) setTimeout(confetti, 500); }
  }
}
function go(view){ cancelMic(); S.view = view; render(true); window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"}); }

function countUp(target, set){
  if (reduceMotion){ set(target); return; }
  const t0 = performance.now(), dur = 900;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    set(Math.round(target * e));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function confetti(){
  if (reduceMotion) return;
  const box = document.createElement("div");
  box.className = "confetti";
  const colors = ["#e1252f", "#f4c430", "#2f6fd1", "#6a4bb0", "#1f8a4c", "#d9532b"];
  for (let i = 0; i < 60; i++){
    const p = document.createElement("i");
    p.style.cssText = `--x:${Math.random() * 100}vw;--dx:${(Math.random() - .5) * 30}vw;--r:${Math.random() * 720 - 360}deg;--t:${1.6 + Math.random() * 1.4}s;--dl:${Math.random() * .3}s;background:${colors[i % colors.length]}`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

function toast(msg){
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  layer.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* 문장 고르기 화면은 다시 그리지 않고 필요한 부분만 바꿔요 (애니메이션이 끊기지 않게) */
function refreshPick(){
  app.querySelectorAll(".pitem").forEach(el => {
    const id = el.dataset.id, pos = S.picked.indexOf(id);
    el.classList.toggle("sel", pos >= 0);
    el.classList.toggle("focus", id === S.focus);
    const c = el.querySelector(".pcheck");
    c.textContent = pos >= 0 ? pos + 1 : "";
    c.setAttribute("aria-pressed", pos >= 0);
  });
  document.getElementById("count").innerHTML = countHTML();
  document.getElementById("clearBtn").hidden = !S.picked.length;
  const sb = document.getElementById("startBtn");
  sb.disabled = !S.picked.length; sb.textContent = startLabel();
}
function setFocus(id){
  if (S.focus === id) return;
  S.focus = id;
  const s = allSentences().find(x => x.id === id);
  const pv = document.getElementById("preview");
  if (pv && s){ pv.innerHTML = previewHTML(s); }
}

/* ---------- 녹음 & 채점 ---------- */
function cancelMic(){
  if (mic){ const m = mic; mic = null; m.stop(); }
  micState = "idle";
}

async function startMic(){
  stopSpeak();
  const s = pickedSentences()[S.idx];
  micState = "listening";
  render();
  const live = document.getElementById("live"), lvl = document.getElementById("lvl");
  const ctl = listen({
    onText: t => { if (live) live.textContent = t; },
    onLevel: v => { if (lvl) lvl.style.setProperty("--lv", v.toFixed(2)); }
  });
  mic = ctl;
  const out = await ctl.done;
  if (mic !== ctl) return;     // 화면을 떠나 취소됨
  mic = null;

  const fail = msg => { micState = "idle"; render(); toast(msg); };
  if (out.error === "not-allowed" || out.error === "service-not-allowed")
    return fail("마이크 권한이 필요해요. 주소창의 🔒 아이콘에서 마이크를 허용해 주세요.");
  if (out.error === "audio-capture" && recorderOK){
    recorderOK = false;               // 녹음과 인식이 충돌 → 녹음 끄고 다시
    return fail("마이크 설정을 바꿨어요. 한 번 더 눌러 주세요!");
  }
  if (out.error === "network") return fail("인터넷 연결이 필요해요. (음성 인식은 온라인에서만 돼요)");
  if (!out.candidates.length){
    if (out.audioUrl) URL.revokeObjectURL(out.audioUrl);
    return fail("소리가 잘 안 들렸어요. 마이크 가까이에서 크게 말해 볼까요?");
  }
  const x = scoreSpeech(s.en, out.candidates);
  if (lastAudio) URL.revokeObjectURL(lastAudio);
  lastAudio = out.audioUrl;
  const prev = S.results[s.id];
  S.results[s.id] = {last: x, best: Math.max(x.score, prev ? prev.best : 0), tries: (prev ? prev.tries : 0) + 1, audio: !!out.audioUrl};
  micState = "idle";
  justScored = true;
  render();
  document.getElementById("result")?.scrollIntoView({block: "nearest", behavior: reduceMotion ? "auto" : "smooth"});
}

/* ---------- 이벤트 ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t || t.disabled) return;
  const act = t.dataset.act, v = t.dataset.v;
  if (act === "say"){
    speak(t.dataset.text, t, S.slow);
    const item = t.closest(".pitem"); if (item){ setFocus(item.dataset.id); refreshPick(); }
  }
  else if (act === "topic"){ S.topic = v; S.level = null; S.picked = []; S.results = {}; S.focus = null; go("level"); }
  else if (act === "level"){ S.level = v; S.picked = []; S.results = {}; S.focus = null; go("pick"); }
  else if (act === "go"){ go(v); }
  else if (act === "pick"){
    const i = S.picked.indexOf(v);
    setFocus(v);
    if (i >= 0) S.picked.splice(i, 1);
    else if (S.picked.length >= MAX_PICK){
      toast(`문장은 ${MAX_PICK}개까지 고를 수 있어요. 다른 문장을 먼저 빼 주세요.`);
      const c = document.getElementById("count"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
      refreshPick(); return;
    }
    else S.picked.push(v);
    refreshPick();
  }
  else if (act === "random"){
    const ids = allSentences().map(s => s.id).sort(() => Math.random() - 0.5);
    S.picked = ids.slice(0, MAX_PICK); setFocus(S.picked[0]); refreshPick();
  }
  else if (act === "clear"){ S.picked = []; refreshPick(); }
  else if (act === "slow"){
    S.slow = !S.slow; saveSlow();
    app.querySelectorAll(".slowtgl").forEach(b => { b.classList.toggle("on", S.slow); b.textContent = b.textContent.replace(/켜짐|꺼짐/, S.slow ? "켜짐" : "꺼짐"); });
  }
  else if (act === "start"){ S.idx = 0; S.results = {}; go("practice"); }
  else if (act === "jump"){ cancelMic(); S.idx = Math.max(0, Math.min(+v, S.picked.length - 1)); S.view = "practice"; render(true); window.scrollTo(0, 0); }
  else if (act === "finish"){ go("result"); }
  else if (act === "mic"){
    if (micState === "listening"){ mic && mic.stop(); }
    else startMic();
  }
  else if (act === "myvoice"){ if (lastAudio){ stopSpeak(); new Audio(lastAudio).play(); } }
  else if (act === "restart"){ resetAll(); }
});
document.getElementById("homeBtn").addEventListener("click", () => {
  if (S.view === "home") return;
  if (confirm("처음 화면으로 돌아갈까요? 지금까지 기록은 지워져요.")) resetAll();
});
/* 마우스를 올리면 그 문장의 사진 미리 보기 */
app.addEventListener("pointerover", e => {
  if (S.view !== "pick" || e.pointerType !== "mouse") return;
  const it = e.target.closest(".pitem"); if (it){ setFocus(it.dataset.id); refreshPick(); }
});

function resetAll(){
  cancelMic();
  if (lastAudio){ URL.revokeObjectURL(lastAudio); lastAudio = null; }
  S = freshState();
  layer.innerHTML = "";
  render(true); window.scrollTo(0, 0);
}

/* ---------- 부스용: 2분 동안 아무 입력이 없으면 처음 화면으로 ---------- */
const IDLE_MS = 120000;
let idleT;
function bump(){ clearTimeout(idleT); idleT = setTimeout(() => { if (S.view !== "home" && micState === "idle") resetAll(); else bump(); }, IDLE_MS); }
["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, bump, {passive: true}));
bump();

render(true);
