import React from "react";
import {
  Button,
  Select,
  Typography,
  Divider,
  Avatar
} from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ApproverSelector({
  slots = [],
  availableApprovers = [],
  updateApprover,
  addApprover,
  removeApprover,
  onSubmitDeferral,
  isSubmitting,
  onCancel,
  currentUser = { name: "Requestor", role: "rm" }
}) {
  const selectedCount = slots.filter(s => s.userId).length;

  const handleAdd = (afterIndex = null) => {
    // default role when adding a custom approver
    addApprover("Approver");
  };

  return (
    <>
      <Title level={4} style={{ color: "#2B1C67", marginBottom: 8 }}>
        Approver Selection
      </Title>

      <Divider style={{ margin: "16px 0" }} />

      {/* Sequential list: Requestor + slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Requestor (top) */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 48, display: "flex", justifyContent: "center" }}>
            <Avatar size={40} icon={<UserOutlined />} style={{ background: '#fff', color: '#2B1C67', border: '2px solid #f0f0f0' }} />
            <div style={{ width: 2, height: 24, background: '#eaeaea', margin: '4px auto 0' }} />
          </div>
          <div style={{ flex: 1 }}>
            <Text strong>{currentUser.name || 'Requestor'}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>Requestor</div>
          </div>
        </div>

        {/* Approval slots */}
        {slots.map((slot, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 48, display: "flex", justifyContent: "center" }}>
              <Avatar size={40} style={{ background: '#fff', color: '#2B1C67', border: '2px solid #f0f0f0' }} icon={<UserOutlined />} />
              {idx < slots.length - 1 && <div style={{ width: 2, height: 24, background: '#eaeaea', margin: '4px auto 0' }} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 13 }}>{slot.role}</Text>
                <div>
                  {slots.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeApprover(idx)}
                      style={{ padding: 0, fontSize: 11, color: '#ff4d4f' }}
                    />
                  )}
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <Select
                  value={slot.userId}
                  onChange={(value) => updateApprover(idx, value)}
                  style={{ width: '100%' }}
                  placeholder={`Select ${slot.role}`}
                  size="middle"
                  showSearch
                  optionFilterProp="children"
                >
                  <Option value="">-- Choose Approver --</Option>
                  {Array.isArray(availableApprovers) && availableApprovers.length > 0 ? (
                    (() => {
                      const matching = availableApprovers.filter((a) => a.position === slot.role);
                      const others = availableApprovers.filter((a) => a.position !== slot.role);
                      return (
                        <>
                          {matching.map((a) => (
                            <Option key={a._id} value={a._id}>{a.name} — {a.position}</Option>
                          ))}
                          {others.map((a) => (
                            <Option key={a._id} value={a._id}>{a.name}{a.position ? ` — ${a.position}` : ''}</Option>
                          ))}
                        </>
                      );
                    })()
                  ) : (
                    <Option value="">No approvers available</Option>
                  )}
                </Select>
              </div>
            </div>
          </div>
        ))}

        {/* Add button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => handleAdd()} icon={<PlusOutlined />}>Add</Button>
        </div>

        <Divider />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="default"
            size="large"
            onClick={onCancel}
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            onClick={onSubmitDeferral}
            loading={isSubmitting}
            size="large"
            type="primary"
            style={{ flex: 1 }}
            disabled={selectedCount === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Deferral"}
          </Button>
        </div>

        <div style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>
          <Text type="secondary">{selectedCount} approver(s) selected</Text>
        </div>

      </div>
    </>
  );
}