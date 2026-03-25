// app/board/[id]/page.tsx
// 게시글 상세 페이지 (/board/[id]) - Phase 0 placeholder
// Phase 1에서 게시글 내용, 사진 갤러리, 수정/삭제 버튼을 구현합니다.

export default function BoardDetailPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <div>
            <h1 className="text-2xl font-bold">게시글 상세</h1>
            <p className="mt-2 text-muted-foreground">게시글 ID: {params.id}</p>
            <p className="mt-1 text-muted-foreground">
                Phase 1에서 게시글 상세 UI를 구현할 예정입니다.
            </p>
        </div>
    );
}
