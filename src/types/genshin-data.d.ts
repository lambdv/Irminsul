declare module "genshin-data" {
  class GenshinData {
    characters(): Promise<any[]>
    weapons(): Promise<any[]>
    artifacts(): Promise<any[]>
  }
  export = GenshinData
}
