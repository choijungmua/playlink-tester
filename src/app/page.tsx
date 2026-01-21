"use client";

import React, { useState } from "react";
import Image from "next/image";
import { insertTesterEmail } from "@/lib/supabase";

type Platform = "ios" | "android";

const PLATFORM_COPY: Record<Platform, { label: string; helper: string }> = {
  ios: {
    label: "iOS",
    helper: "TestFlight를 통해 설치할 분들은 iOS 탭을 선택해주세요.",
  },
  android: {
    label: "Android",
    helper: "APK 혹은 스토어 버전을 사용할 분들은 Android 탭을 선택해주세요.",
  },
};

const PLATFORMS: Platform[] = ["ios", "android"];
const PLATFORM_TYPE: Record<Platform, 0 | 1> = {
  ios: 0,
  android: 1,
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false); // 입력/제출 시도 여부
  const [nameTouched, setNameTouched] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("ios");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ✅ 이메일 유효성 검사
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };


  // ✅ 이름 입력될 때 상태 갱신
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameTouched(true);
    setServerError(null);
    setSuccessMessage(null);
  };

  // ✅ 이메일 입력될 때 상태 갱신
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setTouched(true);
    setServerError(null);
    setSuccessMessage(null);
  };

  const trimmedName = name.trim();
  const isNameEntered = trimmedName.length > 0;
  const isNameValid = isNameEntered;

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailEntered = normalizedEmail.length > 0;
  const isEmailValid = isEmailEntered && validateEmail(normalizedEmail);

  // ✅ 에러 조건 (입력했고 + 유효하지 않을 때)
  const showValidationError = touched && isEmailEntered && !isEmailValid;
  const showError = showValidationError || Boolean(serverError);

  const helperMessage = showError
    ? (serverError ??
      "이메일 형식에 맞지 않습니다.")
    : (successMessage ??
      (isEmailValid
        ? "✓ 유효한 이메일입니다."
        : "이메일을 잘못 입력 했을 때 반려 될 수 있습니다."));

  const helperToneClass = showError
    ? "text-red-500"
    : successMessage || isEmailValid
      ? "text-green-500"
      : "text-gray-500";

  const showNameError = nameTouched && !isNameValid;
  const nameHelperMessage = showNameError
    ? "이름을 입력해주세요."
    : isNameEntered
      ? ""
      : "테스트 참가자 이름을 입력해주세요.";
  const nameHelperToneClass = showNameError ? "text-red-500" : "text-gray-500";

  const handleSubmit = async () => {
    setNameTouched(true);
    setTouched(true);
    setServerError(null);
    setSuccessMessage(null);

    if (!isNameValid) return;

    // 유효하지 않으면 막기
    if (!validateEmail(normalizedEmail)) return;

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const platformType = PLATFORM_TYPE[selectedPlatform];
      const result = await insertTesterEmail(
        trimmedName,
        normalizedEmail,
        platformType,
      );
      if (!result.ok) {
        if (result.status === 409) {
          setServerError("이미 작성한 이메일 입니다.");
        } else {
          setServerError(result.message);
        }
        return;
      }

      setSuccessMessage(
        `${PLATFORM_COPY[selectedPlatform].label} 신청이 완료됐습니다.`,
      );
      setName("");
      setEmail("");
      setTouched(false);
      setNameTouched(false);
    } catch (error) {
      console.error(error);
      setServerError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !isNameValid || !isEmailValid || isSubmitting;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="border border-gray-300 p-8 rounded-lg w-full max-w-sm">
        <div className="flex justify-center pb-4">
          <Image src="/icon.png" alt="icon" width={150} height={150} />
        </div>
        <div className="pb-2">
          <h1 className="text-2xl font-bold">안녕하세요</h1>
          <p>플레이링크 테스트에 참여해주셔서 감사합니다.</p>
        </div>

        <div className="mt-4">
          <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold">
            {PLATFORMS.map((platform) => {
              const isActive = platform === selectedPlatform;
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    setSelectedPlatform(platform);
                    setTouched(false);
                    setNameTouched(false);
                    setServerError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 rounded-full px-4 py-2 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {PLATFORM_COPY[platform].label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm min-h-10 text-gray-500">
            {PLATFORM_COPY[selectedPlatform].helper}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={handleNameChange}
            onBlur={() => setNameTouched(true)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors ${
              showNameError
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            required
          />
          {nameHelperMessage && (
            <p className={`text-xs text-right ${nameHelperToneClass}`}>
              {nameHelperMessage}
            </p>
          )}
        </div>

        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          className={`w-full mt-6 px-4 py-2 border rounded-lg focus:outline-none transition-colors ${
            showError
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
          required
        />

        <div className="mt-4 space-y-2">
          <p className={`text-xs text-right ${helperToneClass}`}>
            {helperMessage}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full mt-6 py-2 rounded-lg font-semibold transition-colors ${
            !isSubmitDisabled
              ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </div>
  );
}
