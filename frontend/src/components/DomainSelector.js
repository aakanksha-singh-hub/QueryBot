import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
  useTheme,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import SupportIcon from "@mui/icons-material/Support";
import PeopleIcon from "@mui/icons-material/People";
import { motion } from "framer-motion";

const domains = [
  {
    id: "sales",
    name: "Sales Performance",
    icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    description:
      "Analyze sales data, customer feedback, and project performance metrics",
    schema: {
      tables: ["sales", "customer_feedback"],
      kpis: [
        "Total Sales",
        "Customer Satisfaction",
        "Sales Growth",
        "Project Success Rate",
      ],
    },
    color: "#3466F6",
  },
  {
    id: "employee",
    name: "Employee Management",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    description:
      "Track employee performance, project assignments, and team productivity",
    schema: {
      tables: ["employees", "projects", "employee_projects"],
      kpis: [
        "Project Completion Rate",
        "Employee Performance",
        "Team Productivity",
        "Resource Utilization",
      ],
    },
    color: "#6366F1",
  },
  {
    id: "projects",
    name: "Project Analytics",
    icon: <SupportIcon sx={{ fontSize: 40 }} />,
    description:
      "Monitor project progress, team assignments, and resource allocation",
    schema: {
      tables: ["projects", "employee_projects", "employees"],
      kpis: [
        "Project Status",
        "Team Allocation",
        "Resource Distribution",
        "Project Timeline",
      ],
    },
    color: "#10B981",
  },
];

const DomainSelector = ({ onSelectDomain }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        mt: 2,
        mb: 6,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Connect to Your Dataset
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 5,
          textAlign: "center",
          maxWidth: 600,
          mx: "auto",
        }}
      >
        Select a data domain to start exploring insights and asking questions
        about your business data
      </Typography>

      <Grid container spacing={3}>
        {domains.map((domain) => (
          <Grid item xs={12} md={4} key={domain.id}>
            <motion.div
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 },
              }}
              whileTap={{
                scale: 0.97,
                transition: { duration: 0.1 },
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "visible",
                  border: "1px solid",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${
                      isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.5)"
                    } 0%, ${
                      isDark
                        ? "rgba(255,255,255,0.01)"
                        : "rgba(255,255,255,0.2)"
                    } 100%)`,
                    borderRadius: "inherit",
                    zIndex: 1,
                  },
                  "&:hover": {
                    boxShadow: `0px 8px 24px ${
                      isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)"
                    }`,
                    transform: "translateY(-4px)",
                    borderColor: domain.color + (isDark ? "40" : "30"),
                  },
                }}
                onClick={() => onSelectDomain(domain)}
              >
                {/* Glow effect */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -15,
                    left: 20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `${domain.color}20`,
                    filter: "blur(25px)",
                    zIndex: 0,
                  }}
                />

                <CardContent
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    p: 3,
                    pb: "24px !important",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "16px",
                        p: 1.5,
                        mr: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `${domain.color}15`,
                        color: domain.color,
                        backdropFilter: "blur(8px)",
                        border: "1px solid",
                        borderColor: `${domain.color}30`,
                      }}
                    >
                      {domain.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.25rem",
                      }}
                    >
                      {domain.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {domain.description}
                  </Typography>

                  <Box sx={{ mt: "auto" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        mb: 1.5,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      Available Data:
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {domain.schema.tables.map((table) => (
                        <Box
                          sx={{
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)",
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.7,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            border: "1px solid",
                            borderColor: isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.06)",
                              borderColor: domain.color + "40",
                            },
                          }}
                        >
                          {table}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 5.33334V8.00001M8 10.6667H8.00667M14 8.00001C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8.00001C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8.00001Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Select a domain to access sample data or connect your own database
        </Typography>
      </Box>
    </Box>
  );
};

export default DomainSelector;