export function generateMetadata({params}) {
  return {
    title: params.name + " | Irminsul"
  }
}

export default function CharacterPage({params}) {
  
  const name = params.name

    return (
      <div id="">
        {name}
      </div>
    );
  }
  