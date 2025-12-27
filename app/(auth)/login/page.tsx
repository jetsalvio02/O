"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, set_error] = useState("");
  const [loading, set_loading] = useState(false);

  const handle_login = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      set_error(data.message);
      set_loading(false);
    }

    // TEMP (later replace with session/JWT)
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Enterprise Ordering System
          </h1>
          {/* <p className="text-gray-500 text-sm mt-1">
            Login to manage and place orders
          </p> */}
        </div>

        {/* Login Form */}
        <form onSubmit={handle_login} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => set_email(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => set_password(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {/* Login Button */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-3 text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Signup CTA */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Don’t have an account?</p>
          <Link
            href="/signup"
            className="block w-full border border-blue-600 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Create an Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 Enterprise Ordering System
        </p>
      </div>
    </div>
  );
}
