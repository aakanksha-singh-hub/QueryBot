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
    challenge: "Connecting to Azure SQL databases securely",
    solution:
      "Used environment-level access configuration with scoped credentials",
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
                  Connect to Your Database
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Navigate to the{" "}
                <Typography
                  component={Link}
                  to="/connect"
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
                  Connect
                </Typography>{" "}
                page and enter the required Azure SQL credentials: server name,
                database name, username, and password.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                On successful validation, your session will be initialized for
                querying with full access to your database schema.
              </Typography>

              <Box sx={{ mt: "auto", pt: 2 }}>
                <img
                  src="/connect-preview.png"
                  alt="Connect interface preview"
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
                  Available tables:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.75rem",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  }}
                >
                  • customers
                  <br />
                  • orders
                  <br />
                  • products
                  <br />• employees
                </Typography>
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
                  Ask a Question
                </Typography>
              </Box>

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
                page and type a natural language query such as "List all
                employees who joined after 2020."
              </Typography>

              <Box sx={{ mt: "auto", pt: 2 }}>
                <img
                  src="/chat-preview.png"
                  alt="chat preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    opacity: 0.8,
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

        {/* Fifth card - wide */}
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

        <Section
          title="Limitations"
          icon={<WarningAmberOutlinedIcon fontSize="medium" />}
        >
          <Grid container spacing={2}>
            {[
              "Ambiguity in queries: The system may struggle with overly vague or highly contextual questions.",
              "Security scope: Only read operations are permitted. The system does not allow updates, deletions, or schema changes.",
              "Error handling: SQL errors are caught and shown gracefully, but complex nested queries may require refinement.",
              "Sensitive data: This POC does not yet support masking or encryption of sensitive fields.",
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 1,
                    height: "100%",
                    display: "flex",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                    bgcolor:
                      index === 0
                        ? isDark
                          ? "rgba(237, 137, 54, 0.1)"
                          : "rgba(237, 137, 54, 0.05)"
                        : index === 1
                        ? isDark
                          ? "rgba(99, 102, 241, 0.1)"
                          : "rgba(99, 102, 241, 0.05)"
                        : index === 2
                        ? isDark
                          ? "rgba(236, 72, 153, 0.1)"
                          : "rgba(236, 72, 153, 0.05)"
                        : isDark
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(16, 185, 129, 0.05)",
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {item}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Section
              title="Why We Built This"
              icon={<LightbulbOutlinedIcon fontSize="medium" />}
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
                    isDark
                      ? "rgba(52, 102, 246, 0.2)"
                      : "rgba(52, 102, 246, 0.1)"
                  }`,
                  height: "100%",
                }}
              >
                <Typography variant="body2" color="text.primary">
                  Accessing insights from databases still requires technical
                  fluency in SQL. This project was designed to simplify
                  structured data querying using natural language, making
                  enterprise data accessible to non-technical users. By
                  integrating Azure SQL with Azure OpenAI, we showcase how AI
                  can improve workflows and reduce friction in everyday data
                  interaction.
                </Typography>
              </Card>
            </Section>
          </Grid>

          <Grid item xs={12} md={6}>
            <Section
              title="What We Learned"
              icon={<PsychologyOutlinedIcon fontSize="medium" />}
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
                  height: "100%",
                }}
              >
                <List disablePadding dense>
                  {[
                    "Effective prompt engineering dramatically improves query accuracy.",
                    "Integrating schema-awareness and metadata helps guide meaningful query construction.",
                    "Robust error handling is essential to build trust and reliability in an AI-driven querying experience.",
                    "The user experience must remain clean and responsive, especially for technical tasks like database exploration.",
                  ].map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon
                            fontSize="small"
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Section>
          </Grid>
        </Grid>

        <Section
          title="Challenges and Solutions"
          icon={<ConstructionOutlinedIcon fontSize="medium" />}
        >
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
                    <TableCell sx={{ fontWeight: 600 }}>Challenge</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Solution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {challenges.map((row, idx) => (
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
                      <TableCell>{row.challenge}</TableCell>
                      <TableCell>{row.solution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Section>

        <Section
          title="Future Roadmap"
          icon={<TrendingUpIcon fontSize="medium" />}
        >
          <Grid container spacing={2}>
            {roadmap.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 1,
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                    transition: "all 0.3s ease",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: isDark
                        ? "0 10px 20px rgba(0,0,0,0.2)"
                        : "0 10px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <BoltOutlinedIcon
                      color="primary"
                      fontSize="small"
                      sx={{ mt: 0.3 }}
                    />
                    {item}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* Step 6: Visualize Data */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            gridColumn: { xs: "span 1", sm: "span 2" },
            height: "100%",
            transition: "all 0.3s ease",
            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
            }`,
            position: "relative",
            overflow: "hidden",
            bgcolor: isDark
              ? "rgba(16, 185, 129, 0.05)"
              : "rgba(16, 185, 129, 0.02)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #FBBF24, #10B981)",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
                mr: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                6
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Visualize Data & Download Results
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create charts from your data or export results for further analysis.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              size="small"
              startIcon={<BarChartIcon fontSize="small" />}
              sx={{
                borderRadius: 1.5,
                bgcolor: isDark
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(16, 185, 129, 0.05)",
                color: "#10B981",
                border: `1px solid ${
                  isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"
                }`,
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(16, 185, 129, 0.1)",
                },
              }}
            >
              Bar Chart
            </Button>
            <Button
              size="small"
              startIcon={<ShowChart fontSize="small" />}
              sx={{
                borderRadius: 1.5,
                bgcolor: isDark
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(16, 185, 129, 0.05)",
                color: "#10B981",
                border: `1px solid ${
                  isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"
                }`,
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(16, 185, 129, 0.1)",
                },
              }}
            >
              Line Chart
            </Button>
            <Button
              size="small"
              startIcon={<PieChart fontSize="small" />}
              sx={{
                borderRadius: 1.5,
                bgcolor: isDark
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(16, 185, 129, 0.05)",
                color: "#10B981",
                border: `1px solid ${
                  isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"
                }`,
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(16, 185, 129, 0.1)",
                },
              }}
            >
              Pie Chart
            </Button>
            <Button
              size="small"
              startIcon={<FileDownload fontSize="small" />}
              sx={{
                borderRadius: 1.5,
                bgcolor: isDark
                  ? "rgba(99, 102, 241, 0.1)"
                  : "rgba(99, 102, 241, 0.05)",
                color: "#6366F1",
                border: `1px solid ${
                  isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)"
                }`,
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(99, 102, 241, 0.15)"
                    : "rgba(99, 102, 241, 0.1)",
                },
              }}
            >
              Download CSV
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default AboutPage;
