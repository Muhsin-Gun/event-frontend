import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  // Sample data for monthly sales chart
  const chartData = {
    labels: ['March', 'April', 'May', 'June'],
    datasets: [{
      label: 'Sales ($)',
      data: [5000, 7000, 6000, 8000],
      backgroundColor: 'rgba(26, 115, 232, 0.6)',  // blue accent
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Common card style for stats
  const statCardStyle = {
    background: '#1f1f2e',
    borderRadius: '8px',
    padding: '20px',
    color: '#ffffff',
    minWidth: '150px',
    textAlign: 'center'
  };

  const dashboardStyle = {
    background: '#121212',
    padding: '20px',
    minHeight: '100vh',
    color: '#ffffff'
  };

  return (
    <div style={dashboardStyle}>
      <h2>Admin Dashboard</h2>
      {/* Summary statistic cards */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <div style={statCardStyle}>
          <h3>$12.3k</h3>
          <p>Total Revenue</p>
        </div>
        <div style={statCardStyle}>
          <h3>342</h3>
          <p>Events Sold</p>
        </div>
        <div style={statCardStyle}>
          <h3>1,024</h3>
          <p>Registered Clients</p>
        </div>
        <div style={statCardStyle}>
          <h3>+8.4%</h3>
          <p>Monthly Growth</p>
        </div>
      </div>

      {/* Sales chart */}
      <div style={{ background: '#1f1f2e', borderRadius: '8px', padding: '20px' }}>
        <h3>Monthly Sales</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

