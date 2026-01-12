// File: src/components/rm/RmLayout.jsx
import React, { useState } from "react";
import { Menu } from "antd";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Inbox,
  BarChart2,
  Clock,
  ClipboardList,
} from "lucide-react";

// Import your RM components
import MyQueue from "../../pages/rm/MyQueue";
import Completed from "../../pages/rm/Completed";
import ReportsPage from "../../pages/rm/Reports";
import Navbar from "../Navbar";

// Import Deferral Components
import DeferralForm from "../../pages/deferrals/DeferralForm"; // Add this import
import DeferralPending from "../../pages/deferrals/DeferralPending";

const Sidebar = ({
  selectedKey,
  setSelectedKey,
  collapsed,
  toggleCollapse,
  navigate,
}) => {
  const location = useLocation();
  
  const handleClick = (e) => {
    console.log("Menu clicked:", e.key);
    
    // Handle deferral route - directly navigate to pending deferrals
    if (e.key === "deferral") {
      navigate("/rm/deferrals/pending");
      return;
    }
    
    setSelectedKey(e.key);
    navigate(`/rm/${e.key}`);
  };

  // Determine selected key from path
  const getSelectedKeyFromPath = () => {
    const path = location.pathname;
    if (path.includes("/rm/deferrals/request")) return "deferral";
    if (path.includes("/rm/deferrals/pending")) return "deferral";
    if (path.includes("/rm/myqueue")) return "myqueue";
    if (path.includes("/rm/completed")) return "completed";
    if (path.includes("/rm/reports")) return "reports";
    return selectedKey;
  };

  return (
    <div
      style={{
        width: collapsed ? 80 : 260,
        background: "#3A2A82",
        color: "white",
        transition: "0.25s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: collapsed ? "20px 0" : "25px 20px",
          fontSize: collapsed ? 28 : 24,
          fontWeight: "bold",
          letterSpacing: collapsed ? 2 : 1,
          textAlign: collapsed ? "center" : "left",
        }}
      >
        {collapsed ? "RM" : "RM Dashboard"}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKeyFromPath()]}
        onClick={handleClick}
        style={{ background: "transparent", borderRight: "none", fontSize: 15 }}
        inlineCollapsed={collapsed}
        items={[
          {
            key: "myqueue",
            label: "My Queue",
            icon: <Inbox size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "completed",
            label: "Completed",
            icon: <CheckCircle size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "deferral",
            label: "Deferrals",
            icon: <Clock size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "reports",
            label: "Reports",
            icon: <BarChart2 size={16} style={{ color: "#e5e7eb" }} />,
          },
        ]}
      />

      <div style={{ marginTop: "auto", padding: 20, textAlign: "center" }}>
        <button
          onClick={toggleCollapse}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 6,
            border: "none",
            background: "#fff",
            color: "#3A2A82",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  );
};

const RmLayout = ({ userId, rmId }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("myqueue");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f0f2f5",
      }}
    >
      <Sidebar
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        collapsed={sidebarCollapsed}
        toggleCollapse={toggleSidebar}
        navigate={navigate}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <div
          style={{
            padding: "25px",
            flex: 1,
            overflowY: "auto",
            background: "#f0f2f5",
          }}
        >
          <Routes>
            {/* Main RM Routes */}
            <Route path="/" element={<MyQueue userId={userId || "rm_current"} />} />
            <Route path="/myqueue" element={<MyQueue userId={userId || "rm_current"} />} />
            <Route path="/completed" element={<Completed userId={userId || "rm_current"} />} />
            <Route path="/reports" element={<ReportsPage userId={userId || "rm_current"} />} />
            
            {/* Deferral Routes */}
            <Route path="/deferrals">
              <Route path="request" element={<DeferralForm userId={userId || "rm_current"} />} />
              <Route path="pending" element={<DeferralPending userId={userId || "rm_current"} />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default RmLayout;