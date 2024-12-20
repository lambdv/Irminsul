import searchresultsCSS from '@/components/navigation/searchresults.module.css'
import { SearchStore } from '@/store/Search'

export default function SearchPalette(props) {
    const { SearchQuery } = SearchStore()
    return (
        <div className={searchresultsCSS.searchresults}>
            {SearchQuery}
            {props.children}
        </div>
    )
}
