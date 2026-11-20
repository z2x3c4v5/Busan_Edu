/* 정확도 채점: 음성 인식 결과(여러 후보)와 목표 문장을 단어 단위로 맞춰 봐요.
   - 정밀한 발음 평가가 아니라 "AI가 알아들은 정도"예요.
   - 한국어 고유명사(lexicon.js)는 인식기가 어떻게 받아 적든 **무조건 정답**으로 처리해요.
   - 학생에게 불리하지 않도록 너그럽게:
     · 동음이의어(to/two/too, sea/see …)는 정답
     · 복수형·과거형·-ing 차이는 정답 (festival ↔ festivals)
     · 발음이 비슷한 철자(소리 키가 같음)는 정답
     · a / the / is 같은 기능어는 점수 비중을 절반으로 */

const NUMS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
const CONTRACTIONS = {
  "it's":"it is", "let's":"let us", "lets":"let us", "i'm":"i am", "im":"i am", "don't":"do not", "dont":"do not",
  "doesn't":"does not", "you'll":"you will", "that's":"that is", "there's":"there is", "isn't":"is not",
  "aren't":"are not", "can't":"can not", "cannot":"can not", "won't":"will not", "we're":"we are",
  "they're":"they are", "you're":"you are", "i've":"i have", "what's":"what is", "i'll":"i will",
  "we'll":"we will", "it'll":"it will", "he's":"he is", "she's":"she is", "wanna":"want to", "gonna":"going to"
};
const HOMOPHONES = [
  ["to","two","too"], ["for","four"], ["sea","see","c"], ["there","their"], ["by","buy","bye"],
  ["one","won"], ["new","knew"], ["right","write"], ["here","hear"], ["meet","meat"], ["night","knight"],
  ["eight","ate"], ["son","sun"], ["week","weak"], ["be","bee"], ["no","know"], ["i","eye"],
  ["way","weigh"], ["wait","weight"], ["hole","whole"], ["flour","flower"], ["tail","tale"],
  ["sail","sale"], ["piece","peace"], ["red","read"], ["blue","blew"], ["pear","pair"], ["our","hour"],
  ["its","it"], ["you","u"], ["are","r"], ["okay","ok"]
];
const HOMO = new Map(); HOMOPHONES.forEach((g, i) => g.forEach(w => HOMO.set(w, i)));
const ARTICLES = new Set(["a", "an", "the"]);
const FUNCTION_WORDS = new Set(["a","an","the","is","are","am","was","at","to","in","of","on","and","for","it","its","with","by","so","but","or","as","be","do","us"]);

/* 단어 하나(띄어쓰기 단위) → 비교용 토큰들 */
function wordTokens(raw){
  let w = String(raw).toLowerCase().replace(/[’‘`]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
  if (!w) return [];
  if (CONTRACTIONS[w]) return CONTRACTIONS[w].split(" ");
  if (/^\d+$/.test(w)) return [NUMS[+w] || w];
  const lx = LEXMAP.get(lexKey(w.replace(/'s$/, "")));
  if (lx) return [lexKey(lx.w)];                    // 고유명사는 하이픈 포함 한 덩어리
  w = w.replace(/'s$/, "");
  return w.split(/[-']/).map(x => x.replace(/[^a-z0-9]/g, "")).filter(Boolean);
}
const tokenize = text => String(text).split(/\s+/).flatMap(wordTokens);

function lev(a, b){
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({length: n + 1}, (_, j) => j), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++){
    cur[0] = i;
    for (let j = 1; j <= n; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}
const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);

/* 어미 떼기: festivals→festival, watched→watch, making→mak(e) */
function stem(w){
  if (w.length <= 3) return w;
  return w.replace(/(ies)$/, "y").replace(/(es|s)$/, "").replace(/(ed|ing)$/, "").replace(/e$/, "");
}
/* 간단한 영어 소리 키: 철자는 달라도 소리가 같으면 같은 키 */
function soundKey(w){
  let s = w.toLowerCase()
    .replace(/^kn/, "n").replace(/^wr/, "r").replace(/^wh/, "w")
    .replace(/ph/g, "f").replace(/gh/g, "").replace(/ck/g, "k").replace(/q/g, "k").replace(/x/g, "ks")
    .replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/z/g, "s").replace(/dg/g, "j")
    .replace(/tion/g, "shn").replace(/th/g, "0").replace(/v/g, "f");
  const first = s[0] || "";
  s = first + s.slice(1).replace(/[aeiouy]/g, "");
  return s.replace(/(.)\1+/g, "$1");
}

/* 목표 토큰 t 와 들린 토큰 묶음(heard) → 0~1 점 */
function credit(t, heard){
  const joined = heard.join("");
  if (heard.length > 1) return sim(joined, t) >= 0.85 ? 1 : 0;   // "sea food" → "seafood"
  const h = heard[0];
  if (h === t) return 1;
  if (HOMO.has(t) && HOMO.get(t) === HOMO.get(h)) return 1;
  if (ARTICLES.has(t) && ARTICLES.has(h)) return 0.75;
  if (t.length <= 3) return sim(h, t) >= 0.66 && soundKey(h) === soundKey(t) ? 0.75 : 0;
  if (stem(h) === stem(t)) return 1;
  if (soundKey(h) === soundKey(t) && sim(h, t) >= 0.5) return 1;
  const s = sim(h, t);
  return s >= 0.75 ? 1 : s >= 0.5 ? 0.6 : 0;
}

/* 목표 토큰 배열 T, 들린 토큰 배열 H → 가중 점수가 최대인 정렬 (DP) */
function align(T, H, W){
  const n = T.length, m = H.length, MAXK = 4;
  const dp = Array.from({length: n + 1}, () => new Float64Array(m + 1).fill(-1));
  const bp = Array.from({length: n + 1}, () => new Array(m + 1));
  dp[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++){
    const v = dp[i][j]; if (v < 0) continue;
    const up = (ii, jj, val, how) => { if (val > dp[ii][jj] + 1e-9){ dp[ii][jj] = val; bp[ii][jj] = how; } };
    if (j < m) up(i, j + 1, v, {pi: i, pj: j});                        // 군더더기 단어 (감점 없음)
    if (i >= n) continue;
    if (LEXMAP.has(T[i])){
      /* 한국어 고유명사: 들린 말이 무엇이든(또는 없어도) 정답. 엉뚱하게 받아 적힌 1~4단어를 흡수해요 */
      for (let k = 0; k <= MAXK && j + k <= m; k++)
        up(i + 1, j + k, v + W[i], {pi: i, pj: j, t: i, c: 1});
      continue;
    }
    up(i + 1, j, v, {pi: i, pj: j, t: i, c: 0});                       // 놓친 단어
    for (let k = 1; k <= 2 && j + k <= m; k++){
      const c = credit(T[i], H.slice(j, j + k));
      if (c > 0) up(i + 1, j + k, v + c * W[i], {pi: i, pj: j, t: i, c});
    }
  }
  const per = new Array(n).fill(0);
  let i = n, j = m;
  while (i > 0 || j > 0){
    const b = bp[i][j]; if (!b) break;
    if (b.t !== undefined) per[b.t] = b.c;
    i = b.pi; j = b.pj;
  }
  return {total: dp[n][m], per};
}

/* 목표 문장 + 인식 후보들 → 결과
   words: 화면에 보여줄 원래 단어별 상태 (ok / near / miss / ko = 한국어 고유명사) */
function scoreSpeech(target, candidates){
  const display = target.split(/\s+/).filter(Boolean);
  const map = [], T = [];
  display.forEach((w, di) => wordTokens(w).forEach(t => { T.push(t); map.push(di); }));
  const W = T.map(t => FUNCTION_WORDS.has(t) ? 0.5 : 1);
  const totalW = W.reduce((a, b) => a + b, 0) || 1;
  let best = null;
  for (const cand of [...new Set(candidates.filter(Boolean).map(c => c.trim()))]){
    const r = align(T, tokenize(cand), W);
    if (!best || r.total > best.r.total) best = {r, cand};
  }
  if (!best) best = {r: {total: 0, per: T.map(() => 0)}, cand: ""};
  const sums = display.map(() => ({s: 0, n: 0, lex: false}));
  best.r.per.forEach((c, ti) => { const d = sums[map[ti]]; d.s += c; d.n++; if (LEXMAP.has(T[ti])) d.lex = true; });
  const words = display.map((w, di) => {
    const {s, n, lex} = sums[di];
    const v = n ? s / n : 1;
    return {text: w, status: lex ? "ko" : v >= 0.99 ? "ok" : v >= 0.5 ? "near" : "miss"};
  });
  const score = Math.min(100, Math.round(100 * best.r.total / totalW));
  return {score, words, heard: best.cand, stars: score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0};
}
