"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row items-center justify-center p-8 bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 max-w-2xl w-full">
        <div className="bg-white shadow-md rounded-2xl p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Hiragana/Katakana Practice
          </h1>
          <p className="text-gray-600 mb-6">
            Learn Hiragana from Hindi and English!
          </p>
          <Link href="/hiragana">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition duration-300">
              Hiragana from Hindi and English
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
