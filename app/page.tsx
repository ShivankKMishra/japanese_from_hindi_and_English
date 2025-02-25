"use client";
import Link from "next/link";
import Script from "next/script";

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

      {/* Side Banner Ad */}
      <aside className="hidden md:block md:w-64 ml-8">
        <div className="sticky top-20">
          {/* Google AdSense Script */}
          <Script
            id="adsbygoogle-js"
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9069261755673914"
            crossOrigin="anonymous"
          />

          {/* Ad Unit */}
          <ins className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client={process.env.NEXT_PUBLIC_AD_CLIENT}
    data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT}
    data-ad-format="auto"
    data-full-width-responsive="true">
</ins>


          {/* Initialize Ads */}
          <Script id="ads-init" strategy="afterInteractive">
            {`
              (adsbygoogle = window.adsbygoogle || []).push({});
            `}
          </Script>
        </div>
      </aside>
    </main>
  );
}
