import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  Grid,
  useMediaQuery,
  ListItemIcon,
  Button,
} from "@mui/material";
import ContentCopy from "@mui/icons-material/ContentCopy";
import MicIcon from "@mui/icons-material/Mic";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChart from "@mui/icons-material/ShowChart";
import PieChart from "@mui/icons-material/PieChart";
import FileDownload from "@mui/icons-material/FileDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Link } from "react-router-dom";

const sampleQueries = [
  {
    natural: "List all departments",
    sql: "SELECT DISTINCT department FROM employees;",
  },
  {
    natural: "Top 5 products by sales in 2023",
    sql: "SELECT TOP 5 product_name, SUM(sales) FROM orders WHERE YEAR(order_date) = 2023 GROUP BY product_name ORDER BY SUM(sales) DESC;",
  },
  {
    natural: "Average salary by department",
    sql: "SELECT department, AVG(salary) FROM employees GROUP BY department;",
  },
  {
    natural: "Show total revenue per year",
    sql: "SELECT YEAR(order_date), SUM(revenue) FROM sales GROUP BY YEAR(order_date);",
  },
];

const challenges = [
  {
    challenge: "Mapping vague queries to correct SQL",
    solution: "Introduced table-aware prompting and auto-suggestions",
  },
  {
    challenge: "Handling runtime SQL errors",
    solution: "Implemented a TRY-CATCH wrapper and safe failure messages",
  },
  {
    challenge: "Designing an intuitive interface",
    solution:
      "Used Streamlit with Tailwind CSS for minimal, responsive interaction",
  },
];

const roadmap = [
  "Visualization Engine: Add basic bar/line/pie charts for aggregated data",
  "User Authentication: Optional user login with role-based access",
  "Data Masking & Security: Obfuscate sensitive columns in output",
  "SQL Validator: Pre-execute SQL linting and safety check",
  "Session-based Memory: Enable contextual query history and refinement",
  "Query History & Export: Allow downloading of results and logs",
];

const AboutPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const Section = ({ title, icon, children, ...props }) => (
    <Box sx={{ mb: 5, ...props }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
        <Box
          sx={{
            color: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDark
            ? `linear-gradient(#3466F610 1px, transparent 1px), 
             linear-gradient(90deg, #3466F610 1px, transparent 1px)`
            : `linear-gradient(#3466F608 1px, transparent 1px), 
             linear-gradient(90deg, #3466F608 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          backgroundPosition: "center center",
          zIndex: 0,
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor:
            theme.palette.background.hero || theme.palette.background.default,
          py: 6,
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
          }`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDark
              ? `linear-gradient(#3466F620 1px, transparent 1px), 
                 linear-gradient(90deg, #3466F620 1px, transparent 1px)`
              : `linear-gradient(#3466F610 1px, transparent 1px), 
                 linear-gradient(90deg, #3466F610 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
            backgroundPosition: "center center",
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-100%", // Fixed positioning
            left: "-50%", // Fixed positioning
            width: "200%", // Increased width to ensure full coverage
            height: "300%", // Increased height
            background: isDark
              ? "radial-gradient(circle at center, rgba(52, 102, 246, 0.08) 0%, rgba(17, 24, 39, 0) 70%)"
              : "radial-gradient(circle at center, rgba(52, 102, 246, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: isDark
                  ? "rgba(52, 102, 246, 0.15)"
                  : "rgba(52, 102, 246, 0.1)",
                color: theme.palette.primary.main,
                px: 2,
                py: 0.5,
                borderRadius: "100px",
                mb: 2,
                fontWeight: 600,
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
              About QueryBot
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: isDark
                  ? "linear-gradient(to right, #3466F6, #8C9EFF)"
                  : "linear-gradient(to right, #1E40AF, #3466F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your GenAI SQL Chatbot
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "800px", mx: "auto", fontWeight: 400 }}
            >
              A streamlined, production-ready platform that enables users to
              query structured databases using natural language
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Section
          title="What This App Does"
          icon={<InfoOutlinedIcon fontSize="medium" />}
        >
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: isDark
                ? "rgba(52, 102, 246, 0.05)"
                : "rgba(52, 102, 246, 0.02)",
              border: `1px solid ${
                isDark ? "rgba(52, 102, 246, 0.2)" : "rgba(52, 102, 246, 0.1)"
              }`,
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.primary }}
            >
              This application enables users to query an Azure SQL database
              using plain English. It translates natural language queries into
              executable SQL statements, runs them against the connected
              database, and returns neatly formatted results. In addition to
              conversational querying, the system also includes a database
              explorer, schema insights, and intelligent query suggestions.
            </Typography>
          </Card>
        </Section>

        <Section
          title="How to Use the App"
          icon={<DescriptionOutlinedIcon fontSize="medium" />}
        >
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
              gridTemplateRows: "auto",
              gridAutoFlow: "dense",
            }}
          >
            {/* First large card - spans 2x2 */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 3" },
                gridRow: { xs: "span 1", md: "span 1" },
                height: "100%",
                transition: "all 0.3s ease",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                }`,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 10px 20px rgba(0,0,0,0.2)"
                    : "0 10px 20px rgba(0,0,0,0.1)",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ color: theme.palette.primary.main }}>
                  <StorageOutlinedIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Data Insights
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This section provides actionable insights from your data.
                Explore trends, patterns, and aggregated metrics to make
                informed decisions. The platform supports interactive
                visualizations and detailed reports for deeper analysis.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Go to the{" "}
                <Typography
                  component={Link}
                  to="/chat"
                  sx={{
                    color: theme.palette.primary.main,
                    fontFamily: "'Geist Mono', monospace",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    px: 1,
                    py: 0.5,
                    bgcolor: isDark
                      ? "rgba(52, 102, 246, 0.1)"
                      : "rgba(52, 102, 246, 0.05)",
                    borderRadius: "4px",
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(52, 102, 246, 0.2)"
                        : "rgba(52, 102, 246, 0.1)",
                    },
                  }}
                >
                  Chat
                </Typography>{" "}
                page and type a natural language query such as
                <Box
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.75rem",
                    color: isDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.85)",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }`,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: "0.75rem",
                      lineHeight: 1.5,
                      m: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    What is the average sae amount per transaction?
                  </Typography>
                </Box>
              </Typography>

              <Box sx={{ mt: "auto", pt: 2 }}>
                <img
                  src="/chat-preview.png"
                  alt="Chat interface"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    opacity: 0.8,
                  }}
                />
              </Box>
            </Card>

            {/* Second card - tall format */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 2" },
                gridRow: { xs: "span 1", md: "span 1" },
                height: "100%",
                transition: "all 0.3s ease",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                }`,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 10px 20px rgba(0,0,0,0.2)"
                    : "0 10px 20px rgba(0,0,0,0.1)",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ color: theme.palette.primary.main }}>
                  <QuizOutlinedIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Explore Your Dataset
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Once connected, you can browse through available tables, view
                their schemas (column names and data types), and preview sample
                rows.
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: isDark
                    ? "rgba(52, 102, 246, 0.05)"
                    : "rgba(52, 102, 246, 0.02)",
                  borderRadius: 1,
                  border: `1px solid ${
                    isDark
                      ? "rgba(52, 102, 246, 0.2)"
                      : "rgba(52, 102, 246, 0.1)"
                  }`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: "block", mb: 1 }}
                >
                  Available tables
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }`,
                        bgcolor: isDark
                          ? "rgba(52, 102, 246, 0.05)"
                          : "rgba(52, 102, 246, 0.02)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "0.75rem",
                          color: isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.7)",
                        }}
                      >
                        customers
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }`,
                        bgcolor: isDark
                          ? "rgba(52, 102, 246, 0.05)"
                          : "rgba(52, 102, 246, 0.02)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "0.75rem",
                          color: isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.7)",
                        }}
                      >
                        orders
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }`,
                        bgcolor: isDark
                          ? "rgba(52, 102, 246, 0.05)"
                          : "rgba(52, 102, 246, 0.02)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "0.75rem",
                          color: isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.7)",
                        }}
                      >
                        products
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }`,
                        bgcolor: isDark
                          ? "rgba(52, 102, 246, 0.05)"
                          : "rgba(52, 102, 246, 0.02)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "0.75rem",
                          color: isDark
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(0,0,0,0.7)",
                        }}
                      >
                        employees
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This helps you understand the structure of your data before
                asking questions.
              </Typography>
            </Card>

            {/* Third card - normal */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 2" },
                gridRow: { xs: "span 1", md: "span 1" },
                height: "100%",
                transition: "all 0.3s ease",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                }`,
                bgcolor: isDark
                  ? "rgba(52, 102, 246, 0.05)"
                  : "rgba(52, 102, 246, 0.02)",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 10px 20px rgba(0,0,0,0.2)"
                    : "0 10px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ color: theme.palette.primary.main }}>
                  <PsychologyOutlinedIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Voice-to-Text Querying
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Use voice-to-text functionality to ask questions naturally.
                Simply speak into the microphone, and the system will convert
                your voice into text, process the query, and provide answers
                instantly.
              </Typography>

              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <video
                  src="/mic.webm"
                  autoPlay
                  loop
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              </Box>
            </Card>

            {/* Fourth card - normal */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 3" },
                height: "100%",
                transition: "all 0.3s ease",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                }`,
                bgcolor: isDark
                  ? "rgba(99, 102, 241, 0.05)"
                  : "rgba(99, 102, 241, 0.02)",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 10px 20px rgba(0,0,0,0.2)"
                    : "0 10px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ color: "#6366F1" }}>
                  <AutoAwesomeIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  View Results
                </Typography>
              </Box>
              <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      The system automatically converts your natural language
                      input into SQL and executes it against your database.
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Results are displayed in a clear, tabular format that you
                      can analyze, filter, and export for further use.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 2,
                      bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                      borderRadius: 1,
                      border: `1px solid ${
                        isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                      }`,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#10B981", display: "block", mb: 1 }}
                    >
                      Generated SQL:
                    </Typography>

                    <Box
                      sx={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.75rem",
                        color: isDark
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(0,0,0,0.85)",
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: isDark
                          ? "rgba(0,0,0,0.3)"
                          : "rgba(0,0,0,0.02)",
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                        }`,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: "0.75rem",
                          lineHeight: 1.5,
                          m: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        SELECT * FROM employees WHERE hire_date > '2020-01-01'
                        ORDER BY hire_date DESC
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1.5,
                      }}
                    ></Box>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </Section>

        
        <Section
          title="Visualize Data"
          icon={<BoltOutlinedIcon fontSize="medium" color="primary" />}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                  bgcolor: isDark
                    ? "rgba(52, 102, 246, 0.05)"
                    : "rgba(52, 102, 246, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <BarChartIcon fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Bar Chart
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                  bgcolor: isDark
                    ? "rgba(52, 102, 246, 0.05)"
                    : "rgba(52, 102, 246, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ShowChart fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Line Chart
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                  bgcolor: isDark
                    ? "rgba(52, 102, 246, 0.05)"
                    : "rgba(52, 102, 246, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <PieChart fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Pie Chart
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                  bgcolor: isDark
                    ? "rgba(52, 102, 246, 0.05)"
                    : "rgba(52, 102, 246, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <FileDownload fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Download CSV
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Section>

        <Section title="How It Works" icon={<HelpOutlineIcon fontSize="medium" />}>
  <Card elevation={0} sx={{ borderRadius: 1 }}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box sx={{ pl: 2, pt: 1.5 }}>
          <Typography variant="body1" gutterBottom>1. <strong>Ask</strong> using text or voice</Typography>
          <Typography variant="body1" gutterBottom>2. <strong>Get output</strong> - SQL + charts + table</Typography>
          <Typography variant="body1" gutterBottom>3. <strong>Refine, download</strong>, or debug</Typography>
          <Typography variant="body1" gutterBottom>4. <strong>Explore suggestions</strong> or try sample queries</Typography> {/* ✅ NEW POINT */}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 1.5,
          }}
        />
      </Grid>
    </Grid>
  </Card>
</Section>

        <Section title="Sample Queries" icon={<CodeIcon fontSize="medium" />}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              overflow: "hidden",
              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead
                  sx={{
                    bgcolor: isDark
                      ? "rgba(52, 102, 246, 0.1)"
                      : "rgba(52, 102, 246, 0.05)",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Natural Language Input
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      SQL Translation
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleQueries.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.01)",
                        },
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: isDark
                            ? "rgba(52, 102, 246, 0.08)"
                            : "rgba(52, 102, 246, 0.04)",
                        },
                      }}
                    >
                      <TableCell>{row.natural}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            fontFamily: '"Geist Mono", monospace',
                            bgcolor: isDark
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(0,0,0,0.03)",
                            p: 1,
                            borderRadius: 1,
                            overflowX: "auto",
                          }}
                        >
                          {row.sql}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Section>

        <Section
          title="Prompting Tips"
          icon={<TipsAndUpdatesOutlinedIcon fontSize="medium" />}
        >
          <Card
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 1,
              overflow: "hidden",
              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <List disablePadding>
              {[
                {
                  primary:
                    "Be specific: Include table names or column references where possible.",
                  secondary:
                    'Example: "Show average salary by department in 2022."',
                },
                {
                  primary: "Use contextual filters:",
                  secondary:
                    'Example: "Employees with salary over 70000 in Marketing."',
                },
                {
                  primary:
                    "Avoid vague phrasing: General inputs like 'Show me something interesting' may not yield usable results.",
                },
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                      <CheckCircleOutlineIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>{item.primary}</Typography>
                      }
                      secondary={item.secondary ? item.secondary : null}
                      secondaryTypographyProps={{
                        sx: { mt: item.secondary ? 0.5 : 0 },
                      }}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Section>

                {/* Reflections */}
                <Section title="Reflections" icon={<LightbulbOutlinedIcon fontSize="medium" />}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              overflow: "hidden",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Cleaner Flow
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Streamlined the experience by merging duplicate sections and
                    simplifying steps so users don't feel overwhelmed.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    More Visual Cues
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Used preview images and icons consistently across sections to make
                    features easier to scan and understand at a glance.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    User-Friendly Prompts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reworded prompts and tips to sound more natural and friendly,
                    helping users feel more confident when asking questions.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Focus on Output Clarity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Added chart/table previews, clearer result summaries, and SQL transparency
                    to help users trust and understand the insights.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Section>

        <Box sx={{ textAlign: "center", mt: 8, mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => window.location.href = "/chat"}
            sx={{
              fontWeight: 600,
              py: 1.5,
              px: 4,
              borderRadius: "100px",
              boxShadow: "0 8px 16px rgba(52, 102, 246, 0.25)",
              "&:hover": {
                boxShadow: "0 12px 20px rgba(52, 102, 246, 0.3)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Try QueryBot Now!
          </Button>
        </Box>

      </Container>
    </Box>
  );
};

export default AboutPage;