import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  CssBaseline,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import Chat from "./components/Chat";
import AboutPage from "./components/AboutPage";
import StorageIcon from "@mui/icons-material/Storage";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import SecurityIcon from "@mui/icons-material/Security";
import BarChartIcon from "@mui/icons-material/BarChart";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

// This comment is added to force GitHub to re-index the frontend directory.
// It can be removed later if desired.

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: { main: "#3466F6", contrastText: "#fff" },
          secondary: { main: "#4B5563", contrastText: "#fff" },
          background: {
            default: "#FFFFFF",
            paper: "#F9FAFB",
            navbar: "#FFFFFF",
            hero: "#FFFFFF",
            section: "#F9FAFB",
            card: "#FFFFFF",
          },
          text: {
            primary: "#111827",
            secondary: "#4B5563",
          },
        }
      : {
          primary: { main: "#3466F6", contrastText: "#fff" },
          secondary: { main: "#6B7280", contrastText: "#fff" },
          background: {
            default: "#111827",
            paper: "#1F2937",
            navbar: "#111827",
            hero: "#111827",
            section: "#1F2937",
            card: "#1F2937",
          },
          text: {
            primary: "#F9FAFB",
            secondary: "#D1D5DB",
          },
        }),
  },
  typography: {
    fontFamily:
      '"Geist Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.7,
      fontSize: "1.05rem",
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12, // Increased for more modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 100, // Full rounded buttons look more modern
          padding: "10px 20px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(52, 102, 246, 0.3)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            mode === "light"
              ? "0px 1px 3px rgba(0, 0, 0, 0.08), 0px 2px 5px rgba(0, 0, 0, 0.05)"
              : "0px 2px 8px rgba(0, 0, 0, 0.25)",
          borderRadius: 8, // Consistent with shape.borderRadius
          overflow: "hidden", // To ensure content respects border radius
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": {
            boxShadow:
              mode === "light"
                ? "0px 4px 12px rgba(0, 0, 0, 0.1), 0px 3px 8px rgba(0, 0, 0, 0.06)"
                : "0px 4px 12px rgba(0, 0, 0, 0.35)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontFamily: '"Geist Sans", system-ui, -apple-system, sans-serif',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        code: {
          fontFamily: '"Geist Mono", monospace',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Remove any default gradient backgrounds
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Remove any default gradient backgrounds
        },
      },
    },
  },
});

const NATURAL_SUGGESTIONS = [
  "How many employees work in each department?",
  "Who are the top 5 highest paid employees?",
  "Show me the average salary by department.",
  "What are the most common skills among employees?",
  "Show me recent hiring trends.",
  "Which department has the best performance ratings?",
  "List all employees who joined in the last year.",
  "Show me the gender distribution in the company.",
  "What is the average years of experience by department?",
  "Show me a breakdown of employees by education level.",
];

const NavigationBar = ({ mode, toggleMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Track scroll position for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          pt: 2,
          pb: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: theme.palette.background.navbar,
            backdropFilter: "blur(10px)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(17, 24, 39, 0.85)",
            color: theme.palette.text.primary,
            borderRadius: "100px",
            boxShadow: scrolled
              ? "0px 2px 8px rgba(0, 0, 0, 0.12)"
              : "0px 1px 3px rgba(0, 0, 0, 0.08)",
            py: 0,
            maxWidth: { xs: "100%", md: "900px" },
            width: { xs: "100%", md: "900px" },
            transition: "box-shadow 0.3s ease",
            border:
              theme.palette.mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.05)"
                : "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Toolbar
            sx={{
              minHeight: 60,
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 2, md: 3 },
            }}
          >
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              <Box
                component="img"
                src="/logo.svg"
                alt="QueryBot Logo"
                sx={{
                  width: 42,
                  height: 42,
                  mr: 1,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "0",
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                }}
              >
                QueryBot
              </Typography>
            </Box>

            {/* Desktop navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate("/")}
                  sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                >
                  Home
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate("/chat")}
                  sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                >
                  Chat
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate("/about")}
                  sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                >
                  About
                </Button>
                <IconButton
                  onClick={toggleMode}
                  sx={{ ml: 0.5 }}
                  color="inherit"
                  size="small"
                >
                  {mode === "dark" ? (
                    <LightModeOutlinedIcon fontSize="small" />
                  ) : (
                    <DarkModeOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{
                    fontWeight: 600,
                    borderRadius: "100px",
                    ml: 0.5,
                    px: 2.5,
                    py: 0.8,
                  }}
                  onClick={() => navigate("/chat")}
                >
                  Use Chat
                </Button>
              </Box>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: 0.5,
                }}
              >
                <IconButton onClick={toggleMode} color="inherit" size="small">
                  {mode === "dark" ? (
                    <LightModeOutlinedIcon fontSize="small" />
                  ) : (
                    <DarkModeOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="menu"
                  sx={{
                    transition: "transform 0.3s",
                    transform: mobileMenuOpen ? "rotate(90deg)" : "none",
                    bgcolor: mobileMenuOpen
                      ? "rgba(0,0,0,0.05)"
                      : "transparent",
                    borderRadius: "8px",
                  }}
                >
                  {mobileMenuOpen ? (
                    <Box sx={{ fontSize: "1.2rem", fontWeight: 300 }}>✕</Box>
                  ) : (
                    <Box
                      sx={{
                        width: 18,
                        height: 14,
                        position: "relative",
                        "&::before, &::after, & span": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: 2,
                          borderRadius: 4,
                          bgcolor: "currentColor",
                          left: 0,
                          transition: "all 0.3s ease",
                        },
                        "&::before": {
                          top: 0,
                        },
                        "& span": {
                          top: "50%",
                          transform: "translateY(-50%)",
                        },
                        "&::after": {
                          bottom: 0,
                        },
                      }}
                    >
                      <span />
                    </Box>
                  )}
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Container>

      {/* Mobile menu overlay */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1099,
            opacity: mobileMenuOpen ? 1 : 0,
            pointerEvents: mobileMenuOpen ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      {isMobile && (
        <Box
          ref={menuRef}
          sx={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: mobileMenuOpen
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-20px)",
            width: "92%",
            maxWidth: "400px",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            bgcolor: theme.palette.background.paper,
            transition: "all 0.3s ease",
            opacity: mobileMenuOpen ? 1 : 0,
            visibility: mobileMenuOpen ? "visible" : "hidden",
            zIndex: 1200,
          }}
        >
          <Box sx={{ p: 2 }}>
            {["Home", "Chat", "About"].map((item) => (
              <Button
                key={item}
                color="inherit"
                fullWidth
                onClick={() => {
                  navigate(`/${item === "Home" ? "" : item.toLowerCase()}`);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  py: 1.8,
                  justifyContent: "flex-start",
                  fontWeight: 500,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                {item}
              </Button>
            ))}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                fontWeight: 600,
                mt: 2,
                borderRadius: 2,
                py: 1.8,
                boxShadow: "0 4px 12px rgba(52, 102, 246, 0.25)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(52, 102, 246, 0.35)",
                },
              }}
              onClick={() => {
                navigate("/chat");
                setMobileMenuOpen(false);
              }}
            >
              Use Chat
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

const HeroSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: theme.palette.background.hero,
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 8 },
        overflow: "hidden",
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
          top: "-50%",
          left: "-20%",
          width: "140%",
          height: "200%",
          background: isDark
            ? "radial-gradient(circle, rgba(52, 102, 246, 0.08) 0%, rgba(17, 24, 39, 0) 50%)"
            : "radial-gradient(circle, rgba(52, 102, 246, 0.06) 0%, rgba(255, 255, 255, 0) 50%)",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Box
            sx={{
              display: "inline-flex",
              bgcolor: isDark
                ? "rgba(52, 102, 246, 0.15)"
                : "rgba(52, 102, 246, 0.1)",
              color: "primary.main",
              px: 2,
              borderRadius: "100px",
              mb: 3,
              fontSize: "0.875rem",
              fontWeight: 600,
              alignItems: "center",
              gap: 1,
              boxShadow: isDark ? "0 0 20px rgba(52, 102, 246, 0.15)" : "none",
            }}
          >
            <SpeedIcon sx={{ fontSize: "0.875rem" }} />
            Powered by Azure OpenAI
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "text.primary",
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
              background: isDark
                ? "linear-gradient(to right, #3466F6, #8C9EFF)"
                : "linear-gradient(to right, #1E40AF, #3466F6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "fadeIn 0.6s ease-out",
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            Create, collaborate, and
            <br />
            scale your database queries.
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              color: "text.secondary",
              mb: 5,
              maxWidth: "780px",
              mx: "auto",
              lineHeight: 1.5,
              animation: "fadeIn 0.6s ease-out 0.2s both",
            }}
          >
            Effortlessly query your Azure SQL database using plain English, with
            the power of AI to translate natural language to SQL queries.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 5,
              animation: "fadeIn 0.6s ease-out 0.3s both",
            }}
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{
                fontWeight: 600,
                py: 1.8,
                px: 4,
                fontSize: "1rem",
                borderRadius: "100px",
                boxShadow: "0 8px 16px rgba(52, 102, 246, 0.25)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 20px rgba(52, 102, 246, 0.3)",
                },
              }}
              onClick={() => navigate("/chat")}
            >
              Start Chatting
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              sx={{
                fontWeight: 600,
                py: 1.8,
                px: 4,
                fontSize: "1rem",
                borderRadius: "100px",
                borderWidth: "2px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderWidth: "2px",
                },
              }}
              onClick={() => navigate("/about")}
            >
              About Us
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            mx: "auto",
            maxWidth: "900px",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: isDark
              ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 102, 246, 0.1)"
              : "0 20px 40px rgba(0, 0, 0, 0.15)",
            border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
            transform: "perspective(1000px) rotateX(2deg)",
            transformOrigin: "center top",
            transition: "all 0.5s ease",
            animation: "slideUp 0.8s ease-out 0.4s both",
            "&:hover": {
              transform: "perspective(1000px) rotateX(0deg)",
              boxShadow: isDark
                ? "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(52, 102, 246, 0.15)"
                : "0 30px 60px rgba(0, 0, 0, 0.2)",
            },
            "@keyframes slideUp": {
              "0%": {
                opacity: 0,
                transform: "perspective(1000px) rotateX(2deg) translateY(30px)",
              },
              "100%": {
                opacity: 1,
                transform: "perspective(1000px) rotateX(2deg) translateY(0)",
              },
            },
          }}
        >
          <Card
            elevation={0}
            sx={{
              bgcolor: theme.palette.background.card,
              borderRadius: 1,
              overflow: "hidden",
              backdropFilter: isDark ? "blur(10px)" : "none",
              background: isDark
                ? "linear-gradient(180deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)"
                : theme.palette.background.card,
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AutoAwesomeIcon fontSize="small" />
                  Show me the top 5 customers by revenue
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: ["#f87171", "#facc15", "#4ade80"][i],
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box
                sx={{
                  bgcolor: isDark ? "rgba(17, 24, 39, 0.8)" : "#F3F4F6",
                  borderRadius: 1,
                  p: 3,
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: "0.9rem",
                  mb: 3,
                  color: isDark ? "#D1D5DB" : "#374151",
                  overflowX: "auto",
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "none",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {`SELECT TOP 5 c.customer_name,
       SUM(o.total_amount) as total_revenue
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_name
ORDER BY total_revenue DESC`}
                </pre>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight={600}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BoltIcon fontSize="small" />
                  Results displayed in a beautiful interactive table
                </Typography>
                <Box
                  component="button"
                  sx={{
                    bgcolor: isDark
                      ? "rgba(52, 102, 246, 0.15)"
                      : "rgba(52, 102, 246, 0.1)",
                    color: "primary.main",
                    border: "none",
                    borderRadius: "8px",
                    py: 0.75,
                    px: 2,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(52, 102, 246, 0.25)"
                        : "rgba(52, 102, 246, 0.2)",
                    },
                  }}
                >
                  Run Query
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

// Replace the benefits array with this one using Material UI icons
const benefits = [
  {
    icon: <CheckCircleOutlineIcon fontSize="large" />,
    title: "No SQL Expertise Required",
    desc: "Ask questions in plain English and get instant results",
  },
  {
    icon: <BoltIcon fontSize="large" />,
    title: "Real-time Insights",
    desc: "Get immediate answers to your data questions",
  },
  {
    icon: <BarChartIcon fontSize="large" />,
    title: "Visualize & Export",
    desc: "View results in charts and export in multiple formats",
  },
];

// Update BenefitsSection to match the image layout more closely
const BenefitsSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 6,
          }}
        >
          Key Benefits
        </Typography>

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                component="img"
                src="/benefits-illustration.png"
                alt="Data Analysis Benefits"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Simplify Your Data Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our platform transforms how you interact with your data,
                  making complex database queries accessible to everyone in your
                  organization regardless of technical expertise.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Right column - benefits grid */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} sx={{ height: "100%" }}>
              {/* First row - two cards side by side */}
              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    bgcolor: isDark
                      ? "rgba(52, 102, 246, 0.1)"
                      : "rgba(52, 102, 246, 0.05)",
                    borderRadius: 1,
                    border: isDark
                      ? "1px solid rgba(52, 102, 246, 0.3)"
                      : "1px solid rgba(52, 102, 246, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ color: "primary.main", mb: 1 }}>
                    {benefits[0].icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {benefits[0].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefits[0].desc}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    bgcolor: isDark
                      ? "rgba(99, 102, 241, 0.1)"
                      : "rgba(99, 102, 241, 0.05)",
                    borderRadius: 1,
                    border: isDark
                      ? "1px solid rgba(99, 102, 241, 0.3)"
                      : "1px solid rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ color: "#6366F1", mb: 1 }}>{benefits[1].icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {benefits[1].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefits[1].desc}
                  </Typography>
                </Card>
              </Grid>

              {/* Second row - full width card */}
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    bgcolor: isDark
                      ? "rgba(52, 102, 246, 0.1)"
                      : "rgba(52, 102, 246, 0.05)",
                    borderRadius: 1,
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ color: "#EF4444", mb: 1 }}>{benefits[2].icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {benefits[2].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefits[2].desc}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Update TechStackSection with a bento-style layout
const TechStackSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Define the missing cardContentSx variable
  const cardContentSx = {
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    height: "100%",
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, py: 10 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
          }}
        >
          Powered By
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{
            color: "text.secondary",
            mb: 6,
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Built with cutting-edge technologies to deliver a seamless experience
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 3,
          }}
        >
          {techStack.map((tech, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                ...cardContentSx,
                bgcolor: theme.palette.background.paper,
                borderRadius: 1,
                border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
              }}
            >
              <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                {tech.icon}
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {tech.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tech.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const CTASection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const logoRef = useRef(null);
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / 25;
        const deltaY = (e.clientY - centerY) / 25;
        setMousePosition({ x: deltaX, y: deltaY });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Interactive Logo with advanced animation */}
          <Box
            ref={logoRef}
            sx={{
              position: "relative",
              width: { xs: 200, md: 400 },
              height: { xs: 200, md: 400 },
              order: { xs: 1, md: 1 },
              perspective: "1000px",
              cursor: "pointer",
              overflow: "visible",
            }}
          >
            {/* Database visualization elements */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                perspective: "800px",
              }}
            >
              {/* Interactive Logo */}
              <Box
                component="img"
                src="/logo.svg"
                alt="QueryBot Logo"
                sx={{
                  width: "80%",
                  height: "auto",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) 
                              translateX(${mousePosition.x * 1.5}px) 
                              translateY(${mousePosition.y * 1.5}px) 
                              rotateY(${mousePosition.x * 0.8}deg) 
                              rotateX(${-mousePosition.y * 0.8}deg)`,
                  transition: "transform 0.1s ease-out",
                  filter: `drop-shadow(0 20px 30px rgba(52, 246, 246, ${
                    isDark ? "0.4" : "0.25"
                  }))`,
                  zIndex: 3,
                }}
              />

              {/* Database cylinder backdrop */}
              <Box
                sx={{
                  position: "absolute",
                  width: "220px",
                  height: "220px",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) 
                              translateX(${mousePosition.x * 0.5}px) 
                              translateY(${mousePosition.y * 0.5}px)`,
                  borderRadius: "50%",
                  background: isDark
                    ? "linear-gradient(135deg, rgba(52, 246, 246, 0.2), rgba(99, 102, 241, 0.1))"
                    : "linear-gradient(135deg, rgba(52, 246, 246, 0.1), rgba(99, 102, 241, 0.05))",
                  boxShadow: isDark
                    ? "0 15px 35px rgba(0, 0, 0, 0.2)"
                    : "0 15px 35px rgba(0, 0, 0, 0.05)",
                  backdropFilter: "blur(5px)",
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(255, 255, 255, 0.5)",
                  zIndex: 1,
                  transition: "transform 0.3s ease-out",
                }}
              />

              {/* Circular lines */}
              {[...Array(3)].map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "absolute",
                    width: `${260 + index * 40}px`,
                    height: `${260 + index * 40}px`,
                    borderRadius: "50%",
                    border: `1px solid ${
                      isDark
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(99, 102, 241, 0.1)"
                    }`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: `spin ${20 + index * 5}s linear infinite`,
                    "@keyframes spin": {
                      "0%": {
                        transform: "translate(-50%, -50%) rotate(0deg)",
                      },
                      "100%": {
                        transform: "translate(-50%, -50%) rotate(360deg)",
                      },
                    },
                    zIndex: 0,
                  }}
                />
              ))}

              {/* Floating data points */}
              {[...Array(6)].map((_, index) => (
                <Box
                  key={`point-${index}`}
                  sx={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background:
                      index % 2 === 0 ? theme.palette.primary.main : "#6366F1",
                    boxShadow: `0 0 10px ${
                      index % 2 === 0 ? theme.palette.primary.main : "#6366F1"
                    }`,
                    top: `${30 + ((index * 60) % 300)}px`,
                    left: `${80 + ((index * 70) % 240)}px`,
                    animation: `float-${index} ${
                      3 + index * 0.5
                    }s ease-in-out infinite`,
                    "@keyframes float-0": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(10px)", opacity: 1 },
                    },
                    "@keyframes float-1": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(-10px)", opacity: 1 },
                    },
                    "@keyframes float-2": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(8px)", opacity: 1 },
                    },
                    "@keyframes float-3": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(-8px)", opacity: 1 },
                    },
                    "@keyframes float-4": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(6px)", opacity: 1 },
                    },
                    "@keyframes float-5": {
                      "0%, 100%": {
                        transform: "translateY(0px)",
                        opacity: 0.7,
                      },
                      "50%": { transform: "translateY(-6px)", opacity: 1 },
                    },
                    zIndex: 2,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Text content */}
          <Box
            sx={{
              textAlign: { xs: "center", md: "left" },
              order: { xs: 2, md: 2 },
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
              Ready to Transform Your Data Experience?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start exploring your data in a whole new way.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ fontWeight: 600, py: 1.5, px: 4, borderRadius: "100px" }}
              onClick={() => navigate("/chat")}
            >
              Try the Chat
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Update the tech stack array to use actual logos with glow effect
const techStack = [
  {
    icon: (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(0, 120, 212, 0.15)",
            filter: "blur(15px)",
            zIndex: 0,
          },
        }}
      >
        <Box
          component="img"
          src="/logos/azure-sql.svg"
          alt="Azure SQL Database"
          sx={{ height: 48, width: "auto", position: "relative", zIndex: 1 }}
        />
      </Box>
    ),
    title: "Azure SQL Database",
    desc: "Enterprise-grade database management",
  },
  {
    icon: (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(0, 188, 242, 0.15)",
            filter: "blur(15px)",
            zIndex: 0,
          },
        }}
      >
        <Box
          component="img"
          src="/logos/azure-openai.svg"
          alt="Azure OpenAI"
          sx={{ height: 48, width: "auto", position: "relative", zIndex: 1 }}
        />
      </Box>
    ),
    title: "Azure OpenAI (GPT-4)",
    desc: "State-of-the-art language model",
  },
  {
    icon: (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(89, 131, 240, 0.15)",
            filter: "blur(15px)",
            zIndex: 0,
          },
        }}
      >
        <Box
          component="img"
          src="/logos/azure-speech.svg"
          alt="Azure Speech Services"
          sx={{ height: 48, width: "auto", position: "relative", zIndex: 1 }}
        />
      </Box>
    ),
    title: "Azure Speech Services",
    desc: "Converts text answers into speech",
  },
  {
    icon: (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(63, 114, 155, 0.15)",
            filter: "blur(15px)",
            zIndex: 0,
          },
        }}
      >
        <Box
          component="img"
          src="/logos/python-fastapi.svg"
          alt="Python + FastAPI"
          sx={{ height: 48, width: "auto", position: "relative", zIndex: 1 }}
        />
      </Box>
    ),
    title: "Python + FastAPI",
    desc: "High-performance backend framework",
  },
  {
    icon: (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(97, 218, 251, 0.15)",
            filter: "blur(15px)",
            zIndex: 0,
          },
        }}
      >
        <Box
          component="img"
          src="/logos/react-mui.svg"
          alt="React + MUI"
          sx={{ height: 48, width: "auto", position: "relative", zIndex: 1 }}
        />
      </Box>
    ),
    title: "React + MUI",
    desc: "Modern, fast, and beautiful UI",
  },
];

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  // Animation variants for the footer elements
  const [hovered, setHovered] = useState(null);

  return (
    <Box
      component="footer"
      sx={{
        py: 4, // Reduced padding
        borderTop: `1px solid ${
          isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
        }`,
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
            ? `linear-gradient(#3466F608 1px, transparent 1px), 
           linear-gradient(90deg, #3466F608 1px, transparent 1px)`
            : `linear-gradient(#3466F605 1px, transparent 1px), 
           linear-gradient(90deg, #3466F605 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Logo and Brand Section */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
                mb: { xs: 2, md: 0 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                  transition: "transform 0.3s ease",
                  "&:hover": {},
                }}
                component={Link}
                to="/"
              >
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="QueryBot Logo"
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    filter: "drop-shadow(0 4px 6px rgba(52, 102, 246, 0.2))",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    background: isDark ? "white" : "black",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  QueryBot
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: "300px",
                  mb: 0,
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                Effortlessly query your database using natural language, powered
                by AI.
              </Typography>
            </Box>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 3,
              }}
            >
              {[
                { label: "Home", path: "/" },
                { label: "Chat", path: "/chat" },
                { label: "About", path: "/about" },
              ].map((link, idx) => (
                <Box
                  key={idx}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    position: "relative",
                    "&:hover": {
                      color: theme.palette.secondary.main,
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom copyright section */}
        <Box
          sx={{
            borderTop: `1px solid ${
              isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
            }`,
            mt: 3,
            pt: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            © {new Date().getFullYear()} QueryBot. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Update your routes to include the Footer component
function App() {
  const [mode, setMode] = useState("light");
  const theme = createTheme(getDesignTokens(mode));
  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  // Set a fixed navbar height
  const navbarHeight = "80px";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: theme.palette.background.default,
                  pt: navbarHeight, // Add padding equal to navbar height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <NavigationBar mode={mode} toggleMode={toggleMode} />
                <Box sx={{ flex: 1 }}>
                  <HeroSection />
                  <BenefitsSection />
                  <TechStackSection />
                  <CTASection />
                </Box>
                <Footer />
              </Box>
            }
          />
          <Route
            path="/chat"
            element={
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: theme.palette.background.default,
                  pt: navbarHeight,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <NavigationBar mode={mode} toggleMode={toggleMode} />
                <Box sx={{ flex: 1 }}>
                  <Chat />
                </Box>
              </Box>
            }
          />
          <Route
            path="/about"
            element={
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: theme.palette.background.default,
                  pt: navbarHeight, // Add padding equal to navbar height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <NavigationBar mode={mode} toggleMode={toggleMode} />
                <Box sx={{ flex: 1 }}>
                  <AboutPage />
                </Box>
                <Footer />
              </Box>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;