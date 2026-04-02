"use client";

import Image from "next/image";
import { LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";

type CloudinaryUploaderProps = {
  value: string[];
  onChange: (nextValue: string[]) => void;
  assetType?: "image" | "video";
  label?: string;
  description?: string;
  buttonLabel?: string;
};

export function CloudinaryUploader({
  value,
  onChange,
  assetType = "image",
  label,
  description,
  buttonLabel
}: CloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function uploadFiles(files: FileList) {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset =
        assetType === "video"
          ? process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET ??
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          : process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        setError("请先配置 Cloudinary 的公开环境变量。");
        return;
      }

      setError("");
      const nextUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${assetType}/upload`,
          {
            method: "POST",
            body: formData
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message ?? "Cloudinary 上传失败");
        }

        nextUrls.push(result.secure_url);
      }

      onChange([...value, ...nextUrls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    startTransition(() => {
      void uploadFiles(files);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {label ?? (assetType === "video" ? "上传房源视频" : "上传高清房源图片")}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description ??
                (assetType === "video"
                  ? "支持多段视频上传。组件会将视频直接发送到 Cloudinary，并返回 URL 列表。"
                  : "支持多图上传。组件会将图片直接发送到 Cloudinary，并返回 URL 列表。")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {buttonLabel ?? (assetType === "video" ? "选择视频" : "选择图片")}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={assetType === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={(event) => handleUpload(event.target.files)}
        />
      </div>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      {value.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((url) => (
            <div key={url} className="glass-panel group relative overflow-hidden rounded-[1.5rem] p-2">
              <div className="relative h-44 overflow-hidden rounded-[1rem]">
                {assetType === "image" ? (
                  <Image src={url} alt="房源图片预览" fill className="object-cover" sizes="33vw" />
                ) : (
                  <video
                    src={url}
                    controls
                    playsInline
                    className="h-full w-full rounded-[1rem] object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== url))}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
