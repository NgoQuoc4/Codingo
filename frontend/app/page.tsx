import Link from "next/link";
import { HeaderAuth, HeroCTA } from "../components/HomeClientComponents";
import {
  Terminal,
  Flame,
  Heart,
  Compass,
  Shield,
} from "lucide-react";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-6xl w-full mx-auto rounded-b-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-green p-2 rounded-lg text-white font-black text-xl tracking-wider shadow-[0_3px_0_#46a302]">
            &lt;/&gt;
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-800">
            Cod<span className="text-brand-green">ingo</span>
          </span>
        </div>

        <HeaderAuth />
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 md:py-20 text-center">
        <div className="relative mb-8 animate-float">
          {/* Synthesized Cartoon Mascot: Laptop with a cute face */}
          <div className="w-56 h-36 bg-gray-800 rounded-lg p-3 shadow-xl relative border-4 border-gray-600 flex flex-col justify-between items-center">
            <div className="w-full flex justify-between items-center px-1 text-gray-500 text-[10px]">
              <span>index.js</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </div>
            </div>
            {/* Mascot Face */}
            <div className="flex items-center justify-center gap-6 my-2">
              <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-1 left-1.5"></div>
              </div>
              <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-1 left-1.5"></div>
              </div>
            </div>
            <div className="w-12 h-2.5 bg-brand-orange rounded-full mb-1"></div>
            {/* Keyboard base */}
            <div className="w-64 h-4 bg-gray-700 absolute -bottom-4 rounded-b-lg border-t border-gray-600 shadow-md"></div>
          </div>
          {/* Floating XP badge */}
          <span className="absolute -top-4 -right-4 bg-brand-yellow text-gray-800 font-bold px-3 py-1.5 rounded-full text-xs shadow-md border-2 border-white flex items-center gap-1">
            <Flame size={12} className="fill-brand-orange text-brand-orange" />
            +15 XP
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
          The free, fun, and effective way <br />
          to{" "}
          <span className="text-brand-green underline decoration-solid decoration-brand-orange">
            learn programming!
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Master Python and JavaScript. Learn syntax, logic, and arrays through
          gamified bite-sized challenges, maintain your streak, and protect your
          hearts!
        </p>

        <HeroCTA />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-gray-200 pt-16">
          <div className="flex flex-col items-center p-4">
            <div className="bg-brand-green/10 text-brand-green p-4 rounded-2xl mb-4">
              <Compass size={32} />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Bite-Sized Paths</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Learn coding sequentially. Solve multiple-choice questions, fill
              in code gaps, and drag snippets to build functional programs.
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="bg-brand-orange/10 text-brand-orange p-4 rounded-2xl mb-4">
              <Flame size={32} className="fill-brand-orange" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Daily Streaks</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Practice daily to build and maintain your streak. Lose it, and
              you'll have to start over from day 1!
            </p>
          </div>

          <div className="flex flex-col items-center p-4">
            <div className="bg-brand-red/10 text-brand-red p-4 rounded-2xl mb-4">
              <Heart size={32} className="fill-brand-red" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Heart Protection</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Take care with your inputs! You start with 5 hearts. Mistakes cost
              hearts, which regenerate over time or can be bought with XP.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center text-gray-500 text-xs mt-12">
        <p>
          © 2026 Codingo. Modeled with passion for gamified programming
          education.
        </p>
      </footer>
    </div>
  );
}
