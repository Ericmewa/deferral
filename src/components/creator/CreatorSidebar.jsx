import React from "react";
import { Menu } from "antd";
import {
  CirclePlus,
  Inbox,
  Users,
  Clock,
  CheckCircle,
  BarChart2,
} from "lucide-react";

const CreatorSidebar = ({
  selectedKey,
  setSelectedKey,
  collapsed,
  toggleCollapse,
}) => {
  const handleClick = (e) => setSelectedKey(e.key);

  return (
    <div
      style={{
        width: collapsed ? 80 : 250,
        background: "#3A2A82",
        paddingTop: 20,
        transition: "width 0.2s",
        color: "white",
        position: "relative",
        height: "100vh",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: 22,
          marginBottom: 35,
          fontWeight: "bold",
        }}
      >
        {collapsed ? "N" : "CO Dashboard"}
      </h2>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleClick}
        inlineCollapsed={collapsed}
        style={{ background: "#3A2A82" }}
        items={[
          {
            key: "creatchecklist",
            icon: <CirclePlus size={16} className="text-gray-200" />,
            label: "Create New DCL",
          },
          // {
          //   key: "queue",
          //   icon: <Inbox size={16} className="text-gray-200" />,
          //   label: "Queue",
          // },
          // {
          //   key: "completedQueue",
          //   icon: <Inbox size={16} className="text-gray-200" />,
          //   label: "Completed Queue",
          // },

          {
            key: "myqueue",
            icon: <Inbox size={16} className="text-gray-200" />,
            label: "My Queue",
          },

          {
            key: "deferrals",
            icon: <Clock size={16} className="text-gray-200" />,
            label: "Deferrals",
          },
          {
            key: "completed",
            icon: <CheckCircle size={16} className="text-gray-200" />,
            label: "Completed",
          },
          {
            key: "report",
            icon: <BarChart2 size={16} className="text-gray-200" />,
            label: "Reports",
          },
        ]}
      />

      <div
        style={{
          position: "absolute",
          bottom: 20,
          width: "100%",
          textAlign: "center",
        }}
      >
        <button
          onClick={toggleCollapse}
          style={{
            background: "#fff",
            color: "#3A2A82",
            border: "none",
            borderRadius: 4,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  );
};

export default CreatorSidebar;
