import { useGLTF } from '@react-three/drei'
import type { ObjectMap } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import modelUrl from '@/assets/models/Poimandres.gltf?url'

type GLTFResult = ObjectMap & {
    nodes: {
        Curve007_1: Mesh
        Curve007_2: Mesh
    }
    materials: {
        'Material.001': MeshStandardMaterial
        'Material.002': MeshStandardMaterial
    }
}

export default function Model() {
    const { nodes, materials } = useGLTF(modelUrl) as unknown as GLTFResult
    return (
        <group dispose={null} position={[0, -2.66, 0]}>
            <mesh castShadow receiveShadow geometry={nodes.Curve007_1.geometry} material={materials['Material.001']} />
            <mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />
        </group>
    )
}

useGLTF.preload(modelUrl)