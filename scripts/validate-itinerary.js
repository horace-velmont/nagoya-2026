const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const base = fs.readFileSync('index-base.html', 'utf8');

const failures = [];
const fail = (msg) => failures.push(msg);
const assert = (cond, msg) => { if (!cond) fail(msg); };

function extractTemplate(afterMarker) {
  const start = index.indexOf(afterMarker);
  if (start < 0) return null;
  const tick1 = index.indexOf('`', start);
  if (tick1 < 0) return null;
  const tick2 = index.indexOf('`', tick1 + 1);
  if (tick2 < 0) return null;
  return index.slice(tick1 + 1, tick2);
}

const canonicalAliases = [
  { id: 'cafe_kako', names: ['카페 카코 부쵸'] },
  { id: 'inuyama_castle', names: ['이누야마성'] },
  { id: 'showa_alley', names: ['이누야마성 쇼와 골목'] },
  { id: 'atsuta_horaiken', names: ['아츠타 호라이켄 마츠자카야점'] },
  { id: 'pokemon_center', names: ['포켓몬 센터 나고야'] },
  { id: 'jump_shop', names: ['점프 숍 나고야'] },
  { id: 'joylab', names: ['joylab', '조이랩'] },
  { id: 'osu_shopping', names: ['오스 상점가', '오스상점가'] },
  { id: 'osu_kannon', names: ['오스칸논', '오스 관음'] },
  { id: 'mirai_tower', names: ['중부전력 미라이 타워', '미라이 타워'] },
  { id: 'oasis21', names: ['오아시스21', 'oasis 21'] },
  { id: 'sunshine_sakae', names: ['선샤인 사카에', 'sunshine sakae', 'sky-boat', '스카이보트'] },
  { id: 'mutsumi', names: ['테바사키 무츠미'] },
  { id: 'princess_street', names: ['프린세스 거리'] },
  { id: 'urban_quar', names: ['urban quar spa & living', '어반쿠아'] }
];

function idsInText(text) {
  const lower = text.toLowerCase();
  const out = [];
  for (const entry of canonicalAliases) {
    if (entry.names.some(n => lower.includes(n.toLowerCase()))) out.push(entry.id);
  }
  return out;
}

const day2Board = extractTemplate('if(box) box.innerHTML=');
assert(day2Board, 'Day 2 canonical board template is missing.');
if (day2Board) {
  const ids = idsInText(day2Board);
  for (const entry of canonicalAliases) {
    const count = ids.filter(id => id === entry.id).length;
    assert(count === 1, `Day 2 board must contain ${entry.id} exactly once; found ${count}.`);
  }
  assert((day2Board.match(/도테야끼/g) || []).length === 1, 'Day 2 board must mention 도테야끼 exactly once.');
  const times = [...day2Board.matchAll(/slot-time\">(\d{2}:\d{2})/g)].map(m => m[1]);
  const minutes = times.map(t => Number(t.slice(0,2))*60 + Number(t.slice(3)));
  for (let i = 1; i < minutes.length; i++) {
    assert(minutes[i] > minutes[i-1], `Day 2 time order is not strictly increasing at ${times[i-1]} -> ${times[i]}.`);
  }
}

const day2Legs = extractTemplate('if(legs) legs.innerHTML=');
assert(day2Legs, 'Day 2 canonical detail template is missing.');
if (day2Legs) {
  for (const entry of canonicalAliases) {
    const lower = day2Legs.toLowerCase();
    const matched = entry.names.filter(n => lower.includes(n.toLowerCase()));
    assert(matched.length >= 1, `Day 2 detail is missing ${entry.id}.`);
  }
  assert(day2Legs.includes('도테야끼'), 'Day 2 detail must mention 도테야끼.');
}

assert(!index.includes('setInterval('), 'Repeated runtime patching is forbidden (setInterval found).');
assert(!index.includes('applyFixes'), 'Repeated applyFixes-style patching is forbidden.');
assert(index.includes("d.body.dataset.fixed='1'"), 'Single-application render guard is missing.');
assert(index.includes("KITTE Nagoya (킷테 나고야) 내 초밥집"), 'Day 3 KITTE sushi mapping is missing.');
assert(index.includes("Urban Quar Spa & Living (어반쿠아)"), 'Urban Quar mapping is missing.');
assert(index.includes("['矢場とん','矢場とん (야바톤)']"), 'Day 1 Yabaton mapping is missing.');
assert(index.includes('대안 후보: 黒豚屋 らむちぃ (쿠로부타야 라무치)'), 'Ramuchi must remain as a Day 1 backup candidate.');

const forbiddenPublicPhrases = [
  '트리플에서 저장', '트리플 저장', '사용자가 정리', '원본 자료', '내부 메모', '자료 출처'
];
for (const phrase of forbiddenPublicPhrases) {
  assert(!index.includes(phrase) && !base.includes(phrase), `Forbidden public phrase found: ${phrase}`);
}

const repeatedParen = /(\([^()]{2,40}\))(?:\s*\1)+/;
assert(!repeatedParen.test(index), 'Repeated parenthetical translation detected in index.html.');
assert(!repeatedParen.test(base), 'Repeated parenthetical translation detected in index-base.html.');

if (failures.length) {
  console.error('\nItinerary validation FAILED:\n');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('Itinerary validation passed.');
console.log('- Day 1 Yabaton primary / Ramuchi backup mapping present');
console.log('- Day 2 canonical board: unique tracked places');
console.log('- Day 2 doteyaki mention present');
console.log('- Day 2 times: strictly increasing');
console.log('- Day 2 detail: required places present');
console.log('- Runtime patching: single-application guard enforced');
console.log('- Public wording / repeated-parenthesis regression checks passed');
