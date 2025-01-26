"use client"
import Link from "next/link"
import { articles } from "./articles"
import styles from "./articles.module.css"
import BrowseHeader from "@/components/explore/BrowseHeader"

import MockIcon from "@public/imgs/icons/Element_Anemo.png"
import { ArticleFitlerStore } from "./filterstate"


export default function ArticleList(){
    const articlesList = articles()
    return (
      <div id="article-list" style={{display: "flex", flexDirection: "row", gap: "10px", paddingLeft: "20px", paddingRight: "20px"}}>
        {articlesList.map((article) => (
          <ArticleCard key={article.slug} article={article}/>
        ))}
      </div>
    )
  }
  
function ArticleCard(props: {article: any}){
    return (
        <Link href={`/articles/${props.article.slug}`}>
            <div className={styles.articleCard}>
                {props.article.title}
                <p>{props.article.description}</p>
            </div>
        </Link>
    )
}


/**
 * export default function CharacterItemList(props: {data: Character[]}) {
    const characters = props.data
    const { SearchQuery } = SearchStore()
    const { selectedFilters, filters, descending } = CharacterFilterStore()
    const [sortBy, setSortBy] = useState("release_date_epoch")

    const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(characters)
    useEffect(() => {
        const filters2d = [filters[0].rarities, filters[1].elements, filters[2].weapons, filters[3].ascensionstats]
        const itemTaggingFunction = (character: any) => [flatten(character.rarity+"-star"), flatten(character.vision), flatten(character.weapon), flatten(character.ascension_stat)]
        const filtered = filterItemList(characters, filters2d, selectedFilters, SearchQuery, itemTaggingFunction)
        setFilteredCharacters(filtered)
    }, [characters, filters, selectedFilters, SearchQuery])

    return (
        <div className={explorePageCSS.itemContainer}>
            {filteredCharacters
                .sort((a,b)=>sortItems(a, b, sortBy, descending))
                .filter((character: any) => flatten(character.name) !== "traveler")
                .map((character, index) => (
                    <Item 
                        key={index} 
                        category="character"
                        name={character.name}
                        rarity={character.rarity}
                        element={character.element}
                        src={getAssetURL("character", character.name, "avatar.png")}
                        alt={toKey(character.name)}
                    />
                    )
                )}
                {filteredCharacters.length === 0 && <p>No characters found </p>}
        </div>
    )
}
 */