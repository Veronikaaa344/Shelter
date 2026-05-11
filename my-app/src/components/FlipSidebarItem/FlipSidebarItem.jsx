import React from 'react';
import { ChevronLeft, LayoutGrid } from 'lucide-react';

/**
 * FlipSidebarItem - A reusable 3D flipping sidebar button component.
 * 
 * @param {string} id - Unique identifier for the item.
 * @param {React.ReactNode} icon - Icon element for the front face.
 * @param {string} label - Text label for the front face.
 * @param {boolean} isDashboard - If true, the back face shows a "Back" button.
 * @param {number} index - Position index for staggered animation delays.
 * @param {boolean} isSpecialMode - If true, triggers the flip animation.
 * @param {string} currentView - The currently active view ID.
 * @param {function} onClickAction - Function called when front face is clicked.
 * @param {function} onBackAction - Function called when back face (if isDashboard) is clicked.
 */
const FlipSidebarItem = ({ 
    id, 
    icon, 
    label, 
    isDashboard = false, 
    index = 0, 
    isSpecialMode = false, 
    currentView = '', 
    onClickAction = () => {}, 
    onBackAction = () => {} 
}) => {
  const isFlipped = isSpecialMode;
  const isActive = currentView === id && !isSpecialMode;

  // Stagger the flip animation based on index
  const baseDelay = isFlipped ? index * 0.1 : (5 - index) * 0.1;

  const wrapperStyle = {
    perspective: '1200px',
    transition: `height 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.4 : baseDelay}s, opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.3 : baseDelay}s, margin-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${isFlipped && !isDashboard ? baseDelay + 0.4 : baseDelay}s`,
    height: isFlipped && !isDashboard ? '0px' : '56px',
    opacity: isFlipped && !isDashboard ? 0 : 1,
    marginBottom: isFlipped && !isDashboard ? '0px' : '12px',
    pointerEvents: isFlipped && !isDashboard ? 'none' : 'auto',
    position: 'relative',
    zIndex: 10 - index
  };

  const innerStyle = {
    position: 'absolute',
    width: '100%',
    height: '56px',
    transformStyle: 'preserve-3d',
    transition: `transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${baseDelay}s`,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  };

  const faceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  const backFaceStyle = {
    ...faceStyle,
    transform: 'rotateY(180deg)'
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        {/* Front */}
        <div
          style={faceStyle}
          className={`flex items-center gap-4 p-4 robust-rounded-20 cursor-pointer transition-all duration-300 ${isActive
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'hover:bg-slate-800 text-slate-400'
            }`}
          onClick={() => { if (!isFlipped) onClickAction(id); }}
        >
          {icon}
          <span className="font-bold text-sm hidden lg:block tracking-wide">{label}</span>
        </div>

        {/* Back */}
        <div
          style={backFaceStyle}
          className={`flex items-center gap-4 p-4 robust-rounded-20 transition-all duration-300 w-full ${isDashboard
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 cursor-pointer'
              : 'bg-slate-800/40 border border-slate-700/30'
            }`}
          onClick={() => { if (isFlipped && isDashboard) onBackAction(); }}
        >
          {isDashboard && (
            <>
              <ChevronLeft size={22} />
              <span className="font-bold text-sm hidden lg:block tracking-wide">Назад</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipSidebarItem;
