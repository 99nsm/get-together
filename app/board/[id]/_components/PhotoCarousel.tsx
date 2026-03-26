// app/board/[id]/_components/PhotoCarousel.tsx
// 여러 장 사진을 좌우 슬라이드로 보여주는 클라이언트 컴포넌트
// - 터치 스와이프 (모바일)
// - 마우스 드래그 (PC)
// - 하단 progress bar: 스크롤 비율에 따라 thumb이 부드럽게 이동
// - 사진 사이 세로 구분선

"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface PhotoCarouselProps {
    photos: string[];
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // 스크롤 진행률 (0 ~ 1): thumb 위치 계산에 사용
    const [scrollRatio, setScrollRatio] = useState(0);

    // 마우스 드래그 상태
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const scrollStartLeft = useRef(0);

    // 스크롤할 때마다 0~1 비율 계산
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setScrollRatio(max > 0 ? el.scrollLeft / max : 0);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", handleScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // ── 마우스 드래그 핸들러 ──

    function onMouseDown(e: React.MouseEvent) {
        isDragging.current = true;
        dragStartX.current = e.clientX;
        scrollStartLeft.current = scrollRef.current?.scrollLeft ?? 0;
        e.preventDefault();
    }

    function onMouseMove(e: React.MouseEvent) {
        if (!isDragging.current || !scrollRef.current) return;
        scrollRef.current.scrollLeft = scrollStartLeft.current + (dragStartX.current - e.clientX);
    }

    function onMouseUp() {
        isDragging.current = false;
    }

    // thumb 너비 = 트랙 너비 / 사진 수
    // thumb 위치 = scrollRatio × (트랙 너비 - thumb 너비)
    const thumbWidthPct = 100 / photos.length;
    const thumbLeftPct  = scrollRatio * (100 - thumbWidthPct);

    return (
        <div className="space-y-3">
            {/* ── 슬라이드 영역 ── */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                {/* 왼쪽 패딩 */}
                <div className="shrink-0 w-[7.5%]" />

                {photos.map((url, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-[85%] relative flex items-center">
                        {/* 첫 번째 사진 제외하고 왼쪽에 세로 구분선 */}
                        {idx > 0 && (
                            <div className="absolute -left-3 top-0 bottom-0 flex items-center justify-center w-3">
                                <div className="w-px h-2/3 bg-gradient-to-b from-transparent via-border to-transparent" />
                            </div>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`첨부사진 ${idx + 1}`}
                            draggable={false}
                            className="w-full aspect-[4/3] object-cover rounded-xl bg-muted"
                        />
                        {/* 사진 번호 뱃지 */}
                        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                            {idx + 1} / {photos.length}
                        </span>
                    </div>
                ))}

                {/* 오른쪽 패딩 */}
                <div className="shrink-0 w-[7.5%]" />
            </div>

            {/* ── 하단 progress bar ── */}
            {/* 회색 트랙 위에서 흰색(전경색) thumb이 스크롤에 따라 이동 */}
            <div className="relative h-1 w-full rounded-full bg-muted">
                <div
                    className="absolute top-0 h-full rounded-full bg-foreground transition-[left] duration-75"
                    style={{
                        width: `${thumbWidthPct}%`,
                        left:  `${thumbLeftPct}%`,
                    }}
                />
            </div>
        </div>
    );
}
