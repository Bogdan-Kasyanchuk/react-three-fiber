import { useProgress } from '@react-three/drei'

export default function Loader() {
    const { active, progress } = useProgress()

    if (!active) {
        return null
    }

    return <div className="loader">{progress.toFixed(0)} % loaded</div>
}
