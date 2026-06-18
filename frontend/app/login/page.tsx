"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

/**
 * LoginPage hiển thị form đăng nhập cho người dùng.
 * Sử dụng AuthContext để gửi thông tin đăng nhập lên backend và lưu trữ token.
 */
export default function LoginPage() {
  // Khai báo các state cục bộ quản lý giá trị input và trạng thái submit
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
  const [error, setError] = useState(""); // Thông báo lỗi khi đăng nhập thất bại
  const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi request

  // Lấy hàm login từ AuthContext toàn cục
  const { login } = useAuth();

  // Xử lý khi nhấn nút gửi form (Submit Form)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Kiểm tra tính hợp lệ cơ bản của dữ liệu đầu vào
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    setSubmitting(true);
    try {
      // Gọi hàm login từ Auth Context để thực hiện API đăng nhập và điều hướng
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || "Email hoặc mật khẩu không hợp lệ.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="bg-brand-green p-2 rounded-lg text-white font-black text-xl tracking-wider shadow-[0_3px_0_#46a302]">
          &lt;/&gt;
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-gray-800">
          Cod<span className="text-brand-green">ingo</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-sm">
        <h2 className="text-2xl font-black text-center text-gray-800 mb-6">
          Log In
        </h2>

        {error && (
          <div className="bg-brand-red/10 border-2 border-brand-red text-brand-red p-3.5 rounded-2xl text-sm font-bold mb-5 flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-brand-blue outline-none transition-colors text-gray-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-brand-blue outline-none transition-colors text-gray-800 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brand-blue hover:bg-sky-500 text-white font-bold rounded-2xl btn-3d border-b-4 border-sky-600 shadow-[0_4px_0_#0284c7] flex items-center justify-center gap-2 text-lg tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none mt-6"
          >
            {submitting ? "LOGGING IN..." : "LOG IN"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="border-t border-gray-100 my-6"></div>

        <p className="text-center text-gray-500 font-bold text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand-blue hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
