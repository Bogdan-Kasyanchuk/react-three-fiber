import { useRef, useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Position = {
    x: number,
    z: number
}

type Direction = 'up' | 'down' | 'left' | 'right';

const DIRS: Record<Direction, Position> = {
    up: { x: 0, z: -1 },
    down: { x: 0, z: 1 },
    left: { x: -1, z: 0 },
    right: { x: 1, z: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
};

const KEY_MAP: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

const INIT_SNAKE = [
    { x: 0, z: 0 },
    { x: -1, z: 0 },
    { x: -2, z: 0 }
];

const INIT_FOOD = { x: -7, z: -7 }

const GRID_SIZE = 20;

const HALF_GRID = GRID_SIZE / 2;

const TICK = 0.2;

const same = (a: Position, b: Position) => a.x === b.x && a.z === b.z;

function randomFood(snake: Position[]): Position {
    const free: Position[] = [];

    for (let x = 0; x < HALF_GRID; x++) {
        for (let z = 0; z < HALF_GRID; z++) {
            if (!snake.some(s => s.x === x && s.z === z)) {
                free.push({ x, z });
            }
        }
    }

    return free[Math.floor(Math.random() * free.length)];
}

function Segment({
    position,
    isHead
}: {
    position: Position,
    isHead: boolean
}) {
    const color = isHead ? '#d2d52e' : '#7BED9F';

    return (
        <mesh
            position={[position.x + 0.5, 0.45, position.z + 0.5]}
            castShadow
        >
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Food({ position }: { position: Position }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame(() => {
        if (!meshRef.current) {
            return
        }

        meshRef.current.rotation.y += 0.05
    })

    return (
        <mesh
            ref={meshRef}
            position={[position.x + 0.5, 0.45, position.z + 0.5]}
            castShadow
        >
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshStandardMaterial color='#ff4757' />
        </mesh>
    )
}

function Snake({
    snake,
    food,
    score,
    isGameOver,
    setSnake,
    setFood,
    setScore,
    setIsGameOver,
    resetGame
}: {
    snake: Array<Position>,
    food: Position,
    score: number,
    isGameOver: boolean,
    setSnake: Dispatch<SetStateAction<Position[]>>,
    setFood: Dispatch<SetStateAction<Position>>,
    setScore: Dispatch<SetStateAction<number>>,
    setIsGameOver: Dispatch<SetStateAction<boolean>>
    resetGame: () => void
}) {
    const direction = useRef<Direction>('right');
    const queue = useRef<Direction[]>([]);
    const elapsed = useRef(0);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isGameOver) {
                return resetGame()
            };

            const next = KEY_MAP[e.code];

            if (!next) {
                return
            }

            e.preventDefault();

            const last = queue.current.at(-1) ?? direction.current;

            if (next === last || next === OPPOSITE[last]) {
                return
            };

            if (queue.current.length < 2) {
                queue.current.push(next)
            };
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isGameOver]);

    useFrame((_, delta) => {
        if (isGameOver) {
            return
        };

        elapsed.current += Math.min(delta, TICK);

        if (elapsed.current < TICK) {
            return
        };

        elapsed.current -= TICK;

        const dir = queue.current.shift() ?? direction.current;

        direction.current = dir;

        const head = snake[0];

        const newHead = { x: head.x + DIRS[dir].x, z: head.z + DIRS[dir].z }

        if (
            newHead.x < -HALF_GRID || newHead.x >= HALF_GRID ||
            newHead.z < -HALF_GRID || newHead.z >= HALF_GRID
        ) {
            setIsGameOver(true);

            return;
        }

        const ate = same(newHead, food);

        const body = ate ? snake : snake.slice(0, -1);

        if (body.some(s => same(s, newHead))) {
            setIsGameOver(true);

            return;
        }

        const next = [newHead, ...body];

        setSnake(next);

        if (ate) {
            setFood(randomFood(next))

            setScore(score += 10)
        };
    });

    return (
        <>
            {
                snake.map(({ x, z }, index) => (
                    <Segment
                        key={`${x}-${z}`}
                        position={{ x, z }}
                        isHead={index === 0}
                    />
                ))
            }

            <Food position={food} />
        </>
    )
}

export default function SnakeGame() {
    const [snake, setSnake] = useState<Array<Position>>(INIT_SNAKE)
    const [food, setFood] = useState<Position>(INIT_FOOD)
    const [score, setScore] = useState<number>(0)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)

    const resetGame = () => {
        setSnake(INIT_SNAKE)
        setFood(INIT_FOOD)
        setScore(0)
        setIsGameOver(false)
    };

    return (
        <div className='snake-container'>
            <Canvas
                camera={{
                    fov: 60,
                    near: 0.1,
                    far: 1000,
                    position: [0, 18, 16],
                }}
                shadows
                gl={{
                    antialias: true,
                }}
            >
                <color attach="background" args={['#1E272E']} />

                <ambientLight
                    intensity={0.5}
                    color={'#fff'}
                />

                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1}
                    color={'#fff'}
                    castShadow
                />

                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial color={"#2F3542"} />
                </mesh>

                <gridHelper
                    args={[GRID_SIZE, GRID_SIZE, '#57606F', '#3D4452']}
                    position={[0, 0.01, 0]}
                />

                <Snake
                    snake={snake}
                    food={food}
                    score={score}
                    isGameOver={isGameOver}
                    setSnake={setSnake}
                    setFood={setFood}
                    setScore={setScore}
                    setIsGameOver={setIsGameOver}
                    resetGame={resetGame}
                />
            </Canvas>

            <div className="snake-ui">Рахунок: {score}</div>

            {
                isGameOver &&
                <div className="snake-gameover">
                    Гру закінчено!<br />
                    <button
                        className='snake-button'
                        onClick={
                            () => {
                                resetGame()
                            }
                        }
                    >
                        Грати знову
                    </button>
                </div>
            }
        </div >
    )
}
