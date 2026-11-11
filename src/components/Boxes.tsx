import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"

import { Environment, OrbitControls } from "@react-three/drei"
import Model from "./Model"
import Box from "./Box"
import Loader from "./Loader"


export default function Boxes() {
    return (
        <>
            <Canvas>
                <ambientLight intensity={Math.PI / 2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                <Box position={[-1.2, 0, 0]} />
                <Box position={[1.2, 0, 0]} />

                <Suspense fallback={null}>
                    <Model />
                    <OrbitControls />
                    <Environment preset="sunset" background />
                </Suspense>
            </Canvas>
            <Loader />
        </>
    )
}
