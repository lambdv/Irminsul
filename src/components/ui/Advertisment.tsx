"use client"
import React, { useEffect } from 'react'

export default function Advertisment(props: {
    type: "card" | "banner" | "in-article"
}) {

    useEffect(() => {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } 
        catch (error: any) { console.log(error.message);}
      }, []);

    return (
        <div id="advertisment" className='flex flex-box justify-center items-center' style={{
            // backgroundColor: "#161616",
            borderRadius: "5px",
            padding: "10px",
            margin: "10px",
            width: "100%",
            height: "auto",
            color: "#5f5f5f",
        }}>
            {/* <p className='text-sm '>adge</p> */}
            {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739492299738628"crossOrigin="anonymous"></script> */}

            <ins className="adsbygoogle"
                style={{display: "block"}}
                data-ad-client="ca-pub-1739492299738628"
                data-ad-slot="9046274057"
                data-ad-format="auto"
                data-full-width-responsive="true">    
            </ins>

            {/* <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script> */}
        </div>
    )
}
