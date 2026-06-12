"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { LogIn, ArrowRight } from "lucide-react";

export function HeaderAuth() {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <Link
          href="/learn"
          className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl btn-3d border-b-4 border-brand-green-hover shadow-[0_3px_0_#46a302] text-sm tracking-wide"
        >
          LEARN PATH
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all"
          >
            <LogIn size={16} />
            LOGIN
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl btn-3d border-b-4 border-brand-green-hover shadow-[0_3px_0_#46a302] text-sm"
          >
            SIGN UP
          </Link>
        </>
      )}
    </div>
  );
}

export function HeroCTA() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md">
      {user ? (
        <Link
          href="/learn"
          className="w-full py-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-2xl btn-3d border-b-4 border-brand-green-hover shadow-[0_4px_0_#46a302] flex items-center justify-center gap-2 text-lg tracking-wider"
        >
          CONTINUE LEARNING
          <ArrowRight size={20} />
        </Link>
      ) : (
        <>
          <Link
            href="/register"
            className="w-full py-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-2xl btn-3d border-b-4 border-brand-green-hover shadow-[0_4px_0_#46a302] flex items-center justify-center gap-2 text-lg tracking-wider"
          >
            GET STARTED
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="w-full py-4 bg-white hover:bg-gray-50 text-brand-green border-2 border-gray-200 font-bold rounded-2xl text-lg transition-all text-center"
          >
            I ALREADY HAVE AN ACCOUNT
          </Link>
        </>
      )}
    </div>
  );
}
