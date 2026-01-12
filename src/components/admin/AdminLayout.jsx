import React, { useState } from "react";
import { Menu } from "antd";
import { BellOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";

import {
  ClipboardList,
  CheckCircle,
  Clock,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

import UserTable from "../../pages/admin/UserTable";
import AdminDashboard from "../../pages/admin/adminDashboard.jsx";
import CreateUserDrawer from "../../pages/admin/createUserDrawer.jsx";
import DashboardSummary from "../../pages/admin/dashboardSummary.jsx";
import Navbar from "../Navbar.jsx";

/* ---------------------------------------------------------------------- */
/*  GLOBAL THEME VARIABLES                                                */
/* ---------------------------------------------------------------------- */
const themeVars = {
  light: {
    "--bg-main": "#f4f6ff",
    "--bg-sidebar": "#2B1C67",
    "--bg-navbar": "#ffffff",
    "--text-main": "#2B1C67",
    "--sidebar-shadow": "rgba(0,0,0,0.15)",
  },
  dark: {
    "--bg-main": "#181a1f",
    "--bg-sidebar": "#1c143a",
    "--bg-navbar": "#22252b",
    "--text-main": "#ffffff",
    "--sidebar-shadow": "rgba(255,255,255,0.15)",
  },
};

/* Apply theme */
const applyTheme = (mode) => {
  const vars = themeVars[mode];
  Object.keys(vars).forEach((key) =>
    document.documentElement.style.setProperty(key, vars[key])
  );
};
const Sidebar = ({
  selectedKey,
  setSelectedKey,
  collapsed,
  toggleCollapse,
}) => {
  const handleClick = (e) => setSelectedKey(e.key);

  return (
    <div
      style={{
        width: collapsed ? 75 : 250,
        background: "var(--bg-sidebar)",
        color: "white",
        transition: "0.25s ease",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: `2px 0 10px var(--sidebar-shadow)`,
      }}
      className="sidebar"
    >
      {/* Logo/Header */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "25px 20px",
          fontSize: collapsed ? 26 : 22,
          fontWeight: "bold",
          textAlign: collapsed ? "center" : "left",
        }}
      >
        {collapsed ? "AD" : "Admin Dashboard"}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleClick}
        style={{
          background: "transparent",
          borderRight: "none",
        }}
        inlineCollapsed={collapsed}
        items={[
          {
            key: "all users",
            label: "All users",
            icon: <CheckCircle size={18} />,
          },
          {
            key: "auditlogs",
            label: "Audit Logs",
            icon: <Clock size={18} />,
          },
        ]}
      />

      {/* Collapse Button */}
      <div style={{ marginTop: "auto", padding: 20 }}>
        <button
          onClick={toggleCollapse}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 6,
            border: "none",
            background: "#fff",
            color: "var(--bg-sidebar)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  );
};

<Navbar />;

/* ---------------------------------------------------------------------- */
/*  MAIN LAYOUT — SAME CONTENT, ONLY STYLE UPGRADES                       */
/* ---------------------------------------------------------------------- */
const AdminLayout = () => {
  const [selectedKey, setSelectedKey] = useState("users");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "rm",
  });

  /* Apply theme immediately */
  applyTheme(theme);

  const renderContent = () => {
    switch (selectedKey) {
      // case "users":
      //   return <UserTable />;
      case "all users":
        return <AdminDashboard />;
      case "auditlogs":
        return <DashboardSummary />;
      case "rms":
        return (
          <div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
            >
              Create RM User
            </button>
          </div>
        );
      case "co checkers":
        return <h1 style={pageStyle}>CO Checkers</h1>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-main)",
      }}
      className="main-layout"
    >
      <Sidebar
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        collapsed={sidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* MAIN SECTION */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          setTheme={setTheme}
        />

        <div
          style={{
            padding: "20px",
            flex: 1,
            overflowY: "auto",
            color: "var(--text-main)",
          }}
        >
          {renderContent()}
        </div>

        {/* Drawer */}
        <CreateUserDrawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          formData={formData}
          setFormData={setFormData}
          loading={false}
          onCreate={() => {
            console.log("FORM VALUES:", formData);
            setFormData({ name: "", email: "", password: "", role: "rm" });
            setDrawerOpen(false);
          }}
        />
      </div>
    </div>
  );
};

const pageStyle = {
  fontSize: 28,
  fontWeight: "bold",
  color: "var(--text-main)",
};

export default AdminLayout;
