import { useState, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export default function useAzureSpeechToText({ speechKey, speechRegion, onResult, onError }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognizerRef = useRef(null);

  const startListening = () => {
    setError(null);
    setListening(true);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizeOnceAsync(
      result => {
        setListening(false);
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          onResult && onResult(result.text);
        } else {
          setError('No speech recognized.');
          onError && onError('No speech recognized.');
        }
        recognizer.close();
      },
      err => {
        setListening(false);
        setError('Speech recognition failed.');
        onError && onError(err);
        recognizer.close();
      }
    );
  };

  const stopListening = () => {
    setListening(false);
    if (recognizerRef.current) {
      recognizerRef.current.close();
    }
  };

  return { listening, error, startListening, stopListening };
} 