# Biometric KYC — Secure Identity Verification

A production-grade Next.js web app with biometric face authentication, AI document OCR verification, a persistent AI voice assistant, and real-time hand gesture control.

## Features

| Feature | Tech |
|---|---|
| Email/password auth | Appwrite Account API |
| Face enrollment + liveness | HyperVerge HyperSnapSDK + REST |
| Face match at login | HyperVerge Face Match API |
| Document OCR & KYC | Sarvam Vision (Document Intelligence) |
| Voice assistant (STT) | Sarvam Saaras v3 |
| Voice assistant (brain) | OpenRouter (Llama 3.1 8B) |
| Voice assistant (TTS) | Sarvam Bulbul v3 |
| Hand gesture tracking | MediaPipe Hand Landmarker (100% in-browser) |
| Deployment | Render (Next.js) + Appwrite Cloud (Functions) |

## Architecture

```
src/
  app/             Routes only — thin page.tsx files that mount Views
  views/           Presentational React (no data fetching, no API calls)
  controllers/     React hooks: hold state, call models/services
  models/          Types, Zod schemas, Appwrite DB/Storage repositories
  services/        Thin clients that call Appwrite Functions
  lib/             Appwrite client init, config, utilities

functions/         Appwrite Functions (serverless, server-side secrets here)
  hv-enroll/       HyperVerge face enrollment
  hv-authenticate/ HyperVerge liveness + face match
  doc-verify/      Sarvam Vision document OCR + name verification
  va-stt/          Sarvam Saaras v3 speech-to-text
  va-brain/        OpenRouter LLM intent + navigation
  va-tts/          Sarvam Bulbul v3 text-to-speech
```

**Security invariant:** All API secrets live exclusively in Appwrite Function environment variables. The Next.js client bundle never sees HyperVerge, Sarvam, or OpenRouter keys.

## Setup

### 1. Prerequisites

- Node.js 20+
- [Appwrite CLI](https://appwrite.io/docs/tooling/command-line/installation) (`npm i -g appwrite-cli`)
- Appwrite Cloud account + project
- HyperVerge account (approved)
- Sarvam AI API key
- OpenRouter API key

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Appwrite

In your Appwrite console:

1. **Create a Database** (TablesDB). Note the database ID.
2. **Create `users` collection** with attributes:
   - `userId` (string, required)
   - `faceEnrolled` (boolean, default: false)
   - `faceTemplateRef` (string, nullable)
   - `kycStatus` (enum: pending/verified/failed, default: pending)
   - `createdAt` (string, required)
3. **Create `documents` collection** with attributes:
   - `userId` (string, required)
   - `fileId` (string, required)
   - `docType` (string, required)
   - `ocrResult` (string, nullable) — stored as JSON string
   - `verificationStatus` (enum: pending/verified/failed, default: pending)
   - `createdAt` (string, required)
4. **Create a Storage bucket** for document uploads. Set permissions to per-user read/write.
5. **Add a Web platform** in Appwrite project settings (your localhost and Render URL).

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in the client-safe values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_HYPERVERGE_APP_ID=<hyperverge-app-id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<database-id>
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=<users-collection-id>
NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID=<documents-collection-id>
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=<bucket-id>
```

### 5. Deploy Appwrite Functions

Update `appwrite.json` with your real project ID, then:

```bash
appwrite login
appwrite deploy function --all
```

In the Appwrite console, set each function's **environment variables**:
- `hv-enroll`, `hv-authenticate`: `HYPERVERGE_APP_ID`, `HYPERVERGE_APP_KEY`
- `doc-verify`, `va-stt`, `va-tts`: `SARVAM_API_KEY`
- `va-brain`: `OPENROUTER_API_KEY`

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Deployment (Render)

1. Push to GitHub.
2. Create a **Web Service** on Render.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Add all `NEXT_PUBLIC_*` env vars in Render's environment settings.

## Routes

| Route | Description |
|---|---|
| `/signup` | Create account + face enrollment |
| `/login` | Email/password + face match |
| `/dashboard` | KYC status overview |
| `/verify-document` | Upload + OCR + verify ID |
| `/hand-control` | Live hand gesture tracking (MediaPipe) |

## Credentials required

| Service | Status | Where to get |
|---|---|---|
| Appwrite | API key provided | Appwrite console → API Keys |
| HyperVerge | **Needs approved account** | https://hyperverge.co |
| Sarvam AI | API key provided | https://dashboard.sarvam.ai |
| OpenRouter | API key provided | https://openrouter.ai |
