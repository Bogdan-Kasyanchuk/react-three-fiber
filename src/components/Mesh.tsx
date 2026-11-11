import { OrbitControls, SpotLight } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { useControls } from "leva";
import * as THREE from 'three'
import img1 from '@/assets/img/1.jpg'
import img2 from '@/assets/img/2.jpg'
import img3 from '@/assets/img/3.jpg'
import img4 from '@/assets/img/4.jpg'
import img5 from '@/assets/img/5.jpg'
import img6 from '@/assets/img/6.jpg'

const colors = ['red', 'blue', 'green'];
const images = [img1, img2, img3, img4, img5, img6];

const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
const randomImgIdx = () => Math.floor(Math.random() * images.length);

const Boxes = () => {
    const meshRef = useRef<THREE.Mesh>(null!)

    const count = 5;

    useFrame((_, delta) => {
        meshRef.current.rotation.x += delta
    })

    const textures = useLoader(THREE.TextureLoader, [
        img1,
        img2,
        img3,
        img4,
        img5,
        img6,
    ]);


    const renderInstances = () => {
        const items = [];
        const start = -count / 2;
        const finish = count / 2;

        for (let i = start; i < finish; i++) {
            for (let j = start; j < finish; j++) {
                for (let k = start; k < finish; k++) {
                    const imgIdx = randomImgIdx()

                    items.push(
                        <mesh
                            key={`${i}-${j}-${k}`}
                            position={[i * 30, j * 30, k * 30]}
                        >
                            <boxGeometry args={[20, 20, 20]} />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-0" />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-1" />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-2" />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-3" />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-4" />
                            <meshStandardMaterial map={textures[imgIdx]} attach="material-5" />
                            {/* <meshBasicMaterial
                                map={t1}
                                attach='material'
                                color={randomColor()}
                            /> */}
                        </mesh>
                    );
                }
            }
        }

        return items;
    };

    return (
        <mesh ref={meshRef}>
            {renderInstances()}
        </mesh>
    );
};

const SPOTLIGHT_DISTANCE = 450;

const Mesh = () => {
    const {
        angle,
        penumbra,
        intensity,
        positionX,
        positionY,
        positionZ,
        color,
    } = useControls({
        angle: { value: 1, min: 0.05, max: 1.4, step: 0.01 },
        penumbra: { value: 0.5, min: 0, max: 1, step: 0.01 },
        intensity: { value: 10, min: 0, max: 30, step: 0.1 },
        positionX: { value: 150, min: -300, max: 300, step: 1 },
        positionY: { value: 220, min: -300, max: 300, step: 1 },
        positionZ: { value: 120, min: -300, max: 300, step: 1 },
        color: '#d01616',
    });

    return (
        <Canvas camera={{ position: [200, 200, 200], fov: 75 }}>
            <color attach="background" args={['#000']} />
            <SpotLight
                position={[positionX, positionY, positionZ]}
                angle={angle}
                penumbra={penumbra}
                intensity={intensity}
                decay={0}
                distance={SPOTLIGHT_DISTANCE}
                radiusTop={2}
                radiusBottom={SPOTLIGHT_DISTANCE * Math.tan(angle)}
                attenuation={300}
                anglePower={5}
                opacity={0.35}
                color={color}
            />
            <Boxes />
            <OrbitControls />
        </Canvas>
    );
};

export default Mesh;