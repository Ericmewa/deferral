import React, { useState, useMemo, useEffect } from "react";
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
  Input as AntInput
} from "antd";
import { 
  SearchOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  ClockCircleOutlined,
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
  UploadOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import deferralApi from '../../service/deferralApi.js';
import { openFileInNewTab, downloadFile } from '../../utils/fileUtils';

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

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;
const { TextArea } = AntInput;

const Deferrals = ({ userId }) => {
  // State Management
  const [selectedDeferral, setSelectedDeferral] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    search: '',
    dateRange: null
  });
  const [loading, setLoading] = useState(false);
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [creatorComment, setCreatorComment] = useState("");

  // Fetch deferrals from API
  const fetchDeferrals = async () => {
    setLoading(true);
    try {
      const pending = await deferralApi.getPendingDeferrals();
      const approved = await deferralApi.getApprovedDeferrals();
      const combined = [];
      if (Array.isArray(pending)) combined.push(...pending);
      if (Array.isArray(approved)) combined.push(...approved);
      // Debug: log counts so we can trace whether approved items are returned
      console.debug('loadDeferrals', { 
        pending: Array.isArray(pending) ? pending.length : 0, 
        approved: Array.isArray(approved) ? approved.length : 0,
        combined: combined.length 
      });
      return combined; // ← FIXED: This was missing!
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
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'

  // Initialize (manual refresh only)
  useEffect(() => {
    // Initial load only; CO dashboard will refresh when the user clicks the Refresh button
    loadDeferrals();
    // No automatic listeners or polling — manual reload only
  }, [userId]);

  // Live refresh: when a deferral is open for viewing, poll the backend for updates so the
  // approval flow shows the real-time current approver (refresh every 5s).
  useEffect(() => {
    if (!selectedDeferral || !modalVisible) return;
    let cancelled = false;
    const fetchLatest = async () => {
      try {
        const fresh = await deferralApi.getDeferralById(selectedDeferral._id);
        if (!cancelled && fresh) setSelectedDeferral(fresh);
      } catch (err) {
        // non-fatal; keep polling
        console.debug('deferral refresh failed', err?.message || err);
      }
    };
    // Fetch immediately, then poll
    fetchLatest();
    const t = setInterval(fetchLatest, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [selectedDeferral?._id, modalVisible]);

  const loadDeferrals = async () => {
    console.log('Loading deferrals for CO dashboard...');
    const data = await fetchDeferrals();
    // Store all deferrals; we'll derive pending/approved via filters/tabs
    setDeferrals(data);

    // Initialize filtered list currently showing pending items
    const pending = data.filter(d => ['pending_approval', 'in_review'].includes(d.status));
    setFilteredDeferrals(pending);
  };

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [deferrals, filters, activeTab]);

  const applyFilters = () => {
    // Start from either pending or approved deferrals depending on active tab
    const pendingStatuses = ['pending_approval', 'in_review'];
    const approvedStatuses = ['approved'];

    let base = deferrals.filter(d => {
      if (activeTab === 'pending') return pendingStatuses.includes(d.status);
      if (activeTab === 'approved') return approvedStatuses.includes(d.status);
      return true;
    });

    // Apply priority filter
    if (filters.priority !== 'all') {
      base = base.filter(d => d.priority === filters.priority);
    }

    // Apply search filter - ONLY customer number and DCL No
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      base = base.filter(d => 
        (d.customerNumber||'').toLowerCase().includes(searchLower) ||
        (d.dclNo||d.dclNumber||'').toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      base = base.filter(d => {
        const createdDate = dayjs(d.createdAt);
        return createdDate.isAfter(filters.dateRange[0]) && 
               createdDate.isBefore(filters.dateRange[1]);
      });
    }

    setFilteredDeferrals(base);
  };

  // Handle deferral actions
  const handleApproveDeferral = async () => {
    if (!creatorComment.trim()) {
      message.error("Please enter your comments before approving");
      return;
    }

    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update local state - remove approved deferral from list
      const updatedDeferrals = deferrals.filter(d => d._id !== selectedDeferral._id);
      
      setDeferrals(updatedDeferrals);
      message.success("Deferral approved successfully!");
      
      // Close modal and reset
      setModalVisible(false);
      setSelectedDeferral(null);
      setCreatorComment("");
      
    } catch (error) {
      console.error("Error approving deferral:", error);
      message.error("Failed to approve deferral");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDeferral = async () => {
    if (!creatorComment.trim()) {
      message.error("Please enter your comments before rejecting");
      return;
    }

    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update local state - remove rejected deferral from list
      const updatedDeferrals = deferrals.filter(d => d._id !== selectedDeferral._id);
      
      setDeferrals(updatedDeferrals);
      message.success("Deferral rejected successfully!");
      
      // Close modal and reset
      setModalVisible(false);
      setSelectedDeferral(null);
      setCreatorComment("");
      
    } catch (error) {
      console.error("Error rejecting deferral:", error);
      message.error("Failed to reject deferral");
    } finally {
      setActionLoading(false);
    }
  };

  // Export functionality
  const exportDeferrals = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Customer No,Customer Name,DCL No,Document,Loan Type,Expiry Date,RM,Priority,Days Remaining\n" +
      filteredDeferrals.map(d => 
        `${d.customerNumber},"${d.customerName}",${d.dclNo},"${d.documentName}",${d.loanType},${dayjs(d.expiryDate).format('DD/MM/YYYY')},${d.assignedRM.name},${d.priority},${d.daysRemaining}`
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

  // Columns arranged to match RM's layout: Deferral No, DCL No, Customer Name, Loan Type, Document Type, Status, Days Sought, SLA
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
      render: (status) => {
        let tagColor = 'processing';
        let tagText = 'Pending';
        if (status === 'approved') { tagColor = 'success'; tagText = 'Approved'; }
        else if (status === 'rejected') { tagColor = 'error'; tagText = 'Rejected'; }
        else if (status === 'in_review') { tagColor = 'processing'; tagText = 'In Review'; }
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

  // Filter component (simplified - no status filter since all are pending)
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
            placeholder="Search by DCL No (important) or customer number..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            allowClear
          />
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Priority"
            value={filters.priority}
            onChange={(value) => setFilters({...filters, priority: value})}
            allowClear
          >
            <Option value="all">All Priorities</Option>
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
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
                : 'View approved deferral requests'}
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
          <Tabs.TabPane tab={`Pending Deferrals (${deferrals.filter(d => ['pending_approval','in_review'].includes(d.status)).length})`} key="pending" />
          <Tabs.TabPane tab={`Approved Deferrals (${deferrals.filter(d => d.status === 'approved').length})`} key="approved" />
        </Tabs>
        <div style={{ marginTop: 8, fontWeight: 700, color: PRIMARY_BLUE }}>
          {activeTab === 'pending' ? `Pending Deferrals (${filteredDeferrals.length} items)` : `Approved Deferrals (${filteredDeferrals.length} items)`}
        </div>
      </div>

      {/* Deferrals Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Spin tip={`Loading ${activeTab === 'pending' ? 'pending' : 'approved'} deferrals...`} />
        </div>
      ) : filteredDeferrals.length === 0 ? (
        <Empty 
          description={
            <div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>{activeTab === 'pending' ? 'No pending deferrals found' : 'No approved deferrals found'}</p>
              <p style={{ color: "#999" }}>
                {filters.search || filters.priority !== 'all' 
                  ? 'Try changing your filters' 
                  : (activeTab === 'pending' ? 'All deferral requests have been processed' : 'No approvals yet')}
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
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${activeTab === 'pending' ? 'pending' : 'approved'} deferrals`
            }} 
            rowClassName={(record, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-50")}
            scroll={{ x: 1300 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </div>
      )}

      {/* Deferral Review Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: "bold", color: PRIMARY_BLUE }}>
              {selectedDeferral?.status === 'approved' ? 'View Approved Deferral' : 'Review Deferral Request'}
            </span>
            {selectedDeferral && (
              <Tag color={selectedDeferral.status === 'approved' ? 'success' : 'blue'} style={{ fontWeight: "bold" }}>
                {selectedDeferral.deferralNumber}
              </Tag>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedDeferral(null);
          setCreatorComment("");
        }}
        width={800}
        footer={
          selectedDeferral?.status === 'approved' ? [
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
          ] : [
            <Button 
              key="cancel" 
              onClick={() => {
                setModalVisible(false);
                setSelectedDeferral(null);
                setCreatorComment("");
              }}
            >
              Cancel
            </Button>,
            <Button 
              key="reject" 
              danger
              onClick={handleRejectDeferral}
              loading={actionLoading}
              disabled={actionLoading || !creatorComment.trim()}
            >
              Reject Deferral
            </Button>,
            <Button 
              key="approve" 
              type="primary" 
              onClick={handleApproveDeferral}
              loading={actionLoading}
              disabled={actionLoading || !creatorComment.trim()}
              style={{ background: ACCENT_LIME, borderColor: ACCENT_LIME }}
            >
              Approve Deferral
            </Button>
          ]
        }
      >
        {selectedDeferral && (() => {
          // helper to select proper icon
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

          const history = [];
          history.push({ user: selectedDeferral.requestedBy || selectedDeferral.rmName || 'RM', userRole: 'RM', date: selectedDeferral.requestedDate || selectedDeferral.createdAt, comment: selectedDeferral.rmReason || selectedDeferral.deferralDescription || 'Deferral request submitted' });
          if (selectedDeferral.history && Array.isArray(selectedDeferral.history) && selectedDeferral.history.length > 0) {
            selectedDeferral.history.forEach(h => history.push({ user: h.user?.name || h.user || 'System', userRole: h.userRole || h.role || 'System', date: h.date || h.createdAt || h.timestamp || h.entryDate, comment: h.comment || h.notes || h.message || '' }));
          }
          const approverEvents = (selectedDeferral.approvers || selectedDeferral.approverFlow || []).filter(a => a && (a.approved || a.approved === true)).map(a => ({ user: a.name || (a.user && a.user.name) || a.userId || 'Approver', userRole: a.role || 'Approver', date: a.date || a.approvedDate || a.approvedAt, comment: `Approved by ${(a.name || a.role || 'Approver')}` }));
          approverEvents.forEach(e => history.push(e));
          history.sort((a,b) => (new Date(a.date||0)) - (new Date(b.date||0)));

          return (
            <div style={{ padding: "16px 0" }}>
              <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Customer Information</span>} style={{ marginBottom: 18, marginTop: 24 }}>
                <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                  <Descriptions.Item label="Customer Name"><Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.customerName}</Text></Descriptions.Item>
                  <Descriptions.Item label="Customer Number"><Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.customerNumber}</Text></Descriptions.Item>
                  <Descriptions.Item label="Loan Type"><Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.loanType}</Text></Descriptions.Item>
                  <Descriptions.Item label="Created At"><div><Text strong style={{ color: PRIMARY_BLUE }}>{dayjs(selectedDeferral.createdAt||selectedDeferral.requestedDate).format('DD MMM YYYY')}</Text><Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{dayjs(selectedDeferral.createdAt||selectedDeferral.requestedDate).format('HH:mm')}</Text></div></Descriptions.Item>
                  {selectedDeferral.status === 'approved' && (
                    <>
                      <Descriptions.Item label="Approved By"><Text strong style={{ color: SUCCESS_GREEN }}>{selectedDeferral.approvedBy || 'N/A'}</Text></Descriptions.Item>
                      <Descriptions.Item label="Approved Date"><Text strong style={{ color: SUCCESS_GREEN }}>{selectedDeferral.approvedDate ? dayjs(selectedDeferral.approvedDate).format('DD MMM YYYY HH:mm') : 'N/A'}</Text></Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>

              <Card className="deferral-info-card" size="small" title={<span style={{ color: PRIMARY_BLUE }}>Deferral Details</span>} style={{ marginBottom: 18 }}>
                <Descriptions size="middle" column={{ xs: 1, sm: 2, lg: 3 }}>
                  <Descriptions.Item label="Deferral Number"><Text strong style={{ color: PRIMARY_BLUE }}>{selectedDeferral.deferralNumber}</Text></Descriptions.Item>
                  <Descriptions.Item label="DCL No">{selectedDeferral.dclNo || selectedDeferral.dclNumber ? (selectedDeferral.dclNo || selectedDeferral.dclNumber) : <Tag color="error">Missing — please input DCL No</Tag>}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={selectedDeferral.status === 'approved' ? 'success' : selectedDeferral.status === 'rejected' ? 'error' : 'processing'}
                      style={{ fontWeight: 600 }}
                    >
                      {selectedDeferral.status === 'approved' ? 'Approved' : 
                       selectedDeferral.status === 'rejected' ? 'Rejected' : 
                       selectedDeferral.status === 'in_review' ? 'In Review' : 'Pending'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Deferral Title"><div style={{ fontWeight: 500 }}>{selectedDeferral.deferralTitle || selectedDeferral.customerName}</div></Descriptions.Item>
                  <Descriptions.Item label="Loan Amount"><div style={{ fontWeight: 500 }}>{selectedDeferral.loanAmount ? (selectedDeferral.loanAmount > 1000 ? `KSh ${selectedDeferral.loanAmount.toLocaleString()}` : `${selectedDeferral.loanAmount} M`) : 'Not specified'}</div></Descriptions.Item>
                  <Descriptions.Item label="Days Sought"><div style={{ fontWeight: 'bold', color: selectedDeferral.daysSought > 45 ? ERROR_RED : selectedDeferral.daysSought > 30 ? WARNING_ORANGE : PRIMARY_BLUE }}>{selectedDeferral.daysSought || 0} days</div></Descriptions.Item>
                  <Descriptions.Item label="Next Due Date"><div style={{ color: selectedDeferral.nextDueDate ? (dayjs(selectedDeferral.nextDueDate).isBefore(dayjs()) ? ERROR_RED : SUCCESS_GREEN) : PRIMARY_BLUE }}>{selectedDeferral.nextDueDate ? dayjs(selectedDeferral.nextDueDate).format('DD MMM YYYY') : 'Not calculated'}</div></Descriptions.Item>

                  <Descriptions.Item label="SLA Expiry"><div style={{ color: selectedDeferral.slaExpiry && dayjs(selectedDeferral.slaExpiry).isBefore(dayjs()) ? ERROR_RED : PRIMARY_BLUE }}>{selectedDeferral.slaExpiry ? dayjs(selectedDeferral.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}</div></Descriptions.Item>
                </Descriptions>

                {selectedDeferral.deferralDescription && (<div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}><Text strong style={{ display: 'block', marginBottom: 8 }}>Deferral Description</Text><div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}><Text>{selectedDeferral.deferralDescription}</Text></div></div>)}
              </Card>

              {selectedDeferral.facilities && selectedDeferral.facilities.length > 0 && (<Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Facility Details ({selectedDeferral.facilities.length})</span>} style={{ marginBottom: 18 }}><Table dataSource={selectedDeferral.facilities} columns={[{ title: 'Facility Type', dataIndex: 'facilityType', key: 'facilityType', render: (t) => <Text strong>{t || 'N/A'}</Text> },{ title: "Sanctioned (KES '000)", dataIndex: 'sanctioned', key: 'sanctioned', align: 'right', render: (v, r) => { const val = v ?? r.amount ?? 0; return Number(val || 0).toLocaleString(); } },{ title: "Balance (KES '000)", dataIndex: 'balance', key: 'balance', align: 'right', render: (v, r) => Number(v ?? r.balance ?? 0).toLocaleString() },{ title: "Headroom (KES '000)", dataIndex: 'headroom', key: 'headroom', align: 'right', render: (v, r) => Number(v ?? r.headroom ?? Math.max(0, (r.amount || 0) - (r.balance || 0))).toLocaleString() }]} pagination={false} size="small" rowKey={(r)=> r.facilityNumber || r._id || `facility-${Math.random().toString(36).slice(2)}`} scroll={{ x: 600 }} />)</Card>)}

              {requestedDocs.length > 0 && (<Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Documents Requested for Deferrals ({requestedDocs.length})</span>} style={{ marginBottom: 18 }}><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{requestedDocs.map((doc, idx) => { const isUploaded = uploadedDocs.some(u => (u.name || '').toLowerCase().includes((doc.name||'').toLowerCase())); const uploadedVersion = uploadedDocs.find(u => (u.name||'').toLowerCase().includes((doc.name||'').toLowerCase())); return (<div key={doc.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: isUploaded ? '#f6ffed' : '#fff7e6', borderRadius: 6, border: isUploaded ? '1px solid #b7eb8f' : '1px solid #ffd591' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><FileDoneOutlined style={{ color: isUploaded ? SUCCESS_GREEN : WARNING_ORANGE, fontSize: 16 }} /><div><div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{doc.name}<Tag color={isUploaded ? 'green' : 'orange'} style={{ fontSize: 10 }}>{isUploaded ? 'Uploaded' : 'Requested'}</Tag></div>{doc.type && (<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}><b>Type:</b> {doc.type}</div>)}{doc.subItems && doc.subItems.length > 0 && (<div style={{ fontSize: 12, color: '#333', marginTop: 4 }}><b>Selected:</b> {doc.subItems.join(', ')}</div>)}{uploadedVersion && (<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Uploaded as: {uploadedVersion.name} {uploadedVersion.uploadDate ? `• ${dayjs(uploadedVersion.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div>)}</div></div><Space>{isUploaded && uploadedVersion && uploadedVersion.url && (<><Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(uploadedVersion.url)} size="small">View</Button><Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(uploadedVersion.url, uploadedVersion.name); message.success(`Downloading ${uploadedVersion.name}...`); }} size="small">Download</Button></>)}</Space></div>); })}</div></Card>)}

              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Mandatory: DCL Upload {dclDocs.length > 0 ? '✓' : ''}</span>} style={{ marginBottom: 18 }}>
                {dclDocs.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{dclDocs.map((doc, i) => (<div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{getFileIcon(doc.type)}<div><div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{doc.name}<Tag color="red" style={{ fontSize: 10, padding: '0 6px' }}>DCL Document</Tag></div><div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12, marginTop: 4 }}>{doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)}{doc.uploadDate && (<span>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)}</div></div></div><Space>{doc.url && (<Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(doc.url)} size="small">View</Button>)}{doc.url && (<Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button>)}</Space></div>))}<div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}><Text type="success" style={{ fontSize: 12 }}>✓ {dclDocs.length} DCL document{dclDocs.length !== 1 ? 's' : ''} uploaded successfully</Text></div></div>) : (<div style={{ textAlign: 'center', padding: 16, color: WARNING_ORANGE }}><UploadOutlined style={{ fontSize: 24, marginBottom: 8, color: WARNING_ORANGE }} /><div>No DCL document uploaded</div><Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>DCL document is required for submission</Text></div>)}

              </Card>

              <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}><PaperClipOutlined style={{ marginRight: 8 }} /> Additional Uploaded Documents ({uploadedDocs.length})</span>} style={{ marginBottom: 18 }}>
                {uploadedDocs.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{uploadedDocs.map((doc, i) => (<div key={doc.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: 6, border: '1px solid #e8e8e8' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{getFileIcon(doc.type)}<div><div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{doc.name}<Tag color="blue" style={{ fontSize: 10 }}>Uploaded</Tag></div><div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12, marginTop: 4 }}>{doc.size && (<span>{doc.size > 1024 ? `${(doc.size/1024).toFixed(2)} MB` : `${doc.size} KB`}</span>)}{doc.uploadDate && (<span>Uploaded: {dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}</span>)}{doc.isAdditional && (<Tag color="cyan" style={{ fontSize: 10, padding: '0 4px' }}>Additional</Tag>)}</div></div></div><Space>{doc.url && (<Button type="text" icon={<EyeOutlined />} onClick={() => openFileInNewTab(doc.url)} size="small">View</Button>)}{doc.url && (<Button type="text" icon={<DownloadOutlined />} onClick={() => { downloadFile(doc.url, doc.name); message.success(`Downloading ${doc.name}...`); }} size="small">Download</Button>)}</Space></div>))}<div style={{ padding: 8, backgroundColor: '#f6ffed', borderRadius: 4, marginTop: 8 }}><Text type="success" style={{ fontSize: 12 }}>✓ {uploadedDocs.length} document{uploadedDocs.length !== 1 ? 's' : ''} uploaded</Text></div></div>) : (<div style={{ textAlign: 'center', padding: 16, color: '#999' }}><PaperClipOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} /><div>No additional documents uploaded</div><Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>You can upload additional supporting documents if needed</Text></div>)}
              </Card>

              <Card size="small" title={<span style={{ color: PRIMARY_BLUE, fontSize: 14 }}>Approval Flow {(selectedDeferral.status === 'pending_approval' || selectedDeferral.status === 'in_review') && (<Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>Pending Approval</Tag>)}</span>} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedDeferral.approverFlow && selectedDeferral.approverFlow.length > 0) ? (selectedDeferral.approverFlow.map((approver, index) => {
                    // Determine current approver robustly: backend may provide currentApproverIndex or currentApprover (object/string)
                    const isCurrentApprover = (() => {
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
                    const hasEmail = isCurrentApprover && selectedDeferral.currentApprover?.email;
                    return (
                      <div key={index} style={{ padding: '12px 16px', backgroundColor: isCurrentApprover ? '#e6f7ff' : '#fafafa', borderRadius: 6, border: isCurrentApprover ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Badge count={index+1} style={{ backgroundColor: isCurrentApprover ? PRIMARY_BLUE : '#bfbfbf', fontSize: 12, height: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 14 }}>{typeof approver === 'object' ? (approver.name || approver.user?.name || approver.userId?.name || approver.email || approver.role || String(approver)) : approver}</Text>
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
                  })) : ((selectedDeferral.approvers && selectedDeferral.approvers.length > 0) ? (selectedDeferral.approvers.filter(a => a && a !== "").map((approver, index) => {
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
                    const hasEmail = isCurrentApprover && selectedDeferral.currentApprover?.email;
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
                              {selectedDeferral.slaExpiry && (
                                <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>SLA: {dayjs(selectedDeferral.slaExpiry).format('DD MMM HH:mm')}</span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })) : (<div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
                    <UserOutlined style={{ fontSize: 24, marginBottom: 8, color: '#d9d9d9' }} />
                    <div>No approvers specified</div>
                  </div>))}
                </div>
              </Card>

              <div style={{ marginTop: 24 }}>
                <h4 style={{ color: PRIMARY_BLUE, marginBottom: 16 }}>Comment Trail & History</h4>
                <div className="max-h-52 overflow-y-auto">
                  <List dataSource={history} itemLayout="horizontal" renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<div className="flex justify-between"><div><b>{item.user || 'System'}</b></div><span className="text-xs text-gray-500">{dayjs(item.date).format('DD MMM YYYY HH:mm')}</span></div>}
                        description={item.comment || item.notes || 'No comment provided.'}
                      />
                    </List.Item>
                  )} />
                </div>
              </div>

            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Deferrals; 