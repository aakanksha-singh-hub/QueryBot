import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import SupportIcon from '@mui/icons-material/Support';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';

const domains = [
  {
    id: 'sales',
    name: 'Sales Performance',
    icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    description: 'Uncover revenue trends, product success, and regional performance with rich sales insights',
    schema: {
      tables: ['sales', 'products', 'customers', 'regions'],
      kpis: ['Revenue', 'Growth Rate', 'Customer Acquisition Cost', 'Average Order Value']
    }
  },
  {
    id: 'support',
    name: 'Customer Support',
    icon: <SupportIcon sx={{ fontSize: 40 }} />,
    description: 'Understand support efficiency, resolution times, and customer satisfaction levels',
    schema: {
      tables: ['tickets', 'customers', 'agents', 'departments'],
      kpis: ['Resolution Time', 'Customer Satisfaction', 'First Response Time', 'Ticket Volume']
    }
  },
  {
    id: 'employee',
    name: 'Employee Productivity',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    description: 'Track workforce impact, project progress, and department-wise productivity',
    schema: {
      tables: ['employees', 'projects', 'departments', 'attendance'],
      kpis: ['Project Completion Rate', 'Resource Utilization', 'Team Performance', 'Attendance Rate']
    }
  }
];

const DomainSelector = ({ onSelectDomain }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Select Data Domain
      </Typography>
      <Grid container spacing={3}>
        {domains.map((domain) => (
          <Grid item xs={12} md={4} key={domain.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'light'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.1)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.3)',
                  },
                }}
                onClick={() => onSelectDomain(domain)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: '12px',
                        p: 1,
                        mr: 2,
                        color: 'white',
                      }}
                    >
                      {domain.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {domain.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {domain.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Available Tables:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {domain.schema.tables.map((table) => (
                        <Tooltip key={table} title={`View ${table} schema`}>
                          <Box
                            sx={{
                              backgroundColor: 'background.paper',
                              borderRadius: '6px',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            {table}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DomainSelector; 