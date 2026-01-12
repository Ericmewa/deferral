import React from "react";
import { Card, Row, Col, Table, Tag } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const DashboardSummary = ({ users = [], auditLogs = [] }) => {
  // --- SUMMARY METRICS ---
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const coCreators = users.filter((u) => u.role === "cocreator").length;
  const rmUsers = users.filter((u) => u.role === "rm").length;

  // --- AUDIT LOG TABLE ---
  const auditColumns = [
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Target User", dataIndex: "targetUser", key: "targetUser" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d) => new Date(d).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "success" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* --- CARDS --- */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card
            title="Total Users"
            bordered={false}
            className="bg-white dark:bg-gray-900 text-center shadow-md"
          >
            <UserOutlined style={{ fontSize: 32 }} />
            <div className="text-2xl mt-2">{totalUsers}</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            title="Active Users"
            bordered={false}
            className="bg-white dark:bg-gray-900 text-center shadow-md"
          >
            <CheckCircleOutlined style={{ fontSize: 32, color: "green" }} />
            <div className="text-2xl mt-2">{activeUsers}</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            title="Co-Creators"
            bordered={false}
            className="bg-white dark:bg-gray-900 text-center shadow-md"
          >
            <TeamOutlined style={{ fontSize: 32, color: "purple" }} />
            <div className="text-2xl mt-2">{coCreators}</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            title="RMs"
            bordered={false}
            className="bg-white dark:bg-gray-900 text-center shadow-md"
          >
            <TeamOutlined style={{ fontSize: 32, color: "blue" }} />
            <div className="text-2xl mt-2">{rmUsers}</div>
          </Card>
        </Col>
      </Row>

      {/* --- AUDIT LOG TABLE --- */}
      <div>
        <h2 className="text-lg font-semibold dark:text-gray-200 mb-2">
          Audit Logs
        </h2>
        <Table
          rowKey={(record) => record._id || record.id}
          columns={auditColumns}
          dataSource={auditLogs}
          pagination={{ pageSize: 6 }}
          bordered
          className="rounded-lg dark:bg-gray-900 dark:text-gray-200"
        />
      </div>
    </div>
  );
};

export default DashboardSummary;
