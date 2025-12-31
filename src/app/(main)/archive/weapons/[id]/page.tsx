import Header from "@/components/archive/Header"
import BaseStatTable from "@/components/archive/BaseStatTable"
import { getWeapon, getWeapons } from "@/utils/genshinData"
import Talent from "@/components/archive/Talent"
import { Suspense } from "react"
import ArchivePageCSS from "@/components/archive/archivePage.module.css"
import CommentSection from "@/components/ui/CommentSection"
import { getAssetURL } from "@/utils/getAssetURL"
import WeaponPassives from "./WeaponPassive"
import Advertisment from "@/components/ui/Advertisment"
import RightSidenav from "@/components/navigation/RightSidenav"
import Loading from "@/app/loading"
//page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getWeapon(id)
  if (!data) {
    return {
      title: "Weapon Not Found | Irminsul",
    }
  }
  return {
    title: `${data.name} | Irminsul`,
    description: data.description,
    image: `/assets/weapons/${data.key}/${data.key}_splash_art.png`,
    url: `/weapons/${id}`,
  }
}

//statically generate all weapon pages from api at build time
export async function generateStaticParams() {
  const weapons = await getWeapons()
  return weapons
    .filter((weapon) => weapon?.id) // Filter out weapons without id
    .map((weapon) => ({
      id: weapon.id,
    }))
}

export default async function WeaponPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getWeapon(id)

  if (!data) {
    return (
      <div className={ArchivePageCSS.archiveRecordContentContainer}>
        <h1>Weapon not found</h1>
        <p>The requested weapon could not be found.</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <WeaponHeader data={data} />
      <RightSidenav>
        <br />
        <Advertisment type="card" />
      </RightSidenav>
      <div className={ArchivePageCSS.archiveRecordContentContainer}>
        <div className="flex flex-col md:flex-row">
          <WeaponBaseStats data={data} />
          <WeaponPassives data={data} />
        </div>
        <br />
        <Suspense fallback={<div>Loading...</div>}>
          <CommentSection pageID={data.key} />
        </Suspense>
      </div>
      <Advertisment type="card" />
    </Suspense>
  )
}

function WeaponHeader({ data }) {
  return (
    <Header
      title={data.name}
      splashImage={getAssetURL("weapon", data.name, "splash.png")}
      // bgImage={`/imgs/icons/wishbg.jpg`}
      // bgStyle={{
      //   backgroundSize: "cover",
      //   backgroundRepeat: "no-repeat",
      //   backgroundPosition: "50% 0%",
      // }}
      // gradientStyle={{
      //   backdropFilter: "blur(20px)",
      // }}
      // colorStrength={0.7}
    >
      <>
        <section className={ArchivePageCSS.archiveRecordSection}>
          {Array.from({ length: data.rarity }).map((_, index) => (
            <i
              key={index}
              className="material-symbols-rounded"
              style={{
                color: "#FFD700",
              }}
            >
              star
            </i>
          ))}
          <p>{data.description}</p>
        </section>
      </>
    </Header>
  )
}

function WeaponBaseStats({ data }) {
  return (
    <div className="mr-3 mb-3 mb-4 overflow-x-auto w-full">
      <BaseStatTable
        table={data.base_stats.map((stat) => ({
          LVL: stat.level,
          BaseATK: stat.base_atk,
          AscensionStatValue: stat.sub_stat_value,
          AscensionStatType: stat.sub_stat_type,
          AscensionPhase: stat.ascension_phase,
        }))}
        cost={[]}
      />
    </div>
  )
}
