type InvalidQRProps = {
  reason: "invalid" | "no_qr";
};

export default function InvalidQR({ reason }: InvalidQRProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-lg border border-surface-container-highest/80 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container/40 text-error flex items-center justify-center border border-error/20">
          <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
        </div>

        <h2 className="text-xl font-bold text-on-surface mb-2">
          {reason === "invalid" ? "Invalid QR Code" : "No Table Found"}
        </h2>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {reason === "invalid"
            ? "This QR code is not valid or the table is currently inactive. Please ask staff for assistance."
            : "Please scan the QR code on your table to start your order."}
        </p>
      </div>
    </div>
  );
}
