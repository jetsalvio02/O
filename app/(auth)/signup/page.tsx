"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function SignupPage() {
  const router = useRouter();

  const [name, set_name] = useState("");
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, set_error] = useState("");
  const [loading, set_loading] = useState(false);

  const handle_signup = async (e: React.FormEvent) => {
    e.preventDefault();
    set_loading(true);
    set_error("");

    try {
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      const data = response.data;

      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: "Your account has been created successfully.",
        confirmButtonText: "Continue",
      });

      router.push("/login");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        set_error(error.response?.data?.message || "Login failed");

        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: error.response?.data?.message || "Unable to create account.",
        });
      } else {
        set_error("Something went wrong");

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
        });
      }
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Create an Account
          </h1>
          <p className="text-gray-500 text-sm">Register to start ordering</p>
        </div>

        {/* Form */}
        <form onSubmit={handle_signup} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => set_name(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
