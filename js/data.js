/* 콘텐츠 — 문장을 바꾸거나 추가하려면 이 파일만 고치면 돼요.
   각 문장: ["영어 문장", "우리말 뜻"] */
const IMG = {
  hello: "images/seon-hello.png", walk: "images/seon-walk.png", selfie: "images/seon-selfie.png",
  please: "images/seon-please.png", study: "images/seon-study.png"
};

const MAX_PICK = 5;

const LEVELS = {
  beg: {label: "초급", en: "Beginner", desc: "짧고 쉬운 문장 (4~6단어)", stars: "★"},
  mid: {label: "중급", en: "Intermediate", desc: "정보를 담은 문장 (7~11단어)", stars: "★★"},
  adv: {label: "고급", en: "Advanced", desc: "이유·조건을 넣은 긴 문장 (12단어 이상)", stars: "★★★"}
};
const LEVEL_ORDER = ["beg", "mid", "adv"];

const TOPICS = {
  place: {
    label: "부산 명소", en: "Places", img: IMG.selfie, color: "#2f6fd1",
    blurb: "해운대, 광안리, 감천문화마을…",
    bubble: ["Let's introduce famous places in Busan!", "부산의 멋진 곳을 소개해 보자!"],
    levels: {
      beg: [
        ["I love Haeundae Beach.", "나는 해운대해수욕장이 정말 좋아요."],
        ["Gwangalli is pretty at night.", "광안리는 밤에 예뻐요."],
        ["Gamcheon Village is very colorful.", "감천마을은 아주 알록달록해요."],
        ["Jagalchi Market has many fish.", "자갈치시장에는 물고기가 많아요."],
        ["Let's go to Taejongdae!", "태종대에 가요!"],
        ["The sea in Busan is blue.", "부산의 바다는 파래요."],
        ["I can swim at the beach.", "나는 해변에서 수영할 수 있어요."],
        ["Busan Tower is very tall.", "부산타워는 아주 높아요."]
      ],
      mid: [
        ["You can see the drone light show at Gwangalli.", "광안리에서 드론 라이트쇼를 볼 수 있어요."],
        ["Gamcheon Culture Village is famous for its colorful houses.", "감천문화마을은 알록달록한 집들로 유명해요."],
        ["Haedong Yonggungsa is a beautiful temple by the sea.", "해동용궁사는 바닷가에 있는 아름다운 절이에요."],
        ["You can take subway Line 2 to Haeundae Station.", "지하철 2호선을 타고 해운대역에 갈 수 있어요."],
        ["Jagalchi Market is the biggest fish market in Korea.", "자갈치시장은 한국에서 가장 큰 수산시장이에요."],
        ["At Taejongdae, you can ride the Danubi train.", "태종대에서는 다누비 열차를 탈 수 있어요."],
        ["I want to take a picture with the Little Prince.", "어린왕자와 사진을 찍고 싶어요."],
        ["Gwangan Bridge lights up beautifully at night.", "광안대교는 밤에 아름답게 불이 켜져요."]
      ],
      adv: [
        ["I recommend Haeundae Beach because the ocean view is amazing all year round.", "일 년 내내 바다 풍경이 멋지기 때문에 해운대해수욕장을 추천해요."],
        ["If you visit Gwangalli on Saturday night, you can watch an amazing drone show.", "토요일 밤에 광안리에 가면 멋진 드론쇼를 볼 수 있어요."],
        ["Gamcheon Culture Village looks like a giant painting, so every corner is a photo spot.", "감천문화마을은 커다란 그림 같아서 모든 곳이 포토존이에요."],
        ["Haedong Yonggungsa is special because it is one of the few temples built by the sea.", "해동용궁사는 바닷가에 지어진 몇 안 되는 절이라서 특별해요."],
        ["At Jagalchi Market, you can hear people shouting Oiso and taste fresh seafood.", "자갈치시장에서는 '오이소!' 하는 소리를 듣고 싱싱한 해산물을 맛볼 수 있어요."],
        ["The view from the cliffs of Taejongdae is so beautiful that you will never forget it.", "태종대 절벽에서 보는 경치는 너무 아름다워서 절대 잊지 못할 거예요."],
        ["You should visit Busan in summer because there are many festivals on the beaches.", "여름에는 해변에서 축제가 많이 열리니까 부산에 꼭 와 보세요."],
        ["Busan is a city where you can enjoy both the mountains and the sea.", "부산은 산과 바다를 모두 즐길 수 있는 도시예요."]
      ]
    }
  },
  food: {
    label: "부산 음식", en: "Food", img: IMG.please, color: "#d9532b",
    blurb: "돼지국밥, 밀면, 씨앗호떡…",
    bubble: ["Let's talk about delicious Busan food!", "맛있는 부산 음식을 소개해 보자!"],
    levels: {
      beg: [
        ["I like dwaeji-gukbap.", "나는 돼지국밥을 좋아해요."],
        ["Milmyeon is cold and yummy.", "밀면은 차갑고 맛있어요."],
        ["Hotteok is very sweet.", "호떡은 아주 달콤해요."],
        ["Eomuk is warm and chewy.", "어묵은 따뜻하고 쫄깃해요."],
        ["Let's eat tteokbokki!", "떡볶이 먹으러 가요!"],
        ["Busan food is the best!", "부산 음식이 최고예요!"],
        ["I love Korean fish cake.", "나는 한국 어묵을 정말 좋아해요."],
        ["It's not spicy.", "맵지 않아요."]
      ],
      mid: [
        ["Dwaeji-gukbap is a hearty pork and rice soup.", "돼지국밥은 든든한 돼지고기 국밥이에요."],
        ["Milmyeon is perfect for a hot summer day.", "밀면은 더운 여름날에 딱이에요."],
        ["You can buy ssiat-hotteok at BIFF Square.", "BIFF광장에서 씨앗호떡을 살 수 있어요."],
        ["Busan eomuk is made with fresh fish meat.", "부산어묵은 신선한 생선살로 만들어요."],
        ["Nakgopsae is a spicy stew with octopus and shrimp.", "낙곱새는 낙지와 새우가 들어간 매콤한 전골이에요."],
        ["Add some vinegar and mustard to your milmyeon.", "밀면에 식초와 겨자를 조금 넣어 보세요."],
        ["Be careful because the inside of hotteok is hot.", "호떡 속은 뜨거우니 조심하세요."],
        ["Many people eat gukbap in Seomyeon.", "많은 사람들이 서면에서 국밥을 먹어요."]
      ],
      adv: [
        ["You should try dwaeji-gukbap because it warms you up on a cold day.", "추운 날 몸을 데워 주니까 돼지국밥을 꼭 먹어 보세요."],
        ["Milmyeon was born in Busan, and it is like naengmyeon with softer noodles.", "밀면은 부산에서 태어났고, 면이 더 부드러운 냉면 같아요."],
        ["Ssiat-hotteok is a sweet pancake filled with brown sugar, seeds, and nuts.", "씨앗호떡은 흑설탕, 씨앗, 견과류가 들어간 달콤한 팬케이크예요."],
        ["If you visit Bupyeong Market, don't forget to try many kinds of eomuk.", "부평시장에 가면 여러 가지 어묵을 꼭 먹어 보세요."],
        ["Nakgopsae is quite spicy, but it tastes even better with a bowl of rice.", "낙곱새는 꽤 맵지만 밥 한 공기와 먹으면 더 맛있어요."],
        ["I think gukbap is the soul food of Busan because people have loved it for a long time.", "사람들이 오랫동안 사랑해 왔기 때문에 국밥은 부산의 소울푸드라고 생각해요."],
        ["Bibim-dangmyeon is a popular street food made with glass noodles and vegetables.", "비빔당면은 당면과 채소로 만든 인기 있는 길거리 음식이에요."],
        ["When you eat gukbap, you can add chives and salted shrimp to make it tastier.", "국밥을 먹을 때 부추와 새우젓을 넣으면 더 맛있어요."]
      ]
    }
  },
  festival: {
    label: "부산 축제", en: "Festivals", img: IMG.walk, color: "#6a4bb0",
    blurb: "불꽃축제, 국제영화제, 모래축제…",
    bubble: ["Busan has so many exciting festivals!", "부산에는 신나는 축제가 정말 많아!"],
    levels: {
      beg: [
        ["I love the fireworks festival.", "나는 불꽃축제가 정말 좋아요."],
        ["The fireworks are so pretty!", "불꽃이 정말 예뻐요!"],
        ["Let's watch a movie at BIFF!", "BIFF에서 영화 보자!"],
        ["The Sand Festival is fun.", "모래축제는 재미있어요."],
        ["I see a big Christmas tree.", "커다란 크리스마스트리가 보여요."],
        ["Festivals in Busan are exciting!", "부산의 축제는 신나요!"],
        ["We can dance on the beach.", "우리는 해변에서 춤출 수 있어요."],
        ["Look at the night sky!", "밤하늘을 봐!"]
      ],
      mid: [
        ["The Busan Fireworks Festival is held at Gwangalli Beach.", "부산불꽃축제는 광안리해수욕장에서 열려요."],
        ["You can see beautiful sand sculptures at Haeundae.", "해운대에서 아름다운 모래 조각을 볼 수 있어요."],
        ["BIFF is one of the biggest film festivals in Asia.", "BIFF는 아시아에서 가장 큰 영화제 중 하나예요."],
        ["Many people come to Busan to see the fireworks.", "많은 사람들이 불꽃을 보러 부산에 와요."],
        ["At the Jagalchi Festival, you can taste fresh seafood.", "자갈치축제에서는 싱싱한 해산물을 맛볼 수 있어요."],
        ["The Christmas Tree Festival is held in Nampo-dong every winter.", "크리스마스트리 축제는 매년 겨울 남포동에서 열려요."],
        ["There are many concerts at the Busan Sea Festival.", "부산바다축제에는 공연이 많이 열려요."],
        ["You can meet famous movie stars at BIFF.", "BIFF에서 유명한 영화배우를 만날 수 있어요."]
      ],
      adv: [
        ["I recommend the Busan Fireworks Festival because the fireworks over Gwangan Bridge are amazing.", "광안대교 위로 터지는 불꽃이 멋지기 때문에 부산불꽃축제를 추천해요."],
        ["If you love movies, you should visit Busan in October for the film festival.", "영화를 좋아한다면 10월에 영화제를 보러 부산에 와 보세요."],
        ["The Haeundae Sand Festival is special because artists make huge sculptures out of sand.", "예술가들이 모래로 거대한 조각을 만들기 때문에 해운대모래축제는 특별해요."],
        ["You should arrive early at the fireworks festival because it gets very crowded.", "불꽃축제는 사람이 아주 많아지니까 일찍 가는 게 좋아요."],
        ["During the Christmas Tree Festival, the streets of Nampo-dong are full of beautiful lights.", "크리스마스트리 축제 동안 남포동 거리는 아름다운 불빛으로 가득해요."],
        ["The Jagalchi Festival shows the culture of Busan, where people have lived by the sea for a long time.", "자갈치축제는 오랫동안 바다와 함께 살아온 부산의 문화를 보여 줘요."],
        ["Busan has festivals in every season, so you can enjoy something new whenever you visit.", "부산에는 계절마다 축제가 있어서 언제 와도 새로운 것을 즐길 수 있어요."],
        ["Watching the fireworks with my family was one of the best memories of my life.", "가족과 함께 불꽃을 본 것은 내 인생 최고의 추억 중 하나예요."]
      ]
    }
  }
};
const TOPIC_ORDER = ["place", "food", "festival"];

/* 문장 목록에 id를 붙여서 꺼내기 */
function sentencesOf(topic, level){
  return TOPICS[topic].levels[level].map(([en, ko], i) => ({id: `${topic}-${level}-${i}`, en, ko}));
}
