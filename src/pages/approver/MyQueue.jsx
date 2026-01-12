import { openFileInNewTab, downloadFile } from '../../utils/fileUtils';

import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from 'react-redux';
import {
  Table,
  Tag,
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Select,
  DatePicker,
  Avatar,
  Spin,
  Empty,
  Typography,
  Modal,
  message,
  Badge,
  Divider,
  Descriptions,
  Upload,
  Form,
  Input as AntdInput,
  Progress,
  List,
  Popconfirm
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  PaperClipOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import deferralApi from "../../service/deferralApi.js";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;
const { confirm } = Modal;
const { TextArea } = AntdInput;

// Theme colors
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";
const PROCESSING_BLUE = "#1890ff";

// Safe text rendering (coerce objects/arrays to readable strings)
const safeText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(i => (typeof i === 'string' ? i : (i?.name || i?.email || String(i)))).join(', ');
  if (typeof v === 'object') return v.name || v.email || v.role || String(v);
  return String(v);
};

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf': return <FilePdfOutlined style={{ color: ERROR_RED }} />;
    case 'word': return <FileWordOutlined style={{ color: PRIMARY_BLUE }} />;
    case 'excel': return <FileExcelOutlined style={{ color: SUCCESS_GREEN }} />;
    case 'image': return <FileImageOutlined style={{ color: "#7e6496" }} />;
    default: return <FileTextOutlined />;
  }
};

const getRoleTag = (role) => {
  let color = "blue";
  const roleLower = (role || "").toLowerCase();
  switch (roleLower) {
    case "rm":
      color = "purple";
      break;
    case "deferral management":
      color = "green";
      break;
    case "creator":
      color = "green";
      break;
    case "co_checker":
      color = "volcano";
      break;
    case "system":
      color = "default";
      break;
    default:
      color = "blue";
  }
  return (
    <Tag color={color} style={{ marginLeft: 8, textTransform: "uppercase" }}>
      {roleLower.replace(/_/g, " ")}
    </Tag>
  );
};

// Helper function to remove role from username in brackets
const formatUsername = (username) => {
  if (!username) return "System";
  return username.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

const CommentTrail = ({ history, isLoading }) => {
  if (isLoading) return <Spin className="block m-5" />;
  if (!history || history.length === 0)
    return <i className="pl-4">No historical comments yet.</i>;

  return (
    <div className="max-h-52 overflow-y-auto">
      <List
        dataSource={history}
        itemLayout="horizontal"
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <div className="flex justify-between">
                  <div>
                    <b>{formatUsername(item.user) || "System"}</b>
                    {getRoleTag(item.userRole || "system")}
                  </div>
                  <span className="text-xs text-gray-500">
                    {dayjs(item.date).format('DD MMM YYYY HH:mm')}
                  </span>
                </div>
              }
              description={
                <div className="break-words">
                  {item.comment || item.notes || "No comment provided."}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

// Add Comment Modal Component
const AddCommentModal = ({ open, onClose, onAddComment, deferralId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        message.success('Comment added successfully');
        form.resetFields();
        setLoading(false);
        onAddComment(deferralId, values.comment);
        onClose();
      }, 500);
    });
  };

  return (
    <Modal
      title="Add Comment to Deferral"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          style={{ backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE }}
        >
          Add Comment
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="comment"
          label="Your Comment"
          rules={[{ required: true, message: 'Please enter your comment' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Enter your comment here. This will be visible in the comment trail and history."
            maxLength={500}
            showCount
          />
        </Form.Item>
        <div style={{ color: '#666', fontSize: 12 }}>
          <InfoCircleOutlined /> Comments added here will appear in the comment trail with your name and timestamp.
        </div>
      </Form>
    </Modal>
  );
};

// Custom CSS for modal styling
const customStyles = `
  .ant-modal-header { background-color: ${PRIMARY_BLUE} !important; padding: 18px 24px !important; }
  .ant-modal-title { color: white !important; font-size: 1.15rem !important; font-weight: 700 !important; letter-spacing: 0.5px; }
  .ant-modal-close-x { color: white !important; }

  .deferral-info-card .ant-card-head { border-bottom: 2px solid ${ACCENT_LIME} !important; }
  .deferral-info-card .ant-descriptions-item-label { font-weight: 600 !important; color: #7e6496 !important; padding-bottom: 4px; }
  .deferral-info-card .ant-descriptions-item-content { color: ${PRIMARY_BLUE} !important; font-weight: 700 !important; font-size: 13px !important; }

  .ant-input, .ant-select-selector { border-radius: 6px !important; border-color: #e0e0e0 !important; }
  .ant-input:focus, .ant-select-focused .ant-select-selector { box-shadow: 0 0 0 2px rgba(22, 70, 121, 0.2) !important; border-color: ${PRIMARY_BLUE} !important; }

  .status-tag { font-weight: 700 !important; border-radius: 999px !important; padding: 3px 8px !important; text-transform: capitalize; min-width: 80px; text-align: center; display: inline-flex; align-items: center; gap: 4px; justify-content: center; }

  .ant-modal-footer .ant-btn { border-radius: 8px; font-weight: 600; height: 38px; padding: 0 16px; }
  .ant-modal-footer .ant-btn-primary { background-color: ${PRIMARY_BLUE} !important; border-color: ${PRIMARY_BLUE} !important; }
`;

// Deferral Details Modal for MyQueue - Shows status as pending
const DeferralDetailsModal = ({ deferral, open, onClose, onAction, token }) => {
  const [addCommentVisible, setAddCommentVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Controlled approve confirmation modal state
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending_approval':
      case 'deferral_requested':
        return { 
          color: 'orange', 
          icon: <ClockCircleOutlined />, 
          label: 'Pending Review', 
          description: 'Awaiting your approval',
          badgeColor: WARNING_ORANGE
        };
      case 'in_review':
        return { 
          color: 'blue', 
          icon: <ClockCircleOutlined />, 
          label: 'In Review', 
          description: 'Currently being reviewed',
          badgeColor: PROCESSING_BLUE
        };
      case 'approved':
      case 'deferral_approved':
        return { 
          color: 'green', 
          icon: <CheckCircleOutlined />, 
          label: 'Approved', 
          description: 'Deferral approved',
          badgeColor: SUCCESS_GREEN
        };
      case 'rejected':
      case 'deferral_rejected':
        return { 
          color: 'red', 
          icon: <CloseCircleOutlined />, 
          label: 'Rejected', 
          description: 'Deferral request was rejected',
          badgeColor: ERROR_RED
        };
      default:
        return { 
          color: 'default', 
          label: status, 
          description: '',
          badgeColor: '#d9d9d9'
        };
    }
  };

  const statusConfig = getStatusConfig(deferral?.status);

  const handleAddComment = (deferralId, comment) => {
    const newComment = {
      action: 'Comment Added',
      user: 'You (Approver)',
      date: new Date().toISOString(),
      notes: 'Comment added by approver',
      comment: comment,
      userRole: 'Approver'
    };
    
    // Add to history
    if (onAction) {
      onAction('addComment', deferralId, newComment);
    }
  };

  const handleApprove = () => {
    // Show controlled approval modal
    setApprovalComment('');
    setShowApproveConfirm(true);
  };

  const doApprove = async () => {
    setApproveLoading(true);
    try {
      await deferralApi.approveDeferral(deferral._id || deferral.id, token, approvalComment);
      message.success('Deferral approved successfully');
      if (onAction) onAction('refreshQueue');
      if (onAction) onAction('gotoActioned');
      setShowApproveConfirm(false);
      onClose();
    } catch (err) {
      message.error(err.message || 'Failed to approve');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = () => {
    confirm({
      title: 'Reject Deferral Request',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to reject this deferral request?</p>
          <p><strong>{deferral?.deferralNumber}</strong> - {deferral?.customerName}</p>
          <p>Please provide a reason for rejection:</p>
          <Input.TextArea rows={3} placeholder="Enter rejection reason..." style={{ marginTop: 8 }} id="rejectionComment" />
        </div>
      ),
      okText: 'Yes, Reject',
      okType: 'danger',
      okButtonProps: { style: { background: ERROR_RED, borderColor: ERROR_RED } },
      cancelText: 'Cancel',
      async onOk() {
        const commentInput = document.getElementById('rejectionComment');
        const comment = commentInput?.value;
        
        if (!comment || comment.trim() === '') {
          message.error('Please provide a rejection reason');
          throw new Error('Rejection reason required');
        }
        
        try {
          await deferralApi.rejectDeferral(deferral._id || deferral.id, comment, token);
          message.success('Deferral rejected');
          if (onAction) onAction('refreshQueue');
          onClose();
        } catch (err) {
          message.error(err.message || 'Failed to reject');
        }
      },
    });
  };

  if (!deferral) return null;

  // Build a consolidated history: initial request, stored history entries, and approval events
  const history = (function buildHistory() {
    const events = [];

    // Initial request
    events.push({ user: deferral.requestedBy || deferral.rmName || 'RM', userRole: 'RM', date: deferral.requestedDate || deferral.createdAt, comment: deferral.rmReason || deferral.deferralDescription || 'Deferral request submitted' });

    // Stored history entries
    if (deferral.history && Array.isArray(deferral.history) && deferral.history.length > 0) {
      deferral.history.forEach(h => events.push({ user: h.user?.name || h.user || 'System', userRole: h.userRole || h.role || 'System', date: h.date || h.createdAt || h.timestamp || h.entryDate, comment: h.comment || h.notes || h.message || '' }));
    }

    // Approver approvals
    const approverEvents = (deferral.approvers || deferral.approverFlow || []).filter(a => a && (a.approved || a.approved === true)).map(a => ({ user: a.name || (a.user && a.user.name) || a.userId || 'Approver', userRole: a.role || 'Approver', date: a.date || a.approvedDate || a.approvedAt, comment: `Approved by ${(a.name || a.role || 'Approver')}` }));
    approverEvents.forEach(e => events.push(e));

    // Sort events by date ascending
    return events.sort((a, b) => (new Date(a.date || 0)) - (new Date(b.date || 0)));
  })();

  // Create attachments array from your data structure
  const attachments = deferral.attachments || [
    { 
      id: "att1", 
      name: `${deferral.document}.pdf`, 
      size: "1.5 MB", 
      type: "pdf", 
      uploadDate: deferral.requestedDate 
    }
  ];

  // Documents categorization (requested, DCL, additional)
  const requestedDocs = (deferral.selectedDocuments || []).map((d, i) => {
    const name = typeof d === 'string' ? d : d.name || d.label || 'Document';
    const subItems = [];
    if (d && typeof d === 'object') {
      if (Array.isArray(d.items) && d.items.length) subItems.push(...d.items);
      else if (Array.isArray(d.selected) && d.selected.length) subItems.push(...d.selected);
      else if (Array.isArray(d.subItems) && d.subItems.length) subItems.push(...d.subItems);
      else if (d.item) subItems.push(d.item);
      else if (d.selected) subItems.push(d.selected);
    }
    return { id: `req_${i}`, name, type: d.type || '', subItems, source: 'selected' };
  });

  const storedDocs = (deferral.documents || []).map((d, i) => {
    const name = (d.name || '').toString();
    const isDCL = (typeof d.isDCL !== 'undefined' && d.isDCL) || /dcl/i.test(name) || (deferral.dclNumber && name.toLowerCase().includes((deferral.dclNumber||'').toLowerCase()));
    const isAdditional = (typeof d.isAdditional !== 'undefined') ? d.isAdditional : !isDCL;
    return {
      id: d._id || `doc_${i}`,
      name: d.name,
      type: d.type || (d.name ? d.name.split('.').pop().toLowerCase() : ''),
      url: d.url,
      size: d.size || null,
      uploadDate: d.uploadDate || d.uploadedAt || null,
      isDCL,
      isAdditional
    };
  });

  const dclDocs = storedDocs.filter(s => s.isDCL);
  const additionalDocs = storedDocs.filter(s => s.isAdditional);

  // Find uploaded versions for requested docs
  const requestedWithUploads = requestedDocs.map(r => {
    const match = storedDocs.find(s => s.name && r.name && s.name.toLowerCase().includes(r.name.toLowerCase()));
    return { ...r, uploaded: !!match, uploadedMeta: match || null };
  });

  return (
    <>
      <style>{customStyles}</style>
      <Modal
        title={`Review Deferral Request: ${deferral.deferralNumber}`}
        open={open}
        onCancel={onClose}
        width={950}
        bodyStyle={{ padding: "0 24px 24px" }}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Close
          </Button>,
          <Button
            key="editComment"
            icon={<EditOutlined />}
            onClick={() => setAddCommentVisible(true)}
          >
            Add Comment
          </Button>,
          (deferral.status === "pending_approval" || deferral.status === "in_review") && (
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={handleReject}
            >
              Reject
            </Button>
          ),
          (deferral.status === "pending_approval" || deferral.status === "in_review") && (
            <Button
              key="approve"
              type="primary"
              style={{ backgroundColor: SUCCESS_GREEN, borderColor: SUCCESS_GREEN }}
              icon={<CheckOutlined />}
              onClick={handleApprove}
              loading={approveLoading}
              disabled={approveLoading}
            >
              Approve
            </Button>
          )
        ]}
      >
        {deferral && (
          <>
            {/* Deferral Details Card */}
            <Card
              className="deferral-info-card"
              size="small"
              title={
                <span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>
                  Deferral Details
                </span>
              }
              style={{
                marginBottom: 18,
                marginTop: 24,
                borderRadius: 10,
                border: `1px solid #e0e0e0`,
              }}
            >
              <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                <Descriptions.Item label="Deferral Number">
                  <Text strong style={{ color: PRIMARY_BLUE }}>
                    {deferral.deferralNumber}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="DCL No">
                  {deferral.dclNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <div style={{ fontWeight: 500 }}>
                    {statusConfig.label}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  <div style={{ fontWeight: 500 }}>
                    {deferral.customerName}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Loan Type">
                  <div style={{ fontWeight: 500 }}>
                    {deferral.loanType}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Document">
                  <div style={{ fontWeight: 500 }}>
                    {deferral.document}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Deferral Type">
                  <div style={{ fontWeight: 500 }}>
                    {deferral.deferralType}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Days Sought">
                  <div style={{
                    fontWeight: "bold",
                    color: deferral.daysSought > 45 ? ERROR_RED : deferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE,
                    fontSize: 14
                  }}>
                    {deferral.daysSought} days
                  </div>
                </Descriptions.Item>



                <Descriptions.Item label="Current Approver">
                  {deferral.approvers?.find(a => a.isCurrent)?.name || "You"}
                </Descriptions.Item>
                <Descriptions.Item label="SLA Expiry">
                  <div style={{ color: dayjs(deferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>
                    {dayjs(deferral.slaExpiry).format('DD MMM YYYY HH:mm')}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {deferral.deferralDescription && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', marginBottom: 18 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Deferral Description</Text>
                <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                  <Text>{deferral.deferralDescription}</Text>
                </div>
              </div>
            )}

            {requestedWithUploads && requestedWithUploads.length > 0 ? (
              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Documents Requested for Deferrals ({requestedWithUploads.length})</span>} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {requestedWithUploads.map((doc, idx) => (
                    <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: doc.uploadedMeta ? '#f6ffed' : '#fff7e6', borderRadius: 6, border: doc.uploadedMeta ? '1px solid #b7eb8f' : '1px solid #ffd591' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileDoneOutlined style={{ color: doc.uploadedMeta ? SUCCESS_GREEN : WARNING_ORANGE, fontSize: 16 }} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {doc.name}
                            <Tag color={doc.uploadedMeta ? 'green' : 'orange'} style={{ fontSize: 10 }}>{doc.uploadedMeta ? 'Uploaded' : 'Requested'}</Tag>
                          </div>
                          {doc.subItems && doc.subItems.length > 0 && (<div style={{ fontSize: 12, color: '#333', marginTop: 4 }}><b>Selected:</b> {doc.subItems.join(', ')}</div>)}
                          {doc.uploadedMeta && (<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Uploaded as: {doc.uploadedMeta.name} {doc.uploadedMeta.uploadDate ? `• ${dayjs(doc.uploadedMeta.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div>)}
                        </div>
                      </div>
                      <Space>
                        {doc.uploadedMeta && doc.uploadedMeta.url && (<><Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(doc.uploadedMeta.url)} size="small">View</Button><Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(doc.uploadedMeta.url, doc.uploadedMeta.name); message.success(`Downloading ${doc.uploadedMeta.name}...`); }} size="small">Download</Button></>)}
                      </Space>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (deferral.selectedDocuments && deferral.selectedDocuments.length > 0 ? (
              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Documents Requested for Deferrals</span>} style={{ marginBottom: 18 }}>
                <div style={{ color: '#999' }}>{deferral.selectedDocuments.join(', ')}</div>
              </Card>
            ) : null)}

            <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Mandatory: DCL Upload {dclDocs.length > 0 ? '✓' : ''}</span>} style={{ marginBottom: 18 }}>
              {dclDocs.length > 0 ? (
                <>
                  <List
                    size="small"
                    dataSource={dclDocs}
                    renderItem={(doc) => (
                      <List.Item
                        actions={[
                          doc.url ? <Button key="view" type="link" onClick={() => openFileInNewTab(doc.url)} size="small">View</Button> : null,
                          doc.url ? <Button key="download" type="link" onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button> : null,
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={getFileIcon(doc.type)}
                          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 500 }}>{doc.name}</span><Tag color="red" style={{ fontSize: 10, padding: '0 6px' }}>DCL Document</Tag></div>}
                          description={<div style={{ fontSize: 12, color: '#666' }}>{doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)} {doc.uploadDate && (<span style={{ marginLeft: 8 }}>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)} {!doc.url && <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>Preview not available</div>}</div>}
                        />
                      </List.Item>
                    )}
                  />

                  <div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}>
                    <Text type="success" style={{ fontSize: 12 }}>✓ DCL document ready: <b>{dclDocs[0].name}</b>{dclDocs.length > 1 ? ` (+${dclDocs.length - 1} more)` : ''}</Text>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 12, color: WARNING_ORANGE }}><UploadOutlined style={{ fontSize: 18, marginBottom: 6, color: WARNING_ORANGE }} /><div>No DCL document uploaded</div><Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>DCL document is required for submission</Text></div>
              )}
            </Card>

            <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}><PaperClipOutlined style={{ marginRight: 8 }} /> Additional Uploaded Documents ({additionalDocs.length})</span>} style={{ marginBottom: 18 }}>
              {additionalDocs.length > 0 ? (
                <>
                  <List
                    size="small"
                    dataSource={additionalDocs}
                    renderItem={(doc) => (
                      <List.Item
                        actions={[
                          doc.url ? <Button key="view" type="link" onClick={() => openFileInNewTab(doc.url)} size="small">View</Button> : null,
                          doc.url ? <Button key="download" type="link" onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button> : null,
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={getFileIcon(doc.type)}
                          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 500 }}>{doc.name}</span>{doc.isAdditional && <Tag color="cyan" style={{ fontSize: 10 }}>Additional</Tag>}</div>}
                          description={<div style={{ fontSize: 12, color: '#666' }}>{doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)} {doc.uploadDate && (<span style={{ marginLeft: 8 }}>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)} {!doc.url && <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>Preview not available</div>}</div>}
                        />
                      </List.Item>
                    )}
                  />

                  <div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}>
                    <Text type="success" style={{ fontSize: 12 }}>✓ {additionalDocs.length} document{additionalDocs.length !== 1 ? 's' : ''} uploaded</Text>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 12, color: '#999' }}><PaperClipOutlined style={{ fontSize: 18, marginBottom: 6, color: '#d9d9d9' }} /><div>No additional documents uploaded</div><Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>You can upload additional supporting documents if needed</Text></div>
              )}
            </Card>

            {/* Comment Trail & History */}
            <div style={{ marginTop: 24 }}>
              <h4>Comment Trail & History</h4>
              <CommentTrail 
                history={history} 
                isLoading={loadingComments}
              />
            </div>

            {/* Add Comment Modal */}
            {/* Approve Confirmation Modal */}
            <Modal
              title={`Approve Deferral Request: ${deferral.deferralNumber}`}
              open={showApproveConfirm}
              onCancel={() => setShowApproveConfirm(false)}
              okText={'Yes, Approve'}
              okType={'primary'}
              okButtonProps={{ style: { background: SUCCESS_GREEN, borderColor: SUCCESS_GREEN } }}
              cancelText={'Cancel'}
              confirmLoading={approveLoading}
              onOk={doApprove}
            >
              <div>
                <p>Are you sure you want to approve this deferral request?</p>
                <p><strong>{deferral?.deferralNumber}</strong> - {deferral?.customerName}</p>
                <p>Days Sought: <strong>{deferral?.daysSought}</strong> days</p>
                {deferral?.category === "Non-Allowable" && (
                  <p style={{ color: ERROR_RED, fontWeight: 'bold' }}>
                    ⚠️ This is a Non-Allowable document
                  </p>
                )}
                <p style={{ marginBottom: 6 }}>Add approval comment (optional):</p>
                <Input.TextArea rows={4} value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Enter approval comment..." />
              </div>
            </Modal>

            <AddCommentModal
              open={addCommentVisible}
              onClose={() => setAddCommentVisible(false)}
              onAddComment={handleAddComment}
              deferralId={deferral.id}
            />
          </>
        )}
      </Modal>
    </>
  );
};

const MyQueue = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector(state => state.auth.token);
  
  // State for modal
  const [selectedDeferral, setSelectedDeferral] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Live data - load pending deferrals from API
  const [deferrals, setDeferrals] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/deferrals/approver/queue`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDeferrals(data);
    } catch (error) {
      message.error('Failed to load deferral requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered deferrals - All in one table
  const filteredDeferrals = useMemo(() => {
    let filtered = [...deferrals];
    
    // Search filtering
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(d =>
        d.customerName.toLowerCase().includes(q) ||
        d.dclNumber.toLowerCase().includes(q) ||
        d.deferralNumber.toLowerCase().includes(q) ||
        d.requestedBy.toLowerCase().includes(q) ||
        d.deferralTitle.toLowerCase().includes(q) ||
        d.customerNumber.toLowerCase().includes(q) ||
        d.document.toLowerCase().includes(q)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(d => d.priority === priorityFilter);
    }
    
    // Date range filtering
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(d => {
        const requestDate = dayjs(d.requestedDate);
        return requestDate.isAfter(start) && requestDate.isBefore(end);
      });
    }
    
    return filtered;
  }, [deferrals, searchText, statusFilter, priorityFilter, dateRange]);

  // Handle actions from modal
  const handleModalAction = (action, deferralId, data) => {
    switch (action) {
      case 'addComment':
        // Optimistically add comment to history locally but avoid adding duplicates
        setDeferrals(prev => prev.map(d => {
          if (d._id !== deferralId && d.id !== deferralId) return d;
          const existing = d.history || [];
          const last = existing.length ? existing[existing.length - 1] : null;
          const isDup = last && last.comment === data.comment && last.user === data.user && last.date === data.date;
          if (isDup) return d;
          return { ...d, history: [...existing, data] };
        }));

        // If the modal is currently open for the same deferral, update it too so UI reflects change immediately
        setSelectedDeferral(prev => {
          if (!prev || (prev._id !== deferralId && prev.id !== deferralId)) return prev;
          const existing = prev.history || [];
          const last = existing.length ? existing[existing.length - 1] : null;
          const isDup = last && last.comment === data.comment && last.user === data.user && last.date === data.date;
          if (isDup) return prev;
          return { ...prev, history: [...existing, data] };
        });

        break;
      case 'approve':
      case 'reject':
      case 'refreshQueue':
        // Refresh approver queue from the server to reflect state changes
        fetchDeferrals();
        break;
      case 'gotoActioned':
        // Navigate user to the Actioned tab so they can see items they've actioned
        navigate('/approver/actioned');
        break;
      default:
        break;
    }
  };



  // Standardized Columns for the table - REMOVED TAGS FROM STATUS AND DAYS SOUGHT, REMOVED ACTIONS COLUMN
  const columns = [
    {
      title: "Deferral No",
      dataIndex: "deferralNumber",
      width: 120,
      fixed: "left",
      render: (deferralNumber) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          {deferralNumber}
        </div>
      ),
    },
    {
      title: "DCL No",
      dataIndex: "dclNumber",
      width: 100,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      width: 180,
      render: (name) => (
        <Text strong style={{ color: PRIMARY_BLUE, fontSize: 13 }}>
          {name}
        </Text>
      ),
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
      width: 120,
      render: (loanType) => (
        <div style={{ fontSize: 12, fontWeight: 500 }}>
          {loanType}
        </div>
      ),
    },
    {
      title: "Document",
      dataIndex: "document",
      width: 150,
      render: (document) => (
        <Text ellipsis style={{ fontSize: 12 }}>
          {safeText(document)}
        </Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "deferralType",
      width: 100,
      render: (deferralType) => (
        <div style={{
          fontSize: 11,
          fontWeight: "bold",
          color: PRIMARY_BLUE
        }}>
          {deferralType}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          pending_approval: { color: WARNING_ORANGE, text: "Pending", icon: <ClockCircleOutlined /> },
          in_review: { color: PROCESSING_BLUE, text: "In Review", icon: <ClockCircleOutlined /> },
          approved: { color: SUCCESS_GREEN, text: "Approved", icon: <CheckCircleOutlined /> },
          rejected: { color: ERROR_RED, text: "Rejected", icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return (
          <div style={{
            fontSize: 12,
            fontWeight: "bold",
            color: config.color === "orange" ? WARNING_ORANGE : 
                   config.color === "blue" ? PROCESSING_BLUE : 
                   config.color === "green" ? SUCCESS_GREEN : 
                   config.color === "red" ? ERROR_RED : "#666",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            {config.icon}
            {config.text}
          </div>
        );
      },
    },
    {
      title: "Days Sought",
      dataIndex: "daysSought",
      width: 100,
      align: "center",
      render: (daysSought) => (
        <div style={{
          fontWeight: "bold",
          color: daysSought > 45 ? ERROR_RED : 
                 daysSought > 30 ? WARNING_ORANGE : 
                 daysSought > 15 ? PROCESSING_BLUE : 
                 SUCCESS_GREEN,
          fontSize: 13,
          padding: "2px 8px",
          borderRadius: 4,
          display: "inline-block"
        }}>
          {daysSought} days
        </div>
      ),
    },
    {
      title: "SLA",
      dataIndex: "slaExpiry",
      width: 100,
      render: (date, record) => {
        if (record.status !== "pending_approval" && record.status !== "in_review") {
          return <div style={{ fontSize: 11, color: "#999" }}>N/A</div>;
        }
        
        const hoursLeft = dayjs(date).diff(dayjs(), 'hours');
        let color = SUCCESS_GREEN;
        let text = `${Math.ceil(hoursLeft/24)}d`;
        
        if (hoursLeft <= 0) {
          color = ERROR_RED;
          text = 'Expired';
        } else if (hoursLeft <= 24) {
          color = ERROR_RED;
          text = `${hoursLeft}h`;
        } else if (hoursLeft <= 72) {
          color = WARNING_ORANGE;
        }
        
        return (
          <div style={{
            color: color,
            fontWeight: "bold",
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 4,
            backgroundColor: `${color}10`,
            display: "inline-block"
          }}>
            {text}
          </div>
        );
      },
    },
  ];



  // Custom table styles
  const tableStyles = `
    .myqueue-table .ant-table-wrapper {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
      border: 1px solid #e0e0e0;
    }
    .myqueue-table .ant-table-thead > tr > th {
      background-color: #f7f7f7 !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700;
      border-bottom: 3px solid ${ACCENT_LIME} !important;
    }
    .myqueue-table .ant-table-tbody > tr:hover > td {
      background-color: rgba(181, 211, 52, 0.1) !important;
      cursor: pointer;
    }
  `;

  return (
    <div style={{ padding: 24 }}>
      <style>{tableStyles}</style>

      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderLeft: `4px solid ${ACCENT_LIME}`,
        }}
      >
        <h2 style={{ margin: 0, color: PRIMARY_BLUE }}>My Queue</h2>
        <p style={{ marginTop: 4, color: "#666" }}>
          All deferral requests from Relationship Managers • {filteredDeferrals.length} items
        </p>
      </Card>



      {/* Search Filter Only */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col md={12}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by Customer, DCL, or ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card>
        <div className="myqueue-table">
          <Table
            columns={columns}
            dataSource={filteredDeferrals}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={isLoading}
            scroll={{ x: 1200 }}
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  description={
                    filteredDeferrals.length === 0 && deferrals.length > 0
                      ? "No deferrals match your filters"
                      : "No deferral requests in your queue"
                  }
                />
              ),
            }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedDeferral(record);
                setModalOpen(true);
              },
            })}
          />
        </div>
      </Card>

      {/* Deferral Details Modal */}
      {selectedDeferral && (
        <DeferralDetailsModal
          deferral={selectedDeferral}
          open={modalOpen}
          token={token}
          onClose={() => {
            setModalOpen(false);
            setSelectedDeferral(null);
          }}
          onAction={handleModalAction}
        />
      )}
    </div>
  );
};

export default MyQueue;