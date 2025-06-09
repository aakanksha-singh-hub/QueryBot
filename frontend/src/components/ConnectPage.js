import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  useTheme,
  Grid,
  Divider,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Storage,
  Person,
  Lock,
  ArrowForward,
  CheckCircleOutlined,
  DataObject,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ConnectPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState({
    server: "",
    database: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const logoRef = useRef(null);
  const formRef = useRef(null);
  const isDark = theme.palette.mode === "dark";

  // Interactive logo animation with standard JS (no framer-motion)
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

  // Form animation on mount
  useEffect(() => {
    if (formRef.current) {
      formRef.current.style.opacity = 0;
      formRef.current.style.transform = "translateY(20px)";

      setTimeout(() => {
        formRef.current.style.transition =
          "opacity 0.8s ease, transform 0.6s ease";
        formRef.current.style.opacity = 1;
        formRef.current.style.transform = "translateY(0)";
      }, 100);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.server.trim()) newErrors.server = "Server name is required.";
    if (!form.database.trim())
      newErrors.database = "Database name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    // --- START: DEMO ONLY CODE (DO NOT PUSH TO GITHUB) ---
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased delay for better UX
    sessionStorage.setItem("db_connected", "true");
    sessionStorage.setItem("db_name", form.database);
    setSuccess(true);
    setLoading(false);

    // Delay navigation slightly to show success state
    setTimeout(() => {
      navigate("/chat");
    }, 1500);
    // --- END: DEMO ONLY CODE ---
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(135deg, #0F172A 80%, rgba(15, 23, 42, 0) 100%)"
          : "linear-gradient(135deg, #F0F9FF 80%, rgba(240, 249, 255, 0) 100%)",
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
          opacity: 0.7,
          zIndex: 0,
        },
      }}
    >
      {/* Background glow effects */}
      <Box
        sx={{
          position: "absolute",
          top: "-30%",
          left: "5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(52, 102, 246, 0.15) 0%, rgba(17, 24, 39, 0) 70%)"
            : "radial-gradient(circle, rgba(52, 102, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(17, 24, 39, 0) 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{ py: { xs: 4, md: 8 } }}
        >
          {/* Interactive Logo Section */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box
              ref={logoRef}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: "100%",
              }}
            >
              {/* Database visualization elements */}
              <Box
                sx={{
                  width: 380,
                  height: 380,
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
                    filter: `drop-shadow(0 20px 30px rgba(52, 102, 246, ${
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
                      ? "linear-gradient(135deg, rgba(52, 102, 246, 0.2), rgba(99, 102, 241, 0.1))"
                      : "linear-gradient(135deg, rgba(52, 102, 246, 0.1), rgba(99, 102, 241, 0.05))",
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

                {/* Circular lines using regular divs instead of framer-motion */}
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

                {/* Floating data points using regular divs instead of framer-motion */}
                {[...Array(6)].map((_, index) => (
                  <Box
                    key={`point-${index}`}
                    sx={{
                      position: "absolute",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background:
                        index % 2 === 0
                          ? theme.palette.primary.main
                          : "#6366F1",
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

              {/* Database connection text */}
              <Typography
                variant="h5"
                fontWeight={600}
                align="center"
                sx={{
                  mt: 4,
                  color: theme.palette.primary.main,
                  background: isDark
                    ? "linear-gradient(to right, #3466F6, #8C9EFF)"
                    : "linear-gradient(to right, #1E40AF, #3466F6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "pulse 3s infinite ease-in-out",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      opacity: 0.9,
                    },
                    "50%": {
                      opacity: 1,
                    },
                  },
                }}
              >
                Connect to Azure SQL
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mt: 1, maxWidth: "300px" }}
              >
                Link your database to start exploring with natural language
                queries
              </Typography>
            </Box>
          </Grid>

          {/* Form Section */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Paper
              elevation={isDark ? 0 : 8}
              ref={formRef}
              sx={{
                width: "100%",
                maxWidth: 580,
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: isDark
                  ? "rgba(30, 41, 59, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(16px)",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: isDark
                  ? "none"
                  : "0 20px 80px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(52, 102, 246, 0.08)",
                overflow: "visible",
              }}
            >
              <Box sx={{ position: "relative", mb: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    mb: 0.5,
                    background: isDark
                      ? "linear-gradient(to right, #3466F6, #8C9EFF)"
                      : "linear-gradient(to right, #1E40AF, #3466F6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Connect Your Database
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Enter your credentials to explore your data with AI
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                  <TextField
                    label="Server Name"
                    name="server"
                    value={form.server}
                    onChange={handleChange}
                    error={!!errors.server}
                    helperText={errors.server}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Storage fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: "1px",
                        },
                      },
                      transition: "transform 0.2s",
                      "&:focus-within": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    label="Database Name"
                    name="database"
                    value={form.database}
                    onChange={handleChange}
                    error={!!errors.database}
                    helperText={errors.database}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <DataObject fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: "1px",
                        },
                      },
                      transition: "transform 0.2s",
                      "&:focus-within": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: "1px",
                        },
                      },
                      transition: "transform 0.2s",
                      "&:focus-within": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 5 }}>
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1 },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            tabIndex={-1}
                            sx={{ color: "text.secondary" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: "1px",
                        },
                      },
                      transition: "transform 0.2s",
                      "&:focus-within": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  endIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ArrowForward />
                    )
                  }
                  sx={{
                    width: "100%",
                    py: 1.8,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    background: theme.palette.primary.main,
                    boxShadow: `0 8px 20px rgba(52, 102, 246, 0.25)`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 25px rgba(52, 102, 246, 0.35)`,
                    },
                  }}
                >
                  {loading ? "Connecting..." : "Connect and Explore"}
                </Button>

                {success && (
                  <Fade in={success}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "rgba(16, 185, 129, 0.15)",
                      }}
                    >
                      <CheckCircleOutlined sx={{ color: "#10B981" }} />
                      <Typography color="#10B981" fontWeight={600}>
                        Connected successfully! Redirecting...
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMsg("")}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
          }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConnectPage;
