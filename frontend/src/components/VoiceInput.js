import React, { useState, useEffect, useRef } from 'react';
import { IconButton, CircularProgress, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const VoiceInput = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      audioChunksRef.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Create form data
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.wav');

        try {
          setIsProcessing(true);
          // Send to backend for transcription
          const response = await axios.post(`${API_URL}/transcribe`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.text) {
            onTranscriptionComplete(response.data.text);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={isRecording ? stopRecording : startRecording}
        color={isRecording ? 'error' : 'primary'}
        disabled={isProcessing}
        sx={{
          '&:hover': {
            backgroundColor: isRecording ? 'error.light' : 'primary.light',
          },
        }}
      >
        {isProcessing ? (
          <CircularProgress size={24} />
        ) : isRecording ? (
          <MicOffIcon />
        ) : (
          <MicIcon />
        )}
      </IconButton>
    </Box>
  );
};

export default VoiceInput; 