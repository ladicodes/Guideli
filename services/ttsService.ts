export const speak = (text: string) => {
  if (!window.speechSynthesis) return;

  // Cancel any currently playing speech to prioritize new information (e.g., safety warnings)
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Attempt to select a clear, natural voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => voice.name.includes("Google") || voice.name.includes("Premium"));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 1.0; // Normal speed
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
