import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import missions from '../data/missions.json'

export default function LunarScene({ onMission }) {
 return <div className="globe"><Canvas camera={{ position: [0, 0, 3.3], fov: 42 }}><ambientLight intensity={0.55}/><directionalLight position={[3, 4, 4]} intensity={2.4}/><Stars radius={50} depth={20} count={650} factor={2}/><group><mesh><sphereGeometry args={[1, 64, 64]}/><meshStandardMaterial color="#b2b3af" roughness={1}/></mesh>{Array.from({ length: 36 }, (_, index) => { const angle = index * 2.4; const vertical = -0.9 + index / 20; const radius = Math.sqrt(1 - Math.min(0.97, vertical * vertical)); return <mesh key={index} position={[Math.sin(angle)*radius, vertical, Math.cos(angle)*radius]}><sphereGeometry args={[0.045 + (index%4)*0.02, 12, 12]}/><meshStandardMaterial color="#888b87" roughness={1}/></mesh> })}{missions.map(mission => <mesh key={mission.id} position={mission.position.map(value => value * 1.08)} onClick={event => { event.stopPropagation(); onMission(mission) }}><sphereGeometry args={[0.06, 16, 16]}/><meshStandardMaterial color="#f3be6d" emissive="#eea64b" emissiveIntensity={2}/></mesh>)}</group><OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35}/></Canvas></div>
}
