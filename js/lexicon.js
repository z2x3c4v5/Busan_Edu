/* 영어 문장 속 한국어 고유명사 사전
   [표기, 영어 음성용 발음(respelling), 한글, 음성 인식 허용 표기들, plain(1이면 화면에 발음 표시 안 함)]
   - 발음(respelling): 영어 TTS가 이 철자로 읽고, 화면에는 단어 위에 작게 표시돼요.
   - 허용 표기: 음성 인식기가 한국어 단어를 엉뚱하게 받아 적어도 정답으로 인정할 소리들이에요.
     띄어쓰기·대소문자는 무시하니 들리는 대로 추가하면 돼요. */
const LEX = [
  ["Busan", "Boo-sahn", "부산", ["busan", "pusan", "boosan", "boo san", "bu san"], 1],
  ["Haeundae", "Hey-oon-day", "해운대", ["haeundae", "hyundai", "hey on day", "hey oon day", "hey and day", "heyunday", "hayunday", "hae un dae", "haeunde", "hey un day"]],
  ["Gwangalli", "Gwahng-ahl-lee", "광안리", ["gwangalli", "gwangali", "kwangali", "kwang ali", "gwang alley", "kwang alley", "gwangally", "wangali", "guangali"]],
  ["Gwangan", "Gwahng-ahn", "광안", ["gwangan", "kwangan", "guangan", "kwang an", "gwang an", "wangan"]],
  ["Gamcheon", "Gahm-chawn", "감천", ["gamcheon", "gamchun", "gamchon", "gum chun", "calm chun", "gam chan", "come chon", "gamcheong"]],
  ["Jagalchi", "Jah-gahl-chee", "자갈치", ["jagalchi", "jagalchee", "jaguar chi", "jagal chi", "jagelchi", "jagaltchi", "jah gal chee"]],
  ["Taejongdae", "Tay-jong-day", "태종대", ["taejongdae", "tejongdae", "tay jong day", "taejong day", "tejong day", "daejongdae", "tae jong dae"]],
  ["Haedong", "Hey-dong", "해동", ["haedong", "haydong", "hedong", "hey dong"]],
  ["Yonggungsa", "Yong-goong-sah", "용궁사", ["yonggungsa", "yong goong sa", "younggungsa", "yongkungsa", "young goong sa"]],
  ["Danubi", "Dah-noo-bee", "다누비", ["danubi", "danube", "danubee", "da new bee", "danuby"]],
  ["Oiso", "Oh-ee-soh", "오이소", ["oiso", "oyso", "oh he so", "oy so", "oeso", "oh eso"]],
  ["Seomyeon", "Saw-myawn", "서면", ["seomyeon", "somyeon", "seomyun", "somyun", "sum yun", "so myeon", "somion"]],
  ["Nampo-dong", "Nahm-poh-dong", "남포동", ["nampodong", "nampo dong", "nam po dong", "nampo"]],
  ["Bupyeong", "Boo-pyawng", "부평", ["bupyeong", "bupyong", "boo pyong", "bupyung", "bu pyeong"]],
  ["dwaeji-gukbap", "dweh-jee gook-bahp", "돼지국밥", ["dwaeji gukbap", "dweji gukbap", "dweji gookbap", "dwaeji gookbap", "twaeji gukbap", "dwaeji cookbop"]],
  ["gukbap", "gook-bahp", "국밥", ["gukbap", "gookbap", "gukbob", "gookbob", "cook bop", "gook bop", "cookbap"]],
  ["milmyeon", "meel-myawn", "밀면", ["milmyeon", "milmyun", "milmyon", "meel myun", "mill myun", "meal myun", "mil myeon"]],
  ["naengmyeon", "neng-myawn", "냉면", ["naengmyeon", "naengmyun", "nengmyun", "nangmyun", "neng myun"]],
  ["ssiat-hotteok", "see-aht hoh-tawk", "씨앗호떡", ["ssiat hotteok", "siat hotteok", "seed hotteok", "see at hotteok", "siat hotdog", "see at hotdog"]],
  ["hotteok", "hoh-tawk", "호떡", ["hotteok", "hottuk", "hotdog", "hot dog", "hotok", "ho tuck", "hoddeok", "hotuck"]],
  ["eomuk", "aw-mook", "어묵", ["eomuk", "omuk", "uh mook", "omook", "eomook", "oh mook"]],
  ["tteokbokki", "dawk-boh-kee", "떡볶이", ["tteokbokki", "tokbokki", "topokki", "dukbokki", "ddeokbokki", "tok bok ki", "duck bokki"]],
  ["nakgopsae", "nahk-gop-seh", "낙곱새", ["nakgopsae", "nakgobsae", "nakgopse", "knock gop say", "nak gop sae"]],
  ["bibim-dangmyeon", "bee-bim dahng-myawn", "비빔당면", ["bibim dangmyeon", "bibim dangmyun", "bibim dang myun", "bibimbap dangmyeon"]],
  ["BIFF", "Biff", "비프", ["biff", "bif", "biff's"], 1]
];

/* 소문자 알파벳만 남긴 키 → 사전 항목 */
const lexKey = s => String(s).toLowerCase().replace(/[^a-z]/g, "");
const LEXMAP = new Map(LEX.map(([w, say, ko, alt, plain]) =>
  [lexKey(w), {w, say, ko, plain: !!plain, alts: [...new Set([lexKey(w), ...alt.map(lexKey)])]}]));
const _reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LEX_RX = new RegExp(`(?<![A-Za-z])(?:${LEX.map(l => l[0]).sort((a, b) => b.length - a.length).map(_reEsc).join("|")})(?![A-Za-z])`, "gi");
const lexOf = word => LEXMAP.get(lexKey(word));
