import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'

export default function Box(props: ThreeElements['mesh']) {
    const meshRef = useRef<THREE.Mesh>(null!)

    const [active, setActive] = useState(false)

    useFrame((_, delta) => (meshRef.current.rotation.x += delta))

    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={
                () => {
                    setActive(!active)
                }
            }
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshLambertMaterial attach="material-0" color="red" />
            <meshLambertMaterial attach="material-1" color="green" />
            <meshLambertMaterial attach="material-2" color="blue" />
            <meshLambertMaterial attach="material-3" color="yellow" />
            <meshLambertMaterial attach="material-4" color="orange" />
            <meshLambertMaterial attach="material-5" color="purple" />
        </mesh>
    )
}