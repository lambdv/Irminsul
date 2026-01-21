"use client"

import { getAssetURL } from "./getAssetURL"

export type GameItemType = "character" | "weapon" | "artifact"

export interface GameItemInfo {
  id: string
  name: string
  type: GameItemType
  iconUrl: string
  archiveUrl: string
}

/**
 * Resolves a game item name to its ID and metadata
 * Uses GraphQL API to search for the item
 */
export async function resolveGameItem(
  type: GameItemType,
  name: string
): Promise<GameItemInfo | null> {
  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query SearchPages {
            searchPages {
              id
              name
              category
            }
          }
        `,
      }),
    })

    const { data } = await response.json()
    if (!data?.searchPages) return null

    // Find matching item by name (case-insensitive, partial match)
    const normalizedName = name.toLowerCase().trim()
    const expectedCategory =
      type === "character"
        ? "Character"
        : type === "weapon"
        ? "Weapon"
        : "Artifact"
    
    // Try exact match first, then partial match
    const item = data.searchPages.find((page: any) => {
      if (page.category !== expectedCategory) return false
      
      const pageNameLower = page.name.toLowerCase()
      // Exact match (case-insensitive)
      if (pageNameLower === normalizedName) return true
      // Page name contains the search term
      if (pageNameLower.includes(normalizedName)) return true
      // Search term contains page name
      if (normalizedName.includes(pageNameLower)) return true
      
      return false
    })

    if (!item) return null

    // Get icon URL based on type
    let iconFileName = ""
    switch (type) {
      case "character":
        iconFileName = "avatar.png"
        break
      case "weapon":
        iconFileName = "base_avatar.png"
        break
      case "artifact":
        iconFileName = "flower.png"
        break
    }

    const iconUrl = getAssetURL(type, item.name, iconFileName)
    const archiveUrl = `/archive/${type}s/${item.id}`

    return {
      id: item.id,
      name: item.name,
      type,
      iconUrl,
      archiveUrl,
    }
  } catch (error) {
    console.error("Error resolving game item:", error)
    return null
  }
}

/**
 * Batch resolve multiple game items
 */
export async function resolveGameItems(
  items: Array<{ type: GameItemType; name: string }>
): Promise<Map<string, GameItemInfo>> {
  const results = new Map<string, GameItemInfo>()
  
  // Fetch all pages once
  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query SearchPages {
            searchPages {
              id
              name
              category
            }
          }
        `,
      }),
    })

    const { data } = await response.json()
    if (!data?.searchPages) return results

    // Resolve each item
    for (const item of items) {
      const normalizedName = item.name.toLowerCase().trim()
      const pageCategory =
        item.type === "character"
          ? "Character"
          : item.type === "weapon"
          ? "Weapon"
          : "Artifact"

      // Try exact match first, then partial match
      const found = data.searchPages.find((page: any) => {
        if (page.category !== pageCategory) return false
        
        const pageNameLower = page.name.toLowerCase()
        // Exact match (case-insensitive)
        if (pageNameLower === normalizedName) return true
        // Page name contains the search term (e.g., "Raiden Shogun" contains "Raiden")
        if (pageNameLower.includes(normalizedName)) return true
        // Search term contains page name (e.g., "Raiden" matches "Raiden Shogun" when searching for full name)
        if (normalizedName.includes(pageNameLower)) return true
        
        return false
      })

      if (found) {
        let iconFileName = ""
        switch (item.type) {
          case "character":
            iconFileName = "avatar.png"
            break
          case "weapon":
            iconFileName = "base_avatar.png"
            break
          case "artifact":
            iconFileName = "flower.png"
            break
        }

        const iconUrl = getAssetURL(item.type, found.name, iconFileName)
        const archiveUrl = `/archive/${item.type}s/${found.id}`

        results.set(`${item.type}:${item.name}`, {
          id: found.id,
          name: found.name,
          type: item.type,
          iconUrl,
          archiveUrl,
        })
      }
    }
  } catch (error) {
    console.error("Error batch resolving game items:", error)
  }

  return results
}
