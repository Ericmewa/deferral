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
  Popconfirm,
  Dropdown,
  Menu,
  Collapse,
  Alert,
  Steps,
  Tooltip,
  Select
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
  BankOutlined,
  LoadingOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PaperClipOutlined,
  FileDoneOutlined,
  EyeOutlined,
  SendOutlined,
  BellOutlined,
  RightOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  CloudUploadOutlined,
  FolderOpenOutlined,
  FileOutlined
} from "@ant-design/icons";
import getFacilityColumns from '../../utils/facilityColumns';
import dayjs from "dayjs";
import { openFileInNewTab, downloadFile } from '../../utils/fileUtils';
import deferralApi from '../../service/deferralApi.js';
import { jsPDF } from 'jspdf';
import ExtensionApplicationModal from '../../components/modals/ExtensionApplicationModal';
import ExtensionApplicationsTab from '../../components/ExtensionApplicationsTab';
import { useCreateExtensionMutation, useGetMyExtensionsQuery } from '../../api/extensionApi';

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
const { Panel } = Collapse;
const { Step } = Steps;
const { Option } = Select;

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
  return username.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

// Status Display Component - Shows real-time deferral status
const DeferralStatusAlert = ({ deferral }) => {
  if (!deferral) return null;

  const status = (deferral.status || '').toLowerCase();
 
  // Determine approval status
  const hasCreatorApproved = deferral.creatorApprovalStatus === 'approved';
  const hasCheckerApproved = deferral.checkerApprovalStatus === 'approved';
  const isFullyApproved = deferral.deferralApprovalStatus === 'approved' ||
                         (hasCreatorApproved && hasCheckerApproved);
  const isRejected = status === 'deferral_rejected' || status === 'rejected' ||
                    deferral.deferralApprovalStatus === 'rejected';
  const isReturned = status === 'returned_for_rework' || deferral.deferralApprovalStatus === 'returned';
 
  // Check for approvers approval
  let allApproversApprovedLocal = false;
  if (deferral.approvals && deferral.approvals.length > 0) {
    allApproversApprovedLocal = deferral.approvals.every(app => app.status === 'approved');
  }
 
  // Also check allApproversApproved field directly
  if (typeof deferral.allApproversApproved !== 'undefined') {
    allApproversApprovedLocal = deferral.allApproversApproved === true;
  }
 
  const isPartiallyApproved = (hasCreatorApproved || hasCheckerApproved || allApproversApprovedLocal) && !isFullyApproved;
  const isUnderReview = status === 'deferral_requested' || status === 'pending_approval' || status === 'in_review';
  const isClosed = status === 'closed' || status === 'deferral_closed' || status === 'closed_by_co' || status === 'closed_by_creator';

  // Fully Approved Status
  if (isFullyApproved) {
    return (
      <div style={{
        backgroundColor: `${SUCCESS_GREEN}15`,
        borderColor: `${SUCCESS_GREEN}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <CheckCircleOutlined style={{ color: SUCCESS_GREEN, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: SUCCESS_GREEN, fontWeight: 700 }}>
              Deferral Fully Approved ✓
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              All approvers, Creator, and Checker have approved this deferral request. You can now submit the deferred document before or during the next due date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected Status
  if (isRejected) {
    return (
      <div style={{
        backgroundColor: `${ERROR_RED}15`,
        borderColor: `${ERROR_RED}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <CloseCircleOutlined style={{ color: ERROR_RED, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: ERROR_RED, fontWeight: 700 }}>
              Deferral Rejected ✗
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              This deferral request has been rejected. {deferral.rejectionReason && `Reason: ${deferral.rejectionReason}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Returned for Rework Status
  if (isReturned) {
    return (
      <div style={{
        backgroundColor: `${WARNING_ORANGE}15`,
        borderColor: `${WARNING_ORANGE}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <WarningOutlined style={{ color: WARNING_ORANGE, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: WARNING_ORANGE, fontWeight: 700 }}>
              Returned for Rework
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              This deferral has been returned for rework. {deferral.returnReason && `Reason: ${deferral.returnReason}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Partially Approved Status
  if (isPartiallyApproved) {
    return (
      <div style={{
        backgroundColor: `${PRIMARY_BLUE}15`,
        borderColor: `${PRIMARY_BLUE}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <LoadingOutlined style={{ color: PRIMARY_BLUE, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: PRIMARY_BLUE, fontWeight: 700 }}>
              {allApproversApprovedLocal ? 'Pending CO Creator & Checker Approval' : 'Deferral Partially Approved'}
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              {allApproversApprovedLocal
                ? 'All approvers have approved. Awaiting CO Creator and CO Checker approval to complete the process.'
                : 'Awaiting approvals from remaining parties.'}
            </p>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 8, paddingLeft: 36 }}>
          <div>Approvers: {allApproversApprovedLocal ? '✓ All Approved' : '⏳ Pending'}</div>
          <div>CO Creator: {hasCreatorApproved ? '✓ Approved' : '⏳ Pending'}</div>
          <div>CO Checker: {hasCheckerApproved ? '✓ Approved' : '⏳ Pending'}</div>
        </div>
      </div>
    );
  }

  // Under Review Status
  if (isUnderReview) {
    return (
      <div style={{
        backgroundColor: `${PRIMARY_BLUE}15`,
        borderColor: `${PRIMARY_BLUE}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <ClockCircleOutlined style={{ color: PRIMARY_BLUE, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: PRIMARY_BLUE, fontWeight: 700 }}>
              Under Review by Approvers
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              This deferral request is currently awaiting approval from the approval chain
            </p>
          </div>
        </div>
        {deferral.slaExpiry && (
          <div style={{ marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 4, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>SLA Expiry: </span>
            <span style={{ color: dayjs(deferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>
              {dayjs(deferral.slaExpiry).format('DD MMM YYYY HH:mm')}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Closed Status
  if (isClosed) {
    return (
      <div style={{
        backgroundColor: `${ACCENT_LIME}15`,
        borderColor: `${ACCENT_LIME}40`,
        border: '1px solid',
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
        marginTop: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <CheckCircleOutlined style={{ color: ACCENT_LIME, fontSize: 24 }} />
          <div>
            <h3 style={{ margin: 0, color: ACCENT_LIME, fontWeight: 700 }}>
              Document Submitted - Awaiting Approval
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              The deferred document has been submitted and is awaiting final approval from the Checker.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
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
              avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#164679' }} />}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 14, color: '#164679' }}>{formatUsername(item.user) || "System"}</b>
                    {getRoleTag(item.userRole || "system")}
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {dayjs(item.date).format('DD MMM YYYY HH:mm')}
                  </span>
                </div>
              }
              description={
                <div style={{ marginTop: 8, color: '#333', lineHeight: '1.6' }}>
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

// Helper function to get file extension type
const getFileExtension = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
  return 'other';
};

// Enhanced Return for Rework Modal Component with Approver Selection
const ReturnForReworkModal = ({ open, onClose, deferral, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedDocuments, setSelectedDocuments] = useState(deferral?.selectedDocuments || []);
  const [dclFile, setDclFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [approverSlots, setApproverSlots] = useState([]);
  const [approverCustomized, setApproverCustomized] = useState(false);
  const [availableApprovers, setAvailableApprovers] = useState([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);

  // Fetch available approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      setLoadingApprovers(true);
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        const token = stored?.token;
       
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/approvers`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });
       
        if (response.ok) {
          const data = await response.json();
          setAvailableApprovers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch approvers:', error);
        message.error('Failed to load approvers');
      } finally {
        setLoadingApprovers(false);
      }
    };

    if (open) {
      fetchApprovers();
    }
  }, [open]);

  // Pre-populate form with existing data
  useEffect(() => {
    if (deferral && open) {
      form.setFieldsValue({
        deferralDescription: deferral.deferralDescription || '',
        comments: ''
      });
     
      setSelectedDocuments(deferral.selectedDocuments || []);
     
      // Initialize approver slots from existing approval flow
      if (deferral.approverFlow && Array.isArray(deferral.approverFlow)) {
        setApproverSlots(deferral.approverFlow.map(approver => ({
          role: approver.role || 'Approver',
          userId: approver.userId || approver._id || ''
        })));
        setApproverCustomized(true);
      } else {
        // Use default roles based on loan amount
        const defaultRoles = computeDefaultRoles(deferral);
        setApproverSlots(defaultRoles.map(role => ({ role, userId: '' })));
        setApproverCustomized(false);
      }
    }
  }, [deferral, open, form]);

  // Compute default approver roles based on loan amount and document category
  const computeDefaultRoles = (deferralData) => {
    const loanAmount = deferralData?.loanAmount || 0;
    const documentCategory = deferralData?.selectedDocuments?.some(d =>
      (typeof d === 'string' && d.toLowerCase().includes('primary')) ||
      (d.type && d.type.toLowerCase() === 'primary')
    ) ? "Primary" : "Secondary";
   
    const LOAN_THRESHOLD = 75000000; // 75M

    if (documentCategory === "Primary") {
      if (loanAmount < LOAN_THRESHOLD) {
        return [
          "Head of Business Segment",
          "Director of Business Unit",
          "Senior Manager, Retail & Corporate Credit Approvals",
        ];
      }
      return [
        "Head of Business Segment",
        "Group Director of Business Unit",
        "Senior Manager, Retail & Corporate Credit Approvals",
      ];
    }

    // Secondary documents
    return ["Head of Business Segment", "Director of Business Unit", "Head of Credit Operations"];
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Filter out empty approver slots
      const validApprovers = approverSlots
        .filter(slot => slot.userId)
        .map(slot => ({
          role: slot.role,
          userId: slot.userId,
          name: availableApprovers.find(a => a._id === slot.userId)?.name || 'Unknown'
        }));

      if (validApprovers.length === 0) {
        message.error('Please select at least one approver');
        setLoading(false);
        return;
      }

      // Update deferral with new documents, description, and approvers
      const updatedDeferral = await deferralApi.updateDeferral(deferral._id, {
        deferralDescription: values.deferralDescription,
        selectedDocuments,
        approverFlow: validApprovers,
        status: 'resubmitted_for_review',
        resubmissionComments: values.comments,
        resubmittedAt: new Date().toISOString()
      });

      // Upload any new files
      if (dclFile) {
        await deferralApi.uploadDocument(deferral._id, dclFile, { isDCL: true });
      }

      if (additionalFiles.length > 0) {
        for (const file of additionalFiles) {
          await deferralApi.uploadDocument(deferral._id, file, { isAdditional: true });
        }
      }

      message.success('Deferral resubmitted for review successfully!');
     
      // Update local state with the resubmitted deferral
      const refreshedDeferral = await deferralApi.getDeferralById(deferral._id);
      onUpdate(refreshedDeferral);
      onClose();
    } catch (error) {
      console.error('Error resubmitting deferral:', error);
      message.error('Failed to resubmit deferral for review');
    } finally {
      setLoading(false);
    }
  };

  // Approver management functions
  const addApprover = (role) => {
    setApproverCustomized(true);
    setApproverSlots([...approverSlots, { role: role || "Approver", userId: "" }]);
  };

  const updateApprover = (index, userId) => {
    setApproverCustomized(true);
    const arr = [...approverSlots];
    arr[index] = { ...arr[index], userId };
    setApproverSlots(arr);
  };

  const removeApprover = (index) => {
    setApproverCustomized(true);
    setApproverSlots(approverSlots.filter((_, i) => i !== index));
  };

  const resetToDefaultApprovers = () => {
    const defaultRoles = computeDefaultRoles(deferral);
    setApproverSlots(defaultRoles.map(role => ({ role, userId: '' })));
    setApproverCustomized(false);
    message.info('Reset to default approvers');
  };

  // File upload handlers
  const handleDCLUpload = (file) => {
    // Check file type
    const allowedTypes = ['.pdf', '.PDF', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
   
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`File type not allowed. Please upload: ${allowedTypes.join(', ')}`);
      return false;
    }
   
    setDclFile(file);
    message.success(`${file.name} selected for DCL upload`);
    return false;
  };

  const handleAdditionalFileUpload = (file) => {
    // Check file type
    const allowedTypes = ['.pdf', '.PDF', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
   
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`File type not allowed. Please upload: ${allowedTypes.join(', ')}`);
      return false;
    }
   
    setAdditionalFiles(prev => [...prev, file]);
    message.success(`${file.name} added to additional documents`);
    return false;
  };

  const removeDCLFile = () => {
    setDclFile(null);
    message.info('DCL file removed');
  };

  const removeAdditionalFile = (file) => {
    setAdditionalFiles(prev => prev.filter(f => f.uid !== file.uid));
    message.info(`${file.name} removed`);
  };

  // Document preview and download functions
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: ERROR_RED }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: PRIMARY_BLUE }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ color: SUCCESS_GREEN }} />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImageOutlined style={{ color: WARNING_ORANGE }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const handleViewDocument = (file) => {
    if (file && file.originFileObj) {
      const fileURL = URL.createObjectURL(file.originFileObj);
      window.open(fileURL, '_blank');
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);
    } else if (file && file instanceof File) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 10000);
    } else if (file && file.url) {
      window.open(file.url, '_blank');
    } else {
      message.info('No preview available');
    }
  };

  const renderDocumentItem = (file, allowDelete = true, isDCL = false) => {
    const fileSize = file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Size unknown';
   
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        marginBottom: '8px',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getFileIcon(file.name)}
          <div>
            <Text strong style={{ display: 'block', fontSize: '13px' }}>
              {file.name}
            </Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {fileSize}
              {isDCL && <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>DCL</Tag>}
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View document">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: PRIMARY_BLUE }} />}
              onClick={() => handleViewDocument(file)}
            />
          </Tooltip>
          {allowDelete && (
            <Tooltip title="Delete document">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => isDCL ? removeDCLFile() : removeAdditionalFile(file)}
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  // Helper to get existing documents from deferral
  const getAllDocuments = () => {
    const all = [];
    (deferral?.attachments || []).forEach((att, i) => {
      const isDCL = att.name && att.name.toLowerCase().includes('dcl');
      all.push({
        id: att.id || `att_${i}`,
        name: att.name,
        type: getFileExtension(att.name || ''),
        url: att.url,
        isDCL,
        isUploaded: true,
        source: 'attachments',
        uploadDate: att.uploadDate
      });
    });
    (deferral?.documents || []).forEach((d, i) => {
      const isDCL = d.isDCL || d.name?.toLowerCase().includes('dcl');
      all.push({
        id: d._id || d.id || `doc_${i}`,
        name: d.name,
        type: d.type || getFileExtension(d.name || ''),
        url: d.url,
        isDCL,
        isUploaded: true,
        source: 'documents',
        uploadDate: d.uploadDate || d.uploadedAt
      });
    });
    return all;
  };

  const existingDocs = getAllDocuments();
  const existingDclDoc = existingDocs.find(d => d.isDCL);
  const existingAdditionalDocs = existingDocs.filter(d => !d.isDCL);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ReloadOutlined style={{ color: WARNING_ORANGE }} />
          <span>Resubmit Deferral for Review</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }
      }}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          style={{ backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE }}
        >
          {loading ? 'Resubmitting...' : 'Resubmit for Review'}
        </Button>
      ]}
    >
      <Alert
        message="Resubmission Required"
        description="Please update the required documents, approval flow, and workflow as requested. Your changes will be reviewed by the approvers."
        type="warning"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Document Picker Section */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 4,
                height: 20,
                backgroundColor: ACCENT_LIME,
                marginRight: 12,
                borderRadius: 2
              }} />
              <Title level={4} style={{ color: PRIMARY_BLUE, margin: 0 }}>
                Documents for Deferral
              </Title>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            Select or update documents that need deferral
          </Text>
          <div style={{ padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <Text type="secondary">
              Update document selection as requested. You can add or remove documents from the list.
            </Text>
           
            {/* Document Selection Area */}
            <div style={{ marginTop: 12 }}>
              {selectedDocuments.map((doc, index) => {
                const docName = typeof doc === 'string' ? doc : doc.name || doc.label;
                const isExisting = existingDocs.some(d =>
                  (d.name || '').toLowerCase().includes((docName || '').toLowerCase())
                );
               
                return (
                  <Tag
                    key={index}
                    color={isExisting ? "green" : "blue"}
                    closable
                    onClose={() => {
                      setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
                    }}
                    style={{ marginBottom: 8, padding: '6px 12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {docName}
                      {isExisting && <CheckCircleOutlined style={{ fontSize: 12, color: SUCCESS_GREEN }} />}
                    </div>
                  </Tag>
                );
              })}
            </div>
           
            {/* Add Document Button */}
            <Button
              type="dashed"
              onClick={() => {
                const newDoc = prompt('Enter document name to add:');
                if (newDoc && newDoc.trim()) {
                  setSelectedDocuments(prev => [...prev, newDoc.trim()]);
                  message.success('Document added');
                }
              }}
              style={{ marginTop: 12 }}
              icon={<FileTextOutlined />}
            >
              Add Document
            </Button>
          </div>
        </Card>

        {/* DCL Upload Section */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 4,
                height: 20,
                backgroundColor: ACCENT_LIME,
                marginRight: 12,
                borderRadius: 2
              }} />
              <Title level={4} style={{ color: PRIMARY_BLUE, margin: 0 }}>
                Mandatory: DCL Upload
              </Title>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Upload
            accept=".pdf,.PDF,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            beforeUpload={handleDCLUpload}
            fileList={[]}
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload DCL Document
            </Button>
          </Upload>
         
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
            {dclFile ? 'New DCL will replace existing:' : 'Upload a new DCL document if needed'}
          </Text>
         
          {dclFile && (
            <div style={{ marginTop: 16 }}>
              {renderDocumentItem(dclFile, true, true)}
            </div>
          )}
         
          {/* Show existing DCL document */}
          {existingDclDoc && !dclFile && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f7ff', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getFileIcon(existingDclDoc.name)}
                  <div>
                    <Text strong style={{ fontSize: 13 }}>Existing DCL:</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{existingDclDoc.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                      (Cannot be deleted - upload a new DCL to replace)
                    </Text>
                  </div>
                </div>
                <Space>
                  {existingDclDoc.url && (
                    <>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => window.open(existingDclDoc.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = existingDclDoc.url;
                          a.download = existingDclDoc.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                      >
                        Download
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            </div>
          )}
        </Card>

        {/* Additional Documents Section */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 4,
                height: 20,
                backgroundColor: ACCENT_LIME,
                marginRight: 12,
                borderRadius: 2
              }} />
              <Title level={4} style={{ color: PRIMARY_BLUE, margin: 0 }}>
                Additional Documents
              </Title>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Upload
            accept=".pdf,.PDF,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            beforeUpload={handleAdditionalFileUpload}
            fileList={[]}
            multiple
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              Upload Additional Documents
            </Button>
          </Upload>
         
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
            Upload any new supporting documents
          </Text>
         
          {additionalFiles.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {additionalFiles.map((file, index) => (
                <div key={file.uid || index}>
                  {renderDocumentItem(file)}
                </div>
              ))}
            </div>
          )}
         
          {/* Show existing additional documents */}
          {existingAdditionalDocs.length > 0 && additionalFiles.length === 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                Existing Additional Documents ({existingAdditionalDocs.length})
              </Text>
              <Alert
                message="Note: Previously submitted documents cannot be deleted"
                description="You can only add new documents. To replace a document, upload a new version."
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
              />
              {existingAdditionalDocs.map((doc, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  marginBottom: 8,
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getFileIcon(doc.name)}
                      <div>
                        <Text style={{ fontSize: 13 }}>{doc.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                          (Cannot be deleted - already submitted)
                        </Text>
                      </div>
                    </div>
                    {doc.url && (
                      <Space>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = doc.url;
                            a.download = doc.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          Download
                        </Button>
                      </Space>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Approval Flow Section */}
        <Card
          size="small"
          title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 4,
                  height: 20,
                  backgroundColor: ACCENT_LIME,
                  marginRight: 12,
                  borderRadius: 2
                }} />
                <Title level={4} style={{ color: PRIMARY_BLUE, margin: 0 }}>
                  Approval Flow
                </Title>
              </div>
              <Button
                type="link"
                onClick={resetToDefaultApprovers}
                size="small"
                icon={<ReloadOutlined />}
              >
                Reset to Default
              </Button>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          {loadingApprovers ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin tip="Loading approvers..." />
            </div>
          ) : (
            <>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Update the approval flow if needed. Select approvers for each role.
              </Text>
             
              <Alert
                message="Approver Management"
                description="You can change or add approvers. However, approvers who have already approved this deferral cannot be removed."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
             
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {approverSlots.map((slot, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0'
                  }}>
                    <Badge
                      count={index + 1}
                      style={{
                        backgroundColor: PRIMARY_BLUE,
                        minWidth: 24,
                        height: 24,
                        fontSize: 12
                      }}
                    />
                   
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 13, color: PRIMARY_BLUE }}>
                          {slot.role}
                        </Text>
                      </div>
                     
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Select approver"
                        value={slot.userId}
                        onChange={(value) => updateApprover(index, value)}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label || '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={availableApprovers.map(approver => ({
                          label: `${approver.name} (${approver.position || approver.role || 'Approver'})`,
                          value: approver._id,
                          key: approver._id
                        }))}
                      />
                    </div>
                   
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeApprover(index)}
                      disabled={approverSlots.length <= 1}
                    />
                  </div>
                ))}
              </div>
             
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  type="dashed"
                  onClick={() => {
                    const newRole = prompt('Enter new approver role:');
                    if (newRole && newRole.trim()) {
                      addApprover(newRole.trim());
                    }
                  }}
                  icon={<UserOutlined />}
                >
                  Add Custom Role
                </Button>
               
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select
                    placeholder="Add predefined role"
                    style={{ width: 200 }}
                    onChange={(value) => addApprover(value)}
                  >
                    <Option value="Head of Business Segment">Head of Business Segment</Option>
                    <Option value="Director of Business Unit">Director of Business Unit</Option>
                    <Option value="Senior Manager, Retail & Corporate Credit Approvals">
                      Senior Manager, Retail & Corporate Credit Approvals
                    </Option>
                    <Option value="Group Director of Business Unit">Group Director of Business Unit</Option>
                    <Option value="Head of Credit Operations">Head of Credit Operations</Option>
                  </Select>
                </div>
              </div>
             
              <Alert
                message="Approval Flow Status"
                description={
                  <div>
                    <div>Selected approvers: {approverSlots.filter(s => s.userId).length}</div>
                    <div>Pending selection: {approverSlots.filter(s => !s.userId).length}</div>
                    {approverSlots.filter(s => !s.userId).length > 0 && (
                      <Text type="warning" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        Please select approvers for all roles before submitting.
                      </Text>
                    )}
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </Card>

        {/* Deferral Description */}
        <Form.Item
          name="deferralDescription"
          label="Deferral Description"
          rules={[{ required: true, message: 'Please enter deferral description' }]}
        >
          <TextArea
            rows={4}
            placeholder="Update the reason for deferral..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Comments for Resubmission */}
        <Form.Item
          name="comments"
          label="Comments for Resubmission"
          rules={[{ required: true, message: 'Please explain what changes you made' }]}
        >
          <TextArea
            rows={3}
            placeholder="Explain what changes you made to the deferral request..."
            maxLength={300}
            showCount
          />
        </Form.Item>

        {/* Summary Section */}
        <Card
          size="small"
          style={{ marginTop: 16, backgroundColor: '#f8f9fa' }}
        >
          <Title level={5} style={{ color: PRIMARY_BLUE, marginBottom: 12 }}>
            Resubmission Summary
          </Title>
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Text strong>Documents:</Text>
              <div>{selectedDocuments.length} selected</div>
            </Col>
            <Col span={8}>
              <Text strong>DCL:</Text>
              <div>{dclFile ? 'New uploaded' : existingDclDoc ? 'Existing retained' : 'None'}</div>
            </Col>
            <Col span={8}>
              <Text strong>Additional Files:</Text>
              <div>{additionalFiles.length} new</div>
            </Col>
            <Col span={8}>
              <Text strong>Approvers:</Text>
              <div>{approverSlots.filter(s => s.userId).length} selected</div>
            </Col>
            <Col span={8}>
              <Text strong>Status:</Text>
              <Tag color="processing">Ready for Resubmission</Tag>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

// Enhanced Deferral Details Modal
const DeferralDetailsModal = ({ deferral, open, onClose, onAction }) => {
  const [addCommentVisible, setAddCommentVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [localDeferral, setLocalDeferral] = useState(deferral);
  const [loadingRecall, setLoadingRecall] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingApproveClose, setLoadingApproveClose] = useState(false);
  const [withdrawConfirmVisible, setWithdrawConfirmVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [returnForReworkVisible, setReturnForReworkVisible] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [allApproversApproved, setAllApproversApproved] = useState(false);
  
  // Extension state
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [selectedDeferralForExtension, setSelectedDeferralForExtension] = useState(null);
  const [createExtension, { isLoading: extensionCreating }] = useCreateExtensionMutation();
  const { data: myExtensions = [], isLoading: extensionsLoading, refetch: refetchExtensions } = useGetMyExtensionsQuery();

  useEffect(() => {
    setLocalDeferral(deferral);
   
    // Calculate if all approvers are approved
    if (deferral) {
      let allApproved = false;
      if (deferral.approverFlow || deferral.approvers) {
        const approvers = deferral.approverFlow || deferral.approvers || [];
        allApproved = approvers.length > 0 &&
          approvers.every(app => app.approved || app.approved === true);
      }
      setAllApproversApproved(allApproved);
    }
  }, [deferral]);

  // Send reminder to current approver
  const sendReminderToCurrentApprover = async () => {
    try {
      setSendingReminder(true);
     
      // Find current approver (first unapproved approver)
      let currentApprover = null;
      const approvers = localDeferral.approverFlow || localDeferral.approvers || [];
     
      for (const approver of approvers) {
        if (!approver.approved && !approver.rejected && !approver.returned) {
          currentApprover = approver;
          break;
        }
      }
     
      if (!currentApprover) {
        message.info("All approvers have already approved or no approvers assigned");
        return;
      }

      // Send reminder via API
      await deferralApi.sendEmailNotification(localDeferral._id, 'reminder_to_approver', {
        approverName: currentApprover.name || currentApprover.email,
        deferralNumber: localDeferral.deferralNumber,
        customerName: localDeferral.customerName,
        dclNumber: localDeferral.dclNumber || localDeferral.dclNo,
        message: 'Reminder: Please review and approve this deferral request.'
      });

      message.success(`Reminder sent to ${currentApprover.name || currentApprover.email}`);
     
      // Add to history
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newHistoryEntry = {
        user: currentUser?.name || 'System',
        userRole: currentUser?.role || 'system',
        date: new Date().toISOString(),
        comment: `Reminder sent to ${currentApprover.name || currentApprover.email}`
      };
     
      setLocalDeferral(prev => ({
        ...prev,
        history: [...(prev.history || []), newHistoryEntry]
      }));
     
    } catch (error) {
      console.error("Error sending reminder:", error);
      message.error("Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  // Calculate approver statistics
  const getApproverStats = () => {
    const approvers = localDeferral.approverFlow || localDeferral.approvers || [];
    const totalApprovers = approvers.length;
    const approvedCount = approvers.filter(a => a.approved).length;
    const pendingCount = totalApprovers - approvedCount;
   
    return {
      total: totalApprovers,
      approved: approvedCount,
      pending: pendingCount,
      percentage: totalApprovers > 0 ? Math.round((approvedCount / totalApprovers) * 100) : 0
    };
  };

  // Download Deferral as PDF
  const downloadDeferralAsPDF = async () => {
    if (!localDeferral || !localDeferral._id) {
      message.error('No deferral selected');
      return;
    }

    setActionLoading(true);
    try {
      const doc = new jsPDF();
     
      const primaryBlue = [22, 70, 121];
      const darkGray = [51, 51, 51];
      const lightGray = [102, 102, 102];
     
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
     
      // Title
      doc.setFontSize(18);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('DEFERRAL DETAILS REPORT', margin, yPosition);
      yPosition += 12;
     
      // Separator line
      doc.setDrawColor(22, 70, 121);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
     
      // Basic Information Section
      doc.setFontSize(11);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
     
      const basicInfo = [
        { label: 'Deferral Number:', value: localDeferral.deferralNumber || 'N/A' },
        { label: 'Customer Name:', value: localDeferral.customerName || 'N/A' },
        { label: 'Customer Number:', value: localDeferral.customerNumber || 'N/A' },
        { label: 'DCL No:', value: localDeferral.dclNo || localDeferral.dclNumber || 'N/A' },
        { label: 'Status:', value: localDeferral.status || 'Pending' },
        { label: 'Created At:', value: dayjs(localDeferral.createdAt).format('DD MMM YYYY HH:mm') }
      ];
     
      basicInfo.forEach(item => {
        doc.setFont(undefined, 'bold');
        doc.text(item.label, margin, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(item.value, margin + 50, yPosition);
        yPosition += 7;
      });
     
      yPosition += 5;
     
      // Approval Statistics
      const stats = getApproverStats();
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('APPROVAL STATUS', margin, yPosition);
      yPosition += 6;
     
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFont(undefined, 'normal');
      doc.text(`Approved: ${stats.approved} of ${stats.total} approvers`, margin, yPosition);
      yPosition += 6;
      doc.text(`Progress: ${stats.percentage}%`, margin, yPosition);
      yPosition += 8;
     
      // Footer
      doc.setFont(undefined, 'italic');
      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Generated on: ${dayjs().format('DD MMM YYYY HH:mm')}`, margin, yPosition);
      doc.text('This is a system-generated report.', margin, yPosition + 6);
     
      // Save the PDF
      doc.save(`Deferral_${localDeferral.deferralNumber}_${dayjs().format('YYYYMMDD')}.pdf`);
      message.success('Deferral downloaded as PDF successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download deferral. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Download as CSV
  const downloadDeferralAsCSV = async () => {
    if (!localDeferral) {
      message.error('No deferral selected');
      return;
    }

    try {
      const csvContent = [
        ['Deferral Details Report'],
        ['Generated on:', dayjs().format('DD MMM YYYY HH:mm')],
        [],
        ['Deferral Number:', localDeferral.deferralNumber],
        ['Customer Name:', localDeferral.customerName],
        ['Customer Number:', localDeferral.customerNumber],
        ['DCL No:', localDeferral.dclNo || localDeferral.dclNumber],
        ['Status:', localDeferral.status],
        ['Created At:', dayjs(localDeferral.createdAt).format('DD MMM YYYY HH:mm')],
        [],
        ['Approval Statistics:'],
        ['Total Approvers:', getApproverStats().total],
        ['Approved:', getApproverStats().approved],
        ['Pending:', getApproverStats().pending],
        ['Progress:', `${getApproverStats().percentage}%`]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Deferral_${localDeferral.deferralNumber}_${dayjs().format('YYYYMMDD')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
     
      message.success('Deferral downloaded as CSV successfully!');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      message.error('Failed to download CSV file');
    }
  };

  // Handle posting comments
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment before posting');
      return;
    }

    if (!localDeferral || !localDeferral._id) {
      message.error('No deferral selected');
      return;
    }

    setPostingComment(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      const token = stored?.token;
     
      const commentData = {
        text: newComment.trim(),
        author: {
          name: currentUser.name || currentUser.user?.name || 'User',
          role: currentUser.role || currentUser.user?.role || 'user'
        },
        createdAt: new Date().toISOString()
      };

      await deferralApi.postComment(localDeferral._id, commentData, token);
      message.success('Comment posted successfully');
      setNewComment('');

      // Refresh deferral
      const refreshedDeferral = await deferralApi.getDeferralById(localDeferral._id, token);
      setLocalDeferral(refreshedDeferral);
    } catch (error) {
      console.error('Failed to post comment:', error);
      message.error(error.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  // Handle Recall Deferral
  const handleRecallDeferral = async () => {
    Modal.confirm({
      title: 'Recall Deferral',
      content: 'Are you sure you want to recall this deferral request? This will notify all approvers via email and the deferral will remain in the Pending tab.',
      okText: 'Yes, Recall',
      cancelText: 'Cancel',
      okButtonProps: { style: { background: WARNING_ORANGE, borderColor: WARNING_ORANGE, color: 'white' } },
      onOk: async () => {
        setLoadingRecall(true);
        try {
          await deferralApi.sendEmailNotification(localDeferral._id, 'recall', {
            deferralNumber: localDeferral.deferralNumber,
            message: 'Your deferral request has been recalled.'
          });
          message.success('Deferral recalled successfully. All approvers have been notified.');
          onAction && onAction({ status: 'recalled', updatedDeferral: localDeferral });
          onClose();
        } catch (error) {
          message.error(`Failed to recall deferral: ${error.message}`);
        } finally {
          setLoadingRecall(false);
        }
      }
    });
  };

  // Handle Withdraw Request
  const handleWithdrawRequest = () => {
    setWithdrawConfirmVisible(true);
  };

  const handleConfirmWithdraw = async () => {
    setLoadingWithdraw(true);
    try {
      const updatedDeferral = await deferralApi.closeDeferral(localDeferral._id, {
        status: 'withdrawn',
        reason: 'withdrawn by rm',
        closedBy: 'rm',
        closedAt: new Date()
      });
     
      await deferralApi.sendEmailNotification(localDeferral._id, 'withdrawal', {
        deferralNumber: localDeferral.deferralNumber,
        customerName: localDeferral.customerName,
        message: 'The deferral request has been withdrawn by the Relationship Manager.'
      });
     
      message.success('Deferral withdrawn successfully. All approvers have been notified and the deferral has been moved to Completed.');
      window.dispatchEvent(new CustomEvent('deferral:updated', { detail: updatedDeferral }));
      onAction && onAction({ status: 'withdrawn', updatedDeferral });
      setWithdrawConfirmVisible(false);
      onClose();
    } catch (error) {
      console.error('Withdraw request error:', error);
      message.error(`Failed to withdraw deferral: ${error.message}`);
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // Handle Return for Rework
  const handleReturnForRework = () => {
    setReturnForReworkVisible(true);
  };

  const handleReworkUpdate = (updatedDeferral) => {
    setLocalDeferral(updatedDeferral);
    message.success('Deferral resubmitted for review');
    window.dispatchEvent(new CustomEvent('deferral:updated', { detail: updatedDeferral }));
  };

  // Handle Extension Application
  const handleApplyForExtension = (deferral) => {
    setSelectedDeferralForExtension(deferral);
    setExtensionModalOpen(true);
  };

  const handleExtensionSubmit = async (values) => {
    try {
      const result = await createExtension({
        deferralId: selectedDeferralForExtension._id,
        requestedDaysSought: values.requestedDaysSought,
        extensionReason: values.extensionReason,
      }).unwrap();

      message.success('Extension request submitted successfully! It will follow the same approval workflow.');
      setExtensionModalOpen(false);
      setSelectedDeferralForExtension(null);
      refetchExtensions();
    } catch (error) {
      console.error('Error creating extension:', error);
      message.error(`Failed to submit extension: ${error?.data?.message || error.message}`);
    }
  };

  if (!localDeferral) return null;

  const status = (localDeferral.status || 'deferral_requested').toLowerCase();
  const isPendingApproval = status === 'deferral_requested';
  const isReturnedForRework = status === 'returned_for_rework';
 
  const stats = getApproverStats();

  // Helper to pull all documents into categories
  const getAllDocuments = () => {
    const all = [];
    (localDeferral.attachments || []).forEach((att, i) => {
      const isDCL = att.name && att.name.toLowerCase().includes('dcl');
      all.push({ id: att.id || `att_${i}`, name: att.name, type: getFileExtension(att.name || ''), url: att.url, isDCL, isUploaded: true, source: 'attachments', uploadDate: att.uploadDate });
    });
    (localDeferral.additionalFiles || []).forEach((f, i) => {
      all.push({ id: `add_${i}`, name: f.name, type: getFileExtension(f.name || ''), url: f.url, isAdditional: true, isUploaded: true, source: 'additionalFiles' });
    });
    (localDeferral.selectedDocuments || []).forEach((d, i) => {
      all.push({ id: `req_${i}`, name: typeof d === 'string' ? d : d.name || d.label || 'Document', type: d.type || '', isRequested: true, isSelected: true, source: 'selected' });
    });
    (localDeferral.documents || []).forEach((d, i) => {
      const name = (d.name || '').toString();
      const dclNameMatch = /dcl/i.test(name) || (localDeferral.dclNo && name.toLowerCase().includes((localDeferral.dclNo || '').toLowerCase()));
      const isDCLFlag = (typeof d.isDCL !== 'undefined' && d.isDCL) || dclNameMatch;
      const isAdditionalFlag = (typeof d.isAdditional !== 'undefined') ? d.isAdditional : !isDCLFlag;
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

  const facilityColumns = getFacilityColumns();

  return (
    <>
      <style>{customStyles}</style>
     
      {/* Return for Rework Modal */}
      <ReturnForReworkModal
        open={returnForReworkVisible}
        onClose={() => setReturnForReworkVisible(false)}
        deferral={localDeferral}
        onUpdate={handleReworkUpdate}
      />
     
      {/* Withdraw Confirmation Modal */}
      <Modal
        title="Withdraw Deferral Request"
        open={withdrawConfirmVisible}
        onCancel={() => setWithdrawConfirmVisible(false)}
        onOk={handleConfirmWithdraw}
        okText="Yes, Withdraw"
        cancelText="Cancel"
        okButtonProps={{
          loading: loadingWithdraw,
          style: {
            background: ERROR_RED,
            borderColor: ERROR_RED,
            color: 'white'
          }
        }}
        cancelButtonProps={{
          style: {
            borderColor: '#d9d9d9'
          }
        }}
        centered={true}
        maskClosable={false}
      >
        <p>Are you sure you want to withdraw this deferral request?</p>
        <p><strong>This action will:</strong></p>
        <ul>
          <li>Notify all approvers via email</li>
          <li>Move the deferral to the Completed tab</li>
          <li>Mark the deferral as "withdrawn"</li>
        </ul>
        <p>This action cannot be undone.</p>
      </Modal>
     
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined />
            <span>Deferral Request: {localDeferral.deferralNumber}</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={1000}
        styles={{ body: { padding: '0 24px 24px' } }}
        footer={[
          // Download dropdown
          <Dropdown
            key="download"
            menu={{
              items: [
                {
                  key: 'pdf',
                  label: 'Download as PDF',
                  icon: <FilePdfOutlined />,
                  onClick: downloadDeferralAsPDF
                },
                {
                  key: 'csv',
                  label: 'Download Summary (CSV)',
                  icon: <FileExcelOutlined />,
                  onClick: downloadDeferralAsCSV
                }
              ]
            }}
          >
            <Button
              type="default"
              loading={actionLoading}
              icon={<DownloadOutlined />}
              style={{ marginRight: 'auto' }}
            >
              Download
            </Button>
          </Dropdown>,

          // Return for Rework button (only for returned deferrals)
          isReturnedForRework && (
            <Button
              key="rework"
              type="primary"
              onClick={handleReturnForRework}
              style={{ backgroundColor: WARNING_ORANGE, borderColor: WARNING_ORANGE }}
              icon={<ReloadOutlined />}
            >
              Resubmit for Review
            </Button>
          ),

          // Recall button
          (status === 'deferral_requested' || status === 'pending_approval') && (
            <Button
              key="recall"
              onClick={handleRecallDeferral}
              loading={loadingRecall}
              style={{ backgroundColor: WARNING_ORANGE, borderColor: WARNING_ORANGE, color: 'white' }}
            >
              Recall Deferral
            </Button>
          ),

          // Withdraw button
          (status === 'deferral_requested' || status === 'pending_approval') && (
            <Button
              key="withdraw"
              type="default"
              onClick={handleWithdrawRequest}
              loading={loadingWithdraw}
              style={{ backgroundColor: ERROR_RED, borderColor: ERROR_RED, color: 'white' }}
            >
              Withdraw Request
            </Button>
          ),

          // Close button
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ].filter(Boolean)}
      >
        {/* Real-time Status Alert */}
        <DeferralStatusAlert deferral={localDeferral} />

        <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Customer Information</span>} style={{ marginBottom: 18, marginTop: 24 }}>
          <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Customer Name"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.customerName}</Text></Descriptions.Item>
            <Descriptions.Item label="Customer Number"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.customerNumber}</Text></Descriptions.Item>
            <Descriptions.Item label="Loan Type"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.loanType}</Text></Descriptions.Item>
            <Descriptions.Item label="Created At">
              <div>
                <Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('DD MMM YYYY')}</Text>
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('HH:mm')}</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Deferral Details</span>} style={{ marginBottom: 18 }}>
          <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
            <Descriptions.Item label="Deferral Number"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.deferralNumber}</Text></Descriptions.Item>
            <Descriptions.Item label="DCL No"><Text strong style={{ color: PRIMARY_BLUE }}>{localDeferral.dclNo || localDeferral.dclNumber}</Text></Descriptions.Item>
            <Descriptions.Item label="Status">
              {status === 'deferral_requested' || status === 'pending_approval' ? (
                <Tag color="processing" style={{ fontWeight: 700 }}>
                  Pending
                </Tag>
              ) : status === 'deferral_approved' || status === 'approved' ? (
                <Tag color="success" style={{ fontWeight: 700 }}>
                  Approved
                </Tag>
              ) : status === 'deferral_rejected' || status === 'rejected' ? (
                <Tag color="error" style={{ fontWeight: 700 }}>
                  Rejected
                </Tag>
              ) : (
                <div style={{ fontWeight: 500 }}>{status}</div>
              )}
            </Descriptions.Item>

            {/* Creator Status */}
            <Descriptions.Item label="Creator Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const creatorStatus = localDeferral.creatorApprovalStatus || 'pending';
                  if (creatorStatus === 'approved') {
                    return (
                      <Tag color="success" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircleOutlined />
                        Approved
                      </Tag>
                    );
                  } else if (creatorStatus === 'rejected') {
                    return (
                      <Tag color="error" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CloseCircleOutlined />
                        Rejected
                      </Tag>
                    );
                  }
                  return (
                    <Tag color="processing" style={{ fontWeight: 700 }}>
                      Pending
                    </Tag>
                  );
                })()}
                {localDeferral.creatorApprovalDate && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {dayjs(localDeferral.creatorApprovalDate).format('DD/MM/YY HH:mm')}
                  </span>
                )}
              </div>
            </Descriptions.Item>

            {/* Checker Status */}
            <Descriptions.Item label="Checker Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const checkerStatus = localDeferral.checkerApprovalStatus || 'pending';
                  if (checkerStatus === 'approved') {
                    return (
                      <Tag color="success" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircleOutlined />
                        Approved
                      </Tag>
                    );
                  } else if (checkerStatus === 'rejected') {
                    return (
                      <Tag color="error" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CloseCircleOutlined />
                        Rejected
                      </Tag>
                    );
                  }
                  return (
                    <Tag color="processing" style={{ fontWeight: 700 }}>
                      Pending
                    </Tag>
                  );
                })()}
                {localDeferral.checkerApprovalDate && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {dayjs(localDeferral.checkerApprovalDate).format('DD/MM/YY HH:mm')}
                  </span>
                )}
              </div>
            </Descriptions.Item>

            {/* Enhanced Approvers Status with Counts */}
            <Descriptions.Item label="Approvers Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  {stats.total === 0 ? (
                    <Tag color="processing" style={{ fontWeight: 700 }}>
                      No approvers
                    </Tag>
                  ) : stats.approved === stats.total ? (
                    <Tag color="success" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleOutlined />
                      All Approved
                    </Tag>
                  ) : (
                    <Tag color="processing" style={{ fontWeight: 700 }}>
                      {stats.approved} of {stats.total} Approved
                    </Tag>
                  )}
                </div>
              </div>
            </Descriptions.Item>

            {/* Loan Amount with threshold indicator */}
            <Descriptions.Item label="Loan Amount">
              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>{(function(){
                  const amt = Number(localDeferral.loanAmount || 0);
                  if (!amt) return 'Not specified';
                  return `KSh ${amt.toLocaleString()}`;
                })()}</div>
                {(function(){
                  const amt = Number(localDeferral.loanAmount || 0);
                  if (!amt) return null;
                  const isAbove75 = amt > 75 && amt <= 1000 ? true : (amt > 75000000 ? true : false);
                  return isAbove75 ? <Tag color={'red'} style={{ fontSize: 12 }}>Above 75 million</Tag> : <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>Under 75 million</span>;
                })()}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Days Sought">
              <div style={{ fontWeight: 'bold', color: localDeferral.daysSought > 45 ? ERROR_RED : localDeferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE }}>
                {localDeferral.daysSought || 0} days
              </div>
            </Descriptions.Item>

            {/* Next Due Date */}
            <Descriptions.Item label="Next Due Date">
              <div style={{ color: (localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? (dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).isBefore(dayjs()) ? ERROR_RED : SUCCESS_GREEN) : PRIMARY_BLUE }}>
                {(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? `${dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).format('DD MMM YYYY')}` : 'Not calculated'}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="SLA Expiry">
              <div style={{ color: localDeferral.slaExpiry && dayjs(localDeferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>
                {localDeferral.slaExpiry ? dayjs(localDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}
              </div>
            </Descriptions.Item>

            {/* Created At */}
            <Descriptions.Item label="Created At">
              <div>
                <Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('DD MMM YYYY')}</Text>
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('HH:mm')}</Text>
              </div>
            </Descriptions.Item>
          </Descriptions>

          {localDeferral.deferralDescription && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Deferral Description</Text>
              <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                <Text>{localDeferral.deferralDescription}</Text>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Approval Flow Section */}
        <Card size="small" title={<span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>Approval Flow & Status</span>} style={{ marginBottom: 18 }}>
          {/* Approval Progress Header */}
          <div style={{
            marginBottom: 16,
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: 6,
            border: '1px solid #e8e8e8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <Text strong style={{ color: PRIMARY_BLUE, fontSize: 15 }}>Approval Progress</Text>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {stats.approved === stats.total && stats.total > 0
                    ? '✓ All approvers have approved'
                    : `${stats.approved} of ${stats.total} approvers have approved`}
                </div>
              </div>
              {/* REMOVED: Send Reminder button from here */}
            </div>
           
            {/* Progress Bar */}
            {stats.total > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 12,
                  color: '#666'
                }}>
                  <span>Approval Progress</span>
                  <span>{stats.approved}/{stats.total} ({stats.percentage}%)</span>
                </div>
                <Progress
                  percent={stats.percentage}
                  strokeColor={stats.approved === stats.total ? SUCCESS_GREEN : PRIMARY_BLUE}
                  size="small"
                  showInfo={false}
                />
              </div>
            )}
          </div>

          {/* Approver List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(function() {
              const approvers = [];
              let hasApprovers = false;
             
              if (localDeferral.approverFlow && Array.isArray(localDeferral.approverFlow)) {
                hasApprovers = true;
                localDeferral.approverFlow.forEach((approver, index) => {
                  const isApproved = approver.approved || approver.approved === true;
                  const isRejected = approver.rejected || approver.rejected === true;
                  const isReturned = approver.returned || approver.returned === true;
                  const isCurrent = !isApproved && !isRejected && !isReturned &&
                    (index === localDeferral.currentApproverIndex ||
                     localDeferral.currentApprover === approver ||
                     localDeferral.currentApprover?._id === approver?._id);
                 
                  approvers.push({
                    ...approver,
                    index,
                    isApproved,
                    isRejected,
                    isReturned,
                    isCurrent,
                    approvalDate: approver.approvedDate || approver.date,
                    rejectionDate: approver.rejectedDate || approver.date,
                    returnDate: approver.returnedDate || approver.date,
                    comment: approver.comment || ''
                  });
                });
              } else if (localDeferral.approvers && Array.isArray(localDeferral.approvers)) {
                hasApprovers = true;
                localDeferral.approvers.forEach((approver, index) => {
                  const isApproved = approver.approved || approver.approved === true;
                  const isRejected = approver.rejected || approver.rejected === true;
                  const isReturned = approver.returned || approver.returned === true;
                  const isCurrent = !isApproved && !isRejected && !isReturned &&
                    (index === localDeferral.currentApproverIndex ||
                     localDeferral.currentApprover === approver ||
                     localDeferral.currentApprover?._id === approver?._id);
                 
                  approvers.push({
                    ...approver,
                    index,
                    isApproved,
                    isRejected,
                    isReturned,
                    isCurrent,
                    approvalDate: approver.approvedDate || approver.date,
                    rejectionDate: approver.rejectedDate || approver.date,
                    returnDate: approver.returnedDate || approver.date,
                    comment: approver.comment || ''
                  });
                });
              }

              if (!hasApprovers) {
                return (
                  <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                    <UserOutlined style={{ fontSize: 32, marginBottom: 12, color: '#d9d9d9' }} />
                    <div>No approvers specified</div>
                  </div>
                );
              }

              return approvers.map((approver, index) => {
                const approverName = typeof approver === 'object' ?
                  (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver)) :
                  (typeof approver === 'string' && approver.includes('@') ? approver.split('@')[0] : approver);
               
                return (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: approver.isApproved ? `${SUCCESS_GREEN}10` :
                                  approver.isRejected ? `${ERROR_RED}10` :
                                  approver.isReturned ? `${WARNING_ORANGE}10` :
                                  approver.isCurrent ? '#e6f7ff' : '#fafafa',
                    borderRadius: 8,
                    border: approver.isApproved ? `2px solid ${SUCCESS_GREEN}` :
                           approver.isRejected ? `2px solid ${ERROR_RED}` :
                           approver.isReturned ? `2px solid ${WARNING_ORANGE}` :
                           approver.isCurrent ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                  }}>
                    <Badge count={index+1} style={{
                      backgroundColor: approver.isApproved ? SUCCESS_GREEN :
                                    approver.isRejected ? ERROR_RED :
                                    approver.isReturned ? WARNING_ORANGE :
                                    approver.isCurrent ? PRIMARY_BLUE : '#bfbfbf',
                      fontSize: 14,
                      height: 28,
                      minWidth: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 15, color: PRIMARY_BLUE }}>
                          {approver.role || 'Approver'}
                        </Text>
                        {approver.isApproved && (
                          <Tag
                            icon={<CheckCircleOutlined />}
                            color="success"
                            style={{ fontSize: 11, padding: '2px 8px' }}
                          >
                            Approved
                          </Tag>
                        )}
                        {approver.isCurrent && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                          <Tag color="processing" style={{ fontSize: 11, padding: '2px 8px' }}>
                            Current
                          </Tag>
                        )}
                      </div>
                     
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: approver.isApproved ? SUCCESS_GREEN :
                                         approver.isCurrent ? PRIMARY_BLUE : '#bfbfbf'
                          }}
                        />
                        <Text style={{ fontSize: 14 }}>
                          {approverName}
                        </Text>
                      </div>
                     
                      {approver.isApproved && approver.approvalDate && (
                        <div style={{ fontSize: 12, color: SUCCESS_GREEN, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarOutlined style={{ fontSize: 11 }} />
                          Approved: {dayjs(approver.approvalDate).format('DD MMM YYYY HH:mm')}
                        </div>
                      )}
                     
                      {approver.isCurrent && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                        <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          Pending Approval
                        </div>
                      )}
                     
                      {approver.comment && (
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' }}>
                          "{approver.comment}"
                        </div>
                      )}
                    </div>
                   
                    {approver.isCurrent && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                      <Popconfirm
                        title="Send Reminder"
                        description={`Send reminder email to ${approverName}?`}
                        onConfirm={sendReminderToCurrentApprover}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ style: { background: PRIMARY_BLUE, borderColor: PRIMARY_BLUE } }}
                      >
                        <Button
                          type="link"
                          size="small"
                          icon={<MailOutlined />}
                          loading={sendingReminder}
                        >
                          Remind
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                );
              });
            })()}
          </div>
         
          {/* Approval Warning */}
          {!allApproversApproved && (localDeferral.approverFlow || localDeferral.approvers)?.length > 0 && (
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: `${WARNING_ORANGE}15`,
              border: `1px solid ${WARNING_ORANGE}40`,
              borderRadius: 6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExclamationCircleOutlined style={{ color: WARNING_ORANGE }} />
                <Text strong style={{ color: WARNING_ORANGE }}>
                  Approval Pending: {stats.pending} approver{stats.pending !== 1 ? 's' : ''} still need to approve
                </Text>
              </div>
              <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                All approvers in the approval flow must approve before Creator and Checker can approve.
              </Text>
            </div>
          )}
        </Card>

        {/* Existing sections for Facilities, Documents, etc. */}
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

        {/* DCL Upload Section */}
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

        {/* Additional Documents Section */}
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

        {/* Comments Input Section */}
        <Card size="small" style={{ marginBottom: 24, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 4,
              height: 20,
              backgroundColor: '#b5d334',
              marginRight: 12,
              borderRadius: 2
            }} />
            <h4 style={{ color: PRIMARY_BLUE, margin: 0 }}>Comments</h4>
          </div>
         
          <AntdInput.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Add any notes or comments for the deferral (optional)"
            maxLength={500}
            showCount
          />
         
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
            <Button
              type="default"
              onClick={() => setNewComment('')}
              disabled={postingComment}
            >
              Clear
            </Button>
            <Button
              type="primary"
              onClick={handlePostComment}
              loading={postingComment}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </Card>

        <div style={{ marginTop: 24 }}>
          <h4 style={{ color: PRIMARY_BLUE, marginBottom: 16 }}>Comment Trail & History</h4>
          {(function renderHistory() {
            const events = [];
            const requester = localDeferral.requestor?.name || localDeferral.requestedBy?.name || localDeferral.rmName || localDeferral.rmRequestedBy?.name || localDeferral.createdBy?.name || 'RM';
            const requesterRole = localDeferral.requestor?.role || 'RM';
            const requestDate = localDeferral.requestedDate || localDeferral.createdAt || localDeferral.requestedAt;
            const requestComment = localDeferral.rmReason || 'Deferral request submitted';
            events.push({ user: requester, userRole: requesterRole, date: requestDate, comment: requestComment });

            if (localDeferral.comments && Array.isArray(localDeferral.comments) && localDeferral.comments.length > 0) {
              localDeferral.comments.forEach(c => {
                const commentAuthorName = c.author?.name || 'RM';
                const commentAuthorRole = c.author?.role || 'RM';
                events.push({
                  user: commentAuthorName,
                  userRole: commentAuthorRole,
                  date: c.createdAt,
                  comment: c.text || ''
                });
              });
            }

            if (localDeferral.history && Array.isArray(localDeferral.history) && localDeferral.history.length > 0) {
              localDeferral.history.forEach((h) => {
                if (h.action === 'moved') return;
                const userName = h.user?.name || h.userName || h.user || 'System';
                const userRole = h.user?.role || h.userRole || h.role || 'System';
                events.push({
                  user: userName,
                  userRole: userRole,
                  date: h.date || h.createdAt || h.timestamp || h.entryDate,
                  comment: h.comment || h.notes || h.message || ''
                });
              });
            }

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
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const a = q.get('active');
      if (a === 'rejected' || a === 'approved' || a === 'pending' || a === 'closed') return a;
    } catch (e) {}
    return 'pending';
  });

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

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...deferrals];
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(d =>
        (d.deferralNumber || "").toLowerCase().includes(q) ||
        (d.dclNumber || "").toLowerCase().includes(q) ||
        (d.customerNumber || "").toLowerCase().includes(q) ||
        (d.customerName || "").toLowerCase().includes(q) ||
        ((d.loanType || "").toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [deferrals, searchText]);

  // Tab data
  const pendingData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    // Exclude: rejected, returned_for_rework, withdrawn, closed, approved
    if (s === 'rejected' || s === 'deferral_rejected' || s === 'returned_for_rework' || s === 'withdrawn' || s === 'closed' || s === 'deferral_closed' || s === 'closed_by_co' || s === 'closed_by_creator') return false;
    if (s === 'deferral_approved' || s === 'approved') {
      const allApproversApproved = d.allApproversApproved === true;
      const creatorApproved = d.creatorApprovedBy || d.creatorStatus === 'approved' || d.createdApprovedBy;
      const checkerApproved = d.checkerApprovedBy || d.checkerStatus === 'approved' || d.checkedApprovedBy;
      return !(allApproversApproved && creatorApproved && checkerApproved);
    }
    return true;
  }), [filteredData]);

  const approvedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    if (!(s === 'deferral_approved' || s === 'approved')) return false;
    const allApproversApproved = d.allApproversApproved === true;
    const creatorApproved = d.creatorApprovedBy || d.creatorStatus === 'approved' || d.createdApprovedBy;
    const checkerApproved = d.checkerApprovedBy || d.checkerStatus === 'approved' || d.checkedApprovedBy;
    return allApproversApproved && creatorApproved && checkerApproved;
  }), [filteredData]);

  const rejectedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'returned_for_rework';
  }), [filteredData]);

  const closedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    return ['closed','deferral_closed','closed_by_co','closed_by_creator','withdrawn','rejected','deferral_rejected'].includes(s);
  }), [filteredData]);

  const currentData = activeTab === 'pending' ? pendingData : activeTab === 'approved' ? approvedData : activeTab === 'rejected' ? rejectedData : closedData;

  // Columns
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
        <div style={{ fontWeight: 600, color: PRIMARY_BLUE }}>
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
        <div style={{ fontSize: 12, fontWeight: 500, color: PRIMARY_BLUE, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'deferral_requested' || s === 'deferral_requested') return (<div style={{ fontSize: 11, fontWeight: 'bold', color: WARNING_ORANGE }}>Pending</div>);
        if (s === 'deferral_approved' || s === 'approved') return (<div style={{ fontSize: 11, fontWeight: 'bold', color: SUCCESS_GREEN }}>Approved</div>);
        if (s === 'deferral_rejected' || s === 'rejected') return (<div style={{ fontSize: 11, fontWeight: 'bold', color: ERROR_RED }}>Rejected</div>);
        return (<div style={{ fontSize: 11, fontWeight: 'bold', color: '#666' }}>{status}</div>);
      },
      filters: [
        { text: 'Pending', value: 'deferral_requested' },
        { text: 'Approved', value: 'deferral_approved' },
        { text: 'Rejected', value: 'deferral_rejected' }
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
    },
    {
      title: "Quick Actions",
      key: "quickActions",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const isApproved = record.status === 'deferral_approved';
        return isApproved ? (
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleApplyForExtension(record);
            }}
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            Apply Extension
          </Button>
        ) : null;
      }
    }
  ];

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
              onClick={() => setSearchText("")}
              style={{ width: '100%' }}
              size="middle"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <div style={{ marginBottom: 12 }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} type="card">
          <Tabs.TabPane tab={`Pending Deferrals (${pendingData.length})`} key="pending" />
          <Tabs.TabPane tab={`Approved Deferrals (${approvedData.length})`} key="approved" />
          <Tabs.TabPane tab={`Re-work Deferrals (${rejectedData.length})`} key="rejected" />
          <Tabs.TabPane tab={`Completed Deferrals (${closedData.length})`} key="closed" />
          <Tabs.TabPane tab={`Extension Applications (${myExtensions.length})`} key="extensions" />
        </Tabs>
      </div>

      <Divider style={{ margin: "12px 0" }}>
        <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
          {activeTab === 'pending' ? `Pending Deferrals` : activeTab === 'approved' ? `Approved Deferrals` : activeTab === 'rejected' ? `Re-work Deferrals` : activeTab === 'closed' ? `Completed Deferrals` : `Extension Applications`} ({activeTab === 'extensions' ? myExtensions.length : currentData.length} items)
        </span>
      </Divider>

      {/* Extensions Tab Content */}
      {activeTab === 'extensions' && (
        <ExtensionApplicationsTab extensions={myExtensions} loading={extensionsLoading} />
      )}

      {/* Table */}
      {activeTab !== 'extensions' && (
      loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Spin tip="Loading deferral requests..." />
        </div>
        </div>
      ) : currentData.length === 0 ? (
        <Empty
          description={
            <div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>{activeTab === 'pending' ? 'No pending deferrals found' : activeTab === 'approved' ? 'No approved deferrals found' : activeTab === 'rejected' ? 'No re-work deferrals found' : 'No completed deferrals found'}</p>
              <p style={{ color: "#999" }}>
                {searchText
                  ? 'Try changing your search term'
                  : (activeTab === 'pending' ? 'No pending deferrals currently' : activeTab === 'approved' ? 'No deferrals have been approved yet' : activeTab === 'rejected' ? 'No deferrals have been rejected' : 'No deferrals have been closed by CO')}
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
          onAction={() => {}}
        />
      )}

      {/* Extension Application Modal */}
      <ExtensionApplicationModal
        open={extensionModalOpen}
        onClose={() => {
          setExtensionModalOpen(false);
          setSelectedDeferralForExtension(null);
        }}
        deferral={selectedDeferralForExtension}
        onSubmit={handleExtensionSubmit}
        loading={extensionCreating}
      />
    </div>
  );
};

export default DeferralPending;