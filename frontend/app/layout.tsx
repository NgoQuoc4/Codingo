import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from "../providers/QueryProvider";

/**
 * Cấu hình SEO và Metadata cho toàn bộ website ở trang chủ và các trang con.
 * Next.js sẽ tự động kết xuất các thẻ meta này trong thẻ <head> của HTML.
 */
export const metadata: Metadata = {
  title: "Codingo - Learn Coding the Gamified Way!",
  description:
    "Codingo-style gamified coding platform. Master Python, JavaScript, and other languages with bite-sized lessons, streaks, and XP points.",
};

/**
 * RootLayout là layout gốc cấp cao nhất của toàn bộ ứng dụng (Next.js App Router).
 * Nó bọc tất cả các trang và thiết lập cấu trúc HTML cơ bản, Font chữ, Icon, cũng như
 * các Context Provider toàn cục như React Query và Auth Context.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <head>
        {/* Nhúng Font chữ Nunito Sans từ Google Fonts để đem lại giao diện hiện đại và thân thiện */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Nhúng bộ biểu tượng Material Symbols Outlined từ Google phục vụ hiển thị icon game */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background antialiased overflow-x-hidden">
        {/* Bọc QueryProvider bên ngoài cùng để cung cấp cơ chế Cache / API Fetching */}
        <QueryProvider>
          {/* Bọc AuthProvider bên trong để quản lý trạng thái đăng nhập, profile người dùng */}
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

