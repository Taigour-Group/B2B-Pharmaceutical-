import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
export const CartFlyAnimation = ({ instances, onComplete }) => {
    // Check prefers-reduced-motion
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const listener = (e) => setReducedMotion(e.matches);
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, []);
    if (reducedMotion || instances.length === 0) {
        return null;
    }
    return (<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {instances.map(inst => (<SingleFlyingCart key={inst.id} instance={inst} onFinish={() => onComplete(inst.id)}/>))}
    </div>);
};
const SingleFlyingCart = ({ instance, onFinish, }) => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let start = null;
        const duration = 600; // ms: fast and snappy
        const step = (timestamp) => {
            if (!start)
                start = timestamp;
            const elapsed = timestamp - start;
            const p = Math.min(elapsed / duration, 1);
            setProgress(p);
            if (p < 1) {
                requestAnimationFrame(step);
            }
            else {
                setTimeout(onFinish, 40);
            }
        };
        const animId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animId);
    }, [onFinish]);
    // Cubic bezier easing for high-velocity acceleration and crisp arrival
    // Using easeOutBack or smooth acceleration:
    const easeProgress = Math.min(1, Math.pow(progress, 1.2));
    // Bezier curve with slight arch trajectory:
    const currentX = instance.startX + (instance.endX - instance.startX) * easeProgress;
    const directY = instance.startY + (instance.endY - instance.startY) * easeProgress;
    // Parabolic upward arc in mid-flight (-60px at peak)
    const arcOffsetY = -Math.sin(easeProgress * Math.PI) * 70;
    const currentY = directY + arcOffsetY;
    // Calculate angle of flight for natural forward tilt:
    const angle = Math.atan2(instance.endY - instance.startY, instance.endX - instance.startX) * (180 / Math.PI);
    const tilt = Math.max(-25, Math.min(25, angle * 0.4));
    // Wind trail opacity & length increases at middle velocity:
    const trailOpacity = Math.sin(progress * Math.PI);
    const scale = 1 + Math.sin(progress * Math.PI) * 0.25;
    return (<div style={{
            position: 'absolute',
            left: `${currentX}px`,
            top: `${currentY}px`,
            transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${scale})`,
            opacity: progress > 0.85 ? (1 - progress) / 0.15 : 1,
            transition: 'none',
        }} className="relative flex items-center justify-center">
      {/* High-speed wind streaks and particle trail */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end pointer-events-none" style={{ opacity: trailOpacity }}>
        <span className="h-[2px] rounded-full bg-cyan-400 blur-[0.5px]" style={{ width: `${32 + progress * 24}px` }}/>
        <span className="h-[2.5px] rounded-full bg-blue-500 blur-[0.5px]" style={{ width: `${44 + progress * 30}px`, marginRight: '-4px' }}/>
        <span className="h-[1.5px] rounded-full bg-teal-300 blur-[0.5px]" style={{ width: `${28 + progress * 20}px` }}/>
      </div>

      {/* Speed lines / motion halo */}
      <div className="absolute inset-0 -m-2 rounded-full bg-cyan-500/20 blur-sm pointer-events-none" style={{ opacity: trailOpacity }}/>

      {/* Flying Shopping Cart Icon */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white shadow-xl shadow-cyan-500/30 ring-2 ring-white">
        <ShoppingCart className="h-5 w-5"/>
        {/* Tiny medicine cross indicator */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow">
          +
        </span>
      </div>
    </div>);
};
