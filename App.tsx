import React, { useState, useRef, useEffect, useCallback } from 'react';
import CameraView from './components/CameraView';
import ControlPanel from './components/ControlPanel';
import { analyzeScene } from './services/geminiService';
import { speak, stopSpeech } from './services/ttsService';
import { AppMode, CameraHandle } from './types';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<AppMode>(AppMode.NAVIGATION);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const cameraRef = useRef<CameraHandle>(null);
  const processingRef = useRef<boolean>(false); // Ref for loop access without closure issues
  const activeRef = useRef<boolean>(false);
  const modeRef = useRef<AppMode>(AppMode.NAVIGATION);

  // Sync refs with state
  useEffect(() => {
    activeRef.current = isActive;
    modeRef.current = mode;
    processingRef.current = isProcessing;
  }, [isActive, mode, isProcessing]);

  // Main processing loop
  const processFrame = useCallback(async () => {
    // Safety check: if not active, or already busy, stop.
    if (!activeRef.current || processingRef.current) return;

    const base64Frame = cameraRef.current?.captureFrame();

    if (!base64Frame) {
      // If camera isn't ready, retry quickly
      setTimeout(processFrame, 500);
      return;
    }

    try {
      setIsProcessing(true);
      
      const guidance = await analyzeScene(base64Frame, modeRef.current);
      
      // Only speak/update if the app is still active after the API call finishes
      if (activeRef.current) {
        if (guidance.trim().length > 0) {
          setLastMessage(guidance);
          speak(guidance);
        }
      }

    } catch (error) {
      console.error("Processing error", error);
    } finally {
      setIsProcessing(false);
      // Schedule next frame
      if (activeRef.current) {
        // Dynamic timing: If text was long, wait a bit longer to let TTS finish (rough approximation), 
        // but essentially we want a steady rhythm.
        // 2500ms allows for "See -> Think -> Speak" loop without overlapping too much.
        setTimeout(processFrame, 2500); 
      }
    }
  }, []);

  const handleToggleActive = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    if (newState) {
      speak(`Starting ${mode === AppMode.NAVIGATION ? 'navigation' : 'reading'} mode.`);
      // Allow camera to initialize before grabbing first frame
      setTimeout(() => {
        processFrame();
      }, 1000);
    } else {
      stopSpeech();
      speak("Paused.");
      setLastMessage("Paused");
    }
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    speak(`${newMode === AppMode.NAVIGATION ? 'Navigation' : 'Reading'} mode selected.`);
    // If active, the next loop iteration will pick up the new mode via modeRef
  };

  // Pre-load voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
      {/* Header / Top Bar (Minimal) */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <h1 className="text-yellow-400 font-bold text-lg tracking-wider opacity-80">VISION GUIDE</h1>
      </div>

      {/* Main Camera View */}
      <div className="flex-1 relative">
        <CameraView ref={cameraRef} isActive={isActive} />
      </div>

      {/* Bottom Controls */}
      <div className="h-[240px] relative z-20">
         <ControlPanel 
           isActive={isActive}
           onToggleActive={handleToggleActive}
           mode={mode}
           onModeChange={handleModeChange}
           lastMessage={lastMessage}
           isProcessing={isProcessing}
         />
      </div>
    </div>
  );
};

export default App;
