import { notFound } from 'next/navigation'
import MissionBook from '../../../src/components/map/MissionBook.jsx'
import missions from '../../../src/data/missions.json'

export default async function MissionPage({ params }) {
 const { id } = await params
 if (!missions.some(mission => mission.id === id && mission.unlocked)) notFound()
 return <MissionBook />
}
