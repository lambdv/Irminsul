import FooterCSS from './footer.module.css'
import Link from 'next/link'

export default function Footer() {
  return (
    <div className={FooterCSS.footer}>
        <div className={FooterCSS.footerTable}>
            <div>logo</div>
            <div>
                <p>Archive</p>
                <Link href="/">Characters</Link>
                <Link href="/">Artifacts</Link>
                <Link href="/">Weapons</Link>
                <Link href="/">Enemies</Link>
                <Link href="/">Wish</Link>
                <Link href="/">Party</Link>
            </div>

            <div>
                <p>Guides</p>
                <Link href="/">Articles</Link>
                <Link href="/">TeamDPS</Link>
            </div>

            <div>
                <p>Tools</p>
                <Link href="/">Damage Calculator</Link>
                <Link href="/">ER Calculator</Link>
            </div>

            <div>
                <p>Socials</p>
                <Link href="/">Github</Link>
                <Link href="/">Twitter</Link>
                <Link href="/">Discord</Link>
            </div>
        </div>
        <blockquote>© All rights reserved by miHoYo.</blockquote>
    </div>
  )
}
