[English CONTRIBUTING](CONTRIBUTING.md) | 한국어

## 🗺️ 기여 우선순위 로드맵


> [!TIP]
> 구체적인 기능 로드맵과 진행 상황은 [README.md 로드맵](https://github.com/hpark3/viewer-saver#roadmap) 및 [GitHub Roadmap Issues](https://github.com/hpark3/viewer-saver/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap)에서 확인하실 수 있습니다.

| 우선순위 | 분야 | 설명 | 난이도 | 비고 |
|---------|------|------|--------|------|
| 🔥 High | 버그 수정 | Canva / Google Slides 등 특정 URL에서 캡처 실패 또는 오류 페이지 과다 감지 | Medium | 재현 케이스(URL + 증상)를 Issue에 남겨주세요 |
| 🔥 High | README 개선 | 문서 오류 수정, 번역 보완, 구조 개선 | Easy | 첫 기여자 환영 · good first issue |
| 🌟 Medium | UI / 디자인 | 레이아웃·색상·간격 개선, 반응형 보완 | Easy–Medium | 작고 분리된 UI 개선이 특히 도움이 됩니다 |
| 🌟 Medium | 서비스명 / 로고 | 브랜드 아이덴티티 통일 (이름·아이콘·색상) | Medium | 변경 전 Issue에서 팀 논의가 필요합니다 |
| 💡 Low | 비기능 개선 | 에러 메시지 개선, 로딩 UX, 접근성 등 | Easy | 작은 단위 개선도 환영합니다 |

## 🤔 이 프로젝트에 기여하고 싶으신가요?

오픈소스 참여가 처음이어도 괜찮습니다. 실제로 외부 기여자가 가장 자주 보게 되는 흐름만 남겨서 정리했습니다.

## 시작 전에

- 새 이슈를 만들기 전에 기존 이슈가 있는지 먼저 확인해 주세요.
- 범위가 큰 변경은 먼저 이슈나 Discussion으로 방향을 맞춘 뒤 진행해 주세요.
- PR은 작고 명확할수록 리뷰와 머지가 훨씬 빨라집니다.

## 🧭 GitHub Issues에서 시작하기

어디서부터 시작해야 할지 모르겠다면 GitHub의 `Issues` 메뉴부터 보시면 됩니다.

1. GitHub 저장소 화면에서 `Issues`를 누릅니다.
2. `New issue` 버튼을 누릅니다.
3. 무언가 고장 났거나 이상하게 동작하면 `Bug report`를 고릅니다.
4. 아이디어, 개선 요청, 새 기능 제안이면 `Feature request`를 고릅니다.
5. 너무 자세하지 않아도 괜찮으니, 쉬운 말로 현재 문제나 생각을 적어 주세요.

어떤 템플릿을 골라야 할지 모르겠다면 `Feature request`를 선택하고 하고 싶은 말을 편하게 적으셔도 됩니다.

## 💬 Issues vs Discussions

`Issues`는 바로 처리할 수 있는 분명한 작업에 잘 맞습니다.

- 고쳐야 할 버그가 있을 때
- 결과가 비교적 또렷한 기능 요청일 때
- 문서 오류나 누락을 바로 잡고 싶을 때
- 누군가 바로 맡아서 진행할 수 있는 작은 개선일 때

`Discussions`는 먼저 이야기해 보고 싶을 때 잘 맞습니다.

- 프로젝트가 아직 낯설어서 방향 설명이 필요할 때
- 이게 버그인지 정상 동작인지 확신이 없을 때
- 아이디어는 있지만 바로 이슈로 만들기 전에 의견을 듣고 싶을 때
- 구현 방법 비교, 사용법 질문, 배경 설명이 먼저 필요할 때

판단이 모호하면 먼저 `Discussion`으로 시작해 주세요. 대화를 통해 필요하면 나중에 `Issue`로 정리하면 됩니다.

## 추천 기여 흐름

1. 먼저 기존 `Issues`와 `Discussions`를 확인하고, 더 잘 맞는 쪽에 새 글을 남깁니다.
2. 저장소를 `Fork`한 뒤 내 계정으로 복사합니다.
3. 복사한 저장소를 로컬에 `clone`합니다.
4. `fix/capture-timeout`, `docs/readme-refresh` 같은 작업용 브랜치를 만듭니다.
5. 문제를 해결하는 가장 작은 단위로 수정합니다.
6. 로컬에서 확인한 뒤 PR 템플릿에 맞춰 설명을 적어 제출합니다.

## 로컬 개발 및 테스트

### 1. 일반 모드

실제 캡처 흐름이나 백엔드 동작을 건드릴 때 사용합니다.

Windows에서는 `py` 명령을 사용하고, macOS / Linux에서는 `python3`를 사용합니다.

Windows:

```powershell
py -m pip install -r requirements.txt
py -m playwright install chromium
cd frontend
npm install
npm run build
cd ..
py server.py
```

macOS / Linux:

```bash
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium
cd frontend
npm install
npm run build
cd ..
python3 server.py
```

### 2. 프런트엔드 개발 모드

Vite 핫리로드를 쓰면서도 로컬 Python 백엔드를 함께 연결하고 싶을 때 사용합니다.

1. 먼저 백엔드를 실행합니다.

Windows:

```powershell
py server.py
```

macOS / Linux:

```bash
python3 server.py
```

2. 다른 터미널에서 프런트 개발 서버를 실행합니다.

```bash
cd frontend
npm install
npm run dev
```

3. 브라우저에서 `http://localhost:3000`을 엽니다.

참고:
- `3000`은 Vite 개발 서버 포트입니다.
- `8000`은 FastAPI 백엔드 포트입니다.
- 프런트 개발 서버의 `/api` 요청은 `http://localhost:8000`으로 프록시됩니다.

## Pull Request 작성 팁

- 사용자 입장에서 무엇이 달라졌는지 먼저 적어 주세요.
- 관련 이슈가 있다면 `Fixes #123` 형식으로 연결해 주세요.
- UI 변경이면 스크린샷을 첨부해 주세요.
- 리뷰어가 특히 봐줬으면 하는 부분이 있으면 같이 적어 주세요.

## 좋은 버그 리포트에 포함되면 좋은 것

- 어떤 서비스나 문서 유형에서 발생했는지
- 재현 가능한 URL 패턴 또는 안전한 재현 설명
- 기대한 동작
- 실제로 발생한 동작
- 가능하면 스크린샷, 로그, Sentry 정보

## 코드 기여 규칙

- `server.py`는 가능하면 얇은 API 레이어로 유지해 주세요.
- 캡처 모듈 수정은 관련 파일 중심으로 작게 나누는 편이 좋습니다.
- 버그 수정 PR에 대규모 정리 작업을 같이 섞지는 않는 편이 좋습니다.
