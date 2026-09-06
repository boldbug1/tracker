import { useEffect, useRef } from "react";

const getQuadraticBezierPath = (points: { x: number; y: number }[]) => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}, ${xc.toFixed(2)} ${yc.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
};

export default function MouseFollowStroke() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const numPoints = 25;
  const points = useRef<{ x: number; y: number }[]>([]);
  const mouse = useRef({ x: 0, y: 0, active: false });
  const initializedRef = useRef(false);
  const frameRef = useRef<number>(0);
  const opacityRef = useRef(0);

  useEffect(() => {
    // Accessibility check: Reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    // Accessibility check: Touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const parent = svgRef.current?.parentElement;
    if (!parent) return;

    // We only initialize the array once to avoid garbage collection churn
    points.current = Array.from({ length: numPoints }, () => ({ x: 0, y: 0 }));

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;

      if (!initializedRef.current) {
        // Teleport all points to the initial mouse position
        points.current.forEach(p => {
          p.x = mouse.current.x;
          p.y = mouse.current.y;
        });
        initializedRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.current.active = false;
    };

    const handleMouseEnter = () => {
      mouse.current.active = true;
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("mouseenter", handleMouseEnter);

    const tick = () => {
      if (!pathRef.current || !initializedRef.current) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const pnts = points.current;

      // Head point eases towards the actual mouse
      pnts[0].x += (mouse.current.x - pnts[0].x) * 0.45;
      pnts[0].y += (mouse.current.y - pnts[0].y) * 0.45;

      let totalDist = 0;
      // Remaining points follow their preceding point
      for (let i = 1; i < numPoints; i++) {
        const prev = pnts[i - 1];
        const curr = pnts[i];
        
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        
        totalDist += Math.sqrt(dx * dx + dy * dy);

        curr.x += dx * 0.5;
        curr.y += dy * 0.5;
      }

      // Determine target opacity based on activity and movement
      let targetOpacity = 0;
      if (mouse.current.active) {
        // If moving, show the stroke. If settled, gracefully fade it out.
        if (totalDist > 2) {
          targetOpacity = 0.3; // Subtle, elegant opacity
        } else {
          targetOpacity = 0;
        }
      }

      // Smoothly interpolate opacity
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.08;

      if (opacityRef.current > 0.01) {
        pathRef.current.setAttribute("d", getQuadraticBezierPath(pnts));
        pathRef.current.style.opacity = opacityRef.current.toString();
      } else {
        pathRef.current.style.opacity = "0";
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ overflow: "hidden" }}
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0, transition: "none" }}
      />
    </svg>
  );
}
