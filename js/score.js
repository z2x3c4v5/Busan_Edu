/* 정확도 채점: 음성 인식 결과(여러 후보)와 목표 문장을 단어 단위로 맞춰 봐요.
   - 이건 정밀한 발음 평가가 아니라 "AI가 알아들은 정도"예요.
   - 한국어 고유명사는 lexicon.js의 허용 표기로 너그럽게 채점해요. */

const NUMS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
const CONTRACTIONS = {
  "it's":"it is", "let's":"let us", "i'm":"i am", "don't":"do not", "doesn't":"does not", "you'll":"you will",
  "that's":"that is", "there's":"there is", "isn't":"is not", "aren't":"are not", "can't":"can not", "cannot":"can not",
  "won't":"will not", "we're":"we are", "they're":"they are", "you're":"you are", "i've":"i have", "what's":"what is",
  "i'll":"i will", "lets":"let us", "dont":"do not", "im":"i am", "we'll":"we will", "it'll":"it will", "he's":"he is", "she's":"she is", "wanna":"want to"
};

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

/* 목표 토큰 t 와 들린 토큰 묶음(heard) → {credit: 0~1, s: 유사도} */
function credit(t, heard){
  const joined = heard.join("");
  const lx = LEXMAP.get(t);
  if (lx){
    const s = Math.max(...lx.alts.map(a => sim(joined, a)));
    return {s, credit: s >= 0.6 ? 1 : s >= 0.4 ? 0.5 : 0};
  }
  const s = sim(joined, t);
  if (heard.length > 1) return {s, credit: s >= 0.9 ? 1 : 0};   // "sea food" → "seafood" 같은 경우만
  if (t.length <= 3) return {s, credit: s === 1 ? 1 : 0};        // 짧은 단어는 정확히
  return {s, credit: s >= 0.8 ? 1 : s >= 0.6 ? 0.5 : 0};
}

/* 목표 토큰 배열 T, 들린 토큰 배열 H → 최대 점수 정렬 (DP) */
function align(T, H){
  const n = T.length, m = H.length, MAXK = 4;
  const dp = Array.from({length: n + 1}, () => new Float64Array(m + 1).fill(-1));
  const bp = Array.from({length: n + 1}, () => new Array(m + 1));
  dp[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++){
    const v = dp[i][j]; if (v < 0) continue;
    const up = (ii, jj, val, how) => { if (val > dp[ii][jj] + 1e-9){ dp[ii][jj] = val; bp[ii][jj] = how; } };
    if (j < m) up(i, j + 1, v, {pi: i, pj: j});                          // 군더더기 단어
    if (i < n){
      up(i + 1, j, v, {pi: i, pj: j, t: i, c: 0});                       // 놓친 단어
      const kmax = LEXMAP.has(T[i]) ? MAXK : 2;
      for (let k = 1; k <= kmax && j + k <= m; k++){
        const r = credit(T[i], H.slice(j, j + k));
        if (r.credit > 0) up(i + 1, j + k, v + r.credit, {pi: i, pj: j, t: i, c: r.credit, h: H.slice(j, j + k).join(" ")});
      }
    }
  }
  const per = new Array(n).fill(0), heardFor = new Array(n).fill("");
  let i = n, j = m;
  while (i > 0 || j > 0){
    const b = bp[i][j]; if (!b) break;
    if (b.t !== undefined){ per[b.t] = b.c; heardFor[b.t] = b.h || ""; }
    i = b.pi; j = b.pj;
  }
  return {total: dp[n][m], per, heardFor};
}

/* 목표 문장 + 인식 후보들 → 결과
   words: 화면에 보여줄 원래 단어별 상태 (ok / near / miss) */
function scoreSpeech(target, candidates){
  const display = target.split(/\s+/).filter(Boolean);
  const map = [];            // 토큰 → 화면 단어 index
  const T = [];
  display.forEach((w, di) => wordTokens(w).forEach(t => { T.push(t); map.push(di); }));
  let best = null;
  for (const cand of candidates.filter(Boolean)){
    const H = tokenize(cand);
    const r = align(T, H);
    if (!best || r.total > best.r.total) best = {r, cand};
  }
  if (!best) best = {r: {total: 0, per: T.map(() => 0)}, cand: ""};
  const sums = display.map(() => ({s: 0, n: 0}));
  best.r.per.forEach((c, ti) => { sums[map[ti]].s += c; sums[map[ti]].n++; });
  const words = display.map((w, di) => {
    const {s, n} = sums[di];
    const v = n ? s / n : 1;
    return {text: w, status: v >= 0.99 ? "ok" : v >= 0.5 ? "near" : "miss"};
  });
  const score = T.length ? Math.round(100 * best.r.total / T.length) : 0;
  return {score, words, heard: best.cand.trim(), stars: score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0};
}
