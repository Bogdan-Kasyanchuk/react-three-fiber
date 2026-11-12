import { useRef, Suspense, type Ref, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'
import {
    Physics,
    RigidBody,
    type RapierRigidBody,
    BallCollider,
    CuboidCollider,
} from '@react-three/rapier'

function Dice({ bodyRef }: { bodyRef: Ref<RapierRigidBody> }) {
    const options = useMemo(() => {
        return {
            visible: true,
            color: { value: '#fff' },
        }
    }, [])

    const dice = useControls('Dice', options)

    return (
        <RigidBody
            ref={bodyRef}
            colliders={false}
            position={[0, 0.625, 17.5]}
            mass={1}
            restitution={1}
            friction={0}
            linearDamping={0}
            angularDamping={0}
        >
            <BallCollider
                args={[0.625]}
                restitution={1}
                friction={0}
            />

            <mesh
                castShadow
                receiveShadow
                visible={dice.visible}
            >
                <sphereGeometry args={[0.625, 64, 64]} />
                <meshStandardMaterial color={dice.color} />
            </mesh>
        </RigidBody>
    )
}

function Paddle({ getBall }: { getBall: () => RapierRigidBody | undefined }) {
    const bodyRef = useRef<RapierRigidBody>(null!)
    const paddleX = useRef(0)

    const { camera, pointer, raycaster } = useThree()

    const plane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        0
    )

    const intersection = new THREE.Vector3()

    const paddleZ = 18.6
    const paddleHalfWidth = 3
    const ballRadius = 0.625
    const paddleHalfDepth = 0.25

    useFrame(() => {
        if (!bodyRef.current) return

        // Отримуємо точку перетину променя миші з дошкою
        raycaster.setFromCamera(pointer, camera)

        const point = raycaster.ray.intersectPlane(
            plane,
            intersection
        )

        if (!point) return

        // Обмежуємо рух ракетки шириною дошки
        const x = THREE.MathUtils.clamp(
            point.x,
            -16.5,
            16.5
        )

        paddleX.current = x

        bodyRef.current.setNextKinematicTranslation({
            x,
            y: 0,
            z: paddleZ,
        })
    })

    const options = useMemo(() => {
        return {
            visible: true,
            color: { value: 'red' },
        }
    }, [])

    const paddle = useControls('Paddle', options)

    // Відбивання кульки від ракетки
    const handleCollision = () => {
        const ball = getBall()
        if (!ball) return

        const velocity = ball.linvel()

        if (velocity.z <= 0) return

        const ballX = ball.translation().x

        const hitOffset = THREE.MathUtils.clamp(
            (ballX - paddleX.current) / paddleHalfWidth,
            -1,
            1
        )

        const angle = hitOffset * THREE.MathUtils.degToRad(55)

        // Фіксована швидкість
        const speed = 30

        ball.setLinvel({
            x: Math.sin(angle) * speed,
            y: 0,
            z: -Math.cos(angle) * speed,
        }, true)

        ball.setTranslation({
            x: ballX,
            y: 0.625,
            z: paddleZ - paddleHalfDepth - ballRadius - 0.03,
        }, true)

        ball.wakeUp()
    }

    return (
        <RigidBody
            ref={bodyRef}
            type="kinematicPosition"
            colliders={false}
            onIntersectionEnter={handleCollision}
        >
            <CuboidCollider
                args={[paddleHalfWidth, 0.625, paddleHalfDepth]}
                sensor
            />

            <mesh
                position={[0, 0.625, 0]}
                castShadow
                visible={paddle.visible}
            >
                <boxGeometry args={[6, 1.25, 0.5]} />

                <meshStandardMaterial
                    color={paddle.color}
                    roughness={0.3}
                />
            </mesh>
        </RigidBody>
    )
}

export default function Game() {
    const bodyRefs = useRef<Array<RapierRigidBody | undefined>>([])

    const getBodies = () =>
        bodyRefs.current.filter(Boolean) as RapierRigidBody[]

    const getBall = () => bodyRefs.current[0]

    const rollDice = () => {
        const bodies = getBodies()
        if (!bodies.length) return

        bodies.forEach((body) => {
            body.setTranslation(
                { x: 0, y: 0.625, z: 17.5 },
                true
            )

            body.setRotation(
                { x: 0, y: 0, z: 0, w: 1 },
                true
            )

            body.setLinvel(
                { x: 0, y: 0, z: 0 },
                true
            )

            body.setAngvel(
                { x: 0, y: 0, z: 0 },
                true
            )

            body.wakeUp()

            // Випадковий початковий кут
            const angle = (Math.random() - 0.5) * THREE.MathUtils.degToRad(40)

            const speed = 30

            body.setLinvel({
                x: Math.sin(angle) * speed,
                y: 0,
                z: -Math.cos(angle) * speed,
            }, true)
        })
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                camera={{
                    position: [0, 60, 0],
                    fov: 50,
                    // near: 0.1,
                    // far: 200,
                }}
            // onCreated={({ camera }) => {
            //     camera.up.set(0, 0, -1)
            //     camera.lookAt(0, 0, 0)
            // }}
            >
                <color attach="background" args={['#333']} />

                <ambientLight intensity={2} />

                <Suspense fallback={null}>
                    <Physics gravity={[0, -9.81, 0]}>
                        {
                            [1].map((_, index) => (
                                <Dice
                                    key={index}
                                    bodyRef={(el) => {
                                        bodyRefs.current[index] = el ?? undefined
                                    }}
                                />
                            ))
                        }

                        <Paddle getBall={getBall} />

                        <RigidBody
                            type="fixed"
                            restitution={0}
                            friction={0}
                        >
                            <mesh position={[0, -0.25, 0]}>
                                <boxGeometry args={[40, 0.5, 40]} />
                                <meshStandardMaterial color="#414750" />
                            </mesh>
                        </RigidBody>

                        <RigidBody
                            type="fixed"
                            restitution={1}
                            friction={0}
                        >
                            <mesh position={[-19.75, 5, 0]}>
                                <boxGeometry args={[0.5, 10, 40]} />
                                <meshStandardMaterial color="#d79819" />
                            </mesh>
                        </RigidBody>

                        <RigidBody
                            type="fixed"
                            restitution={1}
                            friction={0}
                        >
                            <mesh position={[19.75, 5, 0]}>
                                <boxGeometry args={[0.5, 10, 40]} />
                                <meshStandardMaterial color="#d79819" />
                            </mesh>
                        </RigidBody>

                        <RigidBody
                            type="fixed"
                            restitution={1}
                            friction={0}
                        >
                            <mesh position={[0, 5, -19.75]}>
                                <boxGeometry args={[40, 10, 0.5]} />
                                <meshStandardMaterial color="#d79819" />
                            </mesh>
                        </RigidBody>
                    </Physics>
                </Suspense>

                <OrbitControls />

                <axesHelper args={[20]} />

                <gridHelper args={[50, 50, 'orange', 'teal']} />
            </Canvas>

            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '20px',
                    pointerEvents: 'none'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
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
                            fontSize: 14
                        }}
                    >
                        Старт
                    </button>
                </div>
            </div>

            <Leva collapsed />
        </div>
    )
}
