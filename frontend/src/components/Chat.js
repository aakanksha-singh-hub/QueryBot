import React, { useState, useEffect, useRef } from "react";
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
  useMediaQuery,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  Collapse,
  Chip,
  Fade,
  Fab,
} from "@mui/material";
import {
  Send as SendIcon,
  Save as SaveIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Download as DownloadIcon,
  VolumeUp as VolumeUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
  TableChart as TableChartIcon,
  Insights as InsightsIcon,
  ExpandLess,
  ExpandMore,
  Key as KeyIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import axios from "axios";
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
  ResponsiveContainer,
} from "recharts";
import VoiceInput from "./VoiceInput";
import VoiceButton from "./VoiceButton";
import DomainSelector from "./DomainSelector";
import * as XLSX from "xlsx";
import { Pie as PieChartJS, Bar as BarChartJS } from "react-chartjs-2";
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
} from "chart.js";

const SPEECH_KEY = process.env.REACT_APP_SPEECH_KEY;
const SPEECH_REGION = process.env.REACT_APP_SPEECH_REGION;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
  const [input, setInput] = useState("");
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [metricsExpanded, setMetricsExpanded] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTables = () => setTablesExpanded(!tablesExpanded);
  const toggleMetrics = () => setMetricsExpanded(!metricsExpanded);

  const presetQueries = [
    "Show all employees",
    "Top 5 products by sales",
    "Sales by month",
    "List low-stock products",
  ];

  useEffect(() => {
    fetchSchemaInfo();
  }, []);

  useEffect(() => {
    // Close sidebar by default on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const fetchSchemaInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/schema`);
      setSchemaInfo(response.data.schema);
    } catch (error) {
      console.error("Error fetching schema:", error);
      setSchemaInfo("Error loading schema information");
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
    const resultsMsg = messages.findLast((m) => m.type === "results");
    if (!resultsMsg || !Array.isArray(resultsMsg.content)) {
      alert("No results to export!");
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/export`,
        {
          data: resultsMsg.content,
          format: format,
        },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `query-results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const renderVisualization = (data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const firstRow = data[0];
    let categoryColumn = null;
    let valueColumn = null;

    // Find a suitable category (string) and value (number) column
    for (const key in firstRow) {
      if (typeof firstRow[key] === "string" && !categoryColumn) {
        categoryColumn = key;
      } else if (typeof firstRow[key] === "number" && !valueColumn) {
        valueColumn = key;
      }
      // If both are found, break
      if (categoryColumn && valueColumn) break;
    }

    if (!categoryColumn || !valueColumn) {
      // If we don't have at least one category and one value column, we can't chart
      return null;
    }

    const chartData = data.map((row) => ({
      name: row[categoryColumn],
      value: row[valueColumn],
    }));

    switch (visualizationType) {
      case "bar":
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
      case "pie":
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
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)"
                }
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 16 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{
                  stroke: "#8884d8",
                  strokeWidth: 2,
                  fill: theme.palette.background.paper,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2,
                }}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Update the renderMessage function for a more modern UI
  const renderMessage = (message, index) => {
    if (message.type === "system") {
      return (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(66, 66, 88, 0.6)"
                  : "rgba(236, 240, 253, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              borderRadius: 3,
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

    if (!message.content && message.type !== "user" && message.type !== "sql" && message.type !== "results") {
      return null;
    }
    
    // For result messages, only filter if it's explicitly an empty array
    if (message.type === "results" && Array.isArray(message.content) && message.content.length === 0) {
      return null;
    }

    return (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: message.type === "user" ? "flex-end" : "flex-start",
          mb: 3,
          mx: 0.5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor:
              message.type === "user"
                ? theme.palette.primary.main
                : theme.palette.mode === "dark"
                ? "rgba(42, 45, 65, 0.7)"
                : "rgba(255, 255, 255, 0.9)",
            color: message.type === "user" ? "white" : "text.primary",
            maxWidth: "75%",
            borderRadius:
              message.type === "user"
                ? "36px 1px 36px 36px"
                : "1px 36px 36px 36px",
            backdropFilter: "blur(10px)",
            boxShadow:
              message.type === "user"
                ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: message.type !== "user" ? "1px solid" : "none",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
          }}
        >
          {message.type === "user" && (
            <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
              {message.content}
            </Typography>
          )}

          {message.type === "sql" && message.content && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1.5, fontWeight: 600 }}
              >
                Generated SQL:
              </Typography>
              <SyntaxHighlighter
                language="sql"
                style={docco}
                customStyle={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(0, 0, 0, 0.2)"
                      : "rgba(0, 0, 0, 0.03)",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginTop: 0,
                  marginBottom: 0,
                  color: theme.palette.mode === "dark" ? "#FFFFFF" : undefined,
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    Results:
                  </Typography>
                  <Tooltip title="Export to Excel" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleExport("xlsx")}
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Visualization controls */}
                {message.content.length > 1 && (
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Tooltip title="Bar Chart" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setVisualizationType("bar")}
                        color={
                          visualizationType === "bar" ? "primary" : "default"
                        }
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <BarChartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Line Chart" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setVisualizationType("line")}
                        color={
                          visualizationType === "line" ? "primary" : "default"
                        }
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <LineChartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pie Chart" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setVisualizationType("pie")}
                        color={
                          visualizationType === "pie" ? "primary" : "default"
                        }
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <PieChartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* Render chart if data is suitable */}
                {renderVisualization(message.content)}

                {/* Data table */}
                <Box
                  sx={{
                    maxHeight: "300px",
                    overflow: "auto",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(0, 0, 0, 0.2)"
                        : "rgba(0, 0, 0, 0.03)",
                    borderRadius: 2,
                    mt: visualizationType ? 3 : 0,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.palette.divider} transparent`,
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      height: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: theme.palette.divider,
                      borderRadius: "4px",
                    },
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: theme.palette.background.paper,
                          zIndex: 1,
                        }}
                      >
                        {Object.keys(message.content[0]).map((key) => (
                          <th
                            key={key}
                            style={{
                              textAlign: "left",
                              padding: "12px 16px",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              fontWeight: 600,
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {message.content.map((row, i) => (
                        <tr
                          key={i}
                          style={{
                            backgroundColor:
                              i % 2 === 0
                                ? theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.03)"
                                  : "rgba(0,0,0,0.01)"
                                : "transparent",
                          }}
                        >
                          {Object.values(row).map((value, j) => (
                            <td
                              key={j}
                              style={{
                                padding: "10px 16px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                color: theme.palette.text.primary,
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

          {message.type === "analysis" && message.content && (
            <Box sx={{ mt: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}
              >
                Explanation:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  lineHeight: 1.6,
                }}
              >
                {message.content}
              </Typography>
            </Box>
          )}

          {message.type === "error" && (
            <Alert
              severity="error"
              sx={{
                mt: 1.5,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  alignItems: "center",
                },
              }}
            >
              {message.content}
            </Alert>
          )}

          {(message.type === "analysis" || message.type === "sql") && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            ></Box>
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
      const response = await axios.post(`${API_URL}/api/suggestions`, {
        question: input,
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (event, newValue) => {
    setInput(newValue || event.target.value);
    generateSuggestions(newValue || event.target.value);
  };

  // Filter suggestions based on previous user questions
  const askedQuestions = messages
    .filter((m) => m.type === "user")
    .map((m) => m.content);
  const contextSuggestions = VALID_QUESTIONS.filter(
    (q) => !askedQuestions.includes(q)
  );

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
    // Add a system message about the selected domain
    setMessages([
      {
        type: "system",
        content: `You are now exploring the ${
          domain.name
        } domain. Available tables: ${domain.schema.tables.join(
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize speech");
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
            playPromise
              .then(() => {
                console.log("Audio playback started successfully.");
              })
              .catch((error) => {
                console.error("Audio playback prevented or failed:", error);
                alert(
                  "Audio playback was prevented by the browser. Please interact with the page first or check browser settings."
                );
              });
          } else {
            console.log("Audio playback initiated without promise.");
          }
        }, 50); // 50ms delay
      } else {
        console.error(
          "Audio ref current is NULL. Audio element might not be rendered."
        );
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      alert(
        "An error occurred during speech synthesis. Check console for details."
      );
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "#F5F7FB",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            theme.palette.mode === "dark"
              ? `linear-gradient(#3466F620 1px, transparent 1px), 
             linear-gradient(90deg, #3466F620 1px, transparent 1px)`
              : `linear-gradient(#3466F610 1px, transparent 1px), 
             linear-gradient(90deg, #3466F610 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          backgroundPosition: "center center",
          zIndex: 0,
          opacity: 0.5,
        },
      }}
    >
      {selectedDomain ? (
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Schema Sidebar */}
          <Drawer
            variant={isMobile ? "temporary" : "persistent"}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{
              width: sidebarOpen ? { xs: 280, lg: 320 } : 0,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: { xs: 280, lg: 320 },
                boxSizing: "border-box",
                borderRight: "1px solid",
                borderColor: "divider",
                bgcolor: theme.palette.mode === "dark" ? "#1A1B25" : "#FFFFFF",
                boxShadow: "0 0 20px rgba(0,0,0,0.05)",
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: `${selectedDomain.color}15`,
                  color: selectedDomain.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                {selectedDomain.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedDomain.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Data Schema Explorer
                </Typography>
              </Box>
            </Box>

            <List
              sx={{
                width: "100%",
                bgcolor: "background.paper",
                py: 0,
              }}
            >
              {/* Tables Section */}
              <ListItemButton onClick={toggleTables}>
                <ListItemIcon>
                  <StorageIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      Available Tables
                    </Typography>
                  }
                />
                {tablesExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={tablesExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {selectedDomain.schema.tables.map((table) => (
                    <ListItemButton
                      key={table}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        setInput(`Show me the schema for ${table}`);
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <TableChartIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ textTransform: "lowercase" }}
                          >
                            {table}
                          </Typography>
                        }
                      />
                      <Chip
                        label="Query"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          height: 22,
                          fontSize: "0.625rem",
                          visibility: "hidden",
                          ".MuiListItemButton-root:hover &": {
                            visibility: "visible",
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

              {/* KPIs Section */}
              <ListItemButton onClick={toggleMetrics}>
                <ListItemIcon>
                  <KeyIcon sx={{ color: theme.palette.secondary.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>
                      Key Metrics
                    </Typography>
                  }
                />
                {metricsExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={metricsExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {selectedDomain.schema.kpis.map((kpi) => (
                    <ListItemButton
                      key={kpi}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        setInput(`Show me the trend for ${kpi}`);
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InsightsIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2">{kpi}</Typography>}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

              {/* Sample queries section */}
              <Box sx={{ p: 2, mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Sample Queries
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {presetQueries.map((query, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setInput(query);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        px: 2,
                        py: 1,
                        lineHeight: 1.3,
                        fontWeight: 400,
                        fontSize: "0.8125rem",
                        borderColor: "divider",
                        color: "text.primary",
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      {query}
                    </Button>
                  ))}
                </Box>
              </Box>
            </List>
          </Drawer>

          {/* Main chat area */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              maxWidth: {
                xs: "100%", 
                md: `calc(100vw - ${sidebarOpen ? '320px' : '0px'})` 
              },
              width: "100%",
              overflow: "hidden" // Prevent content from flowing outside
            }}
          >
            {/* Toggle sidebar button for mobile */}
            <Fade in={true}>
              <Fab
                color="primary"
                size="small"
                aria-label="toggle sidebar"
                onClick={toggleSidebar}
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  display: { md: "none" },
                }}
              >
                {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
              </Fab>
            </Fade>

            {/* Messages area */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                p: { xs: 2, md: 4 },
                scrollbarWidth: "thin",
                scrollbarColor: `${theme.palette.divider} transparent`,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.divider,
                  borderRadius: "36px 1px 36px 36px",
                },
              }}
            >
              {messages.map((message, index) => renderMessage(message, index))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input area */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                backgroundColor: theme.palette.background.paper,
                borderTop: "1px solid",
                borderColor: "divider",
                position: "relative",
                zIndex: 2,
                boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-end",
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Ask a question about your data"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      multiline
                      maxRows={4}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.02)",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.04)",
                          },
                          "& fieldset": {
                            transition: "all 0.2s",
                          },
                          "&.Mui-focused fieldset": {
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          paddingLeft: 1.5,
                          paddingRight: 1.5,
                        },
                      }}
                    />
                    <Tooltip
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                      arrow
                    >
                      <IconButton
                        onClick={toggleRecording}
                        color={isRecording ? "error" : "primary"}
                        disabled={isLoading}
                        sx={{
                          height: 60,
                          width: 60,
                          borderRadius: 3,
                          backgroundColor: theme.palette.background.paper,
                          border: "1px solid",
                          borderColor: isRecording ? "error.main" : "divider",
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        {isRecording ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      sx={{
                        borderRadius: 3,
                        minWidth: 120,
                        height: 60,
                        boxShadow: "none",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                    >
                      {isLoading ? "Processing" : "Send"}
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {isRecording
                        ? "Listening..."
                        : "Ask questions in natural language"}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleSuggestQuestions}
                      disabled={isLoading}
                      startIcon={<AutoAwesomeIcon fontSize="small" />}
                      sx={{
                        textTransform: "none",
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Suggest Questions
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              <Menu
                anchorEl={anchorEl}
                open={showSuggestions}
                onClose={handleCloseSuggestions}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                    overflowX: "auto",
                    maxWidth: 700,
                  },
                }}
              >
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontWeight: 600,
                    color: "text.secondary",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  Suggested Questions
                </Typography>
                {currentSuggestions.length > 0 ? (
                  currentSuggestions.map((suggestion, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Typography variant="body2">{suggestion}</Typography>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled sx={{ py: 2, px: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No suggestions available
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>
        </Box>
      ) : (
        // Domain selector shown when no domain is selected
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: { xs: 2, md: 4 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <DomainSelector onSelectDomain={handleDomainSelect} />
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Audio element for speech synthesis */}
      <audio ref={audioRef} style={{ display: "none" }} controls />
    </Box>
  );
}

export default Chat;