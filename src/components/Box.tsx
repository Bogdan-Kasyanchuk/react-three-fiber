import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'

export default function Box(props: ThreeElements['mesh']) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    useFrame((_, delta) => (meshRef.current.rotation.x += delta))
    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={() => setActive(!active)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial attach="material-0" color="red" />
            <meshStandardMaterial attach="material-1" color="green" />
            <meshStandardMaterial attach="material-2" color="blue" />
            <meshStandardMaterial attach="material-3" color="yellow" />
            <meshStandardMaterial attach="material-4" color="orange" />
            <meshStandardMaterial attach="material-5" color="purple" />
            {/* <meshStandardMaterial color={hovered ? 'hotpink' : '#2f74c0'} /> */}
        </mesh>
    )
}