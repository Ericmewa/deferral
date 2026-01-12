// src/components/modals/CompletedChecklistModal.jsx
import React, { useMemo } from "react";
import {
  Modal,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Typography,
  List,
  Avatar,
  Space,
  Tooltip,
  Collapse,
  Badge
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  BankOutlined,
  CalendarOutlined,
  MessageOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

// Theme Colors
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const SUCCESS_GREEN = "#52c41a";
const SECONDARY_PURPLE = "#7e6496";
const WARNING_ORANGE = "#faad14";
const ERROR_RED = "#ff4d4f";

const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * CompletedChecklistModal (Read-only)
 *
 * Props:
 *  - checklist: object (the completed checklist)
 *  - open: boolean
 *  - onClose: function
 *
 * Features:
 *  - Clean NCBA-like styling with blue theme
 *  - Two-column layout: left = checklist summary + documents; right = comment thread + timeline
 *  - Download Checklist -> PDF (includes summary, document list and comment thread)
 *  - Document cards show only if a file exists
 */
const CompletedChecklistModal = ({ checklist, open, onClose }) => {
  const statusConfig = (status) => {
    switch (status) {
      case "approved":
        return { color: "success", text: "Approved", icon: <CheckCircleOutlined /> };
      case "approved_with_revisions":
        return { color: "processing", text: "Approved with Revisions", icon: <CheckCircleOutlined /> };
      default:
        return { color: "default", text: status || "Unknown", icon: null };
    }
  };

  const docCount = useMemo(
    () =>
      (checklist?.documents || []).reduce(
        (acc, cat) => acc + (cat.docList?.length || 0),
        0
      ),
    [checklist]
  );

  // Detect common file fields for a single doc; return null if none
  const extractFileUrl = (doc) =>
    doc?.fileUrl ||
    doc?.file ||
    doc?.url ||
    doc?.documentUrl ||
    doc?.attachment ||
    doc?.path ||
    null;

  const downloadableDocs = useMemo(() => {
    const list = [];
    (checklist?.documents || []).forEach((cat) => {
      (cat.docList || []).forEach((d) => {
        const url = extractFileUrl(d);
        if (url) {
          list.push({
            ...d,
            category: cat.category,
            fileUrl: url,
          });
        }
      });
    });
    return list;
  }, [checklist]);

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    
    // Header with NCBA colors
    doc.setFillColor(22, 70, 121); // PRIMARY_BLUE
    doc.rect(0, 0, 595, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("NCBA Bank - Checklist Summary", 40, 25);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Checklist: ${checklist?.dclNo || "N/A"}`, 40, 70);
    
    doc.setFontSize(11);
    doc.text(`Title: ${checklist?.title || "N/A"}`, 40, 94);
    doc.text(`Loan Type: ${checklist?.loanType || "N/A"}`, 40, 110);
    doc.text(`Customer: ${checklist?.customerName || "N/A"} (${checklist?.customerNumber || ""})`, 40, 126);
    doc.text(`Completed: ${checklist?.completionDate ? dayjs(checklist.completionDate).format("DD/MM/YYYY HH:mm") : "N/A"}`, 40, 142);
    doc.text(`Approved By: ${checklist?.approvedBy?.name || "N/A"}`, 40, 158);
    doc.text(`Checker Comments:`, 40, 178);

    const checkerText = checklist?.checkerComments || "N/A";
    const splitText = doc.splitTextToSize(checkerText, 500);
    doc.text(splitText, 40, 194);

    // Table of documents (category, name, status)
    const tableColumn = ["Category", "Document Name", "Status", "File Available"];
    const tableRows = (checklist?.documents || []).flatMap((cat) =>
      (cat.docList || []).map((d) => [
        cat.category || "",
        d.name || "",
        d.status || "",
        extractFileUrl(d) ? "Yes" : "No",
      ])
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 240,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 70, 121] }, // PRIMARY_BLUE
    });

    // Comment thread
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 240;
    doc.setFontSize(12);
    doc.text("Comment Thread:", 40, startY + 12);

    const thread = checklist?.commentThread || [];
    let y = startY + 28;
    doc.setFontSize(10);
    if (thread.length === 0) {
      doc.text("No comments", 40, y);
    } else {
      thread.forEach((c) => {
        const line = `${c.user || "User"} (${c.time || ""}): ${c.comment || ""}`;
        const lines = doc.splitTextToSize(line, 500);
        if (y + lines.length * 12 > 770) {
          doc.addPage();
          y = 40;
        }
        doc.text(lines, 40, y);
        y += lines.length * 12 + 6;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${dayjs().format("DD/MM/YYYY HH:mm:ss")} - NCBA Bank Internal Use`, 40, 800);

    doc.save(`NCBA_Checklist_${checklist?.dclNo || "export"}.pdf`);
  };

  const headerTag = statusConfig(checklist?.status);

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      styles={{ body: { padding: 0 } }}
      destroyOnClose
      centered
    >
      {/* Custom Header */}
      <div style={{ 
        background: PRIMARY_BLUE, 
        padding: "16px 24px",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileTextOutlined style={{ fontSize: 24, color: "white" }} />
              <div>
                <Title level={4} style={{ margin: 0, color: "white" }}>
                  {checklist?.dclNo || "DCL - N/A"}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                  {checklist?.title || checklist?.loanType || ""}
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Tag 
                icon={headerTag.icon} 
                color={headerTag.color} 
                style={{ 
                  fontWeight: 700,
                  fontSize: 12
                }}
              >
                {headerTag.text}
              </Tag>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                Completed: {checklist?.completionDate ? dayjs(checklist.completionDate).format("DD MMM YYYY") : "N/A"}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ padding: 24 }}>
        <Row gutter={16}>
          {/* LEFT: Summary + Documents */}
          <Col span={15}>
            <Card
              size="small"
              bordered={false}
              style={{ 
                marginBottom: 16, 
                boxShadow: "0 4px 12px rgba(22, 70, 121, 0.08)", 
                borderRadius: 8,
                borderLeft: `4px solid ${SUCCESS_GREEN}`
              }}
              styles={{ body: { padding: 20 } }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ color: PRIMARY_BLUE, display: "block", marginBottom: 4 }}>
                      <CustomerServiceOutlined style={{ marginRight: 8 }} />
                      Customer
                    </Text>
                    <Text style={{ display: "block", color: "#164679", fontWeight: 600, fontSize: 15 }}>
                      {checklist?.customerName || "N/A"}
                    </Text>
                    <Text type="secondary">{checklist?.customerNumber || ""}</Text>
                  </div>

                  <div>
                    <Text strong style={{ color: PRIMARY_BLUE, display: "block", marginBottom: 4 }}>
                      <BankOutlined style={{ marginRight: 8 }} />
                      Loan Details
                    </Text>
                    <Tag color="blue" style={{ fontWeight: 500 }}>{checklist?.loanType || "N/A"}</Tag>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">{checklist?.title || ""}</Text>
                    </div>
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ color: PRIMARY_BLUE, display: "block", marginBottom: 4 }}>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Relationship Manager
                    </Text>
                    <Text style={{ display: "block", color: "#164679", fontWeight: 600 }}>
                      {checklist?.assignedToRM?.name || "N/A"}
                    </Text>
                    <Text type="secondary">{checklist?.assignedToRM?.email || ""}</Text>
                  </div>

                  <div>
                    <Text strong style={{ color: PRIMARY_BLUE, display: "block", marginBottom: 4 }}>
                      <CheckCircleOutlined style={{ marginRight: 8 }} />
                      Checker / Approver
                    </Text>
                    <Text style={{ display: "block", color: "#164679", fontWeight: 600 }}>
                      {checklist?.approvedBy?.name || "N/A"}
                    </Text>
                    <Text type="secondary">{checklist?.approvedBy?.email || ""}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Documents section */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileTextOutlined style={{ color: PRIMARY_BLUE }} />
                  <span style={{ color: PRIMARY_BLUE }}>Documents</span>
                  <Badge 
                    count={docCount} 
                    style={{ 
                      backgroundColor: SUCCESS_GREEN,
                      fontSize: 12
                    }}
                  />
                </div>
              }
              styles={{ body: { padding: 0 } }}
              style={{ 
                marginBottom: 16, 
                borderRadius: 8,
                border: `1px solid #e8e8e8`
              }}
            >
              <Collapse 
                accordion 
                bordered={false}
                expandIconPosition="end"
                style={{ background: "transparent" }}
              >
                {(checklist?.documents || []).map((cat, ci) => {
                  const docsWithFile = (cat.docList || []).filter((d) => extractFileUrl(d));
                  return (
                    <Panel 
                      header={
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                          <span style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
                            {cat.category}
                          </span>
                          <span style={{ color: SECONDARY_PURPLE, fontSize: 12 }}>
                            {cat.docList?.length || 0} documents
                          </span>
                        </div>
                      } 
                      key={ci}
                    >
                      {docsWithFile.length === 0 ? (
                        <Text type="secondary" style={{ padding: 8 }}>
                          No uploaded files for this category.
                        </Text>
                      ) : (
                        <List
                          itemLayout="horizontal"
                          dataSource={cat.docList}
                          renderItem={(d) => {
                            const file = extractFileUrl(d);
                            return (
                              <List.Item
                                actions={[
                                  file ? (
                                    <Space key="actions">
                                      <Tooltip title="View file">
                                        <Button
                                          icon={<EyeOutlined />}
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(file, "_blank");
                                          }}
                                          style={{ color: PRIMARY_BLUE }}
                                        />
                                      </Tooltip>
                                      <Tooltip title="Download">
                                        <Button
                                          icon={<DownloadOutlined />}
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(file, "_blank");
                                          }}
                                        />
                                      </Tooltip>
                                    </Space>
                                  ) : null,
                                ].filter(Boolean)}
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<FilePdfOutlined />} style={{ background: ERROR_RED }} />}
                                  title={
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontWeight: 600, color: "#164679" }}>{d.name}</span>
                                      {d.status === "approved" ? (
                                        <Tag 
                                          icon={<CheckCircleOutlined />} 
                                          color="success" 
                                          style={{ marginLeft: 8, fontSize: 11 }}
                                        >
                                          Approved
                                        </Tag>
                                      ) : (
                                        <Tag color="default" style={{ marginLeft: 8, fontSize: 11 }}>
                                          {d.status || "N/A"}
                                        </Tag>
                                      )}
                                    </div>
                                  }
                                  description={
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Approved on: {checklist?.completionDate ? dayjs(checklist.completionDate).format("DD/MM/YYYY") : "N/A"}
                                    </Text>
                                  }
                                />
                              </List.Item>
                            );
                          }}
                        />
                      )}
                    </Panel>
                  );
                })}
              </Collapse>
            </Card>

            {/* Action buttons section */}
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                borderRadius: 8,
                background: "#f8f9fa",
                border: `1px solid ${PRIMARY_BLUE}20`
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Space wrap>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={downloadPDF} 
                  type="primary"
                  style={{ background: PRIMARY_BLUE, borderColor: PRIMARY_BLUE }}
                >
                  Download PDF
                </Button>

                {downloadableDocs.length > 0 && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      // Open the first file in new tab as an example
                      window.open(downloadableDocs[0].fileUrl, "_blank");
                    }}
                  >
                    Download Document
                  </Button>
                )}
              </Space>
            </Card>
          </Col>

          {/* RIGHT: Comment thread + timeline */}
          <Col span={9}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageOutlined style={{ color: SECONDARY_PURPLE }} />
                  <span style={{ color: PRIMARY_BLUE }}>Checker Comments</span>
                </div>
              }
              style={{ 
                marginBottom: 16, 
                borderRadius: 8,
                border: `1px solid #e8e8e8`
              }}
              styles={{ body: {
                maxHeight: 200, 
                overflowY: "auto",
                padding: 16 
              }}}
            >
              {checklist?.checkerComments ? (
                <div style={{ padding: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <Text strong style={{ color: PRIMARY_BLUE }}>
                      {checklist?.approvedBy?.name || "Checker"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined />
                      {' '}
                      {checklist?.completionDate ? dayjs(checklist.completionDate).format('DD/MM/YYYY HH:mm') : ''}
                    </Text>
                  </div>
                  <div style={{ 
                    padding: 12, 
                    background: "rgba(82, 196, 26, 0.1)", 
                    borderRadius: 6,
                    borderLeft: `3px solid ${SUCCESS_GREEN}`
                  }}>
                    <Text>{checklist.checkerComments}</Text>
                  </div>
                </div>
              ) : (
                <Text type="secondary" style={{ padding: 8 }}>No comments from checker</Text>
              )}
            </Card>

            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ClockCircleOutlined style={{ color: WARNING_ORANGE }} />
                  <span style={{ color: PRIMARY_BLUE }}>Timeline</span>
                </div>
              }
              style={{ borderRadius: 8, border: `1px solid #e8e8e8` }}
              bodyStyle={{ padding: 16 }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  { 
                    title: "Created", 
                    time: checklist?.createdAt,
                    color: PRIMARY_BLUE,
                    icon: <CalendarOutlined />
                  },
                  { 
                    title: "Submitted to Checker", 
                    time: checklist?.submittedToCheckerAt,
                    color: WARNING_ORANGE,
                    icon: <ClockCircleOutlined />
                  },
                  { 
                    title: "Completed", 
                    time: checklist?.completionDate,
                    color: SUCCESS_GREEN,
                    icon: <CheckCircleOutlined />
                  },
                  { 
                    title: "Last updated", 
                    time: checklist?.updatedAt,
                    color: SECONDARY_PURPLE,
                    icon: <ClockCircleOutlined />
                  },
                ].filter(Boolean)}
                renderItem={(item) => (
                  <List.Item style={{ padding: "8px 0" }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={item.icon} 
                          style={{ 
                            background: item.color,
                            color: "white",
                            fontSize: 12
                          }} 
                          size="small"
                        />
                      }
                      title={
                        <Text strong style={{ fontSize: 13, color: item.color }}>
                          {item.title}
                        </Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time ? dayjs(item.time).format("DD MMM YYYY HH:mm") : "N/A"}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <div style={{ 
          marginTop: 24, 
          padding: "12px 16px", 
          background: "#f8f9fa", 
          borderRadius: 8,
          fontSize: 12,
          color: "#666",
          border: `1px solid ${PRIMARY_BLUE}10`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 6 }} />
            Last updated: {checklist?.updatedAt ? dayjs(checklist.updatedAt).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
          </Text>
          <Text type="secondary">
            Checklist ID: {checklist?._id}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default CompletedChecklistModal;