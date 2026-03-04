# YouTube Video Bias Checker

A browser extension and backend service designed to analyze YouTube video transcripts in real-time for potential bias. Inspired by Ground News, it provides definitions for key political and historical terms and aims to give users more context about the videos they watch.

This is a monorepo containing a WXT-based browser extension (React/Tailwind) and a Python FastAPI backend.

## 📸 Project Showcase

<table>
  <tr>
    <td><img src="./@imgs/example1.png" alt="Extension Popup" width="400"/></td>
    <td><img src="./@imgs/example2.png" alt="Analyzing Video" width="400"/></td>
  </tr>
  <tr>
    <td><img src="./@imgs/example3.png" alt="Definitions Tooltip" width="400"/></td>
    <td><img src="./@imgs/example4.png" alt="Backend Terminal" width="400"/></td>
  </tr>
</table>

## Key Features

- Real-time analysis of YouTube video transcripts directly from the browser.
- Transcript fetching and formatting via a Python service using `youtube-transcript-api`.
- Contextual term definitions scraped from EBSCO Research Starters with `beautifulsoup4`.
- Backend-first architecture for sensitive requests and key protection.

## Tech Stack

- Frontend (Extension): WXT, React 19, Tailwind CSS v4, Lucide React, Supabase client.
- Backend (API): Python 3.12, FastAPI, Uvicorn, Requests, BeautifulSoup4, youtube-transcript-api.
- Tooling: npm Workspaces (monorepo), TypeScript, Vitest.

## Project Structure

- `apps/biasMateExension/`: Browser extension source code.
- `apps/transcriptService/`: Python FastAPI backend for transcripts and scraped definitions.
- `packages/shared/`: Shared TypeScript logic and types.

## Prerequisites

- Node.js and npm
- Python 3.x

On some Debian/Ubuntu installs, Python may not include `venv` or `pip` by default. Install them with:

```bash
sudo apt update
sudo apt install python3-venv python3-pip
```

## Setup and Installation

1. Install JS dependencies from the monorepo root:

```bash
npm install
```

2. Set up backend dependencies:

```bash
cd apps/transcriptService
python3 -m venv .env
source .env/bin/activate
python -m pip install --upgrade pip
pip install fastapi uvicorn requests beautifulsoup4 youtube-transcript-api
```

## Running the Application

Start the backend API:

```bash
cd apps/transcriptService
python main.py
```

Start the browser extension dev server:

```bash
npm run dev
```

## Roadmap and Future Improvements

The primary goal is to improve the overall accuracy, consistency, and objectivity of the bias detection engine.

- Enhanced determinism and accuracy: refine the analysis pipeline so repeated runs on the same transcript produce stable results.
- Standardized political analysis rubric: anchor scoring to clear criteria for more consistent evaluations.
- Transcript anonymization pre-processing: remove channel/network self-references (for example, mentions like "Fox News" or "CNN") so analysis focuses on content rather than source labels.
- General bugs and quality-of-life fixes.
