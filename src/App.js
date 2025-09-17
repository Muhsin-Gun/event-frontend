// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import RoleCard from './Components/RoleCard';
import Home from './Components/Home';
import Events from './Components/Events';
import Contact from './Components/Contact';
import Login from './Components/Login';
import Register from './Components/Register';
import ForgotPassword from './Components/ForgotPassword';
import AdminDashboard from './Components/AdminDashboard';
import EmployeeDashboard from './Components/EmployeeDashboard';
import ClientDashboard from './Components/ClientDashboard';
import Payment from './Components/Payment';

// Small helper to hide Navbar on RoleCard
function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === '/'; // Hide navbar only on RoleCard page
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Entry point */}
          <Route path="/" element={<RoleCard />} />

          {/* Event frontend (inside ClientDashboard) */}
          <Route path="/client" element={<ClientDashboard />} />

          {/* Dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />

          {/* Regular site pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </Layout>
    </Router>
  );
}
