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
  useTheme
} from '@mui/material';
import { 
  Send as SendIcon, 
  Save as SaveIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
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
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import VoiceInput from './VoiceInput';
import VoiceButton from './VoiceButton';

const SPEECH_KEY = process.env.REACT_APP_SPEECH_KEY;
const SPEECH_REGION = process.env.REACT_APP_SPEECH_REGION;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const VALID_QUESTIONS = [
  "Show all employees",
  "What are the top 5 highest paid employees?",
  "How many employees are in each department?",
  "What is the average salary?",
  "How many employees are in each department?",
  "Show employees hired in 2020",
  "List departments with more than 2 employees",
];

function Chat() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [visualizationType, setVisualizationType] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

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

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const userMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    // --- START: DEMO ONLY CODE (DO NOT PUSH TO GITHUB) ---
    if (query.toLowerCase() === "performance score trend") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { Period: 'Jan-Mar', 'Performance Score': 3.5 },
        { Period: 'Apr-Jun', 'Performance Score': 3.8 },
        { Period: 'Jul-Sep', 'Performance Score': 4.0 },
        { Period: 'Oct-Dec', 'Performance Score': 4.2 },
        { Period: 'Jan-Mar 2025', 'Performance Score': 4.5 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: performance score trend` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Performance scores show a positive upward trend over the recent periods.' }
      ]);
      setVisualizationType('line'); // Force line chart
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "how many employees in each department") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { Department: 'Sales', 'Employee Count': 150 },
        { Department: 'Marketing', 'Employee Count': 80 },
        { Department: 'Engineering', 'Employee Count': 220 },
        { Department: 'HR', 'Employee Count': 50 },
        { Department: 'Finance', 'Employee Count': 100 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: how many employees in each department` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: This bar chart shows the distribution of employees across different departments.' }
      ]);
      setVisualizationType('bar'); // Force bar chart
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "what is the average salary") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { 'Department': 'Finance', 'Average Salary': 76500 },
        { 'Department': 'Human Resources', 'Average Salary': 65000 },
        { 'Department': 'IT', 'Average Salary': 85000 },
        { 'Department': 'Marketing', 'Average Salary': 70000 },
        { 'Department': 'Sales', 'Average Salary': 95000 },
        { 'Department': 'Research', 'Average Salary': 82000 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: what is the average salary` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Average salaries across various departments.' }
      ]);
      setVisualizationType('bar'); // Force bar chart
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "show all employees") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { id: 1, name: 'John Doe', department: 'Finance', salary: 75000 },
        { id: 2, name: 'Jane Smith', department: 'HR', salary: 65000 },
        { id: 3, name: 'Alice Johnson', department: 'IT', salary: 85000 },
        { id: 4, name: 'Bob Brown', department: 'Marketing', salary: 70000 },
        { id: 5, name: 'Carol White', department: 'Finance', salary: 78000 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: show all employees` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Displaying all available employee records.' }
      ]);
      setVisualizationType(null); // Let it default to table or keep current visualization
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "what are the top 5 highest paid employees?") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { id: 1, name: 'Alice Johnson', salary: 85000 },
        { id: 2, name: 'Carol White', salary: 78000 },
        { id: 3, name: 'John Doe', salary: 75000 },
        { id: 4, name: 'Bob Brown', salary: 70000 },
        { id: 5, name: 'Jane Smith', salary: 65000 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: what are the top 5 highest paid employees?` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Here are the top 5 highest paid employees based on available data.' }
      ]);
      setVisualizationType(null); // Let it default to table
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "show employees hired in 2020") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { id: 1, name: 'John Doe', department: 'Finance', hire_date: '2020-01-15' },
        { id: 4, name: 'Bob Brown', department: 'Marketing', hire_date: '2020-11-05' },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: show employees hired in 2020` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Displaying employees hired in 2020.' }
      ]);
      setVisualizationType(null); // Let it default to table
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    } else if (query.toLowerCase() === "list departments with more than 2 employees") {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const dummyResults = [
        { Department: 'Sales', 'Employee Count': 150 },
        { Department: 'Engineering', 'Employee Count': 220 },
        { Department: 'Finance', 'Employee Count': 100 },
      ];
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: `-- Simulated SQL for: list departments with more than 2 employees` },
        { type: 'results', content: dummyResults },
        { type: 'analysis', content: 'Simulated analysis: Departments with a significant number of employees.' }
      ]);
      setVisualizationType('bar'); // Force bar chart for this
      setLoading(false);
      setQuery('');
      return; // Exit here to prevent backend call
    }
    // --- END: DEMO ONLY CODE ---

    try {
      const response = await axios.post(`${API_URL}/api/query`, { query });
      const { sql, results, analysis } = response.data;
      
      setMessages(prev => [
        ...prev,
        { type: 'sql', content: sql },
        { type: 'results', content: results },
        { type: 'analysis', content: analysis }
      ]);

      // Auto-detect visualization type based on results
      if (Array.isArray(results) && results.length > 0) {
        const firstRow = results[0];
        const numericColumns = Object.entries(firstRow)
          .filter(([_, value]) => typeof value === 'number')
          .map(([key]) => key);

        if (numericColumns.length >= 2) {
          setVisualizationType('bar');
        }
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { type: 'error', content: error.response?.data?.error || 'An error occurred' }
      ]);
    }

    setLoading(false);
    setQuery('');
  };

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
              <Tooltip />
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
              <Tooltip />
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
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Paper sx={{ p: 2, maxWidth: '70%', bgcolor: theme.palette.background.paper }}>
              <Typography>{message.content}</Typography>
            </Paper>
          </Box>
        );
      case 'sql':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color={theme.palette.text.secondary}>Generated SQL:</Typography>
            <SyntaxHighlighter language="sql" style={docco}>
              {message.content}
            </SyntaxHighlighter>
          </Box>
        );
      case 'results':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Results:</Typography>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              {Array.isArray(message.content) && message.content.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {Object.keys(message.content[0]).map((col) => (
                        <th key={col} style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.content.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography color="text.secondary">No results found.</Typography>
              )}
              {renderVisualization(message.content)}
            </Paper>
          </Box>
        );
      case 'analysis':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color={theme.palette.text.secondary}>Analysis:</Typography>
            <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
              <Typography className="analysis-section">{message.content}</Typography>
            </Paper>
          </Box>
        );
      case 'error':
        return (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
              <Typography color={theme.palette.error.main}>{message.content}</Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
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
    setQuery(newValue || event.target.value);
    generateSuggestions(newValue || event.target.value);
  };

  // Filter suggestions based on previous user questions
  const askedQuestions = messages.filter(m => m.type === 'user').map(m => m.content);
  const contextSuggestions = VALID_QUESTIONS.filter(q => !askedQuestions.includes(q));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      {/* Suggestions Panel */}
      <Paper sx={{ minWidth: 260, maxWidth: 300, p: 2, height: '80vh', overflowY: 'auto', mr: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom>Suggestions</Typography>
        <List>
          {contextSuggestions.length === 0 ? (
            <ListItem><ListItemText primary="No more suggestions" /></ListItem>
          ) : (
            contextSuggestions.map((suggestion, idx) => (
              <ListItem button key={idx} onClick={() => setQuery(suggestion)}>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chat with Your Database
        </Typography>

        {/* Schema Information */}
        {/* (Removed Available Tables section) */}
        {/* Quick Queries */}
        {/* (Removed Quick Queries section) */}

        {/* Chat Interface */}
        <Paper sx={{ p: 2, mb: 2, height: '60vh', overflow: 'auto', bgcolor: theme.palette.background.paper }}>
          {messages.map((message, index) => (
            <div key={index}>{renderMessage(message)}</div>
          ))}
          <div ref={messagesEndRef} />
        </Paper>

{/* Input Area */}
<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 2, width: '100%' }}>
  <Autocomplete
    freeSolo
    options={suggestions}
    inputValue={query}
    onInputChange={handleInputChange}
    sx={{ flex: 1 }}
    renderInput={(params) => (
      <TextField
        {...params}
        fullWidth
        variant="outlined"
        placeholder="Ask a question about your data..."
        disabled={loading}
        multiline
        minRows={3}
        maxRows={6}
        sx={{
          width: '100%',
          '& .MuiInputBase-root': {
            alignItems: 'flex-start',
            py: 2,
          },
          '& .MuiInputBase-input': {
            fontSize: '1.25rem',
            minHeight: '96px',
          },
        }}
      />
    )}
  />

  <VoiceButton 
    speechKey={SPEECH_KEY}
    speechRegion={SPEECH_REGION}
    onTranscription={(text) => setQuery(text)}
  />

  <IconButton 
    color="primary" 
    onClick={handleQuery}
    disabled={loading || !query.trim()}
    sx={{ mt: 1.5 }}
  >
    {loading ? <CircularProgress size={24} /> : <SendIcon />}
  </IconButton>

  <IconButton
    color="primary"
    onClick={(e) => setAnchorEl(e.currentTarget)}
    sx={{ mt: 1.5 }}
  >
    <SaveIcon />
  </IconButton>
</Box>


        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { handleExport('csv'); setAnchorEl(null); }}>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => { handleExport('json'); setAnchorEl(null); }}>
            Export as JSON
          </MenuItem>
          <MenuItem onClick={() => { handleExport('excel'); setAnchorEl(null); }}>
            Export as Excel
          </MenuItem>
        </Menu>

        {/* Visualization Controls */}
        {messages.some(m => m.type === 'results') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <IconButton 
              color={visualizationType === 'bar' ? theme.palette.primary.main : 'default'}
              onClick={() => setVisualizationType('bar')}
            >
              <BarChartIcon />
            </IconButton>
            <IconButton 
              color={visualizationType === 'pie' ? theme.palette.primary.main : 'default'}
              onClick={() => setVisualizationType('pie')}
            >
              <PieChartIcon />
            </IconButton>
            <IconButton 
              color={visualizationType === 'line' ? theme.palette.primary.main : 'default'}
              onClick={() => setVisualizationType('line')}
            >
              <LineChartIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Chat; 