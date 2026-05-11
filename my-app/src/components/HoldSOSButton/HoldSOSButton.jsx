import React, { useState, useEffect, useRef } from 'react';

const HoldSOSButton = ({ onActivate }) => {
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const duration = 1500; // 1.5 seconds hold

    const startHold = () => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min((elapsed / duration) * 100, 100);
            setProgress(p);

            if (p >= 100) {
                clearInterval(timerRef.current);
                onActivate();
                setProgress(0);
            }
        }, 16); // ~60fps
    };

    const stopHold = () => {
        clearInterval(timerRef.current);
        setProgress(0);
    };

    return (
        <button 
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="relative bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/40 transition-all transform hover:scale-105 active:scale-95 overflow-hidden group"
        >
            <span className="relative z-10">SOS</span>
            {/* Progress Overlay */}
            <div 
                className="absolute left-0 bottom-0 top-0 bg-white/30 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
            ></div>
            
            {/* Pulsing Glow when holding */}
            {progress > 0 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
        </button>
    );
};

export default HoldSOSButton;
