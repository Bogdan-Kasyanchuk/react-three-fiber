// import { Suspense } from "react"
// import { Canvas } from "@react-three/fiber"
// import Box from "./components/Box"
// import Model from "./components/Model"
// import { Environment, OrbitControls } from "@react-three/drei"
// import Loader from "./components/Loader"

// export default function App() {
//     return (
//         <>
//             <Canvas>
//                 <ambientLight intensity={Math.PI / 2} />
//                 <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
//                 <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
//                 <Box position={[-1.2, 0, 0]} />
//                 <Box position={[1.2, 0, 0]} />

//                 <Suspense fallback={null}>
//                     <Model />
//                     <OrbitControls />
//                     <Environment preset="sunset" background />
//                 </Suspense>
//             </Canvas>
//             <Loader />
//         </>
//     )
// }


'use client'

import { useRef, useState, Suspense, type Ref } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, RoundedBox } from '@react-three/drei'
import {
    Physics,
    RigidBody,
    CuboidCollider,
    type RapierRigidBody,
} from '@react-three/rapier'
import * as THREE from 'three'

const DOT_PATTERNS: Record<number, number[][]> = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [
        [-1, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [1, 1],
    ],
}

// Локальна вісь +Z кожної грані повертається назовні
const FACES = [
    { value: 1, position: [0, 0, 0.49], rotation: [0, 0, 0] },
    { value: 6, position: [0, 0, -0.49], rotation: [0, Math.PI, 0] },
    { value: 2, position: [0.49, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { value: 5, position: [-0.49, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { value: 3, position: [0, 0.49, 0], rotation: [-Math.PI / 2, 0, 0] },
    { value: 4, position: [0, -0.49, 0], rotation: [Math.PI / 2, 0, 0] },
]

function DiceFace({ value }: { value: number }) {
    return (
        <group>
            {DOT_PATTERNS[value].map(([x, y], index) => (
                <mesh
                    key={index}
                    position={[x * 0.17, y * 0.17, 0.025]}
                >
                    <sphereGeometry args={[0.055, 20, 20]} />
                    <meshStandardMaterial
                        color="#171717"
                        roughness={0.3}
                    />
                </mesh>
            ))}
        </group>
    )
}

function Dice({
    bodyRef,
    onSleep,
}: {
    bodyRef: Ref<RapierRigidBody>
    onSleep: () => void
}) {
    return (
        <RigidBody
            ref={bodyRef}
            colliders={false}
            position={[0, 2, 0]}
            mass={1}
            restitution={0.25}
            friction={0.7}
            linearDamping={0.3}
            angularDamping={0.5}
            scale={0.75}
            onSleep={onSleep}
        >
            <CuboidCollider args={[0.46, 0.46, 0.46]} />

            <RoundedBox
                args={[1, 1, 1]}
                radius={0.1}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="#f4f0e8"
                    roughness={0.25}
                    metalness={0}
                />
            </RoundedBox>

            {FACES.map((face) => (
                <group
                    key={face.value}
                    position={face.position as [number, number, number]}
                    rotation={face.rotation as [number, number, number]}
                >
                    <DiceFace value={face.value} />
                </group>
            ))}
        </RigidBody>
    )
}

function getDiceResult(body: RapierRigidBody): number {
    const rotation = body.rotation()

    const quaternion = new THREE.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
    )

    const faces = [
        { value: 1, normal: [0, 0, 1] },
        { value: 6, normal: [0, 0, -1] },
        { value: 2, normal: [1, 0, 0] },
        { value: 5, normal: [-1, 0, 0] },
        { value: 3, normal: [0, 1, 0] },
        { value: 4, normal: [0, -1, 0] },
    ]

    let bestValue = 1
    let bestDot = -Infinity

    for (const face of faces) {
        const normal = new THREE.Vector3(...face.normal)
            .applyQuaternion(quaternion)

        if (normal.y > bestDot) {
            bestDot = normal.y
            bestValue = face.value
        }
    }

    return bestValue
}

export default function DiceScene() {
    const bodyRefs = useRef<Array<RapierRigidBody | undefined>>([])
    const [result, setResult] = useState<number | null>(null)

    // Лише змонтовані тіла, без «дірок» від розмонтованих кубиків
    const getBodies = () => bodyRefs.current.filter(Boolean) as RapierRigidBody[]

    const rollDice = () => {
        const bodies = getBodies()
        if (!bodies.length) return

        setResult(null)

        bodies.forEach((body) => {
            body.setTranslation({ x: 0, y: 2, z: 0 }, true)
            body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
            body.setLinvel({ x: 0, y: 0, z: 0 }, true)
            body.setAngvel({ x: 0, y: 0, z: 0 }, true)
            body.wakeUp()

            // Імпульс кидка
            body.applyImpulse({
                x: (Math.random() - 0.5) * 3,
                y: 3 + Math.random() * 2,
                z: (Math.random() - 0.5) * 3,
            }, true)

            // Випадкове обертання
            body.applyTorqueImpulse({
                x: (Math.random() - 0.5) * 1,
                y: (Math.random() - 0.5) * 1,
                z: (Math.random() - 0.5) * 1,
            }, true)
        })
        // Повертаємо кубик у початкову позицію
    }

    const handleSleep = () => {
        const bodies = getBodies()
        if (!bodies.length) return

        let count = 0

        bodies.forEach((body) => {
            count += getDiceResult(body)
        })

        setResult(count)
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [18, 18, 18], fov: 50 }}>
                <color attach="background" args={['#20242c']} />

                <ambientLight intensity={1.5} />

                <directionalLight
                    position={[3, 6, 4]}
                    intensity={3}
                    castShadow
                />

                <Suspense fallback={null}>
                    <Physics gravity={[0, -9.81, 0]}>
                        {[1, 2].map((_, index) => (
                            <Dice
                                key={index}
                                bodyRef={(el) => {
                                    bodyRefs.current[index] = el ?? undefined
                                }}
                                onSleep={handleSleep}
                            />
                        ))}

                        {/* Стіл */}
                        <RigidBody type="fixed" colliders={false}>
                            <CuboidCollider
                                position={[0, -0.25, 0]}
                                args={[20, 0.25, 20]}
                            />

                            <mesh
                                position={[0, -0.25, 0]}
                                receiveShadow
                            >
                                <boxGeometry args={[40, 0.5, 40]} />
                                <meshStandardMaterial color="#414750" />
                            </mesh>
                        </RigidBody>
                    </Physics>
                    <OrbitControls />
                </Suspense>
            </Canvas>

            <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    pointerEvents: 'none',
                }}
            >
                <div style={{ color: 'white', fontSize: 20 }}>
                    {result !== null ? `Результат: ${result}` : 'Кидай кубик!'}
                </div>

                <button
                    onClick={rollDice}
                    style={{
                        pointerEvents: 'auto',
                        padding: '12px 28px',
                        borderRadius: 8,
                        border: 0,
                        background: '#f4f0e8',
                        color: '#171717',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Кинути кубик
                </button>
            </div>
        </div>
    )
}
