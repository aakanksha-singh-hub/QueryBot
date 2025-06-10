import React from 'react';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import useAzureSpeechToText from '../hooks/useAzureSpeechToText';

const VoiceButton = ({ speechKey, speechRegion, onTranscription }) => {
  const { listening, error, startListening } = useAzureSpeechToText({
    speechKey,
    speechRegion,
    onResult: onTranscription,
    onError: () => {}
  });

  return (
    <>
      <Tooltip title={listening ? "Listening..." : "Speak"}>
        <span>
          <IconButton
            color={listening ? "error" : "primary"}
            onClick={startListening}
            disabled={listening}
          >
            {listening ? <CircularProgress size={24} /> : <MicIcon />}
          </IconButton>
        </span>
      </Tooltip>
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </>
  );
};

export default VoiceButton; 