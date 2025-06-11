import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  useTheme,
  Tooltip,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Send as SendIcon, 
  Save as SaveIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Download as DownloadIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import VoiceInput from './VoiceInput';
import VoiceButton from './VoiceButton';
import DomainSelector from './DomainSelector';
import * as XLSX from 'xlsx';
import { Pie as PieChartJS, Bar as BarChartJS } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  PieController,
  BarController,
} from 'chart.js';

const SPEECH_KEY = process.env.REACT_APP_SPEECH_KEY;
const SPEECH_REGION = process.env.REACT_APP_SPEECH_REGION;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const VALID_QUESTIONS = [
  "Show all employees",
  "What are the top 5 highest paid employees?",
  "How many employees are in each department?",
  "What is the average salary?",
  "List departments with more than 2 employees",
];

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  PieController,
  BarController
);

function Chat() {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [visualizationType, setVisualizationType] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const presetQueries = [
    "Show all employees",
    "Top 5 products by sales",
    "Sales by month",
    "List low-stock products"
  ];

  useEffect(() => {
    fetchSchemaInfo();
  }, []);

  const fetchSchemaInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/schema`);
      setSchemaInfo(response.data.schema);
    } catch (error) {
      console.error('Error fetching schema:', error);
      setSchemaInfo('Error loading schema information');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const handleExport = async (format) => {
    // Find the latest results message
    const resultsMsg = messages.findLast(m => m.type === 'results');
    if (!resultsMsg || !Array.isArray(resultsMsg.content)) {
      alert('No results to export!');
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/export`,
        {
          data: resultsMsg.content,
          format: format
        },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `query-results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const renderVisualization = (data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const firstRow = data[0];
    let categoryColumn = null;
    let valueColumn = null;

    // Find a suitable category (string) and value (number) column
    for (const key in firstRow) {
      if (typeof firstRow[key] === 'string' && !categoryColumn) {
        categoryColumn = key;
      } else if (typeof firstRow[key] === 'number' && !valueColumn) {
        valueColumn = key;
      }
      // If both are found, break
      if (categoryColumn && valueColumn) break;
    }

    if (!categoryColumn || !valueColumn) {
      // If we don't have at least one category and one value column, we can't chart
      return null;
    }

    const chartData = data.map(row => ({
      name: row[categoryColumn],
      value: row[valueColumn]
    }));

    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderMessage = (message, index) => {
    console.log("Rendering message:", message);
    if (message.type === "system") {
        return (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Paper
            sx={{
              p: 2,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              maxWidth: "80%",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {message.content}
            </Typography>
            </Paper>
          </Box>
        );
    }

        return (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: message.type === "user" ? "flex-end" : "flex-start",
          mb: 2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            backgroundColor:
              message.type === "user" ? "primary.main" : "background.paper",
            color: message.type === "user" ? "white" : "text.primary",
            maxWidth: "70%",
            borderRadius: 2,
          }}
        >
          {message.type === "user" && (
            <Typography variant="body1">{message.content}</Typography>
          )}

          {message.type === "sql" && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                Generated SQL:
              </Typography>
              <SyntaxHighlighter
                language="sql"
                style={docco}
                customStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
              {message.content}
            </SyntaxHighlighter>
          </Box>
          )}

          {message.type === "results" &&
            Array.isArray(message.content) &&
            message.content.length > 0 && (
              <Box>
                {console.log("Rendering results block. Content:", message.content)}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                    Results:
                  </Typography>
                  <Tooltip title="Export to Excel">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleExport(
                          "xlsx"
                        )
                      }
                      sx={{ color: "primary.main" }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Render chart if data is suitable */}
                {renderVisualization(message.content)}

                <Box
                  sx={{
                    maxHeight: "200px",
                    overflow: "auto",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                        {Object.keys(message.content[0]).map((key) => (
                          <th
                            key={key}
                            style={{
                              textAlign: "left",
                              padding: "8px",
                              borderBottom: "1px solid #ddd",
                            }}
                          >
                            {key}
                          </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                      {message.content.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td
                              key={j}
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {value}
                            </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </Box>
              </Box>
            )}

          {message.type === "analysis" && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                Explanation:
              </Typography>
              <Typography variant="body2">{message.content}</Typography>
          </Box>
          )}

          {message.type === "error" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {message.content}
            </Alert>
          )}

          {(message.type === 'analysis' || message.type === 'sql') && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {message.content && (
                <IconButton
                  onClick={() => handleSpeak(message.content)}
                  disabled={isSpeaking}
                  size="small"
                  title="Speak Answer"
                >
                  <VolumeUpIcon />
                </IconButton>
              )}
              {message.sql_query && (
                <IconButton
                  onClick={() => handleSpeak(message.sql_query)}
                  disabled={isSpeaking}
                  size="small"
                  title="Speak SQL"
                >
                  <VolumeUpIcon />
                </IconButton>
              )}
            </Box>
          )}
            </Paper>
          </Box>
        );
  };

  const generateSuggestions = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/suggestions`, { question: input });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (event, newValue) => {
    setInput(newValue || event.target.value);
    generateSuggestions(newValue || event.target.value);
  };

  // Filter suggestions based on previous user questions
  const askedQuestions = messages.filter(m => m.type === 'user').map(m => m.content);
  const contextSuggestions = VALID_QUESTIONS.filter(q => !askedQuestions.includes(q));

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    // Add a system message about the selected domain
    setMessages([
      {
        type: "system",
        content: `You are now exploring the ${domain.name} domain. Available tables: ${domain.schema.tables.join(
          ", "
        )}. Key metrics: ${domain.schema.kpis.join(", ")}.`,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/query`, {
        query: userMessage,
        domain: selectedDomain?.id,
      });

      const { sql_query, results, explanation, suggestions } = response.data;

      setMessages((prev) => [
        ...prev,
        { type: "sql", content: sql_query },
        { type: "results", content: results },
        { type: "analysis", content: explanation },
        // Add suggestions as a separate message type if desired
        // { type: "suggestions", content: suggestions },
      ]);
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.detail ||
          "An error occurred while processing your request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleSuggestQuestions = async (event) => {
    setAnchorEl(event.currentTarget);
    if (!selectedDomain) {
      alert("Please select a data domain first.");
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/suggestions`, {
        domain: selectedDomain.id,
      });
      setCurrentSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Failed to load suggestions.");
      setCurrentSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuggestions = () => {
    setAnchorEl(null);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleCloseSuggestions();
    // Optionally, trigger handleSend here immediately
    // handleSend();
  };

  const handleSpeak = async (text) => {
    console.log("handleSpeak called with text:", text);
    try {
      setIsSpeaking(true);
      const response = await fetch(`${API_URL}/api/synthesize_speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Generated audio URL:", audioUrl);
      
      if (audioRef.current) {
        console.log("Audio ref current exists.", audioRef.current);
        audioRef.current.src = audioUrl;
        audioRef.current.load(); // Ensure audio element is ready
        audioRef.current.volume = 1; // Ensure volume is not zero

        // Add a small delay before attempting to play
        setTimeout(() => {
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log("Audio playback started successfully.");
            }).catch(error => {
              console.error("Audio playback prevented or failed:", error);
              alert("Audio playback was prevented by the browser. Please interact with the page first or check browser settings.");
            });
          } else {
            console.log("Audio playback initiated without promise.");
          }
        }, 50); // 50ms delay
      } else {
        console.error("Audio ref current is NULL. Audio element might not be rendered.");
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      alert("An error occurred during speech synthesis. Check console for details.");
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {!selectedDomain ? (
          <DomainSelector onSelectDomain={handleDomainSelect} />
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {selectedDomain && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Ask a question about your data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
        multiline
              maxRows={4}
        sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
          },
        }}
      />
            <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
  <IconButton 
                onClick={toggleRecording}
                color={isRecording ? "error" : "primary"}
                disabled={isLoading}
              >
                {isRecording ? <MicOffIcon /> : <MicIcon />}
  </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              sx={{
                borderRadius: 2,
                minWidth: "100px",
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
</Box>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleSuggestQuestions}
                disabled={isLoading}
                sx={{
                  textTransform: 'none',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                  }
                }}
              >
                Suggest Questions
              </Button>
            </Box>
          </Grid>

        <Menu
          anchorEl={anchorEl}
            open={showSuggestions}
            onClose={handleCloseSuggestions}
            MenuListProps={{
              'aria-labelledby': 'suggestions-button',
            }}
          >
            {currentSuggestions.length > 0 ? (
              currentSuggestions.map((suggestion, index) => (
                <MenuItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
          </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No suggestions available</MenuItem>
            )}
        </Menu>
          </Box>
        )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Audio element moved here for direct access by audioRef */}
      <audio ref={audioRef} style={{ display: 'none' }} controls />
    </Box>
  );
}

export default Chat; 