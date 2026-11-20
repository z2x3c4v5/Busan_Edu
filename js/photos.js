/* 실제 사진 (Wikimedia Commons, 자유 이용 라이선스)
   사진을 바꾸려면 images/photos/ 의 파일을 교체하고 아래 출처를 고쳐 주세요. */
const PHOTOS = {
  haeundae: {src: "images/photos/haeundae.jpg", ko: "해운대해수욕장", author: "StephNurnberg", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Haeundae_Beach_in_Busan.jpg"},
  gwangalli: {src: "images/photos/gwangalli.jpg", ko: "광안리해수욕장 · 광안대교", author: "lumoplank", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Gwangan_Bridge_and_Gwangalli_Beach_-_Gwangalli2721.jpg"},
  gamcheon: {src: "images/photos/gamcheon.jpg", ko: "감천문화마을", author: "Bernard Gagnon", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Gamcheon_Culture_Village.jpg"},
  jagalchi: {src: "images/photos/jagalchi.jpg", ko: "자갈치시장", author: "Bernard Gagnon", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Jagalchi_Market_02.jpg"},
  taejongdae: {src: "images/photos/taejongdae.jpg", ko: "태종대", author: "최광모 (Choe Kwangmo)", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:20180514%ED%83%9C%EC%A2%85%EB%8C%80.jpg"},
  yonggungsa: {src: "images/photos/yonggungsa.jpg", ko: "해동용궁사", author: "Anna L Martin", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Haedong_Yonggungsa_Temple%2C_Busan%2C_South_Korea.jpg"},
  gukbap: {src: "images/photos/gukbap.jpg", ko: "돼지국밥", author: "chomjong", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Dwaeji-gukbap_1.jpg"},
  milmyeon: {src: "images/photos/milmyeon.jpg", ko: "밀면", author: "yangmin00", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Milmyeon_1.jpg"},
  hotteok: {src: "images/photos/hotteok.jpg", ko: "호떡", author: "Sandra Vallaure", license: "CC BY 2.0", page: "https://commons.wikimedia.org/wiki/File:Hotteok_2.jpg"},
  eomuk: {src: "images/photos/eomuk.jpg", ko: "어묵", author: "최광모 (Choe Kwangmo)", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Eomuk-kkochi.jpg"},
  tteokbokki: {src: "images/photos/tteokbokki.jpg", ko: "떡볶이", author: "Kimseoeun2023079825", license: "CC0", page: "https://commons.wikimedia.org/wiki/File:Garaetteok_Tteokbokki.jpg"},
  fireworks: {src: "images/photos/fireworks.jpg", ko: "부산불꽃축제", author: "Busan Metropolitan City", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:The_Busan_International_Fireworks_Festival.jpg"},
  sandfest: {src: "images/photos/sandfest.jpg", ko: "해운대모래축제", author: "부산광역시 해운대구", license: "KOGL Type 1", page: "https://commons.wikimedia.org/wiki/File:Haeundae_Sand_Festival_in_Busan%2C_South_Korea.jpg"},
  xmastree: {src: "images/photos/xmastree.jpg", ko: "부산크리스마스트리문화축제", author: "Busan Metropolitan City", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:The_Busan_Christmas_Tree_Festival.jpg"},
  biff: {src: "images/photos/biff.jpg", ko: "부산국제영화제 · 영화의전당", author: "399scout", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Busan_Cinema_Center_BIFF_2023.jpg"},
  nakgopsae: {src: "images/photos/nakgopsae.jpg", ko: "낙곱새 · 낙지전골", author: "대경라이프", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Nakji-jeongol_1.jpg"},
  seafest: {src: "images/photos/seafest.jpg", ko: "부산바다축제", author: "Busan Metropolitan City", license: "CC BY-SA 4.0", page: "https://commons.wikimedia.org/wiki/File:Busan_Sea_Festival.jpg"},
};
