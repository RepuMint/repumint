"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateLogoUrl } from "@/app/actions/settings";

export function LogoUpload({
  currentLogoUrl,
  userId,
}: {
  currentLogoUrl: string | null;
  userId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setSuccess(false);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("File is too large — maximum 4 MB.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      // Bust the cache with a timestamp
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await updateLogoUrl(publicUrl);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      setPreview(currentLogoUrl);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
        {/* Preview */}
        <div
          style={{
            width: "96px", height: "96px", borderRadius: "12px",
            border: "1px solid rgba(11,27,62,0.12)",
            backgroundColor: "#F4F6FA",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Business logo"
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
            />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8892A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
        </div>

        {/* Upload zone */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: "2px dashed rgba(11,27,62,0.15)",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              backgroundColor: uploading ? "rgba(11,27,62,0.02)" : "#FAFBFD",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (!uploading) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168,255,62,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(11,27,62,0.15)";
            }}
          >
            {uploading ? (
              <p style={{ fontSize: "13px", color: "#8892A4" }}>Uploading…</p>
            ) : (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0B1B3E", marginBottom: "4px" }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ fontSize: "12px", color: "#8892A4" }}>
                  PNG recommended · JPG or WebP also accepted · Max 4 MB
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
            style={{ display: "none" }}
          />

          {error && (
            <p style={{ fontSize: "12px", color: "#FF6450", marginTop: "8px" }}>{error}</p>
          )}
          {success && (
            <p style={{ fontSize: "12px", color: "#45A29E", marginTop: "8px" }}>
              Logo updated successfully.
            </p>
          )}
        </div>
      </div>

      <p style={{ fontSize: "11px", color: "#8892A4", marginTop: "12px", lineHeight: "1.5" }}>
        Your logo appears on SMS links, email review requests, and the customer-facing sentiment page.
        PNG with a transparent background works best.
      </p>
    </div>
  );
}
