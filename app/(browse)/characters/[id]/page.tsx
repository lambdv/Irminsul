import useFetch from "@/hooks/useFetch";
import Image from 'next/image';

export function generateMetadata({params}) {
  return { title: params.id + " | Irminsul" }
}

async function getCharacterData(id: string) {
  return await fetch(`https://genshin.jmp.blue/characters/${id}`)
    .then(res => res.json())
}

export default async function CharacterPage({params}) {
  const name = params.id
  const data = await getCharacterData(name)

    return (
      <div id="">
        
        <div className="flex" style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(/assets/characters/${name.toLowerCase().replaceAll(" ", "-")}/banner.png)`,

        }}>
          <h1 className="bold">{name}</h1>
          <Image
            src={`/assets/characters/${name.toLowerCase().replaceAll(" ", "-")}/splash.png`}
            alt={name}
            width={500}
            height={500}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{JSON.stringify(value)}</td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    );
  }
  