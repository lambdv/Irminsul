export const metadata = {
  title: "Irminsul",
};

export default function Home() {
  return (
    <div id="home-page">
      {Array.from({ length: 1000 }, (_, i) => i + 1).map((i) => (
        <div key={i}>Hello, world</div>
      ))}
    </div>
  );
}
