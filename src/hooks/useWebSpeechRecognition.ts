import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type RecognitionResultEvent = {
  results: { 0: { transcript: string } }[];
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRec;

/**
 * Browser speech-to-text (Chrome/Edge; Safari support varies). Web only.
 */
export function useWebSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(
    (onText: (text: string) => void) => {
      if (Platform.OS !== 'web') return;
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) return;

      stopListening();

      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event: RecognitionResultEvent) => {
        const text = event.results[0]?.[0]?.transcript?.trim() ?? '';
        if (text) onText(text);
      };
      rec.onerror = () => {
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
      };
      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    [stopListening]
  );

  useEffect(() => () => stopListening(), [stopListening]);

  return { listening, supported: Platform.OS === 'web' && supported, startListening, stopListening };
}
