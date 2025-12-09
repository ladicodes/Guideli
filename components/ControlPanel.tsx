import React from 'react';
import { AppMode } from '../types';

interface ControlPanelProps {
  isActive: boolean;
  onToggleActive: () => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  lastMessage: string;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isActive, 
  onToggleActive, 
  mode, 
  onModeChange,
  lastMessage,
  isProcessing
}) => {
  
  const handleModeSwitch = () => {
    const newMode = mode === AppMode.NAVIGATION ? AppMode.READING : AppMode.NAVIGATION;
    onModeChange(newMode);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleActiveToggle = () => {
    onToggleActive();
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-black border-t-4 border-yellow-400 p-4 pb-8 flex flex-col gap-4 shadow-2xl z-20">
      
      {/* Live Feedback Text Area */}
      <div className="bg-gray-900 rounded-lg p-4 min-h-[100px] flex items-center justify-center text-center border border-gray-700">
        {isProcessing && !lastMessage ? (
          <span className="animate-pulse text-yellow-400 font-bold text-xl">Thinking...</span>
        ) : (
          <p className="text-white text-2xl font-bold leading-snug">
            {lastMessage || "Ready to guide."}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 h-32">
        {/* Mode Switcher */}
        <button
          onClick={handleModeSwitch}
          className={`
            rounded-2xl font-bold text-xl flex flex-col items-center justify-center transition-all active:scale-95
            ${mode === AppMode.NAVIGATION 
              ? 'bg-blue-600 text-white' 
              : 'bg-green-600 text-white'
            }
          `}
        >
          <span className="uppercase text-sm opacity-80 mb-1">Current Mode</span>
          {mode === AppMode.NAVIGATION ? 'WALKING' : 'READING'}
        </button>

        {/* Start/Stop Button */}
        <button
          onClick={handleActiveToggle}
          className={`
            rounded-2xl font-bold text-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg
            ${isActive 
              ? 'bg-red-600 text-white animate-pulse-slow border-4 border-red-800' 
              : 'bg-yellow-400 text-black border-4 border-yellow-600'
            }
          `}
        >
          {isActive ? 'STOP' : 'START'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
