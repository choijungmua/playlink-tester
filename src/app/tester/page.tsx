"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConfirmModal from "@/components/ConfirmModal";

type Tester = {
  id: string;
  name: string;
  email: string;
  type: number;
  created_at: string;
  invite: boolean;
};

export default function TesterPage() {
  const router = useRouter();
  const [testers, setTesters] = useState<Tester[]>([]);
  const [testersLoading, setTestersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<0 | 1>(1);
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "type" | "created_at"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTesters, setSelectedTesters] = useState<Set<string>>(
    new Set(),
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [exportedTesters, setExportedTesters] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/v1/admin/verify");
      if (response.ok) {
        await loadTesters();
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("인증 확인 오류:", error);
      router.push("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTesters = async () => {
    setTestersLoading(true);
    try {
      const response = await fetch("/api/v1/admin/testers");
      if (response.ok) {
        const data = await response.json();
        setTesters(data.data || []);
      } else {
        console.error("가입자 목록 불러오기 실패");
      }
    } catch (error) {
      console.error("가입자 목록 조회 오류:", error);
    } finally {
      setTestersLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlatformLabel = (type: number) => {
    return type === 0 ? "iOS" : "Android";
  };

  const handleSort = (column: "name" | "email" | "type" | "created_at") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredTesters.map((t) => t.id));
      setSelectedTesters(allIds);
    } else {
      setSelectedTesters(new Set());
    }
  };

  const handleSelectTester = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTesters);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTesters(newSelected);
  };

  const handleInviteClick = () => {
    const selectedTestersList = filteredTesters.filter((t) =>
      selectedTesters.has(t.id),
    );
    if (selectedTestersList.length === 0) {
      return;
    }

    // 추출되지 않은 유저가 선택되어 있는지 확인
    const notExportedTesters = selectedTestersList.filter(
      (t) => !exportedTesters.has(t.id)
    );

    if (notExportedTesters.length > 0) {
      alert(
        `${notExportedTesters.length}명의 테스터가 아직 추출되지 않았습니다.\n초대하려면 먼저 추출을 진행해주세요.`
      );
      return;
    }

    setShowInviteModal(true);
  };

  const handleInviteConfirm = async () => {
    setInviting(true);
    setInviteMessage("");

    try {
      const response = await fetch("/api/v1/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testerIds: Array.from(selectedTesters),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteMessage(`성공: ${data.message}`);
        // 테스터 목록 새로고침
        await loadTesters();
        setSelectedTesters(new Set());
        // 3초 후 모달 닫기
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteMessage("");
        }, 3000);
      } else {
        setInviteMessage(`오류: ${data.message}`);
      }
    } catch (error) {
      console.error("초대 요청 오류:", error);
      setInviteMessage("오류: 서버 오류가 발생했습니다.");
    } finally {
      setInviting(false);
    }
  };

  const handleInviteCancel = () => {
    setShowInviteModal(false);
  };

  const handleExportClick = () => {
    if (filteredTesters.length === 0) {
      return;
    }
    setShowExportModal(true);
  };

  const handleExportConfirm = async () => {
    // 추출된 테스터 목록에 추가
    const newExportedTesters = new Set(exportedTesters);
    filteredTesters.forEach((tester) => {
      newExportedTesters.add(tester.id);
    });
    setExportedTesters(newExportedTesters);

    // 이메일 리스트 생성
    const emailList = filteredTesters
      .map((tester) => tester.email)
      .join("\n");

    try {
      // 1. 클립보드에 복사
      await navigator.clipboard.writeText(emailList);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
    }

    // 2. CSV 파일 다운로드
    const csvContent = emailList;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const platformName = platformFilter === 0 ? "iOS" : "Android";

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `testers_${platformName}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 3. 플랫폼별 콘솔 페이지로 이동
    if (platformFilter === 0) {
      // iOS: App Store Connect로 이동
      window.open(
        "https://appstoreconnect.apple.com/access/users",
        "_blank"
      );
    } else {
      // Android: Google Play Console로 이동
      window.open(
        "https://play.google.com/console/u/0/developers/8187818311799697960/app/4972067573523107916/tracks/internal-testing?tab=testers",
        "_blank"
      );
    }

    setShowExportModal(false);
  };

  const handleExportCancel = () => {
    setShowExportModal(false);
  };

  const handleDeleteClick = () => {
    const selectedTestersList = filteredTesters.filter((t) =>
      selectedTesters.has(t.id),
    );
    if (selectedTestersList.length === 0) {
      return;
    }
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch("/api/v1/admin/testers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testerIds: Array.from(selectedTesters),
        }),
      });

      if (response.ok) {
        // 테스터 목록 새로고침
        await loadTesters();
        setSelectedTesters(new Set());
        setShowDeleteModal(false);
      } else {
        console.error("삭제 실패");
      }
    } catch (error) {
      console.error("삭제 요청 오류:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const filteredTesters = testers
    .filter((t) => t.type === platformFilter)
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const isAllSelected =
    filteredTesters.length > 0 &&
    filteredTesters.every((t) => selectedTesters.has(t.id));

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full justify-center px-2 py-4 sm:px-4 sm:py-6">
      <div className="w-full max-w-5xl">
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="flex justify-center pb-3 sm:pb-4">
            <Image
              src="/icon.png"
              alt="playlink icon"
              width={60}
              height={60}
              className="sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px]"
            />
          </div>
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">관리자 페이지</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">플레이링크 테스터 관리</p>
          </div>

          {/* 테스터 목록 */}
          <div>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-semibold">테스터 목록</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={loadTesters}
                  disabled={testersLoading}
                  className="px-3 py-1.5 text-xs sm:text-sm text-gray-400 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {testersLoading ? "새로고침 중..." : "새로고침"}
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={selectedTesters.size === 0}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  삭제
                </button>
                <button
                  onClick={handleExportClick}
                  disabled={filteredTesters.length === 0}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추출
                </button>
              </div>
            </div>

            {/* 플랫폼 필터 */}
            <div className="flex gap-4 mb-4 border-b border-gray-200">
              <button
                onClick={() => setPlatformFilter(1)}
                className={`pb-2 font-medium transition-colors ${
                  platformFilter === 1
                    ? "text-black border-b-2 border-black"
                    : "text-gray-300"
                }`}
              >
                Android
              </button>
              <button
                onClick={() => setPlatformFilter(0)}
                className={`pb-2 font-medium transition-colors ${
                  platformFilter === 0
                    ? "text-black border-b-2 border-black"
                    : "text-gray-300"
                }`}
              >
                iOS
              </button>
            </div>

            {testersLoading ? (
              <div className="text-center py-8 text-gray-400">로딩 중...</div>
            ) : filteredTesters.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {`${getPlatformLabel(platformFilter)} 테스터가 없습니다.`}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-20rem)] overflow-y-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-gray-200 sticky top-0 bg-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 w-10 sm:w-12">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                            {isAllSelected && (
                              <Image
                                src="/assets/ic_check.svg"
                                alt="check"
                                width={10}
                                height={8}
                                className="sm:w-3 sm:h-2.5"
                              />
                            )}
                          </div>
                        </label>
                      </th>
                      <th
                        onClick={() => handleSort("name")}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          이름
                          {sortBy === "name" && (
                            <span className="text-xs sm:text-sm">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("email")}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          이메일
                          {sortBy === "email" && (
                            <span className="text-xs sm:text-sm">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("type")}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          플랫폼
                          {sortBy === "type" && (
                            <span className="text-xs sm:text-sm">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("created_at")}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          가입일시
                          {sortBy === "created_at" && (
                            <span className="text-xs sm:text-sm">{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase">
                        초대 상태
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTesters.map((tester) => (
                      <tr
                        key={tester.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <label className="flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTesters.has(tester.id)}
                              onChange={(e) =>
                                handleSelectTester(tester.id, e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all">
                              {selectedTesters.has(tester.id) && (
                                <Image
                                  src="/assets/ic_check.svg"
                                  alt="check"
                                  width={10}
                                  height={8}
                                  className="sm:w-3 sm:h-2.5"
                                />
                              )}
                            </div>
                          </label>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{tester.name}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{tester.email}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          {getPlatformLabel(tester.type)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm whitespace-nowrap">
                          {formatDate(tester.created_at)}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span
                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              tester.invite
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {tester.invite ? "초대됨" : "미초대"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 초대 확인 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleInviteCancel}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/icon.png"
                  alt="playlink icon"
                  width={80}
                  height={80}
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                테스터 초대
              </h3>
              <p className="text-gray-600 mb-6">
                선택한{" "}
                <span className="font-semibold text-blue-500">
                  {selectedTesters.size}명
                </span>
                의 테스터를
                <br />
                정말로 초대하시겠습니까?
              </p>

              {inviteMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    inviteMessage.startsWith("성공")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {inviteMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleInviteCancel}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleInviteConfirm}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "초대 중..." : "초대하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmModal - 추출 */}
      <ConfirmModal
        isOpen={showExportModal}
        title="테스터 목록 추출"
        message={
          <>
            현재 필터의 전체{" "}
            <span className="font-semibold text-blue-500">
              {filteredTesters.length}명
            </span>{" "}
            테스터를
            <br />
            {platformFilter === 0
              ? "App Store Connect로 이동하여 추가하시겠습니까?"
              : "Google Play Console로 이동하여 추가하시겠습니까?"}
            <br />
            <span className="text-xs text-gray-500 mt-2 block">
              CSV 다운로드 및 클립보드 복사가 진행됩니다.
            </span>
          </>
        }
        confirmText="이동하기"
        cancelText="취소"
        onConfirm={handleExportConfirm}
        onCancel={handleExportCancel}
      />

      {/* ConfirmModal - 삭제 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="테스터 삭제"
        message={
          <>
            선택한{" "}
            <span className="font-semibold text-red-500">
              {selectedTesters.size}명
            </span>
            의 테스터를
            <br />
            정말로 삭제하시겠습니까?
            <br />
            <span className="text-sm text-gray-500">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </>
        }
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
