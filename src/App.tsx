// import Boxes from "./components/Boxes";
// import GameDice from "./components/GameDice";
import { Canvas } from "@react-three/fiber";
import Mesh from "./components/Mesh";
import { OrbitControls } from "@react-three/drei";

export default function App() {
    return (
        <>
            {/* <Boxes /> */}
            {/* <GameDice /> */}
            {/* <Mesh /> */}
            <Canvas camera={{ position: [0, 0, 2] }}>
                <OrbitControls />

                <mesh>
                    <boxGeometry />
                    <meshBasicMaterial color={0x00ff00} wireframe/>
                </mesh>
            </Canvas>
        </>
    )
}

