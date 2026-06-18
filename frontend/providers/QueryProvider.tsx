'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * QueryProvider là Component bao bọc (Wrapper Component) dùng để khởi tạo và cung cấp 
 * cấu hình TanStack Query (React Query) cho toàn bộ ứng dụng ở phía Frontend.
 * Nó cho phép sử dụng các hooks như useQuery, useMutation để quản lý server state một cách tối ưu.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Sử dụng useState để đảm bảo QueryClient chỉ được khởi tạo duy nhất một lần (singleton)
  // trong suốt vòng đời của ứng dụng ở phía Client, tránh việc re-render tạo lại client mới.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Thời gian dữ liệu được coi là "fresh" (mới) là 5 phút. Trong thời gian này,
            // React Query sẽ không tự động gọi API lấy lại dữ liệu mới (refetch).
            staleTime: 1000 * 60 * 5, 
            
            // Tắt tính năng tự động fetch lại dữ liệu khi người dùng focus lại vào tab trình duyệt.
            // Giúp giảm thiểu số lượng request thừa lên server.
            refetchOnWindowFocus: false, 
            
            // Giới hạn số lần thử lại (retry) khi gọi API thất bại xuống còn 1 lần.
            // Tránh việc gửi quá nhiều request lên máy chủ khi gặp sự cố hệ thống.
            retry: 1, 
          },
        },
      })
  );

  return (
    // QueryClientProvider truyền thực thể queryClient xuống các component con bên dưới
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQueryDevtools giúp hiển thị bảng điều khiển debug các trạng thái cache của query ở góc màn hình (chỉ hiển thị ở chế độ dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

