import { useRef, useState } from "react";
import { api } from "../api/client";
import type { OrderOut } from "../types";

interface PaymentProofUploadProps {
  orderId: number;
  existingProofUrl: string | null;
  onUploaded: (updatedOrder: OrderOut) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function PaymentProofUpload({
  orderId,
  existingProofUrl,
  onUploaded,
}: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>(
    existingProofUrl ? "success" : "idle",
  );
  const [preview, setPreview] = useState<string | null>(existingProofUrl ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploadState("uploading");
    setErrorMsg(null);

    try {
      const updated = await api.uploadPaymentProof(orderId, file);
      URL.revokeObjectURL(localUrl);
      setPreview(updated.payment_proof_url ?? localUrl);
      setUploadState("success");
      onUploaded(updated);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setPreview(existingProofUrl ?? null);
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah, coba lagi.");
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        className="sr-only"
        aria-label="Pilih bukti pembayaran QRIS"
        onChange={handleFileChange}
      />

      {uploadState === "idle" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400 bg-amber-50 py-3 text-xs font-bold text-amber-800 hover:bg-amber-100 active:scale-[0.98] transition-all"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Unggah Bukti Pembayaran QRIS
        </button>
      )}

      {uploadState === "uploading" && (
        <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-3 text-xs font-bold text-amber-700">
          <div
            aria-hidden="true"
            className="h-4 w-4 shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
          />
          Mengunggah bukti…
        </div>
      )}

      {uploadState === "success" && preview && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <span aria-hidden="true">✓</span> Bukti berhasil diunggah
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[11px] text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
            >
              Ganti
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="block w-full overflow-hidden rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Lihat bukti pembayaran yang diunggah"
          >
            <img
              src={preview}
              alt="Bukti pembayaran QRIS"
              className="w-full max-h-40 object-cover"
            />
          </button>
          <p className="mt-1.5 text-center text-[10px] text-emerald-700">
            Tap gambar untuk memperbesar
          </p>
        </div>
      )}

      {uploadState === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <p className="font-bold mb-1">Gagal mengunggah</p>
          <p className="mb-2">{errorMsg}</p>
          <button
            type="button"
            onClick={() => {
              setUploadState("idle");
              setErrorMsg(null);
            }}
            className="text-xs font-bold text-red-700 underline underline-offset-2"
          >
            Coba lagi
          </button>
        </div>
      )}

      {showPreviewModal && preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau bukti pembayaran"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              aria-label="Tutup pratinjau"
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md text-sm font-bold hover:bg-slate-100"
            >
              ✕
            </button>
            <img
              src={preview}
              alt="Bukti pembayaran QRIS (diperbesar)"
              className="w-full rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
