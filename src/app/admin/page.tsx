"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/v1/admin/verify");
      if (response.ok) {
        router.push("/tester");
      }
    } catch (error) {
      console.error("인증 확인 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/tester");
      } else {
        const data = await response.json();
        setError(data.message || "비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 max-h-[calc(100dvh-3rem)] overflow-y-auto">
        <div className="flex justify-center pb-4">
          <Image src="/icon.png" alt="playlink icon" width={150} height={150} />
        </div>
        <div className="pb-2">
          <h1 className="text-2xl font-bold">관리자 로그인</h1>
          <p className="text-gray-600">플레이링크 관리자 페이지입니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit(event as unknown as React.FormEvent);
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              required
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-2 text-right">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className={`w-full mt-6 py-2 rounded-lg font-semibold transition-colors ${
              !isSubmitting && password
                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-pointer"
            } ${isSubmitting ? "opacity-80" : ""}`}
          >
            {isSubmitting ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
