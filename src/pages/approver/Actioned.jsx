import React, { useEffect, useState } from "react";
import { Table, Card, Empty, message, Modal, Typography, Spin, Tag, Descriptions, Space, Badge, Row, Col } from "antd";
import dayjs from "dayjs";
import { FileTextOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import deferralApi from "../../service/deferralApi";

const { Text } = Typography;

const Actioned = () => {

  const PRIMARY_BLUE = "#164679";
  const SUCCESS_GREEN = "#52c41a";
  const WARNING_ORANGE = "#faad14";

  const token = useSelector((s) => s.auth.token);
  const [deferrals, setDeferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const dclDocs = (selected && (selected.documents||[]).filter(d=> (d.isDCL) || (d.name && /dcl/i.test(d.name)) || (selected.dclNo && d.name && d.name.toLowerCase().includes((selected.dclNo||'').toLowerCase())))) || [];

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

  useEffect(() => {
    fetchActioned();
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

  const columns = [
    { title: 'Deferral No', dataIndex: 'deferralNumber', key: 'deferralNumber', render: (val) => <Text strong>{val}</Text> },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', render: (val) => <span>{safe(val)}</span> },
    { title: 'DCL No', dataIndex: 'dclNumber', key: 'dclNumber', render: (val) => <span>{safe(val)}</span> },
    { title: 'Document', dataIndex: 'document', key: 'document', render: (val) => <span>{safe(val)}</span> },
    { title: 'Days Sought', dataIndex: 'daysSought', key: 'daysSought', render: (d) => <Text>{d} days</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Actioned At', dataIndex: 'updatedAt', key: 'updatedAt', render: (d, r) => <Text>{dayjs(r.updatedAt || r.approvedAt || r.updatedAt).format('DD MMM YYYY HH:mm')}</Text> }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Actioned</h2>
        <p style={{ marginTop: 6, color: '#666' }}>Items you have approved or rejected</p>
      </Card>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
        ) : deferrals.length === 0 ? (
          <Empty description="No actioned deferrals" />
        ) : (
          <Table
            columns={columns}
            dataSource={deferrals}
            rowKey={(r) => r._id || r.id}
            onRow={(record) => ({
              onClick: () => {
                setSelected(record);
                setModalOpen(true);
              },
            })}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title={selected ? `Deferral Request: ${selected.deferralNumber}` : 'Deferral'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={950}
      >
        {selected && (
          <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Header */}
            <Card size="small" style={{ borderBottom: '1px solid #f0f0f0' }} bodyStyle={{ padding: 14 }}>
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
                      <Descriptions.Item label="Deferral Title"><div style={{ fontWeight: 600 }}>{selected.deferralTitle || selected.customerName}</div></Descriptions.Item>
                      <Descriptions.Item label="Loan Amount">{selected.loanAmount ? (selected.loanAmount > 1000 ? `KSh ${selected.loanAmount.toLocaleString()}` : `${selected.loanAmount} M`) : 'Not specified'}{selected.loanAmount && selected.loanAmount <= 75 && <div style={{ color: SUCCESS_GREEN, fontWeight: 700, marginTop: 6 }}>Under 75 million</div>}</Descriptions.Item>
                      <Descriptions.Item label="Days Sought"><div style={{ fontWeight: 700 }}>{selected.daysSought || 0} days</div></Descriptions.Item>
                      <Descriptions.Item label="Next Due Date">{selected.nextDueDate ? dayjs(selected.nextDueDate).format('DD MMM YYYY') : 'Not calculated'}</Descriptions.Item>
                      <Descriptions.Item label="SLA Expiry">{selected.slaExpiry ? dayjs(selected.slaExpiry).format('DD MMM YYYY HH:mm') : 'Not set'}</Descriptions.Item>
                    </Descriptions>

                    {selected.deferralDescription && (<div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Deferral Description</div><div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>{selected.deferralDescription}</div></div>)}
                  </Card>

                  {/* Documents Requested */}
                  <Card size="small" title={`Documents Requested for Deferrals (${(selected.selectedDocuments||[]).length})`} style={{ marginTop: 12 }}>
                    {(selected.selectedDocuments||[]).map((doc, idx) => (
                      <div key={`req-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{typeof doc === 'string' ? doc : (doc.name || doc.label || 'Document')}</div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Type: {doc.type || 'Secondary'}</div>
                        </div>
                        <div style={{ color: '#999' }}><Tag color="orange">Requested</Tag></div>
                      </div>
                    ))}
                  </Card>

                  {/* DCL Upload */}
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

                  {/* Additional Documents */}
                  <Card size="small" title={`Additional Documents (${(selected.documents||[]).filter(d=> !((d.isDCL) || (d.name && /dcl/i.test(d.name)) || (selected.dclNo && d.name && d.name.toLowerCase().includes((selected.dclNo||'').toLowerCase())))).length})`} style={{ marginTop: 12 }}>
                    {(selected.documents||[]).filter(d=> !((d.isDCL) || (d.name && /dcl/i.test(d.name)) || (selected.dclNo && d.name && d.name.toLowerCase().includes((selected.dclNo||'').toLowerCase())))).length === 0 ? (<div style={{ color: '#999' }}>No additional documents uploaded</div>) : ((selected.documents||[]).filter(d=> !((d.isDCL) || (d.name && /dcl/i.test(d.name)) || (selected.dclNo && d.name && d.name.toLowerCase().includes((selected.dclNo||'').toLowerCase())))).map((doc, i)=> (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid #f0f0f0' }}><div><div style={{ fontWeight: 700 }}>{doc.name}</div><div style={{ fontSize: 12, color: '#666' }}>{doc.size ? `${(doc.size/1024).toFixed(2)} MB` : ''} {doc.uploadDate ? `• Uploaded: ${dayjs(doc.uploadDate).format('DD MMM YYYY HH:mm')}` : ''}</div></div><div><Tag color="cyan">Additional</Tag></div></div>))) }
                  </Card>

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



