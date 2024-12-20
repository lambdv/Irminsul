"use server"
import { getWeapon, getWeapons } from '@/utils/DataGetters';
import { toTitleCase } from '@/utils/standardizers';

//page metadata
export async function generateMetadata({params}) {
  const {id} = await params
  const name = toTitleCase(id)
  return {
    title: `${name} | Irminsul`,
    description: "",
    image: `/assets/weapons/${id}/splash.png`,
    url: `/weapons/${id}`,
  }
}

//statically generate all character pages from api at build time
export async function generateStaticParams() {
  const weapons = await getWeapons()
  return weapons.map((weapon) => ({
    id: weapon.id,
    data: weapon
  }))
}

export default async function WeaponPage({params}) {
  const {id} = await params
  const data = params.data ? params.data : await getWeapon(id)

  return (
    <div id="">
      {id}
      {JSON.stringify(data)}
    </div>
  );
}
  