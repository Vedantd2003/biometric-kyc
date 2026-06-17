"use client";

import { useState, useRef } from "react";
import { useDocumentController } from "@/controllers/useDocumentController";
import { Button } from "@/views/components/Button";
import { Card } from "@/views/components/Card";
import { StatusBadge } from "@/views/components/StatusBadge";

const DOC_TYPES = ["passport", "national_id", "drivers_license", "voter_id"];

export function DocumentUploadView() {
  const { loading, error, document, submit } = useDocumentController();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    await submit(file, docType);
  }

  if (document) {
    const ocr = document.ocrResult;
    return (
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-16">
        <Card className="w-full max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Verification result</h2>
            <StatusBadge status={document.verificationStatus as "pending" | "verified" | "failed"} />
          </div>
          {ocr && (
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 text-sm">
              <h3 className="mb-2 font-semibold text-zinc-700 dark:text-zinc-300">Extracted fields</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(ocr.fields).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-zinc-500 capitalize">{k.replace(/_/g, " ")}</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-zinc-400">Confidence: {Math.round(ocr.confidence * 100)}%</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-16">
      <Card className="w-full max-w-lg">
        <h2 className="mb-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">Verify your identity document</h2>
        <p className="mb-6 text-sm text-zinc-500">Upload a clear photo or scan of your government-issued ID.</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Document type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {preview ? (
              <img src={preview} alt="Document preview" className="max-h-40 rounded-xl object-contain" />
            ) : (
              <>
                <svg className="h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-zinc-500">Drag & drop or <span className="text-indigo-600">browse</span></p>
                <p className="text-xs text-zinc-400">JPG, PNG, PDF up to 10 MB</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" className="hidden" accept="image/*,.pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <Button type="submit" loading={loading} disabled={!file}>
            Verify document
          </Button>
        </form>
      </Card>
    </div>
  );
}
