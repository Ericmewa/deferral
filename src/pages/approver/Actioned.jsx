import React, { useEffect, useState } from "react";
import { Table, Card, Empty, message, Modal, Typography, Spin, Tag, Descriptions, Space, Badge, Row, Col, Input, Button, Divider } from "antd";
import dayjs from "dayjs";
import { FileTextOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined, SearchOutlined, CustomerServiceOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, BankOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import deferralApi from "../../service/deferralApi";
import getFacilityColumns from '../../utils/facilityColumns';

const { Text } = Typography;

const Actioned = () => {

  const PRIMARY_BLUE = "#164679";
  const ACCENT_LIME = "#b5d334";
  const SUCCESS_GREEN = "#52c41a";
  const ERROR_RED = "#ff4d4f";
  const WARNING_ORANGE = "#faad14";

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
      fontSize: 13px;
      padding: 14px 12px !important;
      border-bottom: 3px solid ${ACCENT_LIME} !important;
      border-right: none !important;
    }
    .deferral-pending-table .ant-table-tbody > tr > td {
      border-bottom: 1px solid #f0f0f0 !important;
      border-right: none !important;
      padding: 12px 12px !important;
      fontSize: 13px;
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
      border-color: ${ACCENT_LIME} !important;
    }
    .deferral-pending-table .ant-pagination .ant-pagination-item-active a {
      color: ${PRIMARY_BLUE} !important;
      font-weight: 600;
    }
  `;

  const modalCustomStyles = `
    .ant-modal-header { background-color: ${PRIMARY_BLUE} !important; padding: 18px 24px !important; }
    .ant-modal-title { color: white !important; font-size: 1.15rem !important; font-weight: 700 !important; letter-spacing: 0.5px; }
    .ant-modal-close-x { color: white !important; }
    .deferral-info-card .ant-card-head { border-bottom: 2px solid ${ACCENT_LIME} !important; }
    .deferral-info-card .ant-descriptions-item-label { font-weight: 600 !important; color: #7e6496 !important; padding-bottom: 4px; }
    .deferral-info-card .ant-descriptions-item-content { color: ${PRIMARY_BLUE} !important; font-weight: 700 !important; font-size: 13px !important; }
  `;

  const token = useSelector((s) => s.auth.token);
  const [deferrals, setDeferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const dclDocs = (selected && (selected.documents||[]).filter(d=> (d.isDCL) || (d.name && /dcl/i.test(d.name)) || (selected.dclNo && d.name && d.name.toLowerCase().includes((selected.dclNo||'').toLowerCase())))) || [];

  const renderDclUpload = () => {
    return (
      <Card size="small" title={`Mandatory: DCL Upload ${dclDocs.length > 0 ? '✓' : ''}`} style={{ marginTop: 12 }}>
        {dclDocs.length === 0 ? (
          <div style={{ textAlign: 'center', color: WARNING_ORANGE }}>No DCL document uploaded</div>
        ) : (
          <div>
            <div style={{ marginBottom: 10 }}>
              {dclDocs.map((doc, i)=> (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{doc.size ? `${(doc.size/1024).toFixed(2)} MB` : ''} {doc.uploadDate ? `• Uploaded: ${dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div>
                  </div>
                  <div><Tag color="red">DCL Document</Tag></div>
                </div>
              ))}
            </div>
            <div style={{ padding: 8, marginTop: 8, backgroundColor: '#f6ffed', borderRadius: 4 }}>
              <div style={{ fontWeight: 700, color: SUCCESS_GREEN }}>✓ DCL document ready: {dclDocs[0].name}</div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const safe = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return (v.name || v.userName || v._id || JSON.stringify(v));
    return v;
  };

  const nameOf = (x) => {
    if (!x) return 'Approver';
    if (typeof x === 'string') return x;
    if (typeof x === 'object') {
      if (x.name) return x.name;
      if (x.userName) return x.userName;
      if (x.user) return (typeof x.user === 'string') ? x.user : (x.user.name || JSON.stringify(x.user));
      if (x._id) return x._id;
      return JSON.stringify(x);
    }
    return String(x);
  };

  // Handle posting comments
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment before posting');
      return;
    }

    if (!selected || !selected._id) {
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
      await deferralApi.postComment(selected._id, commentData, token);

      message.success('Comment posted successfully');
      
      // Clear the input
      setNewComment('');

      // Refresh the deferral to show the new comment
      const refreshedDeferral = await deferralApi.getDeferralById(selected._id, token);
      setSelected(refreshedDeferral);
      
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

  useEffect(() => {
    fetchActioned();

    // Listen for rejected/approved deferrals dispatched from other pages (e.g., approver MyQueue)
    const handler = (e) => {
      try {
        const updated = e && e.detail ? e.detail : null;
        if (!updated || !updated._id) return;

        const s = (updated.status || '').toLowerCase();
        // If the deferral was just rejected or approved, add it to the actioned list
        if (s === 'rejected' || s === 'deferral_rejected' || s === 'approved' || s === 'deferral_approved') {
          setDeferrals(prev => {
            const exists = prev.some(d => String(d._id) === String(updated._id));
            if (exists) {
              return prev.map(d => d._id === updated._id ? updated : d);
            }
            // Add to the top if it's a newly rejected/approved item
            return [updated, ...prev];
          });
        }
      } catch (err) {
        console.warn('deferral:updated handler error in Actioned', err);
      }
    };

    window.addEventListener('deferral:updated', handler);
    return () => window.removeEventListener('deferral:updated', handler);
  }, []);

  // Poll the deferral while the modal is open so the approval flow stays live
  useEffect(() => {
    if (!selected || !modalOpen) return;
    let cancelled = false;
    const fetchLatest = async () => {
      try {
        const fresh = await deferralApi.getDeferralById(selected._id);
        if (!cancelled && fresh) setSelected(fresh);
      } catch (err) {
        console.debug('Actioned modal: failed to refresh deferral', err?.message || err);
      }
    };
    fetchLatest();
    const t = setInterval(fetchLatest, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [selected?._id, modalOpen]);

  const fetchActioned = async () => {
    setLoading(true);
    try {
      const data = await deferralApi.getActionedDeferrals(token);
      setDeferrals(data || []);
    } catch (err) {
      message.error('Failed to load actioned items');
    } finally {
      setLoading(false);
    }
  };

  const PROCESSING_BLUE = "#1890ff";

  const columns = [
    {
      title: "Deferral No",
      dataIndex: "deferralNumber",
      key: "deferralNumber",
      width: 140,
      render: (text) => (
        <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: '#7e6496' }} />
          {text}
        </div>
      )
    },
    {
      title: "DCL No",
      dataIndex: "dclNumber",
      key: "dclNumber",
      width: 120,
      render: (text) => <div style={{ color: '#7e6496', fontWeight: 500, fontSize: 13 }}>{text}</div>
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      width: 220,
      render: (text, record) => (
        <div style={{ fontWeight: 600, color: PRIMARY_BLUE, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CustomerServiceOutlined style={{ fontSize: 12 }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{record.businessName}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{record.customerNumber}</div>
          </div>
        </div>
      )
    },
    {
      title: "Loan Type",
      dataIndex: "loanType",
      key: "loanType",
      width: 120,
      render: (v) => <div style={{ fontSize: 12, fontWeight: 500 }}>{v}</div>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          pending_approval: { color: WARNING_ORANGE, text: "Pending", icon: <ClockCircleOutlined /> },
          in_review: { color: PROCESSING_BLUE, text: "In Review", icon: <ClockCircleOutlined /> },
          approved: { color: SUCCESS_GREEN, text: "Approved", icon: <CheckCircleOutlined /> },
          rejected: { color: ERROR_RED, text: "Rejected", icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <div style={{ fontSize: 12, fontWeight: 'bold', color: config.color || '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
            {config.icon}
            {config.text}
          </div>
        );
      }
    },
    {
      title: "Days Sought",
      dataIndex: "daysSought",
      key: "daysSought",
      width: 100,
      align: 'center',
      render: (days) => (
        <div style={{ fontWeight: 'bold', color: days > 45 ? ERROR_RED : days > 30 ? WARNING_ORANGE : PRIMARY_BLUE, fontSize: 14, backgroundColor: days > 45 ? '#fff2f0' : days > 30 ? '#fff7e6' : '#f0f7ff', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>{days} days</div>
      )
    },
    {
      title: "SLA",
      dataIndex: "slaExpiry",
      key: "slaExpiry",
      width: 120,
      render: (date) => {
        if (!date) return <div style={{ fontSize: 11, color: '#999' }}>N/A</div>;
        const daysLeft = dayjs(date).diff(dayjs(), 'days');
        const hoursLeft = dayjs(date).diff(dayjs(), 'hours');
        let color = SUCCESS_GREEN; let text = `${daysLeft}d`;
        if (daysLeft <= 0 && hoursLeft <= 0) { color = ERROR_RED; text = 'Expired'; }
        else if (daysLeft <= 0) { color = ERROR_RED; text = `${hoursLeft}h`; }
        else if (daysLeft <= 1) { color = ERROR_RED; text = `${daysLeft}d`; }
        else if (daysLeft <= 3) { color = WARNING_ORANGE; text = `${daysLeft}d`; }
        return <Tag color={color} style={{ fontWeight: 'bold', fontSize: 11, minWidth: 50, textAlign: 'center' }}>{text}</Tag>;
      }
    },
    {
      title: 'Actioned At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (d, r) => <Text>{dayjs(r.updatedAt || r.approvedAt || r.updatedAt).format('DD MMM YYYY HH:mm')}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => { setSelected(record); setModalOpen(true); }} style={{ color: PRIMARY_BLUE, fontWeight: 500 }}><EyeOutlined /> Review</Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <style>{customTableStyles}</style>
      <style>{modalCustomStyles}</style>

      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderLeft: `4px solid ${ACCENT_LIME || '#b5d334'}`
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, color: PRIMARY_BLUE, display: "flex", alignItems: "center", gap: 12 }}>
              Completed
              <Badge
                count={deferrals.length}
                style={{
                  backgroundColor: ACCENT_LIME || '#b5d334',
                  fontSize: 12
                }}
              />
            </h2>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
              Items you have approved or rejected
            </p>
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
              placeholder="Search by Customer, DCL, or ID"
              prefix={<SearchOutlined />}
              onChange={(e) => { /* Implement search filter if desired */ }}
              allowClear
              size="middle"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={() => { /* clear filters */ }} style={{ width: '100%' }} size="middle">Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : deferrals.length === 0 ? (
          <Empty
            description={
              <div>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No completed deferrals</p>
                <p style={{ color: "#999" }}>All actioned items are shown here</p>
              </div>
            }
            style={{ padding: 40 }}
          />
        ) : (
          <div className="deferral-pending-table" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Table
              columns={columns}
              dataSource={deferrals}
              rowKey={(r) => r._id || r.id}
              size="middle"
              pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10","20","50"], position: ["bottomCenter"] }}
              scroll={{ x: 1200 }}
              onRow={(record) => ({
                onClick: () => { setSelected(record); setModalOpen(true); }
              })}
              style={{ flex: 1 }}
            />
          </div>
        )}
      </Card>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BankOutlined /> <span>Deferral Request: {selected?.deferralNumber}</span></div>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={950}
        bodyStyle={{ padding: '0 24px 24px' }}
      >
        {selected && (
          <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Header */}
            <Card size="small" style={{ borderBottom: '1px solid #f0f0f0' }} styles={{ body: { padding: 14 } }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_BLUE }}>{`Deferral Request: ${selected.deferralNumber}`}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{selected.customerName}</div>
                </Col>
                <Col>
                  <Space>
                    <Tag color={selected.category === 'Allowable' ? 'green' : 'red'} style={{ fontWeight: 700 }}>{selected.category || '—'}</Tag>
                    {selected.priority ? (
                      <Tag color={selected.priority === 'high' ? 'red' : selected.priority === 'medium' ? 'orange' : 'blue'} style={{ fontWeight: 700 }}>{selected.priority.toUpperCase()} PRIORITY</Tag>
                    ) : null}
                  </Space>
                </Col>
              </Row>
            </Card>

            <div style={{ padding: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={16}>
                  <Card size="small" title="Customer Information">
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Customer Name" span={2}><div style={{ fontWeight: 700, color: PRIMARY_BLUE }}>{selected.customerName}</div></Descriptions.Item>
                      <Descriptions.Item label="Customer Number"><Tag color="blue">{selected.customerNumber || 'N/A'}</Tag></Descriptions.Item>
                      <Descriptions.Item label="Loan Type"><div>{selected.loanType || '—'}</div></Descriptions.Item>
                      <Descriptions.Item label="Created At"><div>{dayjs(selected.createdAt || selected.requestedDate).format('DD MMM YYYY HH:mm')}</div></Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card size="small" title="Deferral Details" style={{ marginTop: 12 }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Deferral Number"><div style={{ fontWeight: 700, color: PRIMARY_BLUE }}>{selected.deferralNumber}</div></Descriptions.Item>
                      <Descriptions.Item label="DCL No">{selected.dclNo || selected.dclNumber || <Tag color="error">Missing — please input DCL No</Tag>}</Descriptions.Item>
                      <Descriptions.Item label="Status"><Tag color={selected.status === 'approved' ? 'success' : selected.status === 'rejected' ? 'error' : 'processing'} style={{ fontWeight: 700 }}>{selected.status}</Tag></Descriptions.Item>
                      <Descriptions.Item label="Customer Name"><div style={{ fontWeight: 600 }}>{selected.customerName}</div></Descriptions.Item>
                      <Descriptions.Item label="Loan Amount">{selected.loanAmount ? (selected.loanAmount > 1000 ? `KSh ${selected.loanAmount.toLocaleString()}` : `${selected.loanAmount} M`) : 'Not specified'}{selected.loanAmount && selected.loanAmount <= 75 && <div style={{ color: SUCCESS_GREEN, fontWeight: 700, marginTop: 6 }}>Under 75 million</div>}</Descriptions.Item>
                      <Descriptions.Item label="Days Sought"><div style={{ fontWeight: 700 }}>{selected.daysSought || 0} days</div></Descriptions.Item>
                      <Descriptions.Item label="Next Due Date">{selected.nextDueDate ? dayjs(selected.nextDueDate).format('DD MMM YYYY') : 'Not calculated'}</Descriptions.Item>
                      <Descriptions.Item label="SLA Expiry">{selected.slaExpiry ? dayjs(selected.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}</Descriptions.Item>
                    </Descriptions>

                    {selected.deferralDescription && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Deferral Description</div><div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>{selected.deferralDescription}</div></div>)}
                  </Card>

                  {selected.facilities && selected.facilities.length > 0 && (
                    <Card size="small" title={`Facility Details (${selected.facilities.length})`} style={{ marginTop: 12 }}>
                      <Table dataSource={selected.facilities} columns={getFacilityColumns()} pagination={false} size="small" rowKey={(r)=> r.facilityNumber || r._id || `facility-${Math.random().toString(36).slice(2)}`} scroll={{ x: 600 }} />
                    </Card>
                  )}

                  {/* DCL Upload */}
                  {renderDclUpload()}

                  {/* Additional Documents */}
                  {(() => {
                    const additionalDocs = (selected.documents || []).filter(d => {
                      const name = (d.name || '').toString().toLowerCase();
                      const isDCLName = name.includes('dcl');
                      const matchesDclNo = selected.dclNo && name.includes((selected.dclNo || '').toString().toLowerCase());
                      return !(d.isDCL || isDCLName || matchesDclNo);
                    });
                    const count = additionalDocs.length;
                    return (
                      <Card size="small" title={<span style={{ color: PRIMARY_BLUE }}>Additional Documents ({count})</span>} style={{ marginTop: 12 }}>
                        {count === 0 ? (
                          <div style={{ color: '#999' }}>No additional documents uploaded</div>
                        ) : (
                          additionalDocs.map((doc, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid #f0f0f0' }}>
                              <div>
                                <div style={{ fontWeight: 700 }}>{doc.name}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>{doc.size ? `${(doc.size/1024).toFixed(2)} MB` : ''} {doc.uploadDate ? `• Uploaded: ${dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div>
                              </div>
                              <div><Tag color="cyan">Additional</Tag></div>
                            </div>
                          ))
                        )}
                      </Card>
                    );
                  })()}

                  {/* Approval Flow */}
                  <Card size="small" title="Approval Flow" style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(selected.approverFlow || selected.approvers || []).map((a, i)=>{
                        const isCurrent = (() => {
                          if (typeof selected?.currentApproverIndex === 'number') return i === selected.currentApproverIndex && !(a && (a.approved || a.approved === true));
                          const ca = selected?.currentApprover;
                          if (!ca) return i === 0 && !(a && (a.approved || a.approved === true));
                          const getKey = (item) => {
                            if (!item) return '';
                            if (typeof item === 'string') return item.toLowerCase();
                            return (String(item._id) || item.email || item.name || (item.user && (item.user.email || item.user.name)) || '').toLowerCase();
                          };
                          return getKey(a) === getKey(ca) && !(a && (a.approved || a.approved === true));
                        })();
                        const approverLabel = nameOf(a);
                        return (<div key={i} style={{ padding: '10px 12px', backgroundColor: isCurrent ? '#e6f7ff' : '#fafafa', borderRadius: 6, border: isCurrent ? `2px solid ${PRIMARY_BLUE}` : '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: isCurrent ? PRIMARY_BLUE : '#bfbfbf', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i+1}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{approverLabel}</div>{isCurrent && <div style={{ fontSize: 12, color: PRIMARY_BLUE, marginTop: 4 }}><ClockCircleOutlined /> Current Approver • Pending Approval {selected.slaExpiry && <span style={{ marginLeft: 8, color: WARNING_ORANGE }}>SLA: {dayjs(selected.slaExpiry).format('DD MMM HH:mm')}</span>}</div>}</div></div>);
                      })}
                    </div>
                  </Card>

                  {/* Comments Input Section */}
                  <Card size="small" style={{ marginBottom: 16, marginTop: 16 }}>
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

                  {/* Comment Trail & History */}
                  <div style={{ marginTop: 16 }}>
                    <h4>Comment Trail & History</h4>
                    {(selected.history && selected.history.length > 0) ? selected.history.map((h, idx)=> {
                      const userLabel = h.userName || (h.user && (typeof h.user === 'string' ? h.user : h.user.name)) || 'System';
                      return (<div key={idx} style={{ padding: 12, borderBottom: '1px solid #eee' }}><div style={{ fontWeight: 700 }}>{userLabel}</div><div style={{ fontSize: 12, color: '#666' }}>{dayjs(h.date || h.createdAt).format('DD MMM YYYY HH:mm')}</div><div style={{ marginTop: 8 }}>{h.comment || h.notes || h.message || ''}</div></div>);
                    }) : (<div style={{ color: '#666' }}>No history entries</div>)}
                  </div>
                </Col>

                {/* Timeline removed per request */}
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Actioned;