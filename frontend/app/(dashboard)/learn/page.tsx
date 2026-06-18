"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGetPractices, apiGetPracticeDetails } from "../../../lib/api";

interface Lesson {
  _id: string;
  title: string;
}

interface Chapter {
  _id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  language: string;
  description: string;
  totalLessons: number;
  completedLessonsCount: number;
  chapters: Chapter[];
}

export default function LearnPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State lưu trữ ID khóa học đang được người dùng lựa chọn để hiển thị lộ trình học
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: courses = [], isLoading: isCoursesLoading, error: coursesError } = useQuery<any[]>({
    queryKey: ["practices"],
    queryFn: () => apiGetPractices(),
  });

  /**
   * Effect lắng nghe danh sách khóa học tải xong.
   * Nếu người dùng chưa chọn khóa học nào, tự động chọn khóa học đầu tiên làm mặc định.
   */
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const { data: courseDetails = null, isLoading: isDetailsLoading, error: detailsError } = useQuery<{
    course: Course;
    progress?: { completedLessons: string[]; currentLessonId: string | null };
  }>({
    queryKey: ["practices", selectedCourseId],
    queryFn: () => apiGetPracticeDetails(selectedCourseId!),
    enabled: !!selectedCourseId,
  });

  // Giải nén các biến phái sinh trực tiếp từ cache dữ liệu của React Query để render JSX
  const selectedCourse = courseDetails?.course || null;
  const completedLessons = courseDetails?.progress?.completedLessons || [];
  const currentLessonId = courseDetails?.progress?.currentLessonId || null;

  // Trạng thái loading và thông báo lỗi tổng hợp từ các query
  const loading = isCoursesLoading || (!!selectedCourseId && isDetailsLoading);
  const error = coursesError ? "Failed to load courses. Please refresh the page." : detailsError ? "Failed to load course details." : "";

  // Hàm xử lý khi người dùng chọn tab chuyển đổi ngôn ngữ/khóa học học tập
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const getAllLessonsFlat = (): Lesson[] => {
    if (!selectedCourse) return [];
    const flat: Lesson[] = [];
    selectedCourse.chapters.forEach((ch) => {
      ch.lessons.forEach((les) => {
        flat.push(les);
      });
    });
    return flat;
  };

  const isLessonUnlocked = (lessonId: string) => {
    const flatLessons = getAllLessonsFlat();
    if (completedLessons.includes(lessonId)) return true;
    if (currentLessonId && currentLessonId === lessonId) return true;

    const idx = flatLessons.findIndex((l) => l._id === lessonId);
    if (idx === 0) return true;

    if (idx > 0 && completedLessons.includes(flatLessons[idx - 1]._id)) {
      return true;
    }

    return false;
  };

  const getZigzagClass = (idx: number) => {
    const offsets = [
      "translate-x-0",
      "translate-x-12 md:translate-x-20",
      "translate-x-0",
      "-translate-x-12 md:-translate-x-20",
    ];
    return offsets[idx % offsets.length];
  };

  const getNodeIcon = (
    globalIdx: number,
    isCompleted: boolean,
    isActive: boolean,
    unlocked: boolean,
  ) => {
    if (!unlocked) return "lock";
    if (isCompleted) return "check";
    if (isActive) return "star";

    // Choose fun cyclic icons for unlocked pathway nodes
    const icons = [
      "school",
      "menu_book",
      "fitness_center",
      "inventory_2",
      "emoji_events",
    ];
    return icons[globalIdx % icons.length];
  };

  const handleLessonClick = (lessonId: string) => {
    if (isLessonUnlocked(lessonId)) {
      router.push(`/lesson/${lessonId}`);
    }
  };

  if (loading && !selectedCourse) {
    return (
      <div className="flex-1 h-full w-full flex items-center justify-center bg-background flex-col gap-3">
        <span className="material-symbols-outlined text-5xl text-secondary animate-spin">
          refresh
        </span>
        <p className="font-extrabold text-on-surface-variant/80">
          Loading your learning path...
        </p>
      </div>
    );
  }

  // Daily XP goal calculation
  const dailyXp = user ? user.xp % 20 : 0;
  const dailyProgressPercent = Math.min((dailyXp / 20) * 100, 100);

  return (
    <>
        {/* CENTER COLUMN: Scrollable Skill Path Tree */}
        <section className="flex-1 h-full overflow-y-auto relative scroll-smooth border-r-4 border-black/10 custom-scrollbar">
          {/* Sticky Header */}
          {selectedCourse && (
            <header className="sticky top-0 z-40 bg-primary-container p-4 flex items-center justify-between border-b-4 border-on-primary-fixed-variant shadow-lg">
              <div className="flex flex-col">
                <span className="font-headline-md text-lg md:text-xl text-white uppercase tracking-wide">
                  {selectedCourse.title}
                </span>
                <span className="text-xs font-bold text-sky-100 mt-0.5">
                  Bản đồ học: {selectedCourse.language}
                </span>
              </div>
              <div className="flex gap-2">
                {courses.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleCourseChange(c._id)}
                    className={`px-3 py-1.5 rounded-xl font-button text-xs transition-all active:translate-y-0.5 uppercase ${
                      selectedCourse?._id === c._id
                        ? "bg-white text-primary-container border-b-2 border-gray-300"
                        : "bg-white/20 text-white hover:bg-white/30 border-b-2 border-transparent"
                    }`}
                  >
                    {c.language}
                  </button>
                ))}
              </div>
            </header>
          )}

          {/* Skill Tree Path container */}
          <div className="max-w-xl mx-auto py-12 px-6 flex flex-col items-center gap-12 relative min-h-[1000px]">
            {/* Dashed vertical connector line */}
            {/* <div className="absolute top-0 bottom-0 w-1.5 bg-surface-container-highest border-l-2 border-dashed border-outline-variant/40"></div> */}

            {selectedCourse &&
              selectedCourse.chapters.map((chapter, chapIdx) => {
                let accumulatedLessonsBefore = 0;
                for (let i = 0; i < chapIdx; i++) {
                  accumulatedLessonsBefore +=
                    selectedCourse.chapters[i].lessons.length;
                }

                return (
                  <div
                    key={chapter._id}
                    className="w-full flex flex-col items-center gap-10 z-10"
                  >
                    {/* Chapter Section Title */}
                    <div className="w-full bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 text-center shadow-md">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-1">
                        CHƯƠNG {chapIdx + 1}
                      </span>
                      <h3 className="font-headline-md text-base md:text-lg text-on-surface leading-snug">
                        {chapter.title}
                      </h3>
                    </div>

                    {/* Chapter Nodes */}
                    {chapter.lessons.map((lesson, lessonIdx) => {
                      const globalIdx = accumulatedLessonsBefore + lessonIdx;
                      const isCompleted = completedLessons.includes(lesson._id);
                      const isActive =
                        currentLessonId === lesson._id ||
                        (!currentLessonId && globalIdx === 0);
                      const unlocked = isLessonUnlocked(lesson._id);

                      return (
                        <div
                          key={lesson._id}
                          className={`flex flex-col items-center transition-all duration-300 relative group ${getZigzagClass(
                            globalIdx,
                          )}`}
                        >
                          {/* Active Indicator Dialog */}
                          {isActive && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-primary-container font-button text-xs px-3 py-1 rounded-xl shadow-lg border-2 border-primary-container animate-bounce whitespace-nowrap z-20 uppercase tracking-wide">
                              BẮT ĐẦU
                            </div>
                          )}

                          {/* Lesson Node Circle Button */}
                          <button
                            onClick={() => handleLessonClick(lesson._id)}
                            disabled={!unlocked}
                            className={`w-20 h-20 rounded-full flex items-center justify-center node-active relative transition-all ${
                              isCompleted
                                ? "bg-secondary-container text-on-secondary-container border-b-8 border-on-secondary-fixed-variant"
                                : isActive
                                  ? "bg-primary-container text-white border-b-8 border-on-primary-fixed-variant animate-float animate-pulse-glow"
                                  : unlocked
                                    ? "bg-surface-bright text-primary border-b-8 border-black/30"
                                    : "bg-surface-container-highest text-on-surface-variant/40 border-b-8 border-black/30 grayscale opacity-60"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined ${isActive ? "text-4xl" : "text-3xl"}`}
                              style={{
                                fontVariationSettings:
                                  isActive || isCompleted
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                              }}
                            >
                              {getNodeIcon(
                                globalIdx,
                                isCompleted,
                                isActive,
                                unlocked,
                              )}
                            </span>

                            {/* Index Badge */}
                            <span className="absolute -bottom-2 bg-surface-container-highest text-on-surface-variant font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-outline-variant/40 shadow-sm">
                              {globalIdx + 1}
                            </span>
                          </button>

                          {/* Node Label Text */}
                          <span
                            className={`text-xs font-black mt-4 max-w-[140px] text-center uppercase tracking-wide leading-tight ${
                              isActive
                                ? "text-primary"
                                : unlocked
                                  ? "text-on-surface"
                                  : "text-on-surface-variant/40"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            {/* Mascot Peaking Figure (Desktop only) */}
            <div className="absolute right-4 top-1/4 floating-animation hidden lg:block select-none z-0 opacity-80 hover:opacity-100 transition-opacity">
              <div className="bg-surface-container rounded-3xl p-4 border-b-4 border-black/20 flex flex-col items-center gap-2 shadow-xl">
                <img
                  alt="Mascot"
                  className="w-24 h-24 object-contain pointer-events-none"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuMWjtyAYeTVDmncrKj6zvqXQ_1DisDuolYsYfKfOrYYwDldPFv9ZJXxr1iHwbCiJvirTveeaZjuoM4U3biq2-x763dT6dbYZj5_9Edx3T2iDSAYFIdEhZn9XF7ftttxfpnY7GERd5v5r6OxjvzP-e4B_5Yz1BFn24sUTFesWQ1Zt_KFlPrDjXoCgm_ptMM0PtHMOK5wDELMAB4jjf91D9MvDGFe86MiWj5iL3uT71YYkBrHF__2z7TcZfeJDbXIpKrax0HAqWjq5F"
                />
                <div className="bg-secondary/10 text-secondary font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Sẵn sàng luyện tập
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMN 3: Right Status & Widgets panel (Desktop only) */}
        <aside className="w-80 h-full p-6 flex flex-col gap-6 bg-surface overflow-y-auto border-l-4 border-black/10 hidden lg:flex custom-scrollbar">
          {/* Status badge row */}
          <div className="flex items-center justify-between gap-2 bg-surface-container p-2 rounded-2xl border-b-4 border-black/20">
            <Link
              href="/quests"
              className="flex items-center gap-1.5 hover:bg-surface-bright px-2.5 py-1.5 rounded-xl transition-all active:translate-y-0.5"
            >
              <span
                className="material-symbols-outlined text-brand-orange text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-black text-sm">{user?.streak}</span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 hover:bg-surface-bright px-2.5 py-1.5 rounded-xl transition-all active:translate-y-0.5"
            >
              <span
                className="material-symbols-outlined text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span className="font-black text-sm text-primary">
                {user?.xp}
              </span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 hover:bg-surface-bright px-2.5 py-1.5 rounded-xl transition-all active:translate-y-0.5"
            >
              <span
                className="material-symbols-outlined text-brand-red text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="font-black text-sm text-brand-red">
                {user?.hearts}
              </span>
            </Link>
          </div>

          {/* Widgets Stack */}
          <div className="flex flex-col gap-6">
            {/* League Rank Widget */}
            <div className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex flex-col gap-3 shadow-md">
              <h3 className="font-headline-md text-base leading-tight">
                Bảng Xếp Hạng
              </h3>
              <div className="flex items-center gap-3 py-2">
                <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center border-b-4 border-black/20">
                  <span
                    className="material-symbols-outlined text-3xl text-on-surface-variant/40"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trophy
                  </span>
                </div>
                <div>
                  <p className="font-black text-sm text-brand-yellow uppercase tracking-wide">
                    Giải Ngọc Trai
                  </p>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    Tuần thi đấu đầu tiên của bạn!
                  </p>
                </div>
              </div>
              <Link
                href="/leaderboard"
                className="w-full py-2 bg-surface-bright hover:bg-surface-variant font-button text-xs text-center rounded-xl border-b-4 border-black/30 transition-all active:translate-y-0.5 active:border-b-0 uppercase font-black"
              >
                XEM BẢNG ĐẤU
              </Link>
            </div>

            {/* Daily Quests Progress Widget */}
            <div className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex flex-col gap-3 shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-base leading-tight">
                  Nhiệm vụ hằng ngày
                </h3>
                <span className="material-symbols-outlined text-brand-yellow font-black">
                  bolt
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs font-black text-on-surface-variant">
                  <span>Kinh nghiệm hôm nay</span>
                  <span className="text-secondary">{dailyXp} / 20 XP</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-4 bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/20 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full transition-all duration-500"
                    style={{ width: `${dailyProgressPercent}%` }}
                  ></div>
                </div>
              </div>
              <Link
                href="/quests"
                className="w-full py-2 bg-surface-bright hover:bg-surface-variant font-button text-xs text-center rounded-xl border-b-4 border-black/30 transition-all active:translate-y-0.5 active:border-b-0 uppercase font-black"
              >
                TẤT CẢ NHIỆM VỤ
              </Link>
            </div>

            {/* Profile Summary Widget */}
            <div className="bg-surface-container p-5 rounded-3xl border-b-4 border-black/20 flex flex-col gap-3 shadow-md">
              <h3 className="font-headline-md text-base leading-tight">
                Hồ Sơ Của Bạn
              </h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Lưu lại tiến độ học tập và theo dõi bảng xếp hạng thi đấu cùng
                bạn bè!
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full py-3 bg-secondary text-on-secondary font-button text-xs rounded-xl border-b-4 border-on-secondary-fixed-variant transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 uppercase font-black"
                >
                  XEM HỒ SƠ
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full py-3 bg-primary-container text-white font-button text-xs rounded-xl border-b-4 border-on-primary-fixed-variant transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 uppercase font-black"
                >
                  CÀI ĐẶT
                </button>
              </div>
            </div>
          </div>

          {/* Social Links inside right panel */}
          <footer className="mt-auto pt-6 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-widest">
              DouLingCode © 2026
            </span>
          </footer>
        </aside>
    </>
  );
}
