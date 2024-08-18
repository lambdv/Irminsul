
export const metadata = {
  title: "Home | Irminsul",
};

export default function Home() {
  return (
    <div id="home-page">
      {Array.from({ length: 100 }, (_, i) => i + 1).map((i) => (
        <div key={i}>Hello, world</div>
      ))}
    </div>
  );
}
