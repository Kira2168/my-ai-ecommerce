"use client";
import { useEffect, useRef } from "react";

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: any[] = [];
    const mouse = { x: -1000, y: -1000, radius: 150 };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          color: "#ff0000",
          // Free movement velocity
          vx: (Math.random() - 0.5) * 0.5, 
          vy: (Math.random() - 0.5) * 0.5,
          // Momentum for mouse interaction
          ax: 0, 
          ay: 0
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // 1. Mouse Dispersion Physics
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let angle = Math.atan2(dy, dx);
          // Push particles away from mouse
          p.ax -= Math.cos(angle) * force * 0.5;
          p.ay -= Math.sin(angle) * force * 0.5;
        }

        // 2. Apply Physics
        p.vx += p.ax;
        p.vy += p.ay;
        
        // Constant speed limit + friction for mouse acceleration
        p.vx *= 0.95; 
        p.vy *= 0.95;
        
        // Basic drift speed (ensures they never stop moving)
        p.x += p.vx + (p.vx > 0 ? 0.2 : -0.2);
        p.y += p.vy + (p.vy > 0 ? 0.2 : -0.2);

        // Reset acceleration
        p.ax = 0; p.ay = 0;

        // 3. Wrap Around Screen logic
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // 4. Draw
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#ff0000";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset blur for performance
      });
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", init);
    init(); animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}