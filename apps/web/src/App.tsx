import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { SocketProvider } from './context/SocketContext.js';
import './i18n/index.js';

import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { MobileBottomNav } from './components/common/MobileBottomNav.js';

// Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { BrowseProductsPage } from './pages/public/BrowseProductsPage.js';
import { ProductDetailsPage } from './pages/public/ProductDetailsPage.js';
import {
  CategoriesPage,
  AboutPage,
  HowItWorksPage,
  FaqPage,
  TermsPage,
  PrivacyPage,
} from './pages/public/StaticPages.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { SignupPage } from './pages/auth/SignupPage.js';

// Authenticated User Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage.js';
import { AddProductPage } from './pages/user/AddProductPage.js';
import { MyProductsPage } from './pages/user/MyProductsPage.js';
import { RequestsPage } from './pages/user/RequestsPage.js';
import { CartPage } from './pages/user/CartPage.js';
import { WishlistPage } from './pages/user/WishlistPage.js';
import { ChatPage } from './pages/user/ChatPage.js';
import { ProfilePage } from './pages/user/ProfilePage.js';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center text-xs">Verifying session...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center text-xs">Verifying admin access...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<BrowseProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/faqs" element={<FaqPage />} />
                <Route path="/help" element={<FaqPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected User */}
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
                <Route path="/products/new" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} />
                <Route path="/my-products" element={<ProtectedRoute><MyProductsPage /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
                <Route path="/requests/sent" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
                <Route path="/requests/received" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
            <MobileBottomNav />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
