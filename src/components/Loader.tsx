import { useProgress } from '@react-three/drei'

// Звичайний DOM-оверлей поза Canvas: <Html> з drei губить вміст при першому монтуванні
export default function Loader() {
    const { active, progress } = useProgress()
    if (!active) {
        return null
    }
    return <div className="loader">{progress.toFixed(0)} % loaded</div>
}
