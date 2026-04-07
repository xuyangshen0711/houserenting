"use client";

import { useRouter } from "next/navigation";

export function BackToHomeButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="glass-panel rounded-full px-4 py-3 text-sm font-medium text-slate-700"
    >
      返回首页
    </button>
  );
}
