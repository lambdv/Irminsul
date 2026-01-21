"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { GlobalStore } from "@/store/global";

export default function Advertisment(props: { 
  type: "card" | "banner" | "in-article";
  className?: string;
}) {
  const { isSupporter } = GlobalStore()
  const adRef = useRef<HTMLModElement>(null);
  const [isAdRendered, setIsAdRendered] = useState(true);

  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error: any) {
      //console.log(error.message);
    }
  }, []);

  useEffect(() => {
    if (!adRef.current || isSupporter) return;

    const checkAdRendered = () => {
      const adElement = adRef.current;
      if (!adElement) return;

      const hasContent = adElement.children.length > 0 || 
                         adElement.offsetHeight > 0 ||
                         adElement.innerHTML.trim().length > 0;

      setIsAdRendered(hasContent);
    };

    const timeoutId = setTimeout(checkAdRendered, 2000);
    const intervalId = setInterval(checkAdRendered, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isSupporter]);

  if(isSupporter) 
    return null

  const content = (
    <>
      {/* Load AdSense script only once */}
      <Script
        strategy="afterInteractive"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      />

      {/* AdSense ad */}
      <ins
        ref={adRef}
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

  if (props.className) {
    return (
      <div className={props.className} style={{ display: "none" }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: "none" }}>
      {content}
    </div>
  );
}
