import '../src/index.css'
import { Fredoka, Nunito, Patrick_Hand } from 'next/font/google'

const mapDisplay = Fredoka({ subsets: ['latin'], weight: ['600', '700'], variable: '--map-display-font' })
const mapBody = Nunito({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--map-body-font' })
const coverHand = Patrick_Hand({ subsets: ['latin'], weight: '400', variable: '--cover-hand-font' })

export const metadata = { title: 'Abandoned but Not Forgotten · Space Logbook', description: 'A gentle lunar adventure for curious explorers.' }
export default function Layout({ children }) { return <html lang="en"><body className={`${mapDisplay.variable} ${mapBody.variable} ${coverHand.variable}`}>{children}</body></html> }
