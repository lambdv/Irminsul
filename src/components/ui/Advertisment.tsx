"use client";
import React, { useEffect } from "react";
import Script from "next/script";

export default function Advertisment(props: { type: "card" | "banner" | "in-article" }) {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);

  return (
    <>
      {/* Load AdSense script only once */}
      <Script
        strategy="afterInteractive"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      />

      {/* AdSense ad */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1739492299738628"
        data-ad-slot="9046274057"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
