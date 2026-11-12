import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"

import { Environment, OrbitControls } from "@react-three/drei"
import Model from "./Model"
import Loader from "./Loader"


export default function Tour() {
    return (
        <>
            <Canvas>
                <OrbitControls />

                <Suspense fallback={null}>
                    <Model />
                    <Environment preset='sunset' background />
                </Suspense>
            </Canvas>

            <Loader />
        </>
    )
}
