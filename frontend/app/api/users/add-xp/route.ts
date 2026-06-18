import { NextResponse } from "next/server";
import { helper, addMockXp } from "../../mockDb";

// API POST /api/users/add-xp - Cộng điểm kinh nghiệm (XP) cho người dùng (ví dụ khi hoàn thành bài phát âm)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { xp } = body;

    // 1. Thử chuyển tiếp yêu cầu đến Express Backend nếu nó đang online
    const proxy = await helper.proxyFetch(req, "/api/users/add-xp", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (proxy.ok) {
      return NextResponse.json(proxy.data);
    }

    // 2. Chế độ dự phòng (Fallback): Cộng XP giả lập
    if (typeof xp !== "number" || xp <= 0) {
      return NextResponse.json(
        { message: "Số điểm kinh nghiệm (XP) không hợp lệ!" },
        { status: 400 },
      );
    }

    const user = helper.authenticate(req);
    addMockXp(user, xp); // Cộng dồn XP và cập nhật lịch sử hàng ngày

    return NextResponse.json({
      message: `Đã cộng thêm ${xp} XP thành công!`,
      user,
    });
  } catch (error) {
    console.error("Lỗi trong API /api/users/add-xp:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ nội bộ" },
      { status: 500 },
    );
  }
}
