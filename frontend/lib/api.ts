/**
 * API base URL định tuyến tới Backend. 
 * Trong môi trường Next.js App Router, /api được cấu hình proxy/rewrites tới http://localhost:5000 ở next.config.ts
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface RequestOptions extends RequestInit {}

/**
 * Hàm gọi API chung (Generic API Client) sử dụng fetch API.
 * Tự động gửi kèm Cookies nhờ cơ chế tự nhiên của trình duyệt, 
 * tự động định nghĩa Content-Type là application/json và xử lý lỗi HTTP.
 * 
 * @param endpoint - Đường dẫn tương đối của API (ví dụ: '/auth/login', '/users/profile')
 * @param options - Cấu hình request bao gồm method, body, headers...
 * @returns Promise chứa kiểu dữ liệu mong đợi từ API phản hồi
 */
async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { headers, ...rest } = options;
  const reqHeaders = new Headers(headers);

  // Tự động thiết lập Content-Type là application/json nếu gửi body dạng chuỗi và chưa định nghĩa header này
  if (rest.body && !(rest.body instanceof FormData) && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  // Gửi request lên server Next.js proxy
  const res = await fetch(`${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`, {
    ...rest,
    headers: reqHeaders,
  });

  // Xử lý lỗi hệ thống/HTTP lỗi (không thuộc dải 200-299)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${res.status}`);
  }

  // Xử lý trường hợp API không trả về nội dung (No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// ==========================================
// ĐĂNG KÝ & ĐĂNG NHẬP (AUTHENTICATION)
// ==========================================

/**
 * API đăng nhập tài khoản
 * @param email - Email người dùng
 * @param password - Mật khẩu người dùng
 */
export const apiLogin = (email: string, password: string) =>
  apiFetch<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/**
 * API đăng ký tài khoản mới
 * @param username - Tên hiển thị người dùng
 * @param email - Email đăng ký
 * @param password - Mật khẩu tài khoản
 */
export const apiRegister = (username: string, email: string, password: string) =>
  apiFetch<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

/**
 * API đăng xuất tài khoản để xóa HttpOnly Cookie ở server BFF
 */
export const apiLogout = () =>
  apiFetch<any>("/auth/logout", {
    method: "POST",
  });

// ==========================================
// TIẾN TRÌNH & THỐNG KÊ NGƯỜI DÙNG (USER PROGRESS)
// ==========================================

/**
 * Lấy thông tin chi tiết profile cá nhân của user
 */
export const apiGetUserProfile = () =>
  apiFetch<any>("/users/profile");

/**
 * Cập nhật cấu hình cài đặt hoặc profile của user
 * @param updates - Đối tượng chứa các trường cần cập nhật (ví dụ: avatar, soundEffects,...)
 */
export const apiUpdateUserProfile = (updates: any) =>
  apiFetch<any>("/users/update", {
    method: "PUT",
    body: JSON.stringify(updates),
  });

/**
 * API giảm trừ 1 tim khi trả lời câu hỏi sai
 */
export const apiLoseHeart = () =>
  apiFetch<any>("/users/lose-heart", {
    method: "POST",
  });

/**
 * API đổi 50 XP lấy đầy tim (5 tim)
 */
export const apiRefillHearts = () =>
  apiFetch<any>("/users/refill-hearts", {
    method: "POST",
  });

/**
 * API cộng điểm kinh nghiệm (XP) sau khi làm bài hoặc ôn tập
 * @param xp - Số lượng điểm kinh nghiệm cộng thêm
 */
export const apiAddXp = (xp: number) =>
  apiFetch<any>("/users/add-xp", {
    method: "POST",
    body: JSON.stringify({ xp }),
  });

// ==========================================
// BẢN ĐỒ HỌC TẬP & KHÓA HỌC (PRACTICES)
// ==========================================

/**
 * Lấy danh sách toàn bộ các khóa học/chương học thực hành của user
 */
export const apiGetPractices = () =>
  apiFetch<any>("/practices");

/**
 * Lấy chi tiết bài học và tiến trình trong một khóa học cụ thể
 * @param courseId - ID của khóa học cần truy vấn
 */
export const apiGetPracticeDetails = (courseId: string) =>
  apiFetch<any>(`/practices/${courseId}`);

// ==========================================
// CHI TIẾT BÀI HỌC (LESSONS)
// ==========================================

/**
 * Lấy chi tiết các câu hỏi thực hành bên trong một bài học cụ thể
 * @param lessonId - ID của bài học
 */
export const apiGetLessonDetails = (lessonId: string) =>
  apiFetch<any>(`/lessons/${lessonId}`);

/**
 * Đánh dấu hoàn thành bài học để tính điểm XP và mở khóa bài học kế tiếp
 * @param lessonId - ID của bài học đã hoàn thành
 */
export const apiCompleteLesson = (lessonId: string) =>
  apiFetch<any>(`/lessons/${lessonId}/complete`, {
    method: "POST",
  });

// ==========================================
// SỔ TAY LÝ THUYẾT (THEORY / COURSES)
// ==========================================

/**
 * Lấy danh sách các tài liệu lý thuyết trong sổ tay
 */
export const apiGetTheoryLessons = () =>
  apiFetch<any>("/courses");

// ==========================================
// BẢNG XẾP HẠNG (LEADERBOARD)
// ==========================================

/**
 * Lấy danh sách xếp hạng người dùng theo điểm kinh nghiệm (XP)
 * @param limit - Số lượng người dùng tối đa hiển thị (mặc định là 10)
 */
export const apiGetLeaderboard = (limit: number = 10) =>
  apiFetch<any>(`/users/leaderboard?limit=${limit}`);
