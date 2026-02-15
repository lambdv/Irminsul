import React from "react"
import ChatWrapper from "./ChatWrapper"
import LightRays from "@/components/cn/LightRays"

import { getServerUser } from "@/lib/server-session"
import { getThemeColors } from "@/lib/themeColors"
import { getCDNURL } from "@/utils/getAssetURL"
import { cookies } from "next/headers"

export async function generateMetadata() {
  return {
    title: "Seelie | Irminsul",
    description: "Seelie is your AI guide for Genshin Impact.",
    image: getCDNURL("/imgs/icons/seelie.png"),
    url: "/ai",
  }
}

export default async function Page() {
  const user = await getServerUser()
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value || "dark"
  const isLightTheme = theme === "light" || theme === "purple"

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-20%",
          width: "calc(100% + 40%)",
          height: "calc(100vh + 60px)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor={getThemeColors(theme).raysColor}
          raysSpeed={1}
          lightSpread={isLightTheme ? 0.1 : 0.4}
          rayLength={2.2}
          fadeDistance={isLightTheme ? 0.4 : 0.8}
          saturation={isLightTheme ? 1 : 0.7}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          isLightMode={isLightTheme}
        />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <ChatWrapper user={user} />
      </div>
    </div>
  )
}
