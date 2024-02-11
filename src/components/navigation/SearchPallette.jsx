import searchpalletteCSS from '@/css/searchpallette.module.css'
import { SearchStore } from '@/store/Search'

export default function SearchPalette() {
    const { SearchQuery } = SearchStore()
    return (
        <div className='SearchPallette'>
            {SearchQuery}
        </div>
    )
}
