import React, { useState } from "react";
import { Menu } from "antd";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  ListChecks,
  Inbox,
  Clock,
  BarChart2,
  User,
} from "lucide-react";

// Import available Approver page components
import MyQueue from "../../pages/approver/MyQueue";
import Actioned from "../../pages/approver/Actioned";
import Reports from "../../pages/approver/Reports";
import Navbar from "../Navbar";

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
    setSelectedKey(e.key);
    navigate(`/approver/${e.key}`);
  };

  // Determine selected key from path
  const getSelectedKeyFromPath = () => {
    const path = location.pathname;
    if (path.includes("/approver/queue")) return "queue";
    if (path.includes("/approver/actioned")) return "actioned";
    if (path.includes("/approver/reports")) return "reports";
    return "queue";
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
        {collapsed ? "AP" : "Approver Dashboard"}
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
            key: "queue",
            label: "My Queue",
            icon: <Inbox size={16} style={{ color: "#e5e7eb" }} />,
          },
          {
            key: "actioned",
            label: "Actioned",
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

const ApproverLayout = ({ userId }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("queue");
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
            <Route path="/" element={<MyQueue userId={userId || "approver_current"} />} />
            <Route path="/queue" element={<MyQueue userId={userId || "approver_current"} />} />
            <Route path="/queue/*" element={<MyQueue userId={userId || "approver_current"} />} />
            <Route path="/actioned" element={<Actioned userId={userId || "approver_current"} />} />
            <Route path="/reports" element={<Reports userId={userId || "approver_current"} />} />
            <Route path="*" element={<MyQueue userId={userId || "approver_current"} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ApproverLayout;







