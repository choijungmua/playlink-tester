"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { insertTesterEmail } from "@/lib/supabase";

type Platform = "ios" | "android";

type EmailRequestPayload = {
  name: string;
  email: string;
  platform: Platform;
};

const sendEmailNotification = async (payload: EmailRequestPayload) => {
  const response = await fetch("/api/v1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  let message = "이메일 발송에 실패했습니다.";
  try {
    const data = await response.json();
    if (data?.message) {
      message = data.message;
    }
  } catch {
    // ignore JSON parse errors
  }

  throw new Error(message);
};

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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const focusNameInput = () => nameInputRef.current?.focus();
  const focusEmailInput = () => emailInputRef.current?.focus();

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
    ? (serverError ?? "이메일 형식에 맞지 않습니다.")
    : (successMessage ??
      (isEmailValid
        ? "✓ 유효한 이메일입니다."
        : "이메일을 잘못 입력 했을 때 반려 될 수 있습니다."));

  const helperToneClass = showError
    ? "text-red-500"
    : successMessage || isEmailValid
      ? "text-green-500"
      : "text-gray-500";

  const showNameError = nameTouched && !isNameValid && !successMessage;
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

    if (!isNameValid) {
      focusNameInput();
      return;
    }

    // 유효하지 않으면 막기
    if (!validateEmail(normalizedEmail)) {
      focusEmailInput();
      return;
    }

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
        focusEmailInput();
        return;
      }

      let emailWarning: string | null = null;
      try {
        await sendEmailNotification({
          name: trimmedName,
          email: normalizedEmail,
          platform: selectedPlatform,
        });
      } catch (emailError) {
        console.error(emailError);
        emailWarning =
          emailError instanceof Error
            ? emailError.message
            : "이메일 발송 중 문제가 발생했습니다.";
      }

      const baseSuccessMessage = `${PLATFORM_COPY[selectedPlatform].label} 신청이 완료됐습니다.`;
      setSuccessMessage(
        emailWarning
          ? `${baseSuccessMessage} (${emailWarning})`
          : baseSuccessMessage,
      );
      setName("");
      setEmail("");
      setTouched(false);
      setNameTouched(false);
      focusNameInput();
    } catch (error) {
      console.error(error);
      setServerError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      focusEmailInput();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormIncomplete = !isNameValid || !isEmailValid;
  const isButtonInactive = isFormIncomplete || isSubmitting;

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 max-h-[calc(100dvh-3rem)] overflow-y-auto">
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
            ref={nameInputRef}
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={handleNameChange}
            onBlur={() => setNameTouched(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                focusEmailInput();
              }
            }}
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
          ref={emailInputRef}
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSubmit();
            }
          }}
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
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className={`w-full mt-6 py-2 rounded-lg font-semibold transition-colors ${
            !isButtonInactive
              ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-pointer"
          } ${isSubmitting ? "opacity-80" : ""}`}
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </div>
  );
}
