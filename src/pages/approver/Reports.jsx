import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Button, DatePicker, Space, Typography, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    pending: 12,
    inReview: 8,
    approved: 24,
    rejected: 4,
    slaCompliance: "92%",
    avgProcessingTime: "2.5 hours",
    approvalRate: "85%", // Last 30 days approval rate
  });

  // Placeholder: in future we can fetch real metrics from an API endpoint
  const refresh = async () => {
    setLoading(true);
    try {
      // Example: await fetch(`${import.meta.env.VITE_API_URL}/api/deferrals/summary`)
      // For now we just simulate a small delay
      await new Promise((r) => setTimeout(r, 400));
      message.success("Metrics refreshed");
    } catch (err) {
      message.error("Failed to refresh metrics");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    // Simple CSV export stub
    const csv = `Metric,Value\nPending Review,${metrics.pending}\nIn Review,${metrics.inReview}\nApproved,${metrics.approved}\nRejected,${metrics.rejected}\nSLA Compliance,${metrics.slaCompliance}\nAvg Processing Time,${metrics.avgProcessingTime}\nApproval Rate (30d),${metrics.approvalRate}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approver-metrics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ color: "#164679" }}>Reports</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <RangePicker />
              <Button icon={<ReloadOutlined />} loading={loading} onClick={refresh}>
                Refresh
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportCsv}>Export CSV</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Pending Review" value={metrics.pending} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="In Review" value={metrics.inReview} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Approved" value={metrics.approved} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Rejected" value={metrics.rejected} />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="SLA Compliance" value={metrics.slaCompliance} />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="Approval Rate (30d)" value={metrics.approvalRate} />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic title="Avg Processing Time" value={metrics.avgProcessingTime} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;