import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
};

export function ParticleField({ onSpeed }: { onSpeed?: (speed: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    const particles: Particle[] = [];

    // Pointer state
    let targetX = -100;
    let targetY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let prevX = -100;
    let prevY = -100;
    let hasMoved = false;
    let isVisible = false;
    let isHoveringInteractive = false;
    let ringRadius = 12;
    let targetRingRadius = 12;
    let currentSpeed = 0;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const addParticle = (x: number, y: number, speed: number, burst = false) => {
      if (reduce) return;
      const angle = Math.random() * Math.PI * 2;
      const velocity = burst ? Math.random() * 3 + 1.5 : Math.random() * 1.8 + 0.4;
      const life = burst ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.5;

      particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 0.6,
        vy: Math.sin(angle) * velocity + (Math.random() - 0.5) * 0.6,
        life,
        maxLife: life,
        size: Math.random() * 2.5 + 1.5,
        hue: 195 + Math.min(110, speed * 1.5) + (Math.random() - 0.5) * 20,
      });

      if (particles.length > 130) {
        particles.splice(0, particles.length - 130);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      isVisible = true;
      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasMoved) {
        cursorX = targetX;
        cursorY = targetY;
        prevX = targetX;
        prevY = targetY;
        hasMoved = true;
        return;
      }

      // Detect hover over interactive elements
      const target = event.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, textarea, select, [role="button"], [data-interactive="true"]',
        );
        isHoveringInteractive = Boolean(interactive);
      }

      const dx = targetX - prevX;
      const dy = targetY - prevY;
      const distance = Math.hypot(dx, dy);

      // Clamp distance jump to prevent teleport bursts
      const clampedDist = Math.min(distance, 60);
      currentSpeed = Math.min(100, clampedDist * 2.4);
      onSpeed?.(Math.round(currentSpeed));

      // Emit stardust particles along movement path
      const count = isHoveringInteractive
        ? Math.min(4, Math.round(clampedDist / 12) + 1)
        : Math.min(3, Math.round(clampedDist / 14));

      for (let i = 0; i < count; i += 1) {
        addParticle(targetX, targetY, currentSpeed);
      }

      prevX = targetX;
      prevY = targetY;
    };

    const handlePointerDown = (event: PointerEvent) => {
      targetRingRadius = 6;
      for (let i = 0; i < 8; i += 1) {
        addParticle(event.clientX, event.clientY, 80, true);
      }
    };

    const handlePointerUp = () => {
      targetRingRadius = isHoveringInteractive ? 20 : 12;
    };

    const handlePointerLeave = () => {
      isVisible = false;
      onSpeed?.(0);
    };

    const handleScroll = () => {
      // Keep previous coords in sync with viewport so scroll does not register as huge mouse delta
      prevX = targetX;
      prevY = targetY;
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Smooth cursor follower lerp
      cursorX += (targetX - cursorX) * 0.35;
      cursorY += (targetY - cursorY) * 0.35;

      // Smooth ring radius animation
      targetRingRadius = isHoveringInteractive ? 22 : 12;
      ringRadius += (targetRingRadius - ringRadius) * 0.2;

      // Draw stardust particles
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.016;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        const currentRadius = p.size * progress;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 2.6);
        gradient.addColorStop(0, `hsla(${p.hue}, 95%, 72%, ${progress * 0.9})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 90%, 60%, ${progress * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 90%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw custom cursor follower when inside window
      if (isVisible && cursorX > 0 && cursorY > 0) {
        // Outer glowing ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isHoveringInteractive
          ? "rgba(6, 182, 212, 0.85)"
          : "rgba(167, 139, 250, 0.6)";
        ctx.lineWidth = isHoveringInteractive ? 2 : 1.25;
        ctx.shadowColor = isHoveringInteractive ? "#06b6d4" : "#a855f7";
        ctx.shadowBlur = isHoveringInteractive ? 14 : 8;
        ctx.stroke();

        // Inner glowing core dot
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // Velocity decay
      currentSpeed *= 0.94;
      if (currentSpeed < 0.5) currentSpeed = 0;

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [onSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-particle-field pointer-events-none fixed inset-0 z-[120] size-full"
      aria-hidden="true"
    />
  );
}
