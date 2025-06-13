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
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import DashboardIcon from '@mui/icons-material/Dashboard';
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
              query structured databases using natural language via text and voice input
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
QueryBot enables users to query an Azure SQL database using natural language - either typed or spoken. It converts user questions into SQL, runs them securely on the database, and presents the results in a structured table along with an easy-to-understand summary. The app also provides smart query suggestions, domain-specific schema insights, and a dashboard to explore different data areas like Sales, HR, or Support. It's built to make data exploration effortless, even for users with no technical background.
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
            {/* Step 1: Ask a Question */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 3" },
                height: "100%",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                transition: "0.3s",
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
                  <KeyboardVoiceOutlinedIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Ask a Question
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Start by typing or speaking a question about the data, such as{" "}
                <strong>"Show me monthly sales for 2024"</strong>. You don't need to write SQL —
                just use natural language!
              </Typography>
              <Box sx={{ mt: "auto", pt: 2 }}>
                <img
                  src="/ask-preview.png"
                  alt="Ask question preview"
                  style={{ width: "100%", borderRadius: "4px", objectFit: "cover", opacity: 0.85 }}
                />
              </Box>
            </Card>

            {/* Step 2: Get Instant Results */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 2" },
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                transition: "0.3s",
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
                  <BarChartOutlinedIcon />
                </Box>
                  <Typography variant="h6" fontWeight={600}>
                  See Results Instantly
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The app uses AI to convert your question into SQL, runs it on the dataset, and returns the output with smart charts, tables, and summaries.
              </Typography>
              <Box sx={{ mt: "auto", pt: 2 }}>
                <img
                  src="/results-preview.png"
                  alt="Results preview"
                  style={{ width: "100%", height: "200px", borderRadius: "4px", opacity: 0.9}}
                />
              </Box>
            </Card>

            {/* Step 3: Download & Explore */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 3" },
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                transition: "0.3s",
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
                  <DownloadIcon />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <ArrowDownwardIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  Download or Refine
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Review the SQL generated, fix errors (if any), download the results,
                or follow up with a refined query — all in a simple chat flow.
              </Typography>
            </Card>

            {/* Step 4: Understand Output */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                gridColumn: { xs: "span 1", md: "span 2" },
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                transition: "0.3s",
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
                  <BarChartIcon />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Understand the Output
                </Typography>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Review smart visualizations and summaries generated from your query - including bar charts, line graphs, tables, and plain-language insights. Instantly identify key patterns, track performance metrics, and uncover trends that help you make informed, data-driven decisions with confidence.
                </Typography>
              </Box>
            </Card>
          </Box>
        </Section>

        <Section title="How It Works" icon={<HelpOutlineIcon fontSize="medium" />}>
          <Card elevation={0} sx={{ borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ pl: 2, pt: 1.5 }}>
                  <Typography variant="body1" gutterBottom>1. <strong>Ask</strong> using text or voice</Typography>
                  <Typography variant="body1" gutterBottom>2. <strong>Get output</strong> — SQL + charts + table</Typography>
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

        {/* Call to action to try chat */}
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