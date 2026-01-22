import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Empty,
  Spin,
  Row,
  Col,
  Space,
  Popover,
  Timeline,
  Descriptions,
  Divider,
  Progress,
  Badge,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const PRIMARY_BLUE = "#164679";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";

const ExtensionApplicationsTab = ({ extensions, loading }) => {
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending_approval":
        return "processing";
      case "in_review":
        return "blue";
      case "returned_for_rework":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: "Awaiting Approvers",
      in_review: "Creator Review",
      approved: "Approved",
      rejected: "Rejected",
      returned_for_rework: "Returned for Rework",
      withdrawn: "Withdrawn",
    };
    return labels[status] || status;
  };

  const calculateApprovalProgress = (extension) => {
    if (!extension.approvers || extension.approvers.length === 0) return 0;
    const approved = extension.approvers.filter(
      (a) => a.approvalStatus === "approved"
    ).length;
    return Math.round((approved / extension.approvers.length) * 100);
  };

  const ExtensionDetailsPopover = ({ extension }) => (
    <div style={{ maxWidth: 400 }}>
      <Descriptions size="small" bordered style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Current Days" span={3}>
          <Tag color="blue">{extension.currentDaysSought}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Requested Days" span={3}>
          <Tag color="gold">{extension.requestedDaysSought}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Additional Days" span={3}>
          <strong>{extension.requestedDaysSought - extension.currentDaysSought}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Reason" span={3}>
          <span style={{ fontSize: 12 }}>{extension.extensionReason}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Requested On" span={3}>
          {dayjs(extension.createdAt).format("DD MMM YYYY, HH:mm")}
        </Descriptions.Item>
      </Descriptions>

      {/* Approvers Status */}
      <Divider style={{ margin: "8px 0" }} />
      <div style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: 12 }}>Approvals Progress:</strong>
        <Progress
          percent={calculateApprovalProgress(extension)}
          size="small"
          strokeColor={PRIMARY_BLUE}
          style={{ marginTop: 6 }}
        />
      </div>

      {/* History Timeline */}
      {extension.history && extension.history.length > 0 && (
        <div>
          <Divider style={{ margin: "8px 0" }} />
          <strong style={{ fontSize: 12 }}>Activity Timeline:</strong>
          <Timeline
            style={{ marginTop: 8, fontSize: 12 }}
            items={extension.history.map((h) => ({
              color:
                h.action === "rejected"
                  ? ERROR_RED
                  : h.action.includes("approved")
                    ? SUCCESS_GREEN
                    : WARNING_ORANGE,
              children: (
                <div>
                  <strong>{h.userName || "System"}</strong> ({h.userRole})<br />
                  <span style={{ color: "#666" }}>
                    {h.notes || h.action}
                  </span>
                  <br />
                  <span style={{ fontSize: 11, color: "#999" }}>
                    {dayjs(h.timestamp || h.createdAt).format(
                      "DD MMM HH:mm"
                    )}
                  </span>
                </div>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );

  const columns = [
    {
      title: "Deferral #",
      dataIndex: "deferralNumber",
      key: "deferralNumber",
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Days",
      key: "days",
      width: 100,
      render: (_, record) => (
        <Tooltip
          title={`${record.currentDaysSought} → ${record.requestedDaysSought} days`}
        >
          <Space size={2}>
            <Tag color="blue">{record.currentDaysSought}</Tag>
            <span>→</span>
            <Tag color="gold">{record.requestedDaysSought}</Tag>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 100,
      render: (_, record) => (
        <Tooltip title={`${calculateApprovalProgress(record)}% complete`}>
          <Progress
            type="circle"
            percent={calculateApprovalProgress(record)}
            width={30}
            strokeColor={PRIMARY_BLUE}
          />
        </Tooltip>
      ),
    },
    {
      title: "Requested",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Popover
          content={<ExtensionDetailsPopover extension={record} />}
          title={`Extension Request Details`}
          trigger="click"
          placement="left"
        >
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setSelectedExtension(record)}
          >
            Details
          </Button>
        </Popover>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin tip="Loading extension applications..." />
      </div>
    );
  }

  if (!extensions || extensions.length === 0) {
    return (
      <Empty
        description="No extension applications yet"
        style={{ padding: "40px 20px" }}
      />
    );
  }

  return (
    <Card
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Table
        columns={columns}
        dataSource={extensions}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} extension requests`,
        }}
        scroll={{ x: 800 }}
        size="small"
      />
    </Card>
  );
};

export default ExtensionApplicationsTab;
