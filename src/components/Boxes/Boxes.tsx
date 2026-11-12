import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Box from "./Box"

export default function Boxes() {
    return (
        <Canvas
            camera={{
                position: [5, 5, 8],
                fov: 45,
            }}
        >
            <color attach="background" args={['#555']} />

            <OrbitControls />

            <ambientLight
                intensity={0.5}
            />

            <mesh position={[-4, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshToonMaterial
                    color="orange"
                />
            </mesh>

            <mesh position={[-2, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={0x00ff00} />
            </mesh>

            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={0x00ff00} wireframe />
            </mesh>

            <Box position={[2, 0, 0]} />

            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[20, 0, 20]} />
                <meshStandardMaterial
                    color="#777777"
                    roughness={0.8}
                />
            </mesh>
        </Canvas>
    )
}
