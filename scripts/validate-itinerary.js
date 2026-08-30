const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');

const failures = [];
const fail = (msg) => failures.push(msg);
const assert = (cond, msg) => { if (!cond) fail(msg); };

function extractSection(startMarker, endMarker) {
  const start = index.indexOf(startMarker);
  if (start < 0) return null;
  const end = index.indexOf(endMarker, start + startMarker.length);
  if (end < 0) return null;
  return index.slice(start, end);
}

const canonicalAliases = [
  { id: 'cafe_kako', names: ['카페 카코 부쵸'] },
  { id: 'inuyama_castle', names: ['이누야마성'] },
  { id: 'showa_alley', names: ['이누야마성 쇼와 골목'] },
  { id: 'kaisendon', names: ['海鮮丼と唐揚げ 百海里', '카이센동'] },
  { id: 'pokemon_center', names: ['포켓몬 센터 나고야'] },
  { id: 'jump_shop', names: ['점프 숍 나고야'] },
  { id: 'joylab', names: ['joylab', '조이랩'] },
  { id: 'osu_shopping', names: ['오스 상점가', '오스상점가'] },
  { id: 'konparu', names: ['コンパル', '콘파루'] },
  { id: 'osu_kannon', names: ['오스칸논', '오스 관음'] },
  { id: 'mirai_tower', names: ['중부전력 미라이 타워', '미라이 타워'] },
  { id: 'oasis21', names: ['오아시스21', 'oasis 21'] },
  { id: 'sunshine_sakae', names: ['선샤인 사카에', 'sunshine sakae', 'sky-boat', '스카이보트'] },
  { id: 'mutsumi', names: ['테바사키 무츠미'] },
  { id: 'shimasho', names: ['シマショウ', '시마쇼'] },
  { id: 'urban_quar', names: ['urban quar spa & living', 'urban quar spa &amp; living', '어반쿠아'] }
];

function idsInText(text, entries = canonicalAliases) {
  const lower = text.toLowerCase();
  const out = [];
  for (const entry of entries) {
    if (entry.names.some(n => lower.includes(n.toLowerCase()))) out.push(entry.id);
  }
  return out;
}

assert(!index.includes('<iframe'), 'index.html must render the itinerary directly, not through an iframe.');
assert(!index.includes('contentDocument'), 'Runtime iframe patching must not be used.');
assert(!index.includes('innerHTML=`'), 'Template-string runtime patching must not be used for canonical itinerary data.');
assert(!fs.existsSync('index-base.html'), 'Stale index-base.html must not remain as a second itinerary source.');

const day1Board = extractSection('<span>도착 → 나나짱 → 지브리파크</span>', '<strong>Day 2</strong>');
assert(day1Board, 'Day 1 canonical board is missing.');
if (day1Board) {
  assert(day1Board.includes('μSKY(뮤스카이) → 나고야역'), 'Day 1 board must include μSKY airport transfer.');
  assert((day1Board.match(/나나짱 인형/g) || []).length === 1, 'Day 1 board must contain Nana-chan exactly once.');
  assert(day1Board.includes('ナナちゃん人形'), 'Day 1 Nana-chan original Japanese label is missing.');
  assert(day1Board.indexOf('나나짱 인형') > day1Board.indexOf('나고야역'), 'Day 1 Nana-chan must come after Nagoya Station luggage storage.');
  assert(day1Board.indexOf('나나짱 인형') < day1Board.indexOf('矢場とん'), 'Day 1 Nana-chan must come before Yabaton lunch.');
  assert(day1Board.includes('矢場とん 中部国際空港店 (야바톤 중부국제공항점)'), 'Day 1 board must keep Chubu Airport Yabaton as the lunch alternative.');
  assert(!day1Board.includes('黒豚屋 らむちぃ'), 'Ramuchi must not remain as the Day 1 lunch alternative.');
  const times = [...day1Board.matchAll(/slot-time\">(\d{2}:\d{2})/g)].map(m => m[1]);
  const minutes = times.map(t => Number(t.slice(0,2))*60 + Number(t.slice(3)));
  for (let i = 1; i < minutes.length; i++) {
    assert(minutes[i] > minutes[i-1], `Day 1 time order is not strictly increasing at ${times[i-1]} -> ${times[i]}.`);
  }
}
const day1Detail = extractSection('<h3>Day 1:', '<h3>Day 2:');
assert(day1Detail && day1Detail.includes('μSKY(뮤스카이)'), 'Day 1 detail must include μSKY airport transfer.');
assert(day1Detail && day1Detail.includes('나나짱 인형'), 'Day 1 detail must include Nana-chan photo stop.');
assert(day1Detail && day1Detail.includes('矢場とん 中部国際空港店'), 'Day 1 detail must mention Chubu Airport Yabaton as an alternative.');
assert(index.includes('나고야역·나나짱 인형'), 'Day 1 core route must include Nana-chan.');
assert(index.includes('나나짱 인형과 기념사진'), 'Day 1 summary must mention the Nana-chan photo.');
assert(index.includes('야바톤 중부국제공항점'), 'Day 1 meal plan must mention Chubu Airport Yabaton.');
assert(!index.includes('黒豚屋 らむちぃ'), 'Ramuchi must not remain after switching the Day 1 alternative to Chubu Airport Yabaton.');

const day2Board = extractSection('<span>모닝 → 이누야마 → 카이센동 → 쇼핑·오스 → 사카에 야경·저녁 → 대욕장</span>', '<strong>Day 3</strong>');
assert(day2Board, 'Day 2 canonical board template is missing.');
if (day2Board) {
  const ids = idsInText(day2Board);
  for (const entry of canonicalAliases) {
    const count = ids.filter(id => id === entry.id).length;
    assert(count === 1, `Day 2 board must contain ${entry.id} exactly once; found ${count}.`);
  }
  assert((day2Board.match(/도테야키/g) || []).length === 1, 'Day 2 board must mention 도테야키 exactly once.');
  assert(day2Board.includes('당고'), 'Day 2 board must mention 오스 상점가 당고.');
  assert(day2Board.includes('크레페'), 'Day 2 board must mention 오스 상점가 크레페.');
  assert(day2Board.includes('콘파루'), 'Day 2 board must mention Konparu at Osu.');
  assert(day2Board.indexOf('도테야키') > day2Board.indexOf('シマショウ'), 'Day 2 board must place doteyaki at Shimasho, not Osu snacks.');
  assert(day2Board.includes('노렌가이 사카에1번출구'), 'Day 2 board must mention Noren-gai Sakae Exit 1.');
  assert(day2Board.indexOf('노렌가이 사카에1번출구') > day2Board.indexOf('シマショウ'), 'Day 2 board must place Noren-gai after Shimasho.');
  assert(day2Board.includes('하시고 문화'), 'Day 2 board must mention hashigo culture at Noren-gai.');
  assert(day2Board.includes('숙소 2차'), 'Day 2 board must end with lodging second round after the bath.');
  assert(day2Board.indexOf('숙소 2차') > day2Board.indexOf('Urban Quar Spa &amp; Living'), 'Day 2 board must place lodging second round after Urban Quar.');
  const times = [...day2Board.matchAll(/slot-time\">(\d{2}:\d{2})/g)].map(m => m[1]);
  const minutes = times.map(t => Number(t.slice(0,2))*60 + Number(t.slice(3)));
  for (let i = 1; i < minutes.length; i++) {
    assert(minutes[i] > minutes[i-1], `Day 2 time order is not strictly increasing at ${times[i-1]} -> ${times[i]}.`);
  }
}

const day2Legs = extractSection('<h3>Day 2:', '<h2>끼니 계획</h2>');
assert(day2Legs, 'Day 2 canonical detail template is missing.');
if (day2Legs) {
  for (const entry of canonicalAliases) {
    const lower = day2Legs.toLowerCase();
    const matched = entry.names.filter(n => lower.includes(n.toLowerCase()));
    assert(matched.length >= 1, `Day 2 detail is missing ${entry.id}.`);
  }
  assert(day2Legs.includes('도테야키'), 'Day 2 detail must mention 도테야키.');
  assert(day2Legs.includes('당고'), 'Day 2 detail must mention 오스 상점가 당고.');
  assert(day2Legs.includes('크레페'), 'Day 2 detail must mention 오스 상점가 크레페.');
  assert(day2Legs.includes('콘파루'), 'Day 2 detail must mention Konparu at Osu.');
  assert(day2Legs.indexOf('도테야키') > day2Legs.indexOf('シマショウ'), 'Day 2 detail must place doteyaki at Shimasho.');
  assert(day2Legs.includes('노렌가이 사카에1번출구'), 'Day 2 detail must mention Noren-gai Sakae Exit 1.');
  assert(day2Legs.indexOf('노렌가이 사카에1번출구') > day2Legs.indexOf('シマショウ'), 'Day 2 detail must place Noren-gai after Shimasho.');
  assert(day2Legs.includes('하시고 문화'), 'Day 2 detail must mention hashigo culture at Noren-gai.');
  assert(day2Legs.includes('숙소 2차'), 'Day 2 detail must mention lodging second round after Urban Quar.');
  assert(day2Legs.indexOf('숙소 2차') > day2Legs.indexOf('Urban Quar Spa &amp; Living'), 'Day 2 detail must place lodging second round after Urban Quar.');
}

assert(index.includes('μSKY(뮤스카이) → 나고야역'), 'Day 1 μSKY airport transfer is missing.');
assert(index.includes('鮨 さわ田 (스시사와다)'), 'Day 3 Sushi Sawada mapping is missing.');
assert(index.includes("Urban Quar Spa &amp; Living (어반쿠아)"), 'Urban Quar mapping is missing.');
assert(index.includes("矢場とん (야바톤)"), 'Day 1 Yabaton mapping is missing.');
assert(index.includes('海鮮丼と唐揚げ 百海里'), 'Day 2 kaisendon place is missing.');
assert(index.includes('오스상점가 당고·크레페·콘파루'), 'Osu dango, crepe, and Konparu meal note is missing.');
assert(index.includes('테바사키 무츠미'), 'Day 2 tebasaki Mutsumi place is missing.');
assert(index.includes('シマショウ (시마쇼)'), 'Shimasho doteyaki place is missing.');
assert(index.includes('노렌가이 사카에1번출구 하시고 문화'), 'Noren-gai hashigo culture summary is missing.');
assert(index.includes('대욕장 후 숙소 2차'), 'Day 2 lodging second-round note after bath is missing.');
assert(!index.includes('KITTE Nagoya (킷테 나고야) 내 초밥집'), 'Day 3 generic KITTE sushi label must not remain.');

// Day 4 regression guards.
assert(index.includes('<strong>도쿠가와 미술관</strong>'), 'Day 4 Tokugawa Art Museum is missing.');
assert(index.includes('이온몰 나고야 노리타케 가든'), 'Day 4 AEON Mall Nagoya Noritake Garden is missing.');
assert(index.includes('<strong>린쿠 비치</strong>'), 'Day 4 Rinku Beach must remain before the airport.');
assert(index.includes('나고야 시내 → 린쿠 비치 → 공항'), 'Day 4 summary must preserve the Rinku Beach segment.');
assert(!index.includes('산업기술기념관'), 'Industrial technology museum must not replace Tokugawa Art Museum.');

const day4Entries = [
  { id: 'nagoya_castle', names: ['나고야성'] },
  { id: 'tokugawa', names: ['도쿠가와 미술관'] },
  { id: 'noritake', names: ['노리타케의 숲'] },
  { id: 'saizeriya', names: ['사이제리아'] },
  { id: 'aeon_noritake', names: ['이온몰 나고야 노리타케 가든'] },
  { id: 'rinku_beach', names: ['린쿠 비치'] },
  { id: 'airport', names: ['중부국제공항', 'NGO'] }
];
const day4Board = extractSection('<strong>Day 4 · 나고야 시내 → 린쿠 비치 → 공항</strong>', '<div class="route-detail">');
assert(day4Board, 'Day 4 canonical board is missing.');
if (day4Board) {
  const ids = idsInText(day4Board, day4Entries);
  for (const entry of day4Entries) {
    const count = ids.filter(id => id === entry.id).length;
    assert(count >= 1, `Day 4 board must contain ${entry.id}; found ${count}.`);
  }
}

const forbiddenPublicPhrases = [
  '트리플에서 저장', '트리플 저장', '사용자가 정리', '원본 자료', '내부 메모', '자료 출처',
  '공통', '후보군', '시간 남으면', '시간 여유 있을 때', 'Google 지도 후보', '내 니즈', '이 일정의 중심'
];
for (const phrase of forbiddenPublicPhrases) {
  assert(!index.includes(phrase), `Forbidden public phrase found: ${phrase}`);
}

const repeatedParen = /(\([^()]{2,40}\))(?:\s*\1)+/;
assert(!repeatedParen.test(index), 'Repeated parenthetical translation detected in index.html.');

if (failures.length) {
  console.error('\nItinerary validation FAILED:\n');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('Itinerary validation passed.');
console.log('- Day 1 μSKY, Nana-chan, and Chubu Airport Yabaton backup mapping present');
console.log('- Day 2 canonical board: kaisendon, Konparu, Mutsumi, Shimasho, Noren-gai, bath');
console.log('- Day 3 Sushi Sawada mapping present');
console.log('- Day 2 times: strictly increasing');
console.log('- Day 2 detail: required places present');
console.log('- Day 4 Tokugawa Art Museum + Rinku Beach preserved');
console.log('- Direct HTML rendering: no iframe/runtime itinerary patching');
console.log('- Public wording / repeated-parenthesis regression checks passed');
