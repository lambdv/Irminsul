export const openApiConfig = {
  openapi: "3.0.0",
  info: {
    title: "Irminsul API",
    description: "Genshin Impact theorycrafting and metagaming API",
    version: "1.0.0",
    contact: {
      name: "Irminsul Team",
      url: "https://irminsul.app",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://irminsul.app",
      description: "Production server",
    },
  ],
  security: [],
  tags: [
    {
      name: "Characters",
      description: "Character data and statistics",
    },
    {
      name: "Weapons",
      description: "Weapon information and stats",
    },
    {
      name: "Artifacts",
      description: "Artifact sets and bonuses",
    },
  ],
}
