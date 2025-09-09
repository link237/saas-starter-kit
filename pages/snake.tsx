import { useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 20;
    let snake: Point[] = [{ x: 8, y: 8 }];
    let food: Point = { x: 12, y: 12 };
    let dx = 1;
    let dy = 0;
    let interval: ReturnType<typeof setInterval>;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw food
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

      // Draw snake
      ctx.fillStyle = 'green';
      snake.forEach((segment) => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
      });
    };

    const placeFood = () => {
      food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize)),
      };

      if (snake.some((s) => s.x === food.x && s.y === food.y)) {
        placeFood();
      }
    };

    const update = () => {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y >= canvas.height / gridSize ||
        snake.some((seg) => seg.x === head.x && seg.y === head.y)
      ) {
        setGameOver(true);
        clearInterval(interval);
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 1);
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (dy !== 1) {
            dx = 0;
            dy = -1;
          }
          break;
        case 'ArrowDown':
          if (dy !== -1) {
            dx = 0;
            dy = 1;
          }
          break;
        case 'ArrowLeft':
          if (dx !== 1) {
            dx = -1;
            dy = 0;
          }
          break;
        case 'ArrowRight':
          if (dx !== -1) {
            dx = 1;
            dy = 0;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    draw();
    interval = setInterval(update, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-8">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-gray-300 bg-white"
      />
      <div className="mt-2">
        {gameOver ? <p>Game Over - Score: {score}</p> : <p>Score: {score}</p>}
      </div>
    </div>
  );
}

