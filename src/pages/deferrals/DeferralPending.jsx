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
  BankOutlined,
  LoadingOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PaperClipOutlined,
  FileDoneOutlined,
  EyeOutlined
} from "@ant-design/icons";
import getFacilityColumns from '../../utils/facilityColumns';
import { FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { openFileInNewTab, downloadFile } from '../../utils/fileUtils';
import deferralApi from '../../service/deferralApi.js';
import { jsPDF } from 'jspdf';

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

// Enhanced Deferral Details Modal (expanded view: facilities, documents, approver flow, comments)
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

  useEffect(() => {
    setLocalDeferral(deferral);
  }, [deferral]);

  // Handle Recall Deferral - notify all approvers and stay on pending tab
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
          // Send email notification to all approvers
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

  // Handle Withdraw Request - close the deferral and move to closed tab
  const handleWithdrawRequest = () => {
    console.log('Withdraw Request button clicked - Opening confirmation modal');
    setWithdrawConfirmVisible(true);
  };

  // Handle the actual withdrawal after confirmation
  const handleConfirmWithdraw = async () => {
    console.log('Withdrawal confirmed');
    setLoadingWithdraw(true);
    try {
      // Close the deferral with status 'withdrawn'
      const updatedDeferral = await deferralApi.closeDeferral(localDeferral._id, {
        status: 'withdrawn',
        reason: 'withdrawn by rm',
        closedBy: 'rm',
        closedAt: new Date()
      });
      console.log('Deferral closed successfully:', updatedDeferral);
      
      // Send email notification to all approvers about the withdrawal
      await deferralApi.sendEmailNotification(localDeferral._id, 'withdrawal', {
        deferralNumber: localDeferral.deferralNumber,
        customerName: localDeferral.customerName,
        message: 'The deferral request has been withdrawn by the Relationship Manager.'
      });
      console.log('Email notification sent');
      
      message.success('Deferral withdrawn successfully. All approvers have been notified and the deferral has been moved to Completed.');
      // Dispatch event to update parent component and switch to completed tab
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

  // Handle Approve Deferral - CO Checker approves and moves to approved tab
  const handleApproveDeferral = async () => {
    Modal.confirm({
      title: 'Approve Deferral',
      content: 'Are you sure you want to approve this deferral request? Once approved, the deferral will be moved to the Approved Deferrals tab.',
      okText: 'Yes, Approve',
      cancelText: 'Cancel',
      okButtonProps: { style: { background: SUCCESS_GREEN, borderColor: SUCCESS_GREEN, color: 'white' } },
      onOk: async () => {
        setLoadingApprove(true);
        try {
          // Approve the deferral via API
          const updatedDeferral = await deferralApi.approveDeferral(localDeferral._id, {
            approvalNotes: '',
            approvedAt: new Date()
          });
          message.success('Deferral approved successfully and moved to Approved tab.');
          // Dispatch event to update parent component and switch to approved tab
          window.dispatchEvent(new CustomEvent('deferral:updated', { detail: updatedDeferral }));
          onAction && onAction({ status: 'approved', updatedDeferral });
          onClose();
        } catch (error) {
          message.error(`Failed to approve deferral: ${error.message}`);
        } finally {
          setLoadingApprove(false);
        }
      }
    });
  };

  // Handle Approve Closed Deferral - Checker approves the closure (final step)
  const handleApproveClosedDeferral = async () => {
    Modal.confirm({
      title: 'Approve Closed Deferral',
      content: 'Are you sure you want to approve the closure of this deferral? This confirms that the deferred document was submitted before or during the next due date, and the deferral request is now fully completed.',
      okText: 'Yes, Approve Closure',
      cancelText: 'Cancel',
      okButtonProps: { style: { background: SUCCESS_GREEN, borderColor: SUCCESS_GREEN, color: 'white' } },
      onOk: async () => {
        setLoadingApproveClose(true);
        try {
          // Approve the closed deferral via API
          const updatedDeferral = await deferralApi.approveDeferral(localDeferral._id, {
            approvalNotes: 'Closure approved - document submitted on time',
            approvedAt: new Date(),
            checkerApproved: true
          });
          message.success('Deferral closure approved successfully. The deferral request is now fully completed.');
          // Dispatch event to update parent component
          window.dispatchEvent(new CustomEvent('deferral:updated', { detail: updatedDeferral }));
          onAction && onAction({ status: 'completed', updatedDeferral });
          onClose();
        } catch (error) {
          message.error(`Failed to approve deferral closure: ${error.message}`);
        } finally {
          setLoadingApproveClose(false);
        }
      }
    });
  };

  // Download Deferral as PDF
  const downloadDeferralAsPDF = async () => {
    if (!localDeferral || !localDeferral._id) {
      message.error('No deferral selected');
      return;
    }

    setActionLoading(true);
    try {
      // Create PDF document
      const doc = new jsPDF();
      
      // Set colors
      const primaryBlue = [22, 70, 121]; // RGB for PRIMARY_BLUE
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
      
      // Loan Information Section
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('LOAN INFORMATION', margin, yPosition);
      yPosition += 7;
      
      doc.setDrawColor(22, 70, 121);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      const loanAmount = Number(localDeferral.loanAmount || 0);
      const formattedLoanAmount = loanAmount ? `KSh ${loanAmount.toLocaleString()}` : 'Not specified';
      
      const loanInfo = [
        { label: 'Loan Type:', value: localDeferral.loanType || 'N/A' },
        { label: 'Loan Amount:', value: formattedLoanAmount },
        { label: 'Days Sought:', value: `${localDeferral.daysSought || 0} days` },
        { label: 'Next Due Date:', value: localDeferral.nextDueDate || localDeferral.nextDocumentDueDate ? dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).format('DD MMM YYYY') : 'Not calculated' },
        { label: 'SLA Expiry:', value: localDeferral.slaExpiry ? dayjs(localDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set' }
      ];
      
      loanInfo.forEach(item => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(item.label, margin, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(item.value, margin + 50, yPosition);
        yPosition += 7;
        
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      yPosition += 5;
      
      // Facilities Section
      if (localDeferral.facilities && localDeferral.facilities.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('FACILITIES', margin, yPosition);
        yPosition += 7;
        
        doc.setDrawColor(22, 70, 121);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        localDeferral.facilities.forEach(facility => {
          const facilityText = `${facility.facilityNumber || 'N/A'} - ${facility.facilityType || 'N/A'} (${facility.outstandingAmount || 0})`;
          const lines = doc.splitTextToSize(facilityText, contentWidth - 10);
          lines.forEach(line => {
            doc.text('• ' + line, margin + 5, yPosition);
            yPosition += 6;
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
          });
        });
        
        yPosition += 3;
      }
      
      // Deferral Description Section
      if (localDeferral.deferralDescription) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('DEFERRAL DESCRIPTION', margin, yPosition);
        yPosition += 7;
        
        doc.setDrawColor(22, 70, 121);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFont(undefined, 'normal');
        const descLines = doc.splitTextToSize(localDeferral.deferralDescription, contentWidth);
        descLines.forEach(line => {
          doc.text(line, margin, yPosition);
          yPosition += 6;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
      
      yPosition += 10;
      
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

  if (!localDeferral) return null;

  const status = (localDeferral.status || 'deferral_requested').toLowerCase();
  const isPendingApproval = status === 'deferral_requested';
  
  console.log('DeferralDetailsModal - Status:', status, 'localDeferral._id:', localDeferral._id);

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

  // Use shared facility columns
  const facilityColumns = getFacilityColumns();

  return (
    <>
      <style>{customStyles}</style>
      
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
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BankOutlined /> <span>Deferral Request: {localDeferral.deferralNumber}</span></div>}
        open={open}
        onCancel={onClose}
        width={950}
        styles={{ body: { padding: '0 24px 24px' } }}
        footer={[
          <div key="debug-status" style={{ textAlign: 'left', fontSize: 12, color: '#999', marginRight: 'auto' }}>
            DEBUG: status="{status}", raw="{localDeferral.status}"
          </div>,
          (status === 'deferral_requested' || status === 'pending_approval') ? (
            <Button 
              key="recall" 
              onClick={handleRecallDeferral} 
              loading={loadingRecall}
              style={{ backgroundColor: WARNING_ORANGE, borderColor: WARNING_ORANGE, color: 'white' }}
            >
              Recall Deferral
            </Button>
          ) : null,
          (status === 'deferral_requested' || status === 'pending_approval') ? (
            <Button 
              key="withdraw"
              type="default"
              onClick={() => {
                console.log('Button clicked, calling handleWithdrawRequest');
                handleWithdrawRequest();
              }}
              loading={loadingWithdraw}
              style={{ backgroundColor: ERROR_RED, borderColor: ERROR_RED, color: 'white' }}
            >
              Withdraw Request
            </Button>
          ) : null,
          (status === 'closed' || status === 'deferral_closed' || status === 'closed_by_co' || status === 'closed_by_creator' || status === 'withdrawn') ? (
            <Button 
              key="approveClosure" 
              type="primary"
              onClick={handleApproveClosedDeferral} 
              loading={loadingApproveClose}
              disabled={status === 'withdrawn'}
              style={{ backgroundColor: status === 'withdrawn' ? '#d9d9d9' : SUCCESS_GREEN, borderColor: status === 'withdrawn' ? '#d9d9d9' : SUCCESS_GREEN, color: status === 'withdrawn' ? '#8c8c8c' : 'white' }}
            >
              {status === 'withdrawn' ? 'Request Withdrawn' : 'Approve Closure'}
            </Button>
          ) : null,
          <Button
            key="download"
            type="default"
            onClick={downloadDeferralAsPDF}
            loading={actionLoading}
            icon={<DownloadOutlined />}
            style={{ marginLeft: 8 }}
          >
            Download as PDF
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
            <Descriptions.Item label="Created At"><div><Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('DD MMM YYYY')}</Text><Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('HH:mm')}</Text></div></Descriptions.Item>
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

            {/* Approvers Status */}
            <Descriptions.Item label="Approvers Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const approvers = localDeferral.approvals || [];
                  const approvedCount = approvers.filter(a => a.status === 'approved').length;
                  const totalCount = approvers.length;
                  
                  if (totalCount === 0) {
                    return (
                      <Tag color="processing" style={{ fontWeight: 700 }}>
                        No approvers
                      </Tag>
                    );
                  }
                  
                  if (approvedCount === totalCount && totalCount > 0) {
                    return (
                      <Tag color="success" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircleOutlined />
                        All Approved
                      </Tag>
                    );
                  }
                  
                  return (
                    <Tag color="processing" style={{ fontWeight: 700 }}>
                      {approvedCount} of {totalCount} Approved
                    </Tag>
                  );
                })()}
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

            <Descriptions.Item label="Days Sought"><div style={{ fontWeight: 'bold', color: localDeferral.daysSought > 45 ? ERROR_RED : localDeferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE }}>{localDeferral.daysSought || 0} days</div></Descriptions.Item>

            {/* Next Due Date: use available properties and mark as auto-generated when present */}
            <Descriptions.Item label="Next Due Date">
              <div style={{ color: (localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? (dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).isBefore(dayjs()) ? ERROR_RED : SUCCESS_GREEN) : PRIMARY_BLUE }}>
                {(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate) ? `${dayjs(localDeferral.nextDueDate || localDeferral.nextDocumentDueDate).format('DD MMM YYYY')}` : 'Not calculated'}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="SLA Expiry"><div style={{ color: localDeferral.slaExpiry && dayjs(localDeferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>{localDeferral.slaExpiry ? dayjs(localDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}</div></Descriptions.Item>

            {/* Created At */}
            <Descriptions.Item label="Created At">
              <div>
                <Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('DD MMM YYYY')}</Text>
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(localDeferral.createdAt||localDeferral.requestedDate).format('HH:mm')}</Text>
              </div>
            </Descriptions.Item>
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

        {/* Updated Approval Flow with Green Ticks for Approved Approvers */}
        <Card size="small" title={<span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>Approval Flow</span>} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(function() {
              // Process approvers similar to second file
              const approvers = [];
              let allApproversApprovedLocal = true;
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
                  
                  // Check if all approvers have approved
                  if (!isApproved && !isRejected && !isReturned) {
                    allApproversApprovedLocal = false;
                  }
                  
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
                  
                  // Check if all approvers have approved
                  if (!isApproved && !isRejected && !isReturned) {
                    allApproversApprovedLocal = false;
                  }
                  
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

              // If there are no approvers defined, allow approval
              if (!hasApprovers) {
                allApproversApprovedLocal = true;
              }

              if (approvers.length > 0) {
                return approvers.map((approver, index) => {
                  const approverName = typeof approver === 'object' ?
                    (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver)) :
                    (typeof approver === 'string' && approver.includes('@') ? approver.split('@')[0] : approver);
                  
                  return (
                    <div key={index} style={{
                      padding: '12px 16px',
                      backgroundColor: approver.isApproved ? `${SUCCESS_GREEN}10` :
                                    approver.isRejected ? `${ERROR_RED}10` :
                                    approver.isReturned ? `${WARNING_ORANGE}10` :
                                    approver.isCurrent ? '#e6f7ff' : '#fafafa',
                      borderRadius: 6,
                      border: approver.isApproved ? `2px solid ${SUCCESS_GREEN}` :
                             approver.isRejected ? `2px solid ${ERROR_RED}` :
                             approver.isReturned ? `2px solid ${WARNING_ORANGE}` :
                             approver.isCurrent ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <Badge count={index+1} style={{
                        backgroundColor: approver.isApproved ? SUCCESS_GREEN :
                                      approver.isRejected ? ERROR_RED :
                                      approver.isReturned ? WARNING_ORANGE :
                                      approver.isCurrent ? PRIMARY_BLUE : '#bfbfbf',
                        fontSize: 12,
                        height: 24,
                        minWidth: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Text strong style={{ fontSize: 14 }}>{approverName}</Text>
                          {approver.isApproved && (
                            <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Approved
                            </Tag>
                          )}
                          {approver.isRejected && (
                            <Tag icon={<CloseCircleOutlined />} color="error" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Rejected
                            </Tag>
                          )}
                          {approver.isReturned && (
                            <Tag icon={<ReloadOutlined />} color="warning" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Returned
                            </Tag>
                          )}
                          {approver.isCurrent && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                            <Tag color="processing" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Current
                            </Tag>
                          )}
                        </div>
                        
                        {approver.isApproved && approver.approvalDate && (
                          <div style={{ fontSize: 12, color: SUCCESS_GREEN, marginTop: 2 }}>
                            <CheckCircleOutlined style={{ marginRight: 4 }} />
                            Approved on: {dayjs(approver.approvalDate).format('DD MMM YYYY HH:mm')}
                          </div>
                        )}
                        
                        {approver.isRejected && approver.rejectionDate && (
                          <div style={{ fontSize: 12, color: ERROR_RED, marginTop: 2 }}>
                            <CloseCircleOutlined style={{ marginRight: 4 }} />
                            Rejected on: {dayjs(approver.rejectionDate).format('DD MMM YYYY HH:mm')}
                          </div>
                        )}
                        
                        {approver.isReturned && approver.returnDate && (
                          <div style={{ fontSize: 12, color: WARNING_ORANGE, marginTop: 2 }}>
                            <ReloadOutlined style={{ marginRight: 4 }} />
                            Returned on: {dayjs(approver.returnDate).format('DD MMM YYYY HH:mm')}
                          </div>
                        )}
                        
                        {approver.comment && (
                          <div style={{ fontSize: 12, color: '#666', marginTop: 2, fontStyle: 'italic' }}>
                            "{approver.comment}"
                          </div>
                        )}
                        
                        {approver.isCurrent && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                          <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockCircleOutlined style={{ fontSize: 11 }} />
                            Current Approver • Pending Approval
                            {localDeferral.slaExpiry && (
                              <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>
                                SLA: {dayjs(localDeferral.slaExpiry).format('DD MMM HH:mm')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              } else if (localDeferral.approvers && localDeferral.approvers.length > 0) {
                return localDeferral.approvers.filter(a => a && a !== "").map((approver, index) => {
                  const isCurrentApprover = (() => {
                    if (typeof localDeferral?.currentApproverIndex === 'number') return index === localDeferral.currentApproverIndex;
                    const ca = localDeferral?.currentApprover;
                    if (!ca) return index === 0;
                    const getKey = (item) => {
                      if (!item) return '';
                      if (typeof item === 'string') return item.toLowerCase();
                      return (String(item._id) || item.email || item.name || (item.user && (item.user.email || item.user.name)) || '').toLowerCase();
                    };
                    return getKey(approver) === getKey(ca);
                  })();
                  const isEmail = typeof approver === 'string' && approver.includes('@');
                  
                  return (
                    <div key={index} style={{
                      padding: '12px 16px',
                      backgroundColor: isCurrentApprover ? '#e6f7ff' : '#fafafa',
                      borderRadius: 6,
                      border: isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <Badge count={index+1} style={{
                        backgroundColor: isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf',
                        fontSize: 12,
                        height: 24,
                        minWidth: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} />
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {typeof approver === 'string' ? (isEmail ? approver.split('@')[0] : approver) : (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver))}
                        </Text>
                        {isCurrentApprover && (
                          <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockCircleOutlined style={{ fontSize: 11 }} />
                            Current Approver • Pending Approval
                            {localDeferral.slaExpiry && (
                              <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>
                                SLA: {dayjs(localDeferral.slaExpiry).format('DD MMM HH:mm')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              } else {
                return (
                  <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                    <UserOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} />
                    <div>No approvers specified</div>
                  </div>
                );
              }
            })()}
          </div>
          
          {/* Show warning if not all approvers have approved */}
          {(function() {
            // Recalculate approvers status
            let allApproversApprovedLocal = false;
            if (localDeferral.approvals && localDeferral.approvals.length > 0) {
              allApproversApprovedLocal = localDeferral.approvals.every(app => app.status === 'approved');
            }
            
            if (typeof localDeferral.allApproversApproved !== 'undefined') {
              allApproversApprovedLocal = localDeferral.allApproversApproved === true;
            }
            
            if (!allApproversApprovedLocal && (localDeferral.approverFlow || localDeferral.approvers)?.length > 0) {
              return (
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
                      Approval Pending: Not all approvers have approved yet
                    </Text>
                  </div>
                  <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                    All approvers in the approval flow must approve before Creator and Checker can approve.
                  </Text>
                </div>
              );
            }
            return null;
          })()}
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

          {/* Build a derived history: initial request, any stored history, and approval events */}
          {(function renderHistory() {
            const events = [];

            // Initial request event - show RM's real name and role
            const requester = localDeferral.requestor?.name || localDeferral.requestedBy?.name || localDeferral.rmName || localDeferral.rmRequestedBy?.name || localDeferral.createdBy?.name || 'RM';
            const requesterRole = localDeferral.requestor?.role || 'RM';
            const requestDate = localDeferral.requestedDate || localDeferral.createdAt || localDeferral.requestedAt;
            const requestComment = localDeferral.rmReason || 'Deferral request submitted';
            events.push({ user: requester, userRole: requesterRole, date: requestDate, comment: requestComment });

            // Add RM's posted comments (if any)
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

            // Existing history entries (if any) - filter out redundant 'moved' entries
            if (localDeferral.history && Array.isArray(localDeferral.history) && localDeferral.history.length > 0) {
              localDeferral.history.forEach((h) => {
                // Skip redundant 'moved' action entries - they're implicit when the next approver approves
                if (h.action === 'moved') {
                  return;
                }
                
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
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState("");

  // Handle posting comments
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment before posting');
      return;
    }

    if (!selectedDeferral || !selectedDeferral._id) {
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

      // Post comment to the backend
      await deferralApi.postComment(selectedDeferral._id, commentData, token);

      message.success('Comment posted successfully');
      
      // Clear the input
      setNewComment('');

      // Refresh the deferral to show the new comment
      const refreshedDeferral = await deferralApi.getDeferralById(selectedDeferral._id, token);
      setSelectedDeferral(refreshedDeferral);
      
      // Update in the list
      const updatedDeferrals = deferrals.map(d => 
        d._id === refreshedDeferral._id ? refreshedDeferral : d
      );
      setDeferrals(updatedDeferrals);
    } catch (error) {
      console.error('Failed to post comment:', error);
      message.error(error.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

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

        ((d.loanType || "").toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [deferrals, searchText]);

  // Tabs: Pending / Approved / Rejected - track active tab and derive data sets
  const [activeTab, setActiveTab] = useState(() => {
    // Respect ?active= in the url query if present (optional UX nicety)
    try {
      const q = new URLSearchParams(window.location.search);
      const a = q.get('active');
      if (a === 'rejected' || a === 'approved' || a === 'pending' || a === 'closed') return a;
    } catch (e) {}
    return 'pending';
  });

  // Pending should include all non-finalised requests and partial approvals
  // A deferral only leaves pending when it's fully approved (all approvers + creator + checker)
  const pendingData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    
    // Exclude fully rejected and rework statuses
    if (s === 'rejected' || s === 'deferral_rejected' || s === 'returned_for_rework') return false;
    
    // For approved status, only exclude if fully approved by all parties
    if (s === 'deferral_approved' || s === 'approved') {
      const allApproversApproved = d.allApproversApproved === true;
      const creatorApproved = d.creatorApprovedBy || d.creatorStatus === 'approved' || d.createdApprovedBy;
      const checkerApproved = d.checkerApprovedBy || d.checkerStatus === 'approved' || d.checkedApprovedBy;
      
      // Keep in pending if NOT fully approved
      return !(allApproversApproved && creatorApproved && checkerApproved);
    }
    
    // Include all other pending statuses
    return true;
  }), [filteredData]);

  // Approved should only include deferrals that have been fully approved by:
  // 1. All approvers
  // 2. CO creator  
  // 3. CO checker
  const approvedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    
    // Check if status is approved
    if (!(s === 'deferral_approved' || s === 'approved')) return false;
    
    // For full approval, check that all approvers have approved
    const allApproversApproved = d.allApproversApproved === true;
    
    // Check creator approval (createdApprovedBy or creatorStatus)
    const creatorApproved = d.creatorApprovedBy || d.creatorStatus === 'approved' || d.createdApprovedBy;
    
    // Check checker approval (checkerApprovedBy or checkerStatus)  
    const checkerApproved = d.checkerApprovedBy || d.checkerStatus === 'approved' || d.checkedApprovedBy;
    
    // Only include if ALL three approval stages are complete
    return allApproversApproved && creatorApproved && checkerApproved;
  }), [filteredData]);

  // Rejected should only include 'returned_for_rework' status (deferrals sent back for changes)
  const rejectedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'returned_for_rework';
  }), [filteredData]);

  // Closed by CO (includes both closed statuses and rejected/rejected deferrals - final statuses)
  const closedData = useMemo(() => filteredData.filter(d => {
    const s = (d.status || '').toLowerCase();
    return ['closed','deferral_closed','closed_by_co','closed_by_creator','withdrawn','rejected','deferral_rejected'].includes(s);
  }), [filteredData]);

  const currentData = activeTab === 'pending' ? pendingData : activeTab === 'approved' ? approvedData : activeTab === 'rejected' ? rejectedData : closedData;

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

  // Listen for in-app deferral updates (e.g., when an approver rejects a deferral)
  useEffect(() => {
    const handler = (e) => {
      try {
        const updated = e && e.detail ? e.detail : null;
        if (!updated || !updated._id) return;

        setDeferrals(prev => {
          const exists = prev.some(d => String(d._id) === String(updated._id));
          if (exists) {
            return prev.map(d => d._id === updated._id ? { ...d, ...updated } : d);
          }
          // If the deferral belongs to this RM, add it
          return [updated, ...prev];
        });

        // Also update selectedDeferral if this is the deferral being viewed in the modal
        if (selectedDeferral && String(selectedDeferral._id) === String(updated._id)) {
          setSelectedDeferral(prev => ({ ...prev, ...updated }));
        }

        // Get current user ID from localStorage
        const myUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user._id : null;
        
        // Check if this deferral belongs to the current RM
        // Check multiple fields: requestor, requestedBy, createdBy
        const isMine = 
          (updated.requestor && ((updated.requestor._id && String(updated.requestor._id) === String(myUserId)) || String(updated.requestor) === String(myUserId))) ||
          (updated.requestedBy && ((updated.requestedBy._id && String(updated.requestedBy._id) === String(myUserId)) || String(updated.requestedBy) === String(myUserId))) ||
          (updated.createdBy && ((updated.createdBy._id && String(updated.createdBy._id) === String(myUserId)) || String(updated.createdBy) === String(myUserId))) ||
          (updated.rmId && String(updated.rmId) === String(myUserId)) ||
          (updated.createdByUserId && String(updated.createdByUserId) === String(myUserId));

        const s = (updated.status || '').toLowerCase();
        
        // Switch to rejected/rework tab if deferral is rejected or returned for rework and belongs to this RM
        if ((s === 'rejected' || s === 'deferral_rejected' || s === 'returned_for_rework') && isMine) {
          setActiveTab('rejected');
        }
        
        // Switch to approved tab if deferral is approved and belongs to this RM
        if ((s === 'approved' || s === 'deferral_approved') && isMine) {
          setActiveTab('approved');
        }
        
        // Switch to closed tab if deferral is closed/withdrawn and belongs to this RM
        if ((s === 'closed' || s === 'deferral_closed' || s === 'closed_by_co' || s === 'closed_by_creator' || s === 'withdrawn') && isMine) {
          setActiveTab('closed');
        }

      } catch (err) {
        console.warn('deferral:updated handler error', err);
      }
    };

    window.addEventListener('deferral:updated', handler);
    return () => window.removeEventListener('deferral:updated', handler);
  }, []);

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
          <Tabs.TabPane tab={`Re-work Deferrals (${rejectedData.length})`} key="rejected" />
          <Tabs.TabPane tab={`Completed Deferrals (${closedData.length})`} key="closed" />
        </Tabs>
      </div>

      <Divider style={{ margin: "12px 0" }}>
        <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
          {activeTab === 'pending' ? `Pending Deferrals` : activeTab === 'approved' ? `Approved Deferrals` : activeTab === 'rejected' ? `Re-work Deferrals` : `Completed Deferrals`} ({currentData.length} items)
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