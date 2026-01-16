import React, { useState } from "react";
import { Menu } from "antd";
import { Inbox, CheckCircle, BarChart2, FileText } from "lucide-react";
import { useSelector } from "react-redux";

import Navbar from "../Navbar";

// Pages
import AllChecklists from "../../pages/checker/allChecklists";
import CompletedChecklists from "../../pages/checker/Completed";
import Reportss from "../../pages/creator/Reports";
import Deferrals from "../../pages/checker/Deferrals";

/* ===========================
   SIDEBAR COMPONENT
=========================== */
const Sidebar = ({
  selectedKey,
  setSelectedKey,
  collapsed,
  toggleCollapse,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: collapsed ? 80 : 250,
        background: "#3A2A82",
        transition: "width 0.2s",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: collapsed ? 18 : 20,
          color: "#fff",
        }}
      >
        {collapsed ? "N" : "CO Checker"}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(e) => setSelectedKey(e.key)}
        inlineCollapsed={collapsed}
        style={{ flex: 1, background: "#3A2A82" }}
        items={[
          {
            key: "myQueue",
            icon: <Inbox size={16} />,
            label: "My Queue",
          },
          {
            key: "completed",
            icon: <CheckCircle size={16} />,
            label: "Completed",
          },
          {
            key: "deferrals",
            icon: <FileText size={16} />,
            label: "Deferrals",
          },
          {
            key: "reports",
            icon: <BarChart2 size={16} />,
            label: "Reports",
          },
        ]}
      />

      {/* Collapse Button */}
      <div style={{ padding: 12 }}>
        <button
          onClick={toggleCollapse}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
            background: "#fff",
            color: "#3A2A82",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  );
};

/* ===========================
   MAIN LAYOUT
=========================== */
const CheckerLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [selectedKey, setSelectedKey] = useState("myQueue");
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 80 : 250;

  const renderContent = () => {
    switch (selectedKey) {
      case "myQueue":
        return <AllChecklists userId={userId} />;
      case "completed":
        return <CompletedChecklists userId={userId} />;
      case "deferrals":
        return <Deferrals userId={userId} />;
      case "reports":
        return <Reportss />;
      default:
        return <AllChecklists userId={userId} />;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        collapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* MAIN AREA */}
      <div
        style={{
          marginLeft: sidebarWidth,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f0f2f5",
        }}
      >
        {/* NAVBAR (STICKY) */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Navbar />
        </div>

        {/* CONTENT (SCROLLS) */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
          }}
        >
          {renderContent()}
        </div>

        {/* FOOTER (STICKY) */}
        <footer
          style={{
            position: "sticky",
            bottom: 0,
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
            padding: "10px 20px",
            textAlign: "center",
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          © {new Date().getFullYear()} NCBA Bank PLC. All Rights Reserved.
        </footer>
      </div>
    </>
  );
};

export default CheckerLayout;