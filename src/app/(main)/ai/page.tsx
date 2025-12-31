import Chat from "@root/src/feature/ai/components/chat"
import LightRays from "@/components/cn/LightRays"
import { getCDNURL } from "@/utils/getAssetURL"
import AIPageWrapper from "@/components/ui/AIPageWrapper"

export const metadata = {
  title: "Seelie | Irminsul",
  description: "Seelie is your AI guide for Genshin Impact.",
  image: getCDNURL("/imgs/icons/seelie.png"),
  url: "/ai",
}

export default function AIPage() {
  return (
    <AIPageWrapper user={null}>
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
            raysColor="#00ffff"
            raysSpeed={1}
            lightSpread={0.2}
            rayLength={1.5}
            fadeDistance={0.6}
            saturation={0.7}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Chat user={null} />
        </div>
      </div>
    </AIPageWrapper>
  )
}
