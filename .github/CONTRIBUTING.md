English | [한국어 CONTRIBUTING](https://github.com/hpark3/viewer-saver/blob/main/.github/CONTRIBUTING-KR.md)

## 🗺️ Contribution Priorities


> [!TIP]
> For a list of specific feature goals and their progress, please see the [README Roadmap](https://github.com/hpark3/viewer-saver#roadmap) and the [GitHub Roadmap Issues](https://github.com/hpark3/viewer-saver/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap).

| Priority | Area | What Helps Most | Difficulty | Notes |
|----------|------|-----------------|------------|-------|
| High | Capture bugs | Fixing failed captures or error-page detection for Canva, Google Slides, and similar viewers | Medium | Include a reproducible URL pattern and screenshots when possible |
| High | Documentation | README cleanup, translation polish, and missing setup details | Easy | Good first issue territory |
| Medium | UI and UX | Layout polish, responsive fixes, and clarity improvements | Easy to Medium | Small isolated UI fixes are especially helpful |
| Medium | Branding | Naming, logo, and product wording consistency | Medium | Please discuss larger branding shifts in an issue first |
| Low | Quality of life | Better error messages, loading states, and affordances | Easy | Small targeted improvements are welcome |

## 🤔 Want to Contribute to This Project?

You do not need prior open-source experience to help. This guide focuses on the parts external contributors are most likely to need.

## ✅ Before You Start

- Check existing issues before opening a new one.
- For larger changes, open an issue or start a discussion before investing heavily.
- Keep pull requests focused. Smaller PRs are much easier to review and merge.

## 🧭 Start from GitHub Issues

If you are not sure how to begin, start with the `Issues` tab on GitHub.

1. Open the repository on GitHub and click `Issues`.
2. Click `New issue`.
3. Choose `Bug report` if something is broken or working incorrectly.
4. Choose `Feature request` if you have an idea, improvement, or suggestion.
5. Write the issue in plain language. Short and simple is completely fine.

If you are unsure which one fits, choose `Feature request` and explain the problem in your own words.

## 💬 Issues vs Discussions

Use `Issues` when you can point to a clear task:

- A bug that needs fixing
- A feature request with a concrete outcome
- A documentation correction
- A scoped improvement someone can pick up

Use `Discussions` when you want to talk first:

- You are new and want help understanding the project
- You are not sure whether something is a bug or expected behavior
- You have an idea but want feedback before turning it into a task
- You want to compare approaches, ask setup questions, or share context

If you are unsure, start with a `Discussion`. We can help sort it out and turn it into an issue later if needed.

## 🚀 Recommended Workflow

1. Start by checking existing `Issues` and `Discussions`, then open the one that fits best.
2. Fork the repository and clone your fork.
3. Create a branch for your change such as `fix/capture-timeout` or `docs/readme-refresh`.
4. Make the smallest change that solves the problem clearly.
5. Test locally before opening a pull request.
6. Fill in the pull request template with context, scope, and any screenshots.

## 💻 Local Development

### Full Local Run

Use this when you are changing the real capture flow or backend behavior.

On Windows, use `py` commands. On macOS and Linux, use `python3`.

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

### Frontend Development Mode

Use this when you want Vite hot reload while still calling the local Python backend.

1. Start the backend.

Windows:

```powershell
py server.py
```

macOS / Linux:

```bash
python3 server.py
```

2. In a second terminal, start the frontend dev server.

```bash
cd frontend
npm install
npm run dev
```

3. Open `http://localhost:3000`.

Notes:
- `3000` is the Vite dev server.
- `8000` is the FastAPI backend.
- `/api` requests from the frontend dev server are proxied to `http://localhost:8000`.

## 📝 Pull Request Expectations

- Describe the user-facing change clearly.
- Link the related issue with `Fixes #123` when applicable.
- Add screenshots for visual changes.
- Call out anything you want extra review on.

## 🐛 Issue Reports

Helpful bug reports usually include:

- The target service or document type
- The URL pattern or a safe repro description
- What you expected to happen
- What actually happened
- Screenshots, logs, or Sentry details when available

## 📋 Code Guidelines

- Keep `server.py` as a thin API layer when possible.
- Prefer isolated changes in the capture modules instead of mixing unrelated refactors.
- Avoid sweeping cleanup in the same PR as a bug fix.

> [!IMPORTANT]
> If you are unsure about any part of the process, please don't hesitate to ask in the **Discussions** tab. We are here to help!
