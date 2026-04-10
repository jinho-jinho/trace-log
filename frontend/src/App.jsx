import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import TraceLogSessionDetail from "./pages/TraceLogSessionDetail";
import TraceLogSessions from "./pages/TraceLogSessions";

import MyOrders from "./pages/MyOrders";
import MyProfile from "./pages/MyProfile";
import MyOrderRegister from "./pages/MyOrderRegister";
import MyBenefits from "./pages/MyBenefits";
import MyLogout from "./pages/MyLogout";

import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductNew from "./pages/admin/AdminProductNew";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEntry from "./pages/admin/AdminEntry";
import TraceLogDashboard from "./pages/TraceLogDashboard";

function App() {
  const location = useLocation();
  const isTraceLogDashboard = location.pathname.startsWith("/tracelog-dashboard");

  return (
    <div className="app-shell">
      {!isTraceLogDashboard && <Header />}

      <main className="page">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/tracelog-dashboard" element={<TraceLogDashboard />} />
          <Route path="/tracelog-dashboard/sessions" element={<TraceLogSessions />} />
          <Route path="/tracelog-dashboard/sessions/:sessionId" element={<TraceLogSessionDetail />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />

          {/* My */}
          <Route path="/my/profile" element={<MyProfile />} />
          <Route path="/my/orders" element={<MyOrders />} />
          <Route path="/my/order-register" element={<MyOrderRegister />} />
          <Route path="/my/benefits" element={<MyBenefits />} />
          <Route path="/my/logout" element={<MyLogout />} />

          {/* Admin */}
          <Route path="/admin/select" element={<AdminEntry />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductNew />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isTraceLogDashboard && <Footer />}
      {!isTraceLogDashboard && <CartDrawer />}
    </div>
  );
}

export default App;
