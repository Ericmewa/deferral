import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Tabs,
  Divider,
  Table,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Input,
  Badge,
  Typography,
  Modal,
  message,
  Descriptions,
  Space,
  Upload,
  Form,
  Input as AntdInput,
  Progress,
  List,
  Avatar,
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
  BankOutlined,
  MailOutlined,
  FileDoneOutlined,
  PaperClipOutlined,
  SendOutlined,
  BellOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { openFileInNewTab, downloadFile } from '../../utils/fileUtils';

// Theme Colors (same as other queues)
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const HIGHLIGHT_GOLD = "#fcb116";
const LIGHT_YELLOW = "#fcd716";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";

const { Text, Title } = Typography;
const { TextArea } = AntdInput;

// NOTE: Mock data removed. Fetch real deferrals via API and populate state.

// Custom CSS for modal styling
const customStyles = `
  .ant-modal-header { background-color: ${PRIMARY_BLUE} !important; padding: 18px 24px !important; }
  .ant-modal-title { color: white !important; font-size: 1.15rem !important; font-weight: 700 !important; letter-spacing: 0.5px; }
  .ant-modal-close-x { color: white !important; }

  .deferral-info-card .ant-card-head { border-bottom: 2px solid ${ACCENT_LIME} !important; }
  .deferral-info-card .ant-descriptions-item-label { font-weight: 600 !important; color: ${SECONDARY_PURPLE} !important; padding-bottom: 4px; }
  .deferral-info-card .ant-descriptions-item-content { color: ${PRIMARY_BLUE} !important; font-weight: 700 !important; font-size: 13px !important; }

  .ant-input, .ant-select-selector { border-radius: 6px !important; border-color: #e0e0e0 !important; }
  .ant-input:focus, .ant-select-focused .ant-select-selector { box-shadow: 0 0 0 2px rgba(22, 70, 121, 0.2) !important; border-color: ${PRIMARY_BLUE} !important; }

  .status-tag { font-weight: 700 !important; border-radius: 999px !important; padding: 3px 8px !important; text-transform: capitalize; min-width: 80px; text-align: center; display: inline-flex; align-items: center; gap: 4px; justify-content: center; }

  .ant-modal-footer .ant-btn { border-radius: 8px; font-weight: 600; height: 38px; padding: 0 16px; }
  .ant-modal-footer .ant-btn-primary { background-color: ${PRIMARY_BLUE} !important; border-color: ${PRIMARY_BLUE} !important; }
`;

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf': return <FilePdfOutlined style={{ color: ERROR_RED }} />;
    case 'word': return <FileWordOutlined style={{ color: PRIMARY_BLUE }} />;
    case 'excel': return <FileExcelOutlined style={{ color: SUCCESS_GREEN }} />;
    case 'image': return <FileImageOutlined style={{ color: SECONDARY_PURPLE }} />;
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
  
  // Remove everything in parentheses including the parentheses
  // Example: "Sarah Johnson (RM)" becomes "Sarah Johnson"
  // Example: "Diana Jebet (Deferral Management Team)" becomes "Diana Jebet"
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

// Helper function to get file extension type
const getFileExtension = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
  return 'other';
};

// Helper: Send reminder email to approver (simulated)
const sendReminderEmail = async (approverEmail, approverName, deferralNumber, customerName) => {
  try {
    message.loading(`Sending reminder to ${approverName}...`, 2);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulated log — in real app call server API
    console.log('Reminder email', { approverEmail, approverName, deferralNumber, customerName });

    message.success(`Reminder sent to ${approverName}`);
    return { success: true, timestamp: new Date().toISOString(), recipient: approverEmail };
  } catch (err) {
    console.error(err);
    message.error('Failed to send reminder');
    return { success: false, error: err.message };
  }
};

// Enhanced Deferral Details Modal (expanded view: facilities, documents, approver flow, comments)
const DeferralDetailsModal = ({ deferral, open, onClose, onAction }) => {
  const [addCommentVisible, setAddCommentVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [localDeferral, setLocalDeferral] = useState(deferral);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    setLocalDeferral(deferral);
  }, [deferral]);

  if (!localDeferral) return null;

  const status = localDeferral.status || 'deferral_requested';
  const isPendingApproval = status === 'deferral_requested';

  // Helper to pull all documents into categories
  const getAllDocuments = () => {
    const all = [];

    // attachments
    (localDeferral.attachments || []).forEach((att, i) => {
      const isDCL = att.name && att.name.toLowerCase().includes('dcl');
      all.push({ id: att.id || `att_${i}`, name: att.name, type: getFileExtension(att.name || ''), url: att.url, isDCL, isUploaded: true, source: 'attachments', uploadDate: att.uploadDate });
    });

    // additionalFiles
    (localDeferral.additionalFiles || []).forEach((f, i) => {
      all.push({ id: `add_${i}`, name: f.name, type: getFileExtension(f.name || ''), url: f.url, isAdditional: true, isUploaded: true, source: 'additionalFiles' });
    });

    // selected documents (requested)
    (localDeferral.selectedDocuments || []).forEach((d, i) => {
      all.push({ id: `req_${i}`, name: typeof d === 'string' ? d : d.name || d.label || 'Document', type: d.type || '', isRequested: true, isSelected: true, source: 'selected' });
    });

    // stored documents - preserve flags (isDCL, isAdditional, uploadDate, size) so UI can categorize them
    (localDeferral.documents || []).forEach((d, i) => {
      const name = (d.name || '').toString();
      // Heuristic: if not explicitly flagged, infer DCL by filename or by matching DCL number
      const dclNameMatch = /dcl/i.test(name) || (localDeferral.dclNo && name.toLowerCase().includes((localDeferral.dclNo || '').toLowerCase()));
      const isDCLFlag = (typeof d.isDCL !== 'undefined' && d.isDCL) || dclNameMatch;
      const isAdditionalFlag = (typeof d.isAdditional !== 'undefined') ? d.isAdditional : !isDCLFlag;

      // Treat entries in documents[] as uploaded metadata (they were added via addDocument). The URL may be blank for older records,
      // but we still want to display the filename and size so RM can see what was attached.
      const isUploadedFlag = true;

      all.push({ 
        id: d._id || d.id || `doc_${i}`,
        name: d.name,
        type: d.type || getFileExtension(d.name || ''),
        url: d.url,
        isDocument: true,
        isUploaded: isUploadedFlag,
        source: 'documents',
        isDCL: !!isDCLFlag,
        isAdditional: !!isAdditionalFlag,
        uploadDate: d.uploadDate || d.uploadedAt || null,
        size: d.size || null
      });
    });

    return all;
  };

  const allDocs = getAllDocuments();
  const dclDocs = allDocs.filter(d => d.isDCL);
  const uploadedDocs = allDocs.filter(d => d.isUploaded && !d.isDCL);
  const requestedDocs = allDocs.filter(d => d.isRequested || d.isSelected);

  // Facilities table columns (prefer sanctioned/balance/headroom if available)
  const facilityColumns = [
    { title: 'Facility Type', dataIndex: 'facilityType', key: 'facilityType', render: (t) => <Text strong>{t || 'N/A'}</Text> },
    { title: "Sanctioned (KES '000)", dataIndex: 'sanctioned', key: 'sanctioned', align: 'right', render: (v, r) => {
        const val = v ?? r.amount ?? 0; return Number(val || 0).toLocaleString();
      }
    },
    { title: "Balance (KES '000)", dataIndex: 'balance', key: 'balance', align: 'right', render: (v, r) => Number(v ?? r.balance ?? 0).toLocaleString() },
    { title: "Headroom (KES '000)", dataIndex: 'headroom', key: 'headroom', align: 'right', render: (v, r) => Number(v ?? r.headroom ?? Math.max(0, (r.amount || 0) - (r.balance || 0))).toLocaleString() }
  ];

  const handleSendReminder = async () => {
    if (!localDeferral) return;
    const current = localDeferral.currentApprover || (localDeferral.approverFlow && localDeferral.approverFlow[0]);
    const email = current?.email || (typeof current === 'string' && current.includes('@') ? current : '');
    const name = current?.name || (typeof current === 'string' ? current : 'Approver');
    if (!email) { message.warning('No email for current approver'); return; }
    setSendingReminder(true);
    const res = await sendReminderEmail(email, name, localDeferral.deferralNumber, localDeferral.customerName);
    setSendingReminder(false);
    if (res.success) {
      const historyEntry = { action: 'Reminder Sent', user: 'RM', date: new Date().toISOString(), notes: `Reminder sent to ${name}`, comment: `Reminder sent to ${name}` };
      if (onAction) onAction('addComment', localDeferral._id, historyEntry);
      setLocalDeferral(prev => ({ ...prev, history: [...(prev.history||[]), historyEntry] }));
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BankOutlined /> <span>Deferral Request: {localDeferral.deferralNumber}</span></div>}
        open={open}
        onCancel={onClose}
        width={950}
        styles={{ body: { padding: '0 24px 24px' } }}
        footer={[<Button key="close" onClick={onClose}>Close</Button>]}
      >
        <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Customer Information</span>} style={{ marginBottom: 18, marginTop: 24 }}>
          <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Customer Name"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.customerName}</Text></Descriptions.Item>
            <Descriptions.Item label="Customer Number"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.customerNumber}</Text></Descriptions.Item>
            <Descriptions.Item label="Loan Type"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.loanType}</Text></Descriptions.Item>
            <Descriptions.Item label="Created At"><div><Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('DD MMM YYYY')}</Text><Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('HH:mm')}</Text></div></Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Deferral Details</span>} style={{ marginBottom: 18 }}>
          <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Deferral Number"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.deferralNumber}</Text></Descriptions.Item>
            <Descriptions.Item label="DCL No">{localDeferral.dclNo || localDeferral.dclNumber}</Descriptions.Item>
            <Descriptions.Item label="Status"><div style={{ fontWeight: 500 }}>{status === 'deferral_requested' ? 'Pending' : status}</div></Descriptions.Item>
            <Descriptions.Item label="Deferral Title"><div style={{ fontWeight: 500 }}>{localDeferral.deferralTitle}</div></Descriptions.Item>
            {/* Loan Amount with threshold indicator */}
            <Descriptions.Item label="Loan Amount">
              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>{(function(){
                  const amt = Number(localDeferral.loanAmount || 0);
                  if (!amt) return 'Not specified';
                  // Heuristics: if value looks small (<1000) treat as millions; otherwise treat as KSh
                  if (amt > 1000) {
                    return `KSh ${amt.toLocaleString()}`;
                  }
                  return `${amt} M`;
                })()}</div>
                {(function(){
                  const amt = Number(localDeferral.loanAmount || 0);
                  if (!amt) return null;
                  const isAbove75 = amt > 75 && amt <= 1000 ? true : (amt > 75000000 ? true : false);
                  return isAbove75 ? <Tag color={'red'} style={{ fontSize: 12 }}>Above 75 million</Tag> : <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>Under 75 million</span>;
                })()}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Days Sought"><div style={{ fontWeight: 'bold', color: localDeferral.daysSought > 45 ? ERROR_RED : localDeferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE }}>{localDeferral.daysSought || 0} days</div></Descriptions.Item>

            {/* Next Due Date: use available properties and mark as auto-generated when present */}
            <Descriptions.Item label="Next Due Date">
              <div style={{ color: (localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? (dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).isBefore(dayjs()) ? ERROR_RED : SUCCESS_GREEN) : PRIMARY_BLUE }}>
                {(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? `${dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).format('DD MMM YYYY')}` : 'Not calculated'}
              </div>
            </Descriptions.Item>



            <Descriptions.Item label="SLA Expiry"><div style={{ color: localDeferral.slaExpiry && dayjs(localDeferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>{localDeferral.slaExpiry ? dayjs(localDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}</div></Descriptions.Item>
          </Descriptions>



          {localDeferral.deferralDescription && (<div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}><Text strong style={{ display: 'block', marginBottom: 8 }}>Deferral Description</Text><div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}><Text>{localDeferral.deferralDescription}</Text></div></div>)}
        </Card>

        {localDeferral.facilities && localDeferral.facilities.length > 0 && (
          <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Facility Details ({localDeferral.facilities.length})</span>} style={{ marginBottom: 18 }}>
            <Table dataSource={localDeferral.facilities} columns={facilityColumns} pagination={false} size="small" rowKey={(r)=> r.facilityNumber || r._id || `facility-${Math.random().toString(36).slice(2)}`} scroll={{ x: 600 }} />
          </Card>
        )}

        {requestedDocs.length > 0 && (
          <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Documents Requested for Deferrals ({requestedDocs.length})</span>} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requestedDocs.map((doc, idx) => {
                const isUploaded = uploadedDocs.some(u => (u.name || '').toLowerCase().includes((doc.name||'').toLowerCase()));
                const uploadedVersion = uploadedDocs.find(u => (u.name||'').toLowerCase().includes((doc.name||'').toLowerCase()));
                return (
                  <div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: isUploaded ? '#f6ffed' : '#fff7e6', borderRadius: 6, border: isUploaded ? '1px solid #b7eb8f' : '1px solid #ffd591' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <FileDoneOutlined style={{ color: isUploaded ? SUCCESS_GREEN : WARNING_ORANGE, fontSize: 16 }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {doc.name}
                          <Tag color={isUploaded ? 'green' : 'orange'} style={{ fontSize: 10 }}>{isUploaded ? 'Uploaded' : 'Requested'}</Tag>
                        </div>
                        {doc.type && (<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}><b>Type:</b> {doc.type}</div>)}
                        {uploadedVersion && (<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Uploaded as: {uploadedVersion.name} {uploadedVersion.uploadDate ? `• ${dayjs(uploadedVersion.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div>)}
                      </div>
                    </div>
                    <Space>
                      {isUploaded && uploadedVersion && uploadedVersion.url && (<><Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(uploadedVersion.url)} size="small">View</Button><Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(uploadedVersion.url, uploadedVersion.name); message.success(`Downloading ${uploadedVersion.name}...`); }} size="small">Download</Button></>)}
                    </Space>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

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
                      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 500 }}>{doc.name}</span><Tag color="red" style={{ fontSize: 10 }}>DCL Document</Tag></div>}
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

        <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}><PaperClipOutlined style={{ marginRight: 8 }} /> Additional Documents ({uploadedDocs.length})</span>} style={{ marginBottom: 18 }}>
          {uploadedDocs.length > 0 ? (
            <>
              <List
                size="small"
                dataSource={uploadedDocs}
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
                <Text type="success" style={{ fontSize: 12 }}>✓ {uploadedDocs.length} additional document{uploadedDocs.length !== 1 ? 's' : ''} ready</Text>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 12, color: '#999' }}><PaperClipOutlined style={{ fontSize: 18, marginBottom: 6, color: '#d9d9d9' }} /><div>No additional documents uploaded</div><Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>You can upload additional supporting documents if needed</Text></div>
          )}
        </Card>

        <Card size="small" title={<span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>Approval Flow {isPendingApproval && (<Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>Pending Approval</Tag>)}</span>} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {localDeferral.approverFlow && localDeferral.approverFlow.length > 0 ? (
              localDeferral.approverFlow.map((approver, index) => {
                const isCurrentApprover = index === 0;
                const hasEmail = isCurrentApprover && localDeferral.currentApprover?.email;
                return (
                  <div key={index} style={{ padding: '12px 16px', backgroundColor: isCurrentApprover ? '#e6f7ff' : '#fafafa', borderRadius: 6, border: isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge count={index+1} style={{ backgroundColor: isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf', fontSize: 12, height: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 14 }}>{typeof approver === 'object' ? (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver)) : approver}</Text>
                      {isCurrentApprover && (
                        <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          Current Approver • Pending Approval
                          {localDeferral.slaExpiry && (
                            <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>SLA: {dayjs(localDeferral.slaExpiry).format('DD MMM HH:mm')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {isCurrentApprover && isPendingApproval && hasEmail && (
                      <Space>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          <MailOutlined style={{ marginRight: 4 }} />{localDeferral.currentApprover.email}
                        </div>
                        <Button type="primary" icon={<SendOutlined />} onClick={handleSendReminder} loading={sendingReminder} size="small" style={{ backgroundColor: ACCENT_LIME, borderColor: ACCENT_LIME, color: PRIMARY_BLUE, fontWeight: 600 }}>Send Reminder</Button>
                      </Space>
                    )}
                  </div>
                );
              })
            ) : localDeferral.approvers && localDeferral.approvers.length > 0 ? (
              localDeferral.approvers.filter(a => a && a !== "").map((approver, index) => {
                const isCurrentApprover = index === 0;
                const hasEmail = isCurrentApprover && localDeferral.currentApprover?.email;
                const isEmail = typeof approver === 'string' && approver.includes('@');
                return (
                  <div key={index} style={{ padding: '12px 16px', backgroundColor: isCurrentApprover ? '#e6f7ff' : '#fafafa', borderRadius: 6, border: isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge count={index+1} style={{ backgroundColor: isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf', fontSize: 12, height: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 14 }}>{typeof approver === 'string' ? (isEmail ? approver.split('@')[0] : approver) : (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver))}</Text>
                      {isCurrentApprover && (
                        <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          Current Approver • Pending Approval
                          {localDeferral.slaExpiry && (
                            <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>SLA: {dayjs(localDeferral.slaExpiry).format('DD MMM HH:mm')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {isCurrentApprover && isPendingApproval && isEmail && (
                      <Space>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          <MailOutlined style={{ marginRight: 4 }} />{approver}
                        </div>
                        <Button type="primary" icon={<SendOutlined />} onClick={async () => {
                          setSendingReminder(true);
                          const result = await sendReminderEmail(approver, approver.split('@')[0], localDeferral.deferralNumber, localDeferral.customerName);
                          setSendingReminder(false);
                          if (result.success) {
                            const historyEntry = { action: 'Reminder Sent', user: 'RM', date: new Date().toISOString(), notes: `Reminder email sent to ${approver.split('@')[0]} (${approver})`, comment: `Reminder sent to ${approver.split('@')[0]}` };
                            if (onAction) onAction('addComment', localDeferral._id, historyEntry);
                            setLocalDeferral(prev => ({ ...prev, history: [...(prev.history||[]), historyEntry] }));
                          }
                        }} loading={sendingReminder} size="small" style={{ backgroundColor: ACCENT_LIME, borderColor: ACCENT_LIME, color: PRIMARY_BLUE, fontWeight: 600 }}>Send Reminder</Button>
                      </Space>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                <UserOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} />
                <div>No approvers specified</div>
              </div>
            )}

            {isPendingApproval && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591', marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <BellOutlined style={{ color: WARNING_ORANGE, marginTop: 2 }} />
                  <div>
                    <Text strong style={{ fontSize: 13, color: WARNING_ORANGE }}>Send Reminder</Text>
                    <Text style={{ fontSize: 12, color: '#666', display: 'block', marginTop: 4 }}>
                      You can send a reminder email to the current approver if this deferral is pending approval for too long. The email will include deferral details and a direct link to the approval page.
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div style={{ marginTop: 24 }}>
          <h4 style={{ color: PRIMARY_BLUE, marginBottom: 16 }}>Comment Trail & History</h4>

          {/* Build a derived history: initial request, any stored history, and approval events */}
          {(function renderHistory() {
            const events = [];

            // Initial request event
            const requester = localDeferral.requestedBy || localDeferral.rmName || localDeferral.rmRequestedBy?.name || 'RM';
            const requestDate = localDeferral.requestedDate || localDeferral.createdAt || localDeferral.requestedAt;
            events.push({ user: requester, userRole: 'RM', date: requestDate, comment: localDeferral.rmReason || localDeferral.deferralDescription || 'Deferral request submitted' });

            // Existing history entries (if any)
            if (localDeferral.history && Array.isArray(localDeferral.history) && localDeferral.history.length > 0) {
              localDeferral.history.forEach((h) => {
                events.push({ user: h.user?.name || h.user || h.user || 'System', userRole: h.userRole || h.role || 'System', date: h.date || h.createdAt || h.timestamp || h.entryDate, comment: h.comment || h.notes || h.message || '' });
              });
            }

            // Approver approvals (map approved steps)
            const approverEvents = (localDeferral.approvers || localDeferral.approverFlow || []).filter(a => a && a.approved).map(a => ({ user: a.name || (a.user && a.user.name) || a.userId || 'Approver', userRole: a.role || 'Approver', date: a.date || a.approvedDate || a.approvedAt, comment: `Approved by ${(a.name || a.role || 'Approver')}` }));
            approverEvents.forEach(e => events.push(e));

            // Sort events by date ascending
            const sorted = events.sort((a, b) => (new Date(a.date || 0)) - (new Date(b.date || 0)));

            return <CommentTrail history={sorted} isLoading={loadingComments} />;
          })()}
        </div>

      </Modal>
    </>
  );
};

// Main DeferralPending Component for RM
const DeferralPending = ({ userId = "rm_current" }) => {
  const [selectedDeferral, setSelectedDeferral] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deferrals, setDeferrals] = useState([]);
  
  // Filters
  const [searchText, setSearchText] = useState("");

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        const token = stored?.token;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/deferrals/my`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });
        let myData = [];
        if (res.ok) {
          const data = await res.json();
          myData = Array.isArray(data) ? data : [];
        } else {
          myData = [];
        }

        // Additionally fetch approved deferrals and include those assigned to this RM
        let approvedAssigned = [];
        try {
          const aprRes = await fetch(`${import.meta.env.VITE_API_URL}/api/deferrals/approved`, {
            headers: token ? { authorization: `Bearer ${token}` } : {},
          });
          if (aprRes.ok) {
            const approvedData = await aprRes.json();
            const rmId = stored?.user?._id || userId;
            if (Array.isArray(approvedData)) {
              approvedAssigned = approvedData.filter(d => d.assignedRM && String(d.assignedRM._id) === String(rmId));
            }
          }
        } catch (e) {
          console.warn('Failed to load approved deferrals for RM', e);
        }

        // Merge approvedAssigned into myData without duplicates
        const combined = [...myData];
        const existingIds = new Set(combined.map(d => d._id));
        for (const a of approvedAssigned) {
          if (!existingIds.has(a._id)) combined.push(a);
        }

        setDeferrals(combined);
      } catch (err) {
        console.error(err);
        setDeferrals([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  // Filter data - RM sees their own deferrals (all statuses)
  const filteredData = useMemo(() => {
    let filtered = [...deferrals];

    // Apply search filter
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(d =>
        (d.deferralNumber || "").toLowerCase().includes(q) ||
        (d.dclNumber || "").toLowerCase().includes(q) ||
        (d.customerNumber || "").toLowerCase().includes(q) ||
        (d.customerName || "").toLowerCase().includes(q) ||
        (d.deferralTitle || "").toLowerCase().includes(q) ||
        ((d.loanType || "").toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [deferrals, searchText]);

  // Tabs: Pending vs Approved - track active tab and derive data sets
  const [activeTab, setActiveTab] = useState('pending');

  // Pending should include all non-finalised requests (anything not approved/rejected)
  const pendingData = useMemo(() => filteredData.filter(d => d.status !== 'deferral_approved' && d.status !== 'deferral_rejected'), [filteredData]);
  // Approved should include both legacy CO 'approved' and RM 'deferral_approved' statuses
  const approvedData = useMemo(() => filteredData.filter(d => d.status === 'deferral_approved' || d.status === 'approved'), [filteredData]);
  const currentData = activeTab === 'pending' ? pendingData : approvedData;

  // Handle actions from modal
  const handleModalAction = (action, deferralId, data) => {
    switch (action) {
      case 'edit':
        setDeferrals(prev => prev.map(d => 
          d._id === deferralId ? { ...d, ...data } : d
        ));
        break;
      case 'withdraw':
        setDeferrals(prev => prev.filter(d => d._id !== deferralId));
        break;
      case 'addComment':
        // Add new comment to history
        setDeferrals(prev => prev.map(d => 
          d._id === deferralId ? { 
            ...d, 
            history: [...d.history, data] 
          } : d
        ));
        break;
      case 'uploadComplete':
        // Add uploaded files to attachments
        setDeferrals(prev => prev.map(d => 
          d._id === deferralId ? { 
            ...d, 
            attachments: [...d.attachments, ...data]
          } : d
        ));
        break;
      default:
        break;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
  };

  // Updated Columns - No sorting functionality
  const columns = [
    {
      title: "Deferral No",
      dataIndex: "deferralNumber",
      key: "deferralNumber",
      width: 140,
      render: (text) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: SECONDARY_PURPLE }} />
          {text}
        </div>
      )
    },
    {
      title: "DCL No",
      dataIndex: "dclNo",
      key: "dclNo",
      width: 120,
      render: (text, record) => {
        const value = record.dclNo || record.dclNumber;
        return value ? (
          <div style={{ color: SECONDARY_PURPLE, fontWeight: 500, fontSize: 13 }}>{value}</div>
        ) : (
          <Tag color="warning" style={{ fontWeight: 700 }}>Missing DCL</Tag>
        );
      }
    },

    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      width: 160,
      render: (text) => (
        <div style={{
          fontWeight: 600,
          color: PRIMARY_BLUE,
        }}>
          {text}
        </div>
      )
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
      key: "loanType",
      width: 140,
      render: (text) => (
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: PRIMARY_BLUE,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {text || "Not Specified"}
        </div>
      ),
      filters: [
        { text: 'Buy & Build', value: 'Buy & Build' },
        { text: 'Mortgage DCL', value: 'Mortgage DCL' },
        { text: 'Construction Loan', value: 'Construction Loan' },
        { text: 'Secured Loan DCL', value: 'Secured Loan DCL' },
        { text: 'Stock Loan DCL', value: 'Stock Loan DCL' },
        { text: 'Equity Release Loan', value: 'Equity Release Loan' },
        { text: 'Shamba Loan', value: 'Shamba Loan' }
      ],
      onFilter: (value, record) => record.loanType === value
    },
    {
      title: "Document",
      dataIndex: "deferralTitle",
      key: "document",
      width: 150,
      render: (text) => (
        <div style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>
          {text}
        </div>
      ),
      filters: [
        { text: 'Bank Statements', value: 'Bank Statements' },
        { text: 'CR12 Certificate', value: 'CR12 Certificate' },
        { text: 'Lease Agreement', value: 'Lease Agreement' },
        { text: 'Title Deed', value: 'Title Deed' },
        { text: 'Stock Valuation Report', value: 'Stock Valuation Report' }
      ],
      onFilter: (value, record) => record.deferralTitle === value,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          'deferral_requested': { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
          'deferral_approved': { color: 'green', text: 'Approved', icon: <CheckCircleOutlined /> },
          'deferral_rejected': { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> }
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <div style={{ 
            fontSize: 11,
            fontWeight: "bold",
            color: config.color === 'orange' ? WARNING_ORANGE : 
                   config.color === 'green' ? SUCCESS_GREEN : 
                   config.color === 'red' ? ERROR_RED : '#666'
          }}>
            {config.text}
          </div>
        );
      },
      filters: [
        { text: 'Pending', value: 'deferral_requested' },
        { text: 'Approved', value: 'deferral_approved' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Days Sought",
      dataIndex: "daysSought",
      key: "daysSought",
      width: 100,
      align: "center",
      render: (days) => (
        <div style={{
          fontWeight: "bold",
          color: days > 45 ? ERROR_RED : days > 30 ? WARNING_ORANGE : PRIMARY_BLUE,
          fontSize: 14,
          backgroundColor: days > 45 ? "#fff2f0" : days > 30 ? "#fff7e6" : "#f0f7ff",
          padding: "4px 8px",
          borderRadius: 4,
          display: "inline-block"
        }}>
          {days} days
        </div>
      )
    },
    {
      title: "SLA",
      dataIndex: "slaExpiry",
      key: "slaExpiry",
      width: 100,
      fixed: "right",
      render: (date) => {
        const daysLeft = dayjs(date).diff(dayjs(), 'days');
        const hoursLeft = dayjs(date).diff(dayjs(), 'hours');
        
        let color = SUCCESS_GREEN;
        let text = `${daysLeft}d`;
        
        if (daysLeft <= 0 && hoursLeft <= 0) {
          color = ERROR_RED;
          text = 'Expired';
        } else if (daysLeft <= 0) {
          color = ERROR_RED;
          text = `${hoursLeft}h`;
        } else if (daysLeft <= 1) {
          color = ERROR_RED;
          text = `${daysLeft}d`;
        } else if (daysLeft <= 3) {
          color = WARNING_ORANGE;
          text = `${daysLeft}d`;
        }
        
        return (
          <Tag
            color={color}
            style={{ 
              fontWeight: "bold", 
              fontSize: 11,
              minWidth: 50,
              textAlign: "center"
            }}
          >
            {text}
          </Tag>
        );
      }
    }
  ];

  // Custom table styles - Remove sorting hover effects
  const customTableStyles = `
    .deferral-pending-table .ant-table-wrapper {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
      border: 1px solid #e0e0e0;
    }
    .deferral-pending-table .ant-table-thead > tr > th {
      background-color: #f7f7f7 !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700;
      font-size: 13px;
      padding: 14px 12px !important;
      border-bottom: 3px solid ${ACCENT_LIME} !important;
      border-right: none !important;
      cursor: default !important;
    }
    .deferral-pending-table .ant-table-thead > tr > th:hover {
      background-color: #f7f7f7 !important;
    }
    .deferral-pending-table .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f0f0f0 !important;
      border-right: none !important;
      padding: 12px 12px !important;
      font-size: 13px;
      color: #333;
    }
    .deferral-pending-table .ant-table-tbody > tr.ant-table-row:hover > td {
      background-color: rgba(181, 211, 52, 0.1) !important;
      cursor: pointer;
    }
    .deferral-pending-table .ant-table-row:hover .ant-table-cell:last-child {
      background-color: rgba(181, 211, 52, 0.1) !important;
    }
    .deferral-pending-table .ant-pagination .ant-pagination-item-active {
      background-color: ${ACCENT_LIME} !important;
      borderColor: ${ACCENT_LIME} !important;
    }
    .deferral-pending-table .ant-pagination .ant-pagination-item-active a {
      color: ${PRIMARY_BLUE} !important;
      font-weight: 600;
    }
    
    /* Remove sorting icons completely */
    .deferral-pending-table .ant-table-column-sorter {
      display: none !important;
    }
    .deferral-pending-table .ant-table-column-sorters {
      cursor: default !important;
    }
    .deferral-pending-table .ant-table-column-sorters:hover {
      background: none !important;
    }
  `;

  return (
    <div style={{ padding: 24 }}>
      <style>{customTableStyles}</style>

      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderLeft: `4px solid ${ACCENT_LIME}`
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
              My Deferral Requests
              <Badge
                count={filteredData.length}
                style={{
                  backgroundColor: ACCENT_LIME,
                  fontSize: 12
                }}
              />
            </h2>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
              Track and manage your deferral requests
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => {
                // Navigate to request new deferral
                window.location.href = '/rm/deferrals/request';
              }}
              style={{
                backgroundColor: PRIMARY_BLUE,
                borderColor: PRIMARY_BLUE
              }}
            >
              + New Deferral Request
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card
        style={{
          marginBottom: 16,
          background: "#fafafa",
          border: `1px solid ${PRIMARY_BLUE}20`,
          borderRadius: 8
        }}
        size="small"
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Deferral No, DCL No, Customer, Loan Type, or Document"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="middle"
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Button
              onClick={clearFilters}
              style={{ width: '100%' }}
              size="middle"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs: Pending / Approved */}
      <div style={{ marginBottom: 12 }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} type="card">
          <Tabs.TabPane tab={`Pending Deferrals (${pendingData.length})`} key="pending" />
          <Tabs.TabPane tab={`Approved Deferrals (${approvedData.length})`} key="approved" />
        </Tabs>
      </div>

      <Divider style={{ margin: "12px 0" }}>
        <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
          {activeTab === 'pending' ? `Pending Deferrals` : `Approved Deferrals`} ({currentData.length} items)
        </span>
      </Divider>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Spin tip="Loading deferral requests..." />
        </div>
      ) : currentData.length === 0 ? (
        <Empty
          description={
            <div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>{activeTab === 'pending' ? 'No pending deferrals found' : 'No approved deferrals found'}</p>
              <p style={{ color: "#999" }}>
                {searchText
                  ? 'Try changing your search term'
                  : (activeTab === 'pending' ? 'No pending deferrals currently' : 'No deferrals have been approved yet')}
              </p>
              {activeTab === 'pending' && (
                <Button
                  type="primary"
                  onClick={() => window.location.href = '/rm/deferrals/request'}
                  style={{ marginTop: 16 }}
                >
                  Request New Deferral
                </Button>
              )}
            </div>
          }
          style={{ padding: 40 }}
        />
      ) : (
        <div className="deferral-pending-table">
          <Table
            columns={columns}
            dataSource={currentData}
            rowKey="_id"
            size="middle"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              position: ["bottomCenter"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} deferrals`
            }}
            scroll={{ x: 1000 }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedDeferral(record);
                setModalOpen(true);
              },
            })}
          />
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: "#f8f9fa",
        borderRadius: 8,
        fontSize: 12,
        color: "#666",
        border: `1px solid ${PRIMARY_BLUE}10`
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            Report generated on: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
          </Col>
          <Col>
            <Text type="secondary">
              Showing {filteredData.length} items • Data as of latest system update
            </Text>
          </Col>
        </Row>
      </div>

      {/* Enhanced Deferral Details Modal */}
      {selectedDeferral && (
        <DeferralDetailsModal
          deferral={selectedDeferral}
          open={modalOpen}
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

export default DeferralPending;