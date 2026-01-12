import React from "react";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu, message } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../api/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    message.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    { key: "profile", label: "Profile", icon: <UserOutlined /> },
    { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") handleLogout();
    if (key === "profile") navigate("/profile");
  };

  return (
    <div
      style={{
        height: 60,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div onClick={toggleSidebar} style={{ cursor: "pointer" }}>
        <MenuOutlined style={{ fontSize: 24 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />

        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={["click"]} placement="bottomRight">
          <span style={{ cursor: 'pointer' }}>
            <UserOutlined style={{ fontSize: 20 }} />
          </span>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;