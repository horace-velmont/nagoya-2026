# Nagoya 2026

나고야 3박 4일 여행 일정 HTML입니다.

- Local file: `index.html`
- Public page: https://horace-velmont.github.io/nagoya-2026/
- GitHub repo: https://github.com/horace-velmont/nagoya-2026

## 이어서 작업할 때

Codex Cloud 또는 다른 기기에서는 이 repo를 열고 `index.html`을 단일 원본으로 수정하면 됩니다.

현재 일정의 큰 구조:

- Day 1: 09:30 NGO 도착, 나고야역 짐 보관, 점심, 지브리파크, 저녁, 야경
- Day 2: 이누야마, 히츠마부시, 오스/사카에, JOYLAB, 오아시스21/스카이보트, 저녁, 대욕장, 숙소 2차
- Day 3: 다카야마/시라카와고 투어, 나고야 복귀 후 초밥, 돈키호테
- Day 4: 나고야성, 도쿠가와 미술관, 노리타케의 숲, 사이제리아, 린쿠 비치, 공항

## 수정 가이드

다른 Codex가 이어서 작업할 때는 먼저 `AGENTS.md`를 읽어야 합니다.

핵심 원칙:

- `index.html`만 최종 일정 원본으로 사용합니다.
- `index-base.html`, iframe, 런타임 문자열 치환으로 일정을 바꾸지 않습니다.
- 장소나 식사를 바꾸면 시간표, 상세 동선, 끼니 계획, 식사 목록, 요약/예약 확인까지 같은 Day 전체를 확인합니다.
- 같은 실수가 재발하지 않도록 `scripts/validate-itinerary.js`도 함께 갱신합니다.
- 완료 전 `xmllint --html --noout index.html`, `node scripts/validate-itinerary.js`, `git diff --check`를 실행합니다.

## 작성 톤

이 파일은 개인 메모가 아니라 같이 보는 일정표입니다. 아래 표현은 피합니다.

- "공통"
- "후보군"
- "시간 남으면"
- "Google 지도 후보"
- 사용자의 의도나 취향을 설명하는 메타 문장

일정은 가능한 한 절대시각 기준으로 작성합니다.
