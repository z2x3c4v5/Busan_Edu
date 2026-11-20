/* ---------- 듣기 (TTS) ---------- */
const hasTTS = "speechSynthesis" in window;
function enVoice(){
  const vs = hasTTS ? speechSynthesis.getVoices() : [];
  return vs.find(v => /^en[-_]US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name))
      || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (hasTTS){ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }

/* 한국어 고유명사는 영어 음성이 읽기 쉬운 철자로 바꿔 읽어요 */
const spokenForm = text => String(text).replace(LEX_RX, m => lexOf(m).say);

let ttsOwner = null;
function stopSpeak(){
  if (hasTTS) speechSynthesis.cancel();
  if (ttsOwner){ ttsOwner.classList.remove("playing"); ttsOwner = null; }
}
function speak(text, btn, slow){
  if (!hasTTS) return;
  const same = btn && ttsOwner === btn;
  stopSpeak(); if (same) return;
  const v = enVoice();
  const chunks = spokenForm(text).match(/[^.!?]+[.!?]*\s*/g) || [text];
  ttsOwner = btn || null; btn && btn.classList.add("playing");
  chunks.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t.trim());
    u.lang = "en-US"; if (v) u.voice = v;
    u.rate = slow ? 0.7 : 0.92;
    if (i === chunks.length - 1) u.onend = () => { if (ttsOwner === btn){ btn && btn.classList.remove("playing"); ttsOwner = null; } };
    u.onerror = () => { btn && btn.classList.remove("playing"); };
    speechSynthesis.speak(u);
  });
}

/* ---------- 말하기 (음성 인식 + 녹음) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSTT = !!SR;
const isAndroid = /Android/i.test(navigator.userAgent);
/* 안드로이드 크롬은 음성 인식과 녹음을 동시에 하면 마이크가 충돌하는 경우가 많아서 녹음(다시 듣기)을 꺼 둬요 */
let recorderOK = !isAndroid && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

/* listen(handlers) → {stop(), done: Promise<{candidates, audioUrl, error}>}
   handlers.onText(text)  : 말하는 동안 인식된 글자
   handlers.onLevel(0~1)  : 마이크 소리 크기 (녹음이 켜져 있을 때만) */
function listen(handlers = {}){
  let rec, stream, mr, chunks = [], ac, raf, silenceT, maxT, stopped = false;
  const segs = [];          // 확정된 구간: [후보1, 후보2, ...]
  let interim = "", error = null;

  let resolveDone;
  const done = new Promise(r => resolveDone = r);

  const cleanupAudio = () => {
    cancelAnimationFrame(raf);
    try { ac && ac.close(); } catch(e){}
    stream && stream.getTracks().forEach(t => t.stop());
  };

  const finish = async () => {
    clearTimeout(silenceT); clearTimeout(maxT);
    let audioUrl = null;
    if (mr && mr.state !== "inactive"){
      await new Promise(r => { mr.onstop = r; mr.stop(); });
    }
    if (chunks.length) audioUrl = URL.createObjectURL(new Blob(chunks, {type: mr.mimeType || "audio/webm"}));
    cleanupAudio();
    const finals = segs.filter(Boolean);
    let candidates = [];
    if (finals.length){
      const K = Math.max(...finals.map(s => s.length));
      for (let k = 0; k < K; k++) candidates.push(finals.map(s => s[k] ?? s[0]).join(" "));
      if (interim) candidates = candidates.map(c => c + " " + interim);
    } else if (interim) candidates = [interim];
    resolveDone({candidates, audioUrl, error});
  };

  const stop = () => {
    if (stopped) return; stopped = true;
    try { rec.stop(); } catch(e){ finish(); }
  };

  const startRecognition = () => {
    rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.onresult = e => {
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++){
        const r = e.results[i];
        if (r.isFinal) segs[i] = Array.from(r).map(a => a.transcript.trim());
        else interim += r[0].transcript;
      }
      handlers.onText && handlers.onText((segs.filter(Boolean).map(s => s[0]).join(" ") + " " + interim).trim());
      clearTimeout(silenceT);
      silenceT = setTimeout(stop, 1800);     // 말이 1.8초 멈추면 자동 종료
    };
    rec.onerror = e => { error = e.error; };
    rec.onend = finish;
    rec.start();
    maxT = setTimeout(stop, 20000);          // 최대 20초
    silenceT = setTimeout(stop, 7000);       // 7초 동안 아무 말이 없으면 종료
  };

  (async () => {
    if (recorderOK){
      try {
        stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
        mr = new MediaRecorder(stream);
        mr.ondataavailable = e => e.data.size && chunks.push(e.data);
        mr.start();
        if (handlers.onLevel){
          ac = new (window.AudioContext || window.webkitAudioContext)();
          const an = ac.createAnalyser(); an.fftSize = 512;
          ac.createMediaStreamSource(stream).connect(an);
          const buf = new Uint8Array(an.fftSize);
          const tick = () => {
            an.getByteTimeDomainData(buf);
            let sum = 0; for (const b of buf){ const x = (b - 128) / 128; sum += x * x; }
            handlers.onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
            raf = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch(e){
        if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")){ error = "not-allowed"; resolveDone({candidates: [], audioUrl: null, error}); return; }
        recorderOK = false; stream = null; mr = null;
      }
    }
    if (stopped){ finish(); return; }
    try { startRecognition(); }
    catch(e){ error = "start-failed"; finish(); }
  })();

  return {stop, done};
}
