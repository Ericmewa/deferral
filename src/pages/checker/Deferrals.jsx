import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Tabs,
  Button,
  Divider,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Badge,
  Tooltip,
  Space,
  Modal,
  message,
  List,
  Avatar,
  Descriptions,
  Typography,
  Input as AntInput,
  Collapse,
  Alert
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  SendOutlined,
  MailOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  EyeOutlined,
  PaperClipOutlined,
  FileDoneOutlined,
  UploadOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  RightOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { jsPDF } from 'jspdf';
import deferralApi from '../../service/deferralApi.js';
import { openFileInNewTab, downloadFile } from '../../utils/fileUtils.js';
import getFacilityColumns from '../../utils/facilityColumns.js';
import CheckerExtensionTab from '../../components/CheckerExtensionTab';
import { useGetCheckerPendingExtensionsQuery, useApproveExtensionAsCheckerMutation, useRejectExtensionAsCheckerMutation } from '../../api/extensionApi';

// Extend dayjs
dayjs.extend(relativeTime);

// Theme Colors
const PRIMARY_BLUE = "#164679";
const ACCENT_LIME = "#b5d334";
const HIGHLIGHT_GOLD = "#fcb116";
const LIGHT_YELLOW = "#fcd716";
const SECONDARY_PURPLE = "#7e6496";
const SUCCESS_GREEN = "#52c41a";
const ERROR_RED = "#ff4d4f";
const WARNING_ORANGE = "#faad14";

// Custom CSS for deferral modal styling (matches CO design)
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
 
  .approved-status {
    background-color: ${SUCCESS_GREEN}15 !important;
    border: 1px solid ${SUCCESS_GREEN}40 !important;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 16px;
  }
 
  .approved-badge {
    background-color: ${SUCCESS_GREEN} !important;
    border-color: ${SUCCESS_GREEN} !important;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
 
  .rejected-badge {
    background-color: ${ERROR_RED} !important;
    border-color: ${ERROR_RED} !important;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ant-modal-footer .ant-btn { border-radius: 8px; font-weight: 600; height: 38px; padding: 0 16px; }
  .ant-modal-footer .ant-btn-primary { background-color: ${PRIMARY_BLUE} !important; border-color: ${PRIMARY_BLUE} !important; }
`;

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;
const { TextArea } = AntInput;
const { Panel } = Collapse;

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
              All approvers, Creator, and Checker have approved this deferral request.
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
              Deferral Closed
            </h3>
            <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
              This deferral has been closed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const Deferrals = ({ userId }) => {
  // Get token from Redux
  const token = useSelector(state => state.auth.token);
  
  // State Management
  const [selectedDeferral, setSelectedDeferral] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalConfirmModalVisible, setApprovalConfirmModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    search: '',
    dateRange: null
  });

  // Local copy so we can update UI and persist history without relying on parent props
  const [localDeferral, setLocalDeferral] = useState(null);
  useEffect(() => { setLocalDeferral(selectedDeferral); }, [selectedDeferral]);
  const [loading, setLoading] = useState(false);
 
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [creatorComment, setCreatorComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  // Reject and rework confirmation modals
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [showReworkConfirm, setShowReworkConfirm] = useState(false);
  const [reworkComment, setReworkComment] = useState("");
  const [returnReworkLoading, setReturnReworkLoading] = useState(false);

  // Extension state and hooks
  const { data: pendingExtensions = [], isLoading: extensionsLoading, refetch: refetchExtensions } = useGetCheckerPendingExtensionsQuery();
  const [approveExtension, { isLoading: approvingExtension }] = useApproveExtensionAsCheckerMutation();
  const [rejectExtension, { isLoading: rejectingExtension }] = useRejectExtensionAsCheckerMutation();
  const [approvingExtensionId, setApprovingExtensionId] = useState(null);
  const [rejectingExtensionId, setRejectingExtensionId] = useState(null);

  // Fetch deferrals from API
  const fetchDeferrals = async () => {
    setLoading(true);
    try {
      // Use getPendingDeferrals to get ALL pending deferrals for all CO creators,
      // then combine with other statuses from getMyDeferrals for a complete view
      const pending = await deferralApi.getPendingDeferrals(token);
      const all = Array.isArray(pending) ? pending : [];
      
      // For approved/rejected/closed, get the current user's deferrals
      const my = await deferralApi.getMyDeferrals(token);
      const myDeferrals = Array.isArray(my) ? my : [];
      
      // Combine: all pending deferrals + this creator's approved/rejected/closed
      const approved = myDeferrals.filter(d => ['approved', 'deferral_approved'].includes((d.status || '').toLowerCase()));
      const rejected = myDeferrals.filter(d => ['rejected', 'deferral_rejected'].includes((d.status || '').toLowerCase()));
      const closed = myDeferrals.filter(d => ['closed', 'deferral_closed', 'closed_by_co', 'closed_by_creator'].includes((d.status || '').toLowerCase()));
      
      const combined = [...all, ...approved, ...rejected, ...closed];
      
      if (!Array.isArray(combined)) return [];
      console.debug('loadDeferrals (creator)', { pending: pending.length, approved: approved.length, rejected: rejected.length, closed: closed.length, total: combined.length });
      return combined;
    } catch (error) {
      console.error("Error fetching deferrals:", error);
      message.error('Failed to load deferrals');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // State for deferrals
  const [deferrals, setDeferrals] = useState([]);
  const [filteredDeferrals, setFilteredDeferrals] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const a = q.get('active');
      if (a === 'approved' || a === 'pending' || a === 'completed') return a;
    } catch (e) {}
    return 'pending';
  });

  // Initialize
  useEffect(() => {
    loadDeferrals();

    const handler = (e) => {
      try {
        const updated = e && e.detail ? e.detail : null;
        if (!updated || !updated._id) return;

        setDeferrals(prev => {
          const exists = prev.some(d => String(d._id) === String(updated._id));
          if (exists) {
            // Deferral already exists, update it
            return prev.map(d => d._id === updated._id ? { ...d, ...updated } : d);
          }
          
          // Check if this is a deferral that's now approved by creator (should appear in checker's pending list)
          const hasCreatorApproved = updated.creatorApprovalStatus === 'approved';
          const hasCheckerApproved = updated.checkerApprovalStatus === 'approved';
          
          // If creator approved but checker hasn't, add it to the list
          if (hasCreatorApproved && !hasCheckerApproved) {
            return [updated, ...prev];
          }
          
          return prev;
        });

        // Also update selectedDeferral if this is the deferral being viewed in the modal
        if (selectedDeferral && String(selectedDeferral._id) === String(updated._id)) {
          setSelectedDeferral(prev => ({ ...prev, ...updated }));
        }

        const s = (updated.status || '').toLowerCase();
        const hasCreatorApproved = updated.creatorApprovalStatus === 'approved';
        const hasCheckerApproved = updated.checkerApprovalStatus === 'approved';
        
        // If fully approved by both, switch to approved tab
        if (hasCreatorApproved && hasCheckerApproved) {
          setActiveTab('approved');
        }

      } catch (err) {
        console.warn('deferral:updated handler error', err);
      }
    };

    window.addEventListener('deferral:updated', handler);
    return () => {
      window.removeEventListener('deferral:updated', handler);
    };
  }, [userId]);

  useEffect(() => {
    if (!selectedDeferral || !modalVisible) return;
    let cancelled = false;
    const fetchLatest = async () => {
      try {
        const fresh = await deferralApi.getDeferralById(selectedDeferral._id, token);
        if (!cancelled && fresh) setSelectedDeferral(fresh);
      } catch (err) {
        console.debug('deferral refresh failed', err?.message || err);
      }
    };
    fetchLatest();
    const t = setInterval(fetchLatest, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [selectedDeferral?._id, modalVisible]);

  const loadDeferrals = async () => {
    console.log('Loading deferrals for CO dashboard...');
    const data = await fetchDeferrals();
    setDeferrals(data);
    const pending = data.filter(d => ['pending_approval', 'in_review'].includes(d.status));
    setFilteredDeferrals(pending);
  };

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [deferrals, filters, activeTab]);

  const applyFilters = () => {
    const approvedStatusesForChecker = ['approved', 'deferral_approved'];
    const completedStatuses = ['closed', 'deferral_closed', 'closed_by_co', 'closed_by_creator'];

    let base = deferrals.filter(d => {
      const s = (d.status || '').toString().toLowerCase();
      
      if (activeTab === 'pending') {
        // PENDING tab: Show only deferrals that are approved by CO Creator but NOT yet approved by Checker
        const hasCreatorApproved = d.creatorApprovalStatus === 'approved';
        const hasCheckerApproved = d.checkerApprovalStatus === 'approved';
        
        // Only show if creator has approved AND checker has NOT approved
        return hasCreatorApproved && !hasCheckerApproved;
      }
      
      if (activeTab === 'approved') {
        // APPROVED tab: Show ONLY fully approved deferrals
        const hasCreatorApproved = d.creatorApprovalStatus === 'approved';
        const hasCheckerApproved = d.checkerApprovalStatus === 'approved';
        
        // Only show if both creator and checker have approved
        return hasCreatorApproved && hasCheckerApproved;
      }
      
      if (activeTab === 'completed') return completedStatuses.includes(s);
      return true;
    });

    if (filters.priority !== 'all') {
      base = base.filter(d => d.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      base = base.filter(d =>
        (d.customerNumber||'').toLowerCase().includes(searchLower) ||
        (d.dclNo||d.dclNumber||'').toLowerCase().includes(searchLower) ||
        (d.customerName||'').toLowerCase().includes(searchLower) ||
        (d.deferralNumber||'').toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      base = base.filter(d => {
        const createdDate = dayjs(d.createdAt);
        return createdDate.isAfter(filters.dateRange[0]) &&
               createdDate.isBefore(filters.dateRange[1]);
      });
    }

    setFilteredDeferrals(base);
  };

  // Check if deferral can be approved (all approvers must have approved)


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

  // Handle Approve Deferral - Show confirmation modal
  const handleApproveDeferral = async () => {
    if (!selectedDeferral) {
      message.error("No deferral selected");
      return;
    }

    // Show confirmation modal
    setApprovalConfirmModalVisible(true);
  };

  // Handle confirmation of approval
  const handleConfirmApproval = async () => {
    if (!selectedDeferral) {
      message.error("No deferral selected");
      return;
    }

    setActionLoading(true);
    try {
      const hasCheckerApproved = selectedDeferral.checkerApprovalStatus === 'approved';
      
      // On the checker page, we approve as checker
      if (hasCheckerApproved) {
        message.warning("This deferral has already been approved by the checker");
        setActionLoading(false);
        return;
      }

      // Call the checker approval API
      console.log('Calling approveByChecker API for deferral:', selectedDeferral._id);
      const response = await deferralApi.approveByChecker(selectedDeferral._id, {
        comment: creatorComment
      }, token);
      
      console.log('Approval response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // The response should contain the updated deferral in deferral property
      const updatedDeferral = response?.deferral || response;
      
      console.log('Updated deferral:', updatedDeferral);
      console.log('Updated deferral approval statuses:', {
        creatorApprovalStatus: updatedDeferral?.creatorApprovalStatus,
        checkerApprovalStatus: updatedDeferral?.checkerApprovalStatus,
        status: updatedDeferral?.status
      });
      
      if (updatedDeferral && updatedDeferral._id) {
        message.success("Deferral approved successfully!");
        
        // Update local state with the new deferral
        const updatedDeferrals = deferrals.map(d => 
          d._id === updatedDeferral._id ? updatedDeferral : d
        );
        console.log('Setting deferrals state, new length:', updatedDeferrals.length);
        
        setDeferrals(updatedDeferrals);
        setSelectedDeferral(updatedDeferral);
        setCreatorComment("");
        
        // Close the confirmation modal
        setApprovalConfirmModalVisible(false);
        
        // Close the main modal and refresh deferrals
        setTimeout(() => {
          setModalVisible(false);
          setSelectedDeferral(null);
          // Refresh deferrals to ensure filters are applied correctly
          console.log('Calling loadDeferrals after approval');
          loadDeferrals();
        }, 500);
        
        // Dispatch event for real-time updates
        try {
          console.log('Dispatching deferral:updated event');
          window.dispatchEvent(new CustomEvent('deferral:updated', { 
            detail: updatedDeferral 
          }));
        } catch(e) { console.error('Error dispatching event:', e); }
      } else {
        throw new Error("Invalid response from server - no deferral data returned");
      }
    } catch (error) {
      console.error('Error approving deferral:', error);
      message.error(error?.message || error?.toString() || "Failed to approve deferral");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDeferral = () => {
    setRejectComment('');
    setShowRejectConfirm(true);
  };

  const doReject = async () => {
    if (!rejectComment || rejectComment.trim() === '') {
      message.error('Please provide a rejection reason');
      return;
    }
    
    setRejecting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.user?._id;
      const userName = currentUser.name || currentUser.user?.name || currentUser.email;
      const userRole = currentUser.role || currentUser.user?.role;
      
      // Determine which rejection action to take based on user role
      const isCreator = userRole === 'creator' || 
        (selectedDeferral.creator &&
         (selectedDeferral.creator._id?.toString() === userId || selectedDeferral.creator?.toString() === userId));
      
      const isChecker = userRole === 'checker' ||
        (selectedDeferral.checker &&
         (selectedDeferral.checker._id?.toString() === userId || selectedDeferral.checker?.toString() === userId));
      
      let response;
      
      if (isCreator || userRole === 'creator') {
        response = await deferralApi.rejectByCreator(selectedDeferral._id, {
          comment: rejectComment,
          rejectedBy: userId,
          rejectedByName: userName,
          status: 'rejected'
        }, token);
      } else if (isChecker || userRole === 'checker') {
        response = await deferralApi.rejectByChecker(selectedDeferral._id, {
          comment: rejectComment,
          rejectedBy: userId,
          rejectedByName: userName,
          status: 'rejected'
        }, token);
      } else {
        response = await deferralApi.rejectDeferral(selectedDeferral._id, {
          comment: rejectComment,
          rejectedBy: userId,
          rejectedByName: userName,
          status: 'rejected'
        }, token);
      }

      if (response && response.success) {
        message.success("Deferral rejected successfully!");
        
        // Email notification to RM
        try {
          await deferralApi.sendEmailNotification(selectedDeferral._id, 'rejected_to_rm', {
            comment: rejectComment,
            userName: userName,
            rejectedBy: isCreator || userRole === 'creator' ? 'Creator' : isChecker || userRole === 'checker' ? 'Checker' : 'Approver'
          });
        } catch (emailErr) {
          console.warn("Failed to send email notification:", emailErr);
        }
        
        // Update local state - move to rejected list
        const updatedDeferrals = deferrals.map(d =>
          d._id === selectedDeferral._id ? { ...d, ...response.deferral } : d
        );
        setDeferrals(updatedDeferrals);
        
        setModalVisible(false);
        setSelectedDeferral(null);
        setShowRejectConfirm(false);
        
        // Set active tab to rejected
        setActiveTab('rejected');
        
        // Load deferrals to refresh lists
        loadDeferrals();
        
        // Dispatch event for other components
        try {
          window.dispatchEvent(new CustomEvent('deferral:updated', {
            detail: response.deferral
          }));
        } catch(e) { /* ignore */ }
      } else {
        throw new Error(response?.message || "Failed to reject deferral");
      }
    } catch (error) {
      console.error("Error rejecting deferral:", error);
      message.error(error.message || "Failed to reject deferral");
    } finally {
      setRejecting(false);
    }
  };

  // Extension handlers
  const handleApproveExtension = async (extensionId, comment) => {
    setApprovingExtensionId(extensionId);
    try {
      await approveExtension({ id: extensionId, comment }).unwrap();
      message.success("Extension approved successfully - Deferral days updated");
      refetchExtensions();
    } catch (error) {
      message.error(error?.data?.message || "Failed to approve extension");
    } finally {
      setApprovingExtensionId(null);
    }
  };

  const handleRejectExtension = async (extensionId, reason) => {
    setRejectingExtensionId(extensionId);
    try {
      await rejectExtension({ id: extensionId, reason }).unwrap();
      message.success("Extension rejected successfully");
      refetchExtensions();
    } catch (error) {
      message.error(error?.data?.message || "Failed to reject extension");
    } finally {
      setRejectingExtensionId(null);
    }
  };

  const handleReturnForRework = () => {
    setReworkComment('');
    setShowReworkConfirm(true);
  };

  const doReturnForRework = async () => {
    if (!reworkComment || reworkComment.trim() === '') {
      message.error('Please provide rework instructions');
      return;
    }
    
    setReturnReworkLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.user?._id;
      const userName = currentUser.name || currentUser.user?.name || currentUser.email;
      const userRole = currentUser.role || currentUser.user?.role;
      
      // Determine who is returning for rework based on user role
      const isCreator = userRole === 'creator' ||
        (selectedDeferral.creator &&
         (selectedDeferral.creator._id?.toString() === userId || selectedDeferral.creator?.toString() === userId));
      
      const isChecker = userRole === 'checker' ||
        (selectedDeferral.checker &&
         (selectedDeferral.checker._id?.toString() === userId || selectedDeferral.checker?.toString() === userId));
      
      let response;
      
      if (isCreator || userRole === 'creator') {
        response = await deferralApi.returnForReworkByCreator(selectedDeferral._id, {
          comment: reworkComment,
          returnedBy: userId,
          returnedByName: userName,
          returnedByRole: "Creator"
        }, token);
      } else if (isChecker || userRole === 'checker') {
        response = await deferralApi.returnForReworkByChecker(selectedDeferral._id, {
          comment: reworkComment,
          returnedBy: userId,
          returnedByName: userName,
          returnedByRole: "Checker"
        }, token);
      } else {
        response = await deferralApi.returnForRework(selectedDeferral._id, {
          comment: reworkComment,
          returnedBy: userId,
          returnedByName: userName,
          returnedByRole: "Approver"
        }, token);
      }

      if (response && response.success) {
        message.success("Deferral returned for rework successfully! Relationship Manager has been notified.");
        
        // Email notification to RM
        try {
          await deferralApi.sendEmailNotification(selectedDeferral._id, 'returned_for_rework_to_rm', {
            comment: reworkComment,
            userName: userName,
            returnedBy: isCreator || userRole === 'creator' ? 'Creator' : isChecker || userRole === 'checker' ? 'Checker' : 'Approver'
          });
        } catch (emailErr) {
          console.warn("Failed to send email notification:", emailErr);
        }

        // Update local state
        const updatedDeferrals = deferrals.map(d =>
          d._id === selectedDeferral._id ? { ...d, ...response.deferral } : d
        );
        setDeferrals(updatedDeferrals);
        
        setModalVisible(false);
        setSelectedDeferral(null);
        setShowReworkConfirm(false);
        
        // Set active tab to returned
        setActiveTab('returned');
        
        // Load deferrals to refresh lists
        loadDeferrals();
        
        // Dispatch event for other components
        try {
          window.dispatchEvent(new CustomEvent('deferral:updated', {
            detail: response.deferral
          }));
        } catch(e) { /* ignore */ }
      } else {
        throw new Error(response?.message || "Failed to return deferral for rework");
      }
    } catch (error) {
      console.error("Error returning deferral for rework:", error);
      message.error(error.message || "Failed to return deferral for rework");
    } finally {
      setReturnReworkLoading(false);
    }
  };

  const handleCloseDeferral = async () => {
    if (!selectedDeferral || !selectedDeferral._id) {
      message.error('No deferral selected');
      return;
    }

    setActionLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.user?._id;
      const userName = currentUser.name || currentUser.user?.name || currentUser.email;
     
      const response = await deferralApi.closeDeferral(selectedDeferral._id, {
        closedBy: userId,
        closedByName: userName,
        comment: creatorComment || "Deferral closed by CO"
      }, token);

      if (response && response.success) {
        // Email notification to all parties
        try {
          await deferralApi.sendEmailNotification(selectedDeferral._id, 'closed_to_all_parties', {
            comment: creatorComment || "Deferral closed by CO",
            userName: userName
          });
        } catch (emailErr) {
          console.warn("Failed to send email notification:", emailErr);
        }

        const updatedDeferrals = deferrals.map(d =>
          d._id === selectedDeferral._id ? { ...d, ...response.deferral } : d
        );
        setDeferrals(updatedDeferrals);
        message.success('Deferral closed successfully!');

        setModalVisible(false);
        setSelectedDeferral(null);
        setCreatorComment("");

        try {
          window.dispatchEvent(new CustomEvent('deferral:updated', {
            detail: response.deferral
          }));
        } catch(e) { /* ignore */ }
      } else {
        throw new Error(response?.message || "Failed to close deferral");
      }
    } catch (error) {
      console.error('Error closing deferral:', error);
      message.error('Failed to close deferral');
    } finally {
      setActionLoading(false);
    }
  };

  // Download deferral as PDF - Fixed version
  const downloadDeferralAsPDF = async () => {
    if (!selectedDeferral || !selectedDeferral._id) {
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
      
      const hasCreatorApproved = selectedDeferral.creatorApprovalStatus === 'approved';
      const hasCheckerApproved = selectedDeferral.checkerApprovalStatus === 'approved';
      const allApproversApproved = selectedDeferral.allApproversApproved === true;
      const isFullyApproved = hasCreatorApproved && hasCheckerApproved && allApproversApproved;
      
      const basicInfo = [
        { label: 'Deferral Number:', value: selectedDeferral.deferralNumber || 'N/A' },
        { label: 'Customer Name:', value: selectedDeferral.customerName || 'N/A' },
        { label: 'Customer Number:', value: selectedDeferral.customerNumber || 'N/A' },
        { label: 'DCL No:', value: selectedDeferral.dclNo || selectedDeferral.dclNumber || 'N/A' },
        { label: 'Status:', value: isFullyApproved ? 'Fully Approved' : (selectedDeferral.status || 'Pending') },
        { label: 'Created At:', value: dayjs(selectedDeferral.createdAt).format('DD MMM YYYY HH:mm') }
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
      
      const loanAmount = Number(selectedDeferral.loanAmount || 0);
      const formattedLoanAmount = loanAmount ? `KSh ${loanAmount.toLocaleString()}` : 'Not specified';
      
      const loanInfo = [
        { label: 'Loan Type:', value: selectedDeferral.loanType || 'N/A' },
        { label: 'Loan Amount:', value: formattedLoanAmount },
        { label: 'Days Sought:', value: `${selectedDeferral.daysSought || 0} days` },
        { label: 'Next Due Date:', value: selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate ? dayjs(selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate).format('DD MMM YYYY') : 'Not calculated' },
        { label: 'SLA Expiry:', value: selectedDeferral.slaExpiry ? dayjs(selectedDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set' }
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
      
      // Approval Status Section
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('APPROVAL STATUS', margin, yPosition);
      yPosition += 7;
      
      doc.setDrawColor(22, 70, 121);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;
      
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      const approvalInfo = [
        { label: 'Creator Status:', value: `${selectedDeferral.creatorApprovalStatus || 'pending'} ${selectedDeferral.creatorApprovalDate ? `(${dayjs(selectedDeferral.creatorApprovalDate).format('DD MMM YYYY HH:mm')})` : ''}` },
        { label: 'Checker Status:', value: `${selectedDeferral.checkerApprovalStatus || 'pending'} ${selectedDeferral.checkerApprovalDate ? `(${dayjs(selectedDeferral.checkerApprovalDate).format('DD MMM YYYY HH:mm')})` : ''}` }
      ];
      
      approvalInfo.forEach(item => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(item.label, margin, yPosition);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(item.value, contentWidth - 60);
        doc.text(lines, margin + 50, yPosition);
        yPosition += 7;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      yPosition += 5;
      
      // Facilities Section
      if (selectedDeferral.facilities && selectedDeferral.facilities.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('FACILITIES', margin, yPosition);
        yPosition += 7;
        
        doc.setDrawColor(22, 70, 121);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        selectedDeferral.facilities.forEach(facility => {
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
      if (selectedDeferral.deferralDescription) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('DEFERRAL DESCRIPTION', margin, yPosition);
        yPosition += 7;
        
        doc.setDrawColor(22, 70, 121);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFont(undefined, 'normal');
        const descLines = doc.splitTextToSize(selectedDeferral.deferralDescription, contentWidth);
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
      doc.save(`Deferral_${selectedDeferral.deferralNumber}_${dayjs().format('YYYYMMDD')}.pdf`);
      message.success('Deferral downloaded as PDF successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download deferral. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Export functionality
  const exportDeferrals = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Deferral No,Customer No,Customer Name,DCL No,Document,Loan Type,Expiry Date,RM,Priority,Days Remaining\n" +
      filteredDeferrals.map(d =>
        `${d.deferralNumber},${d.customerNumber},"${d.customerName}",${d.dclNo},"${d.documentName}",${d.loanType},${dayjs(d.expiryDate).format('DD/MM/YYYY')},${d.assignedRM?.name || 'N/A'},${d.priority},${d.daysRemaining}`
      ).join("\n");
   
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pending_deferrals_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   
    message.success("Deferrals exported successfully!");
  };

  // Custom table styles
  const customTableStyles = `
    .deferrals-table .ant-table-wrapper {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 70, 121, 0.08);
      border: 1px solid #e0e0e0;
    }
    .deferrals-table .ant-table-thead > tr > th {
      background-color: #f7f7f7 !important;
      color: ${PRIMARY_BLUE} !important;
      font-weight: 700;
      fontSize: 15px;
      padding: 16px 16px !important;
      border-bottom: 3px solid ${ACCENT_LIME} !important;
      border-right: none !important;
    }
    .deferrals-table .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f0f0f0 !important;
      border-right: none !important;
      padding: 14px 16px !important;
      fontSize: 14px;
      color: #333;
    }
    .deferrals-table .ant-table-tbody > tr.ant-table-row:hover > td {
      background-color: rgba(181, 211, 52, 0.1) !important;
      cursor: pointer;
    }
    .deferrals-table .ant-table-bordered .ant-table-container,
    .deferrals-table .ant-table-bordered .ant-table-tbody > tr > td,
    .deferrals-table .ant-table-bordered .ant-table-thead > tr > th {
      border: none !important;
    }
    .deferrals-table .ant-pagination .ant-pagination-item-active {
      background-color: ${ACCENT_LIME} !important;
      border-color: ${ACCENT_LIME} !important;
    }
    .deferrals-table .ant-pagination .ant-pagination-item-active a {
      color: ${PRIMARY_BLUE} !important;
      font-weight: 600;
    }
    .deferrals-table .ant-pagination .ant-pagination-item:hover {
      border-color: ${ACCENT_LIME} !important;
    }
    .deferrals-table .ant-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
    .deferrals-table .ant-pagination .ant-pagination-next:hover .ant-pagination-item-link {
      color: ${ACCENT_LIME} !important;
    }
    .deferrals-table .ant-pagination .ant-pagination-options .ant-select-selector {
      border-radius: 8px !important;
    }
  `;

  // Columns arranged to match RM's layout
  const columns = [
    {
      title: 'Deferral No',
      dataIndex: 'deferralNumber',
      width: 150,
      render: (text) => <div style={{ fontWeight: 700, color: PRIMARY_BLUE }}>{text}</div>
    },
    {
      title: 'DCL No',
      dataIndex: 'dclNo',
      width: 140,
      render: (text, record) => {
        const value = record.dclNo || record.dclNumber;
        return value ? (
          <div style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>{value}</div>
        ) : (
          <Tag color="warning" style={{ fontWeight: 700 }}>Missing DCL</Tag>
        );
      }
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      width: 220,
      render: (text) => (
        <div style={{ fontWeight: 600, color: PRIMARY_BLUE }}>{text}</div>
      )
    },
    {
      title: 'Loan Type',
      dataIndex: 'loanType',
      width: 120,
      render: (t) => <div style={{ color: '#666' }}>{t || '—'}</div>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status, record) => {
        const hasCreatorApproved = record.creatorApprovalStatus === 'approved';
        const hasCheckerApproved = record.checkerApprovalStatus === 'approved';
        const allApproversApproved = record.allApproversApproved === true;
       
        const isFullyApproved = hasCreatorApproved && hasCheckerApproved && allApproversApproved;
        const isPartiallyApproved = (hasCreatorApproved || hasCheckerApproved || allApproversApproved) && !isFullyApproved;
       
        const isRejected = status === 'rejected' || status === 'deferral_rejected';
        const isReturned = ['returned_for_rework', 'returned_by_creator', 'returned_by_checker'].includes(status);
       
        if (isFullyApproved) {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              style={{
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: `${SUCCESS_GREEN}15`,
                borderColor: SUCCESS_GREEN,
                color: SUCCESS_GREEN
              }}
            >
              Approved
            </Tag>
          );
        }
       
        if (isPartiallyApproved) {
          return (
            <Tag
              icon={<LoadingOutlined />}
              color="processing"
              style={{
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Pending
            </Tag>
          );
        }
       
        if (isRejected) {
          return (
            <Tag
              icon={<CloseCircleOutlined />}
              color="error"
              style={{
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: `${ERROR_RED}15`,
                borderColor: ERROR_RED,
                color: ERROR_RED
              }}
            >
              Rejected
            </Tag>
          );
        }

        if (isReturned) {
          return (
            <Tag
              icon={<ReloadOutlined />}
              color="warning"
              style={{
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: `${WARNING_ORANGE}15`,
                borderColor: WARNING_ORANGE,
                color: WARNING_ORANGE
              }}
            >
              Returned
            </Tag>
          );
        }
       
        let tagColor = 'processing';
        let tagText = 'Pending';
        if (status === 'in_review') {
          tagColor = 'processing';
          tagText = 'In Review';
        }
        return <Tag color={tagColor} style={{ fontWeight: 700 }}>{tagText}</Tag>;
      }
    },
    {
      title: 'Days Sought',
      dataIndex: 'daysSought',
      width: 110,
      render: (d) => <div style={{ fontWeight: 700 }}>{d || 0} days</div>
    },
    {
      title: 'SLA',
      dataIndex: 'slaExpiry',
      width: 160,
      render: (s) => s ? <div style={{ color: (dayjs(s).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE) }}>{dayjs(s).format('DD MMM YYYY HH:mm')}</div> : <div style={{ color: '#999' }}>Not set</div>
    }
  ];

  // Filter component
  const renderFilters = () => (
    <Card
      style={{
        marginBottom: 16,
        background: "#fafafa",
        border: `1px solid ${PRIMARY_BLUE}20`
      }}
      size="small"
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search by DCL No, Deferral No, Customer Name or Number..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            allowClear
          />
        </Col>
       
        <Col xs={24} sm={12} md={8}>
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date']}
            value={filters.dateRange}
            onChange={(dates) => setFilters({...filters, dateRange: dates})}
            format="DD/MM/YYYY"
          />
        </Col>
       
        <Col xs={24} sm={12} md={2}>
          <Button
            onClick={() => setFilters({
              priority: 'all',
              search: '',
              dateRange: null
            })}
            style={{ width: '100%' }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Handle row click to open modal
  const handleRowClick = (record) => {
    setSelectedDeferral(record);
    setModalVisible(true);
  };

  // Determine modal footer buttons based on deferral status
  const getModalFooter = () => {
    if (!selectedDeferral) return null;
   
    const hasCreatorApproved = selectedDeferral.creatorApprovalStatus === 'approved';
    const hasCheckerApproved = selectedDeferral.checkerApprovalStatus === 'approved';
    const allApproversApproved = selectedDeferral.allApproversApproved === true;
    const isFullyApproved = hasCreatorApproved && hasCheckerApproved && allApproversApproved;
    const isRejected = selectedDeferral.status === 'rejected' || selectedDeferral.status === 'deferral_rejected';
    const isReturned = ['returned_for_rework', 'returned_by_creator', 'returned_by_checker'].includes(selectedDeferral.status);
    const isClosed = ['closed', 'deferral_closed', 'closed_by_co', 'closed_by_creator'].includes(selectedDeferral.status);
   
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser._id || currentUser.user?._id;
    const userRole = currentUser.role || currentUser.user?.role;
    
    const isCreator = selectedDeferral.creator &&
      (selectedDeferral.creator._id === userId || selectedDeferral.creator === userId);
    const isChecker = selectedDeferral.checker &&
      (selectedDeferral.checker._id === userId || selectedDeferral.checker === userId);
    
    // On Checker page, assume user is checker if checker field not set (old deferrals)
    // Or if user has checker role and checker field is set, they're the checker
    const effectiveIsCreator = isCreator;
    const effectiveIsChecker = isChecker || (!selectedDeferral.checker && userRole === 'checker');
   
    // Fully Approved deferrals (Approved tab)
    if (isFullyApproved) {
      return [
        <Button
          key="close"
          onClick={() => {
            setModalVisible(false);
            setSelectedDeferral(null);
            setCreatorComment("");
          }}
        >
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={downloadDeferralAsPDF}
          loading={actionLoading}
          icon={<DownloadOutlined />}
          style={{ marginLeft: 'auto' }}
        >
          Download Deferral as PDF
        </Button>
      ];
    }
   
    // Rejected deferrals
    if (isRejected) {
      return [
        <Button
          key="close"
          onClick={() => {
            setModalVisible(false);
            setSelectedDeferral(null);
            setCreatorComment("");
          }}
        >
          Close
        </Button>
      ];
    }
   
    // Returned or Closed deferrals
    if (isReturned || isClosed) {
      return [
        <Button
          key="close"
          onClick={() => {
            setModalVisible(false);
            setSelectedDeferral(null);
            setCreatorComment("");
          }}
        >
          Close
        </Button>,
        <Button
          key="download"
          type="default"
          onClick={downloadDeferralAsPDF}
          loading={actionLoading}
          icon={<DownloadOutlined />}
        >
          Download
        </Button>
      ];
    }
   
    // Pending deferrals (In Review) - Enable approve button based on user role and approval status
    // Creator can approve when all approvers have approved
    // Checker can approve when all approvers AND creator have approved
    let canApprove = false;
    if (effectiveIsCreator && allApproversApproved && !hasCreatorApproved) {
      canApprove = true; // Creator can approve once all approvers approve
    } else if (effectiveIsChecker && allApproversApproved && hasCreatorApproved && !hasCheckerApproved) {
      canApprove = true; // Checker can approve once all approvers and creator approve
    }
   
    return [
      // DOWNLOAD — ALWAYS FAR LEFT & ACTIVE
      <Button
        key="download"
        type="default"
        onClick={downloadDeferralAsPDF}
        icon={<DownloadOutlined />}
        style={{ marginRight: 'auto' }}
      >
        Download
      </Button>,

      // RETURN FOR REWORK — NEVER GREYED
      <Button
        key="return_for_rework"
        danger
        onClick={handleReturnForRework}
        icon={<ReloadOutlined />}
      >
        Return for Re-work
      </Button>,

      // REJECT — NEVER GREYED
      <Button
        key="reject"
        danger
        onClick={handleRejectDeferral}
      >
        Reject Deferral
      </Button>,

      // APPROVE — BUTTON WITH WHITE TEXT
      <Button
        key="approve"
        type="primary"
        onClick={handleApproveDeferral}
        style={{
          color: 'white'
        }}
      >
        Approve Deferral
      </Button>
    ];
  };

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
        styles={{ body: { padding: 16 } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
              Deferral Management Dashboard
              <Badge
                count={deferrals.length}
                style={{
                  backgroundColor: ACCENT_LIME,
                  fontSize: 12
                }}
              />
            </h2>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
              {activeTab === 'pending'
                ? 'Review and manage pending deferral requests from Relationship Managers'
                : activeTab === 'returned' ? 'View deferrals returned for re-work'
                : activeTab === 'approved' ? 'View fully approved deferral requests'
                : 'View closed deferrals'}
            </p>
          </Col>
         
          <Col>
            <Space>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadDeferrals}
                  loading={loading}
                />
              </Tooltip>
             
              <Tooltip title="Export Deferrals">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportDeferrals}
                  disabled={filteredDeferrals.length === 0}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      {renderFilters()}

      {/* Table Title + Tabs */}
      <Divider style={{ margin: "12px 0" }}>
        <span style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: 600 }}>
          Deferrals
        </span>
      </Divider>

      <div style={{ marginBottom: 12 }}>
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)}>
          <Tabs.TabPane tab={`Pending Deferrals (${deferrals.filter(d => {
            const hasCreatorApproved = d.creatorApprovalStatus === 'approved';
            const hasCheckerApproved = d.checkerApprovalStatus === 'approved';
            return hasCreatorApproved && !hasCheckerApproved;
          }).length})`} key="pending" />
          <Tabs.TabPane tab={`Approved Deferrals (${deferrals.filter(d => {
            const hasCreatorApproved = d.creatorApprovalStatus === 'approved';
            const hasCheckerApproved = d.checkerApprovalStatus === 'approved';
            return hasCreatorApproved && hasCheckerApproved;
          }).length})`} key="approved" />
          <Tabs.TabPane tab={`Completed Deferrals (${deferrals.filter(d => ['closed','deferral_closed','closed_by_co','closed_by_creator'].includes((d.status||'').toString().toLowerCase())).length})`} key="completed" />
          <Tabs.TabPane tab={`Extension Applications (${pendingExtensions.length})`} key="extensions" />
        </Tabs>
        <div style={{ marginTop: 8, fontWeight: 700, color: PRIMARY_BLUE }}>
          {activeTab === 'extensions' ? `Extension Applications (${pendingExtensions.length} items)`
            : activeTab === 'pending' ? `Pending Deferrals (${filteredDeferrals.length} items)`
            : activeTab === 'approved' ? `Approved Deferrals (${filteredDeferrals.length} items)`
            : `Completed Deferrals (${filteredDeferrals.length} items)`}
        </div>
      </div>

      {/* Extensions Tab */}
      {activeTab === 'extensions' && (
        <CheckerExtensionTab
          extensions={pendingExtensions}
          loading={extensionsLoading}
          onApprove={handleApproveExtension}
          onReject={handleRejectExtension}
          approvingId={approvingExtensionId}
          rejectingId={rejectingExtensionId}
        />
      )}

      {/* Deferrals Table */}
      {activeTab !== 'extensions' && (
        loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
            <Spin tip={`Loading ${activeTab} deferrals...`} />
          </div>
        ) : filteredDeferrals.length === 0 ? (
          <Empty
            description={
              <div>
                <p style={{ fontSize: 16, marginBottom: 8 }}>
                  {activeTab === 'pending' ? 'No pending deferrals found'
                    : activeTab === 'approved' ? 'No approved deferrals found'
                    : 'No completed deferrals found'}
                </p>
                <p style={{ color: "#999" }}>
                  {filters.search || filters.priority !== 'all'
                    ? 'Try changing your filters'
                    : (activeTab === 'pending' ? 'No deferrals approved by CO Creator awaiting your review'
                      : activeTab === 'approved' ? 'No fully approved deferrals yet'
                      : 'No deferrals have been completed')}
                </p>
              </div>
            }
            style={{ padding: 40 }}
          />
        ) : (
          <div className="deferrals-table">
            <Table
              columns={columns}
              dataSource={filteredDeferrals}
              rowKey={(record) => record._id || record.id}
              size="large"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                position: ["bottomCenter"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${activeTab} deferrals`
              }}
              rowClassName={(record, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-50")}
              scroll={{ x: 1300 }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        )
      )}

      {/* Deferral Review Modal */}
      <style>{customStyles}</style>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BankOutlined style={{ color: "white", fontSize: 22 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
                Deferral Request: {selectedDeferral?.deferralNumber}
              </div>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedDeferral(null);
          setCreatorComment("");
        }}
        width={1050}
        styles={{ body: { padding: '0 24px 24px' } }}
        footer={getModalFooter()}
      >
        {selectedDeferral && (() => {
          const hasCreatorApproved = selectedDeferral.creatorApprovalStatus === 'approved';
          const hasCheckerApproved = selectedDeferral.checkerApprovalStatus === 'approved';
          const allApproversApproved = selectedDeferral.allApproversApproved === true;
         
          const isFullyApproved = hasCreatorApproved && hasCheckerApproved && allApproversApproved;
          const isPartiallyApproved = (hasCreatorApproved || hasCheckerApproved || allApproversApproved) && !isFullyApproved;
         
          const isRejected = selectedDeferral.status === 'rejected' || selectedDeferral.status === 'deferral_rejected';
          const isReturned = ['returned_for_rework', 'returned_by_creator', 'returned_by_checker'].includes(selectedDeferral.status);
         
          const getFileIcon = (type) => {
            switch ((type||'').toString().toLowerCase()) {
              case 'pdf': return <FilePdfOutlined style={{ color: ERROR_RED }} />;
              case 'doc':
              case 'docx': return <FileWordOutlined style={{ color: PRIMARY_BLUE }} />;
              case 'xls':
              case 'xlsx':
              case 'csv': return <FileExcelOutlined style={{ color: SUCCESS_GREEN }} />;
              case 'jpg':
              case 'jpeg':
              case 'png': return <FileImageOutlined style={{ color: '#7e6496' }} />;
              default: return <FileTextOutlined />;
            }
          };

          const all = [];
          (selectedDeferral.attachments || []).forEach((att, i) => { const isDCL = att.name && /dcl/i.test(att.name); all.push({ id: att.id || `att_${i}`, name: att.name, type: (att.name||'').split('.').pop().toLowerCase(), url: att.url, isDCL, isUploaded: true, source: 'attachments', uploadDate: att.uploadDate, size: att.size }); });
          (selectedDeferral.additionalDocuments || []).forEach((f, i) => { all.push({ id: `add_${i}`, name: f.name, type: (f.name||'').split('.').pop().toLowerCase(), url: f.url, isAdditional: true, isUploaded: true, source: 'additionalDocuments', uploadDate: f.uploadDate, size: f.size }); });
          (selectedDeferral.selectedDocuments || []).forEach((d, i) => {
            const name = typeof d === 'string' ? d : d.name || d.label || 'Document';
            const subItems = [];
            if (d && typeof d === 'object') {
              if (Array.isArray(d.items) && d.items.length) subItems.push(...d.items);
              else if (Array.isArray(d.selected) && d.selected.length) subItems.push(...d.selected);
              else if (Array.isArray(d.subItems) && d.subItems.length) subItems.push(...d.subItems);
              else if (d.item) subItems.push(d.item);
              else if (d.selected) subItems.push(d.selected);
            }
            all.push({ id: `req_${i}`, name, type: d.type || '', subItems, isRequested: true, isSelected: true, source: 'selected' });
          });
          (selectedDeferral.documents || []).forEach((d, i) => { const name = (d.name || '').toString(); const dclNameMatch = /dcl/i.test(name) || (selectedDeferral.dclNo && name.toLowerCase().includes((selectedDeferral.dclNo||'').toLowerCase())); const isDCL = (typeof d.isDCL !== 'undefined' && d.isDCL) || dclNameMatch; const isAdditional = (typeof d.isAdditional !== 'undefined') ? d.isAdditional : !isDCL; all.push({ id: d._id || `doc_${i}`, name: d.name, type: d.type || (d.name ? d.name.split('.').pop().toLowerCase() : ''), url: d.url, isDocument: true, isUploaded: !!d.url, source: 'documents', isDCL, isAdditional, uploadDate: d.uploadDate || d.uploadedAt || null, size: d.size || null }); });

          const dclDocs = all.filter(a => a.isDCL);
          const uploadedDocs = all.filter(a => a.isUploaded && !a.isDCL);
          const requestedDocs = all.filter(a => a.isRequested || a.isSelected);

          // Process history to combine approval comments inline
          const history = [];
          const requesterName = selectedDeferral.requestor?.name || selectedDeferral.requestedBy || selectedDeferral.rmName || 'RM';
          const requesterRole = selectedDeferral.requestor?.role || 'RM';
          history.push({
            user: requesterName,
            userRole: requesterRole,
            date: selectedDeferral.requestedDate || selectedDeferral.createdAt,
            comment: selectedDeferral.rmReason || 'Deferral request submitted',
            type: 'request'
          });

          // Add RM's posted comments (if any)
          if (selectedDeferral.comments && Array.isArray(selectedDeferral.comments) && selectedDeferral.comments.length > 0) {
            selectedDeferral.comments.forEach(c => {
              const commentAuthorName = c.author?.name || 'RM';
              const commentAuthorRole = c.author?.role || 'RM';
              history.push({
                user: commentAuthorName,
                userRole: commentAuthorRole,
                date: c.createdAt,
                comment: c.text || '',
                type: 'comment'
              });
            });
          }
         
          if (selectedDeferral.history && Array.isArray(selectedDeferral.history) && selectedDeferral.history.length > 0) {
            selectedDeferral.history.forEach(h => {
              // Skip redundant 'moved' action entries
              if (h.action === 'moved') {
                return;
              }
              
              const comment = h.comment || h.notes || h.message || '';
              const isApprovalComment = h.action === 'approved' || comment.toLowerCase().includes('approved by');
              const isRejectionComment = h.action === 'rejected' || comment.toLowerCase().includes('rejected by');
              const isReturnComment = h.action === 'returned' || comment.toLowerCase().includes('returned for rework');
             
              let displayComment = comment;
              if (isApprovalComment) {
                const match = comment.match(/^Approved by [^:]+:\s*(.*)/i) || comment.match(/^Approved by [^:]+(.*)/i);
                if (match && match[1]) {
                  displayComment = match[1].trim();
                }
              }
             
              history.push({
                user: h.user?.name || h.userName || h.user || 'System',
                userRole: h.user?.role || h.userRole || h.role || 'System',
                date: h.date || h.createdAt || h.timestamp || h.entryDate,
                comment: displayComment,
                originalComment: comment,
                type: isApprovalComment ? 'approval' : isRejectionComment ? 'rejection' : isReturnComment ? 'return' : 'comment'
              });
            });
          }

          // Process approvers to show approved status with green tick
          const approvers = [];
          let allApproversApprovedLocal = true;
          let hasApprovers = false;
         
          if (selectedDeferral.approverFlow && Array.isArray(selectedDeferral.approverFlow)) {
            hasApprovers = true;
            selectedDeferral.approverFlow.forEach((approver, index) => {
              const isApproved = approver.approved || approver.approved === true;
              const isRejected = approver.rejected || approver.rejected === true;
              const isReturned = approver.returned || approver.returned === true;
              const isCurrent = !isApproved && !isRejected && !isReturned &&
                (index === selectedDeferral.currentApproverIndex ||
                 selectedDeferral.currentApprover === approver ||
                 selectedDeferral.currentApprover?._id === approver?._id);
             
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
          } else if (selectedDeferral.approvers && Array.isArray(selectedDeferral.approvers)) {
            hasApprovers = true;
            selectedDeferral.approvers.forEach((approver, index) => {
              const isApproved = approver.approved || approver.approved === true;
              const isRejected = approver.rejected || approver.rejected === true;
              const isReturned = approver.returned || approver.returned === true;
              const isCurrent = !isApproved && !isRejected && !isReturned &&
                (index === selectedDeferral.currentApproverIndex ||
                 selectedDeferral.currentApprover === approver ||
                 selectedDeferral.currentApprover?._id === approver?._id);
             
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

          history.sort((a,b) => (new Date(a.date||0)) - (new Date(b.date||0)));

          return (
            <div style={{ padding: "16px 0" }}>
              {/* Show Fully Approved Banner */}
              {isFullyApproved && (
                <div className="approved-status" style={{
                  backgroundColor: `${SUCCESS_GREEN}15`,
                  borderColor: `${SUCCESS_GREEN}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: SUCCESS_GREEN, fontSize: 24 }} />
                    <div>
                      <h3 style={{ margin: 0, color: SUCCESS_GREEN, fontWeight: 700 }}>
                        Deferral Fully Approved ✓
                      </h3>
                      <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
                        This deferral has been approved by all parties: Approvers, Creator, and Checker
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Creator: </span>
                      <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>
                        {selectedDeferral.creatorApprovalStatus === 'approved' ? 'Approved' : 'Pending'}
                        {selectedDeferral.creatorApprovalDate && ` • ${dayjs(selectedDeferral.creatorApprovalDate).format('DD MMM YYYY HH:mm')}`}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Checker: </span>
                      <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>
                        {selectedDeferral.checkerApprovalStatus === 'approved' ? 'Approved' : 'Pending'}
                        {selectedDeferral.checkerApprovalDate && ` • ${dayjs(selectedDeferral.checkerApprovalDate).format('DD MMM YYYY HH:mm')}`}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Approvers: </span>
                      <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>
                        {allApproversApprovedLocal ? 'All Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Partially Approved Banner */}
              {isPartiallyApproved && !isFullyApproved && (
                <div className="approved-status" style={{
                  backgroundColor: `${PRIMARY_BLUE}15`,
                  borderColor: `${PRIMARY_BLUE}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <LoadingOutlined style={{ color: PRIMARY_BLUE, fontSize: 24 }} />
                    <div>
                      <h3 style={{ margin: 0, color: PRIMARY_BLUE, fontWeight: 700 }}>
                        {allApproversApprovedLocal && (!hasCreatorApproved || !hasCheckerApproved)
                          ? 'All Approvers Approved • Awaiting Creator/Checker'
                          : 'Deferral Partially Approved'}
                      </h3>
                      <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
                        {allApproversApprovedLocal && (!hasCreatorApproved || !hasCheckerApproved)
                          ? 'All approvers have approved. Now awaiting approval from Creator and/or Checker.'
                          : 'Awaiting approvals from remaining parties'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Creator: </span>
                      <span style={{ color: hasCreatorApproved ? SUCCESS_GREEN : WARNING_ORANGE, fontWeight: 500 }}>
                        {hasCreatorApproved ? '✓ Approved' : 'Pending'}
                        {selectedDeferral.creatorApprovalDate && ` • ${dayjs(selectedDeferral.creatorApprovalDate).format('DD MMM YYYY')}`}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Checker: </span>
                      <span style={{ color: hasCheckerApproved ? SUCCESS_GREEN : WARNING_ORANGE, fontWeight: 500 }}>
                        {hasCheckerApproved ? '✓ Approved' : 'Pending'}
                        {selectedDeferral.checkerApprovalDate && ` • ${dayjs(selectedDeferral.checkerApprovalDate).format('DD MMM YYYY')}`}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Approvers: </span>
                      <span style={{ color: allApproversApprovedLocal ? SUCCESS_GREEN : WARNING_ORANGE, fontWeight: 500 }}>
                        {allApproversApprovedLocal ? '✓ All Approved' : 'Partially Approved'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Rejected/Returned Banner */}
              {(isRejected || isReturned) && (
                <div className="approved-status" style={{
                  backgroundColor: isRejected ? `${ERROR_RED}15` : `${WARNING_ORANGE}15`,
                  borderColor: isRejected ? `${ERROR_RED}40` : `${WARNING_ORANGE}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {isRejected ? (
                      <CloseCircleOutlined style={{ color: ERROR_RED, fontSize: 24 }} />
                    ) : (
                      <ReloadOutlined style={{ color: WARNING_ORANGE, fontSize: 24 }} />
                    )}
                    <div>
                      <h3 style={{ margin: 0, color: isRejected ? ERROR_RED : WARNING_ORANGE, fontWeight: 700 }}>
                        {isRejected ? 'Deferral Rejected ✗' : 'Deferral Returned for Re-work ↻'}
                      </h3>
                      <p style={{ margin: 4, color: '#666', fontSize: 14 }}>
                        {isRejected ? 'This deferral has been rejected' : 'This deferral has been returned for re-work to the RM'}
                      </p>
                    </div>
                  </div>
                  {selectedDeferral.rejectedBy && selectedDeferral.rejectedDate && isRejected && (
                    <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                      <div>
                        <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Rejected By: </span>
                        <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>{selectedDeferral.rejectedBy}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Rejected Date: </span>
                        <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>
                          {dayjs(selectedDeferral.rejectedDate).format('DD MMM YYYY HH:mm')}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedDeferral.returnedBy && selectedDeferral.returnedDate && isReturned && (
                    <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                      <div>
                        <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Returned By: </span>
                        <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>{selectedDeferral.returnedBy}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Returned Date: </span>
                        <span style={{ color: PRIMARY_BLUE, fontWeight: 500 }}>
                          {dayjs(selectedDeferral.returnedDate).format('DD MMM YYYY HH:mm')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Status Alert */}
              <DeferralStatusAlert deferral={selectedDeferral} />

              {/* Customer Information Card */}
              <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Customer Information</span>} style={{ marginBottom: 18 }}>
                <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                  <Descriptions.Item label="Customer Name">
                    <Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.customerName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Number">
                    <Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.customerNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loan Type">
                    <Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.loanType}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Deferral Details Card */}
              <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Deferral Details</span>} style={{ marginBottom: 18 }}>
                <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                  <Descriptions.Item label="Deferral Number">
                    <Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.deferralNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="DCL No">
                    <Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.dclNo || selectedDeferral.dclNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {isFullyApproved ? (
                      <Tag className="approved-badge" icon={<CheckCircleOutlined />}>
                        Fully Approved
                      </Tag>
                    ) : isPartiallyApproved ? (
                      <Tag icon={<LoadingOutlined />} color="processing" style={{ fontWeight: 700 }}>
                        Partially Approved
                      </Tag>
                    ) : isRejected ? (
                      <Tag className="rejected-badge" icon={<CloseCircleOutlined />}>
                        Rejected
                      </Tag>
                    ) : isReturned ? (
                      <Tag className="returned-badge" icon={<ReloadOutlined />} style={{
                        backgroundColor: `${WARNING_ORANGE}15`,
                        borderColor: WARNING_ORANGE,
                        color: WARNING_ORANGE
                      }}>
                        Returned
                      </Tag>
                    ) : (
                      <div style={{ fontWeight: 500 }}>{(selectedDeferral.status || '').toLowerCase() === 'deferral_requested' ? 'Pending' : (selectedDeferral.status || '')}</div>
                    )}
                  </Descriptions.Item>
                 
                  {/* Creator Status */}
                  <Descriptions.Item label="Creator Status">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const creatorStatus = selectedDeferral.creatorApprovalStatus || 'pending';
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
                        } else if (creatorStatus === 'returned_for_rework') {
                          return (
                            <Tag color="warning" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ReloadOutlined />
                              Returned
                            </Tag>
                          );
                        }
                        return (
                          <Tag color="processing" style={{ fontWeight: 700 }}>
                            Pending
                          </Tag>
                        );
                      })()}
                     
                      {selectedDeferral.creatorApprovalDate && (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {dayjs(selectedDeferral.creatorApprovalDate).format('DD/MM/YY HH:mm')}
                        </span>
                      )}
                    </div>
                  </Descriptions.Item>
                 
                  {/* Checker Status */}
                  <Descriptions.Item label="Checker Status">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const checkerStatus = selectedDeferral.checkerApprovalStatus || 'pending';
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
                        } else if (checkerStatus === 'returned_for_rework') {
                          return (
                            <Tag color="warning" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ReloadOutlined />
                              Returned
                            </Tag>
                          );
                        }
                        return (
                          <Tag color="processing" style={{ fontWeight: 700 }}>
                            Pending
                          </Tag>
                        );
                      })()}
                     
                      {selectedDeferral.checkerApprovalDate && (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {dayjs(selectedDeferral.checkerApprovalDate).format('DD/MM/YY HH:mm')}
                        </span>
                      )}
                    </div>
                  </Descriptions.Item>
                 
                  {/* Approvers Status */}
                  <Descriptions.Item label="Approvers Status">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {allApproversApprovedLocal ? (
                        <Tag color="success" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircleOutlined />
                          All Approved
                        </Tag>
                      ) : (
                        <Tag color="processing" style={{ fontWeight: 700 }}>
                          {approvers.filter(a => a.isApproved).length} of {approvers.length} Approved
                        </Tag>
                      )}
                    </div>
                  </Descriptions.Item>
                 
                  {/* Loan Amount */}
                  <Descriptions.Item label="Loan Amount">
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>{(function(){
                        const amt = Number(selectedDeferral.loanAmount || 0);
                        if (!amt) return 'Not specified';
                        return `KSh ${amt.toLocaleString()}`;
                      })()}</div>
                      {(function(){
                        const amt = Number(selectedDeferral.loanAmount || 0);
                        if (!amt) return null;
                        const isAbove75 = amt > 75 && amt <= 1000 ? true : (amt > 75000000 ? true : false);
                        return isAbove75 ? <Tag color={'red'} style={{ fontSize: 12 }}>Above 75 million</Tag> : <span style={{ color: SUCCESS_GREEN, fontWeight: 600 }}>Under 75 million</span>;
                      })()}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Days Sought">
                    <div style={{ fontWeight: 'bold', color: selectedDeferral.daysSought > 45 ? ERROR_RED : selectedDeferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE }}>
                      {selectedDeferral.daysSought || 0} days
                    </div>
                  </Descriptions.Item>

                  {/* Next Due Date */}
                  <Descriptions.Item label="Next Due Date">
                    <div style={{ color: (selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate) ? (dayjs(selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate).isBefore(dayjs()) ? ERROR_RED : SUCCESS_GREEN) : PRIMARY_BLUE }}>
                      {(selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate) ? `${dayjs(selectedDeferral.nextDueDate || selectedDeferral.nextDocumentDueDate).format('DD MMM YYYY')}` : 'Not calculated'}
                    </div>
                  </Descriptions.Item>

                  {/* SLA Expiry */}
                  <Descriptions.Item label="SLA Expiry">
                    <div style={{ color: selectedDeferral.slaExpiry && dayjs(selectedDeferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>
                      {selectedDeferral.slaExpiry ? dayjs(selectedDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}
                    </div>
                  </Descriptions.Item>

                  {/* Created At */}
                  <Descriptions.Item label="Created At">
                    <div>
                      <Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(selectedDeferral.createdAt||selectedDeferral.requestedDate).format('DD MMM YYYY')}</Text>
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(selectedDeferral.createdAt||selectedDeferral.requestedDate).format('HH:mm')}</Text>
                    </div>
                  </Descriptions.Item>
                </Descriptions>

                {selectedDeferral.deferralDescription && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Deferral Description</Text>
                    <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                      <Text>{selectedDeferral.deferralDescription}</Text>
                    </div>
                  </div>
                )}
              </Card>

              {selectedDeferral.facilities && selectedDeferral.facilities.length > 0 && (
                <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Facility Details ({selectedDeferral.facilities.length})</span>} style={{ marginBottom: 18 }}>
                  <Table dataSource={selectedDeferral.facilities} columns={getFacilityColumns()} pagination={false} size="small" rowKey={(r)=> r.facilityNumber || r._id || `facility-${Math.random().toString(36).slice(2)}`} scroll={{ x: 600 }} />
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
                                <Tag color={isUploaded ? 'green' : 'orange'} style={{ fontSize: 10 }}>
                                  {isUploaded ? 'Uploaded' : 'Requested'}
                                </Tag>
                              </div>
                              {doc.type && (
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                  <b>Type:</b> {doc.type}
                                </div>
                              )}
                              {doc.subItems && doc.subItems.length > 0 && (
                                <div style={{ fontSize: 12, color: '#333', marginTop: 4 }}>
                                  <b>Selected:</b> {doc.subItems.join(', ')}
                                </div>
                              )}
                              {uploadedVersion && (
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                  Uploaded as: {uploadedVersion.name} {uploadedVersion.uploadDate ? `• ${dayjs(uploadedVersion.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                          <Space>
                            {isUploaded && uploadedVersion && uploadedVersion.url && (
                              <>
                                <Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(uploadedVersion.url)} size="small">View</Button>
                                <Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(uploadedVersion.url, uploadedVersion.name); message.success(`Downloading ${uploadedVersion.name}...`); }} size="small">Download</Button>
                              </>
                            )}
                          </Space>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Mandatory: DCL Upload {dclDocs.length > 0 ? '✓' : ''}</span>} style={{ marginBottom: 18 }}>
                {dclDocs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dclDocs.map((doc, i) => (
                      <div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {getFileIcon(doc.type)}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {doc.name}
                              <Tag color="red" style={{ fontSize: 10, padding: '0 6px' }}>DCL Document</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12, marginTop: 4 }}>
                              {doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)}
                              {doc.uploadDate && (<span>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)}
                            </div>
                          </div>
                        </div>
                        <Space>
                          {doc.url && (<Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(doc.url)} size="small">View</Button>)}
                          {doc.url && (<Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button>)}
                        </Space>
                      </div>
                    ))}
                    <div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}>
                      <Text type="success" style={{ fontSize: 12 }}>
                        ✓ {dclDocs.length} DCL document{dclDocs.length !== 1 ? 's' : ''} uploaded successfully
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 16, color: WARNING_ORANGE }}>
                    <UploadOutlined style={{ fontSize: 24, marginBottom: 8, color: WARNING_ORANGE }} />
                    <div>No DCL document uploaded</div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>DCL document is required for submission</Text>
                  </div>
                )}
              </Card>

              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}><PaperClipOutlined style={{ marginRight: 8 }} /> Additional Uploaded Documents ({uploadedDocs.length})</span>} style={{ marginBottom: 18 }}>
                {uploadedDocs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {uploadedDocs.map((doc, i) => (
                      <div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {getFileIcon(doc.type)}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {doc.name}
                              <Tag color="blue" style={{ fontSize: 10 }}>Uploaded</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12, marginTop: 4 }}>
                              {doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)}
                              {doc.uploadDate && (<span>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)}
                              {doc.isAdditional && (<Tag color="cyan" style={{ fontSize: 10, padding: '0 4px' }}>Additional</Tag>)}
                            </div>
                          </div>
                        </div>
                        <Space>
                          {doc.url && (<Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(doc.url)} size="small">View</Button>)}
                          {doc.url && (<Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button>)}
                        </Space>
                      </div>
                    ))}
                    <div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}>
                      <Text type="success" style={{ fontSize: 12 }}>
                        ✓ {uploadedDocs.length} document{uploadedDocs.length !== 1 ? 's' : ''} uploaded
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                    <PaperClipOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} />
                    <div>No additional documents uploaded</div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>You can upload additional supporting documents if needed</Text>
                  </div>
                )}
              </Card>

              {/* Approval Flow with Green Ticks for Approved Approvers */}
              <Card size="small" title={<span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>Approval Flow</span>} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {approvers.length > 0 ? approvers.map((approver, index) => {
                    // Determine current approver robustly
                    const isCurrentApprover = approver.isCurrent || (() => {
                      if (typeof selectedDeferral?.currentApproverIndex === 'number') return index === selectedDeferral.currentApproverIndex;
                      const ca = selectedDeferral?.currentApprover;
                      if (!ca) return index === 0; // fallback behavior
                      const getKey = (item) => {
                        if (!item) return '';
                        if (typeof item === 'string') return item.toLowerCase();
                        return (String(item._id) || item.email || item.name || (item.user && (item.user.email || item.user.name)) || '').toLowerCase();
                      };
                      return getKey(approver) === getKey(ca);
                    })();
                   
                    const approverName = typeof approver === 'object' ?
                      (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver)) :
                      (typeof approver === 'string' && approver.includes('@') ? approver.split('@')[0] : approver);
                   
                    return (
                      <div key={index} style={{
                        padding: '12px 16px',
                        backgroundColor: approver.isApproved ? `${SUCCESS_GREEN}10` :
                                      approver.isRejected ? `${ERROR_RED}10` :
                                      approver.isReturned ? `${WARNING_ORANGE}10` :
                                      isCurrentApprover ? '#e6f7ff' : '#fafafa',
                        borderRadius: 6,
                        border: approver.isApproved ? `2px solid ${SUCCESS_GREEN}` :
                               approver.isRejected ? `2px solid ${ERROR_RED}` :
                               approver.isReturned ? `2px solid ${WARNING_ORANGE}` :
                               isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}>
                        <Badge count={index+1} style={{
                          backgroundColor: approver.isApproved ? SUCCESS_GREEN :
                                        approver.isRejected ? ERROR_RED :
                                        approver.isReturned ? WARNING_ORANGE :
                                        isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf',
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
                            {isCurrentApprover && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
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
                         
                          {isCurrentApprover && !approver.isApproved && !approver.isRejected && !approver.isReturned && (
                            <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ClockCircleOutlined style={{ fontSize: 11 }} />
                              Current Approver • Pending Approval
                              {selectedDeferral.slaExpiry && (
                                <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>
                                  SLA: {dayjs(selectedDeferral.slaExpiry).format('DD MMM HH:mm')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }) : ((selectedDeferral.approvers && selectedDeferral.approvers.length > 0) ? (selectedDeferral.approvers.filter(a => a && a !== "").map((approver, index) => {
                    const isCurrentApprover = (() => {
                      if (typeof selectedDeferral?.currentApproverIndex === 'number') return index === selectedDeferral.currentApproverIndex;
                      const ca = selectedDeferral?.currentApprover;
                      if (!ca) return index === 0;
                      const getKey = (item) => {
                        if (!item) return '';
                        if (typeof item === 'string') return item.toLowerCase();
                        return (String(item._id) || item.email || item.name || (item.user && (item.user.email || item.user.name)) || '').toLowerCase();
                      };
                      return getKey(approver) === getKey(ca);
                    })();
                    const isEmail = typeof approver === 'string' && approver.includes('@');
                    const currentCandidate = selectedDeferral.currentApprover || approver;
                    const emailAddr = (currentCandidate && typeof currentCandidate === 'object' && currentCandidate.email) || (typeof approver === 'string' && approver.includes('@') ? approver : (typeof currentCandidate === 'string' && currentCandidate.includes('@') ? currentCandidate : null));
                    return (
                      <div key={index} style={{ padding: '12px 16px', backgroundColor: isCurrentApprover ? '#e6f7ff' : '#fafafa', borderRadius: 6, border: isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Badge count={index+1} style={{ backgroundColor: isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf', fontSize: 12, height: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 14 }}>{typeof approver === 'string' ? (isEmail ? approver.split('@')[0] : approver) : (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver))}</Text>
                          {isCurrentApprover && (
                            <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ClockCircleOutlined style={{ fontSize: 11 }} />
                              Current Approver • Pending Approval
                              {selectedDeferral.slaExpiry && (
                                <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>SLA: {dayjs(selectedDeferral.slaExpiry).format('DD MMM HH:mm')}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })) : (
                    <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                      <UserOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} />
                      <div>No approvers specified</div>
                    </div>
                  ))}
                </div>
               
                {/* Show warning if not all approvers have approved */}
                {!allApproversApprovedLocal && approvers.length > 0 && (
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
                )}
              </Card>



              {/* Comments Input Section */}
              <Card size="small" style={{ marginBottom: 24, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{
                    width: 4,
                    height: 20,
                    backgroundColor: ACCENT_LIME,
                    marginRight: 12,
                    borderRadius: 2
                  }} />
                  <h4 style={{ color: PRIMARY_BLUE, margin: 0 }}>Comments</h4>
                </div>
                
                <TextArea
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
                <div className="max-h-52 overflow-y-auto">
                  <List
                    dataSource={history}
                    itemLayout="horizontal"
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} style={{
                            backgroundColor: item.type === 'approval' ? SUCCESS_GREEN :
                                          item.type === 'rejection' ? ERROR_RED :
                                          item.type === 'return' ? WARNING_ORANGE :
                                          item.type === 'request' ? PRIMARY_BLUE : '#bfbfbf'
                          }} />}
                          title={
                            <div className="flex justify-between">
                              <div>
                                <b>{item.user || 'System'}</b>
                                {item.type === 'approval' && (
                                  <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginLeft: 8, fontSize: 10, padding: '0 4px' }}>
                                    Approved
                                  </Tag>
                                )}
                                {item.type === 'rejection' && (
                                  <Tag icon={<CloseCircleOutlined />} color="error" style={{ marginLeft: 8, fontSize: 10, padding: '0 4px' }}>
                                    Rejected
                                  </Tag>
                                )}
                                {item.type === 'return' && (
                                  <Tag icon={<ReloadOutlined />} color="warning" style={{ marginLeft: 8, fontSize: 10, padding: '0 4px' }}>
                                    Returned
                                  </Tag>
                                )}
                                {item.type === 'request' && (
                                  <Tag icon={<UserOutlined />} color="blue" style={{ marginLeft: 8, fontSize: 10, padding: '0 4px' }}>
                                    Requested
                                  </Tag>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {dayjs(item.date).format('DD MMM YYYY HH:mm')}
                              </span>
                            </div>
                          }
                          description={
                            <div>
                              {item.comment ? (
                                <div style={{ marginTop: 4 }}>
                                  <Text>{item.comment}</Text>
                                </div>
                              ) : (
                                <Text type="secondary" style={{ fontStyle: 'italic' }}>No comment provided</Text>
                              )}
                              {item.type === 'approval' && item.originalComment && item.originalComment.includes('Approved by') && (
                                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                                  <Text type="secondary">
                                    {item.originalComment.split(':')[0]} {/* Shows "Approved by Eric" */}
                                  </Text>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>

            </div>
          );
        })()}
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal
        title="Confirm Deferral Approval"
        open={approvalConfirmModalVisible}
        onCancel={() => setApprovalConfirmModalVisible(false)}
        okText="Confirm Approval"
        cancelText="Cancel"
        okButtonProps={{ 
          loading: actionLoading,
          style: {
            background: ACCENT_LIME,
            borderColor: ACCENT_LIME,
            color: '#ffffff'
          }
        }}
        onOk={handleConfirmApproval}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16, color: PRIMARY_BLUE }}>
              Are you sure you want to approve this deferral?
            </Text>
          </div>
          <div style={{
            padding: 12,
            backgroundColor: '#f0f5ff',
            borderLeft: `4px solid ${PRIMARY_BLUE}`,
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Deferral Number:</span>
              <span style={{ marginLeft: 8, color: PRIMARY_BLUE, fontWeight: 500 }}>{selectedDeferral?.deferralNumber}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>Customer:</span>
              <span style={{ marginLeft: 8, color: PRIMARY_BLUE, fontWeight: 500 }}>{selectedDeferral?.customerName}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: SECONDARY_PURPLE }}>DCL Number:</span>
              <span style={{ marginLeft: 8, color: PRIMARY_BLUE, fontWeight: 500 }}>{selectedDeferral?.dclNo || selectedDeferral?.dclNumber}</span>
            </div>
          </div>
          <Alert
            message="Once you approve, this deferral will be finalized. You will not be able to make changes."
            type="warning"
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 12 }}
          />
          <div style={{
            padding: 12,
            backgroundColor: ACCENT_LIME + '15',
            border: `1px solid ${ACCENT_LIME}40`,
            borderRadius: 4
          }}>
            <Text strong style={{ color: PRIMARY_BLUE, display: 'block', marginBottom: 8 }}>Your Comment (Optional):</Text>
            <TextArea
              rows={3}
              placeholder="Enter your approval comment here (optional)..."
              value={creatorComment}
              onChange={(e) => setCreatorComment(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        title={`Reject Deferral Request: ${selectedDeferral?.deferralNumber}`}
        open={showRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
        okText={'Yes, Reject'}
        okType={'danger'}
        okButtonProps={{ style: { background: ERROR_RED, borderColor: ERROR_RED, color: 'white' }, loading: rejecting }}
        cancelText={'Cancel'}
        onOk={doReject}
      >
        <div>
          <p>Are you sure you want to reject this deferral request?</p>
          <p><strong>{selectedDeferral?.deferralNumber}</strong> - {selectedDeferral?.customerName}</p>
          <p>Days Sought: <strong>{selectedDeferral?.daysSought}</strong> days</p>
          <p style={{ marginBottom: 6 }}>Please provide a reason for rejection (required):</p>
          <Input.TextArea 
            rows={4} 
            value={rejectComment} 
            onChange={(e) => setRejectComment(e.target.value)} 
            placeholder="Enter rejection reason..." 
            required
          />
          {!rejectComment || rejectComment.trim() === '' ? (
            <p style={{ color: ERROR_RED, fontSize: 12, marginTop: 4 }}>
              Rejection reason is required
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Return for Rework Confirmation Modal */}
      <Modal
        title={`Return for Rework: ${selectedDeferral?.deferralNumber}`}
        open={showReworkConfirm}
        onCancel={() => setShowReworkConfirm(false)}
        okText={'Yes, Return for Rework'}
        okType={'warning'}
        okButtonProps={{ style: { background: WARNING_ORANGE, borderColor: WARNING_ORANGE }, loading: returnReworkLoading }}
        cancelText={'Cancel'}
        onOk={doReturnForRework}
      >
        <div>
          <p>Are you sure you want to return this deferral for rework?</p>
          <p><strong>{selectedDeferral?.deferralNumber}</strong> - {selectedDeferral?.customerName}</p>
          <p>This will return the deferral back to the Relationship Manager for corrections.</p>
          <p style={{ marginBottom: 6 }}>Please provide rework instructions for the Relationship Manager (required):</p>
          <Input.TextArea 
            rows={4} 
            value={reworkComment} 
            onChange={(e) => setReworkComment(e.target.value)} 
            placeholder="Enter rework instructions for the Relationship Manager..." 
            required
          />
          {!reworkComment || reworkComment.trim() === '' ? (
            <p style={{ color: ERROR_RED, fontSize: 12, marginTop: 4 }}>
              Rework instructions are required
            </p>
          ) : null}
          <p style={{ marginTop: 12, fontSize: 12, color: '#666', fontStyle: 'italic' }}>
            Note: The Relationship Manager will receive these instructions and need to resubmit the deferral request.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Deferrals;