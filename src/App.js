// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import RoleCard from './Components/RoleCard';
import Home from './Components/Home';

import Contact from './Components/Contact';
import Login from './Components/Login';
import Register from './Components/Register';
import ForgotPassword from './Components/ForgotPassword';
import AdminDashboard from './Components/AdminDashboard';
import EmployeeDashboard from './Components/EmployeeDashboard';
import ClientDashboard from './Components/ClientDashboard';
import Payment from './Components/Payment';

// Layout component to handle navbar visibility logic
function Layout({ children }) {
  const location = useLocation();
  
  // Hide navbar on these specific routes
  const hideNavbarRoutes = [
    '/',           // RoleCard page
    '/admin',      // Admin dashboard
    '/employee',   // Employee dashboard
    '/client'      // Client dashboard (they have their own navbar logic)
  ];
  
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);
  
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Entry point - Role selection */}
          <Route path="/" element={<RoleCard />} />
          
          {/* Dashboard routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          
          {/* Main site pages (will show navbar) */}
          <Route path="/home" element={<Home />} />
         
          
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth pages (will show navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Payment page (will show navbar) */}
          <Route path="/payment" element={<Payment />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<RoleCard />} />
        </Routes>
      </Layout>
    </Router>
  );
}