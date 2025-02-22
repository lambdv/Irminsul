"use client";
import React, { useEffect } from "react";
import Script from "next/script";
import { GlobalStore } from "@/store/global";

export default function Advertisment(props: { type: "card" | "banner" | "in-article" }) {
  const { isSupporter } = GlobalStore()


  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error: any) {
      //console.log(error.message);
    }
  }, []);

  if(isSupporter) 
    return null

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
        style={{ 
            display: "block",
            height: "auto",
            borderRadius: "2px",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "10px",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            margin: "auto",
        }}
        data-ad-client="ca-pub-1739492299738628"
        data-ad-slot="9046274057"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
