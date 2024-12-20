import SearchPallet from "@components/navigation/SearchPallet";

export const metadata = {
  title: "Irminsul",
};

export default function Home() {

  return (    
    <div id="home-page">
    <h1 className="text-4xl text-center text-red-500">Hello World</h1>      
    <SearchPallet/>
      {/* <h1 className="text-4xl text-center text-red-500">Hello World</h1>
      {Array.from({ length: 1000 }, (_, i) => i + 1).map((i) => (
        <div key={i}>Hello, world</div>
      ))} */}
    </div>
  );
}
