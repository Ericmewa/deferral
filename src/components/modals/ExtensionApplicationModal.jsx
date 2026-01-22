import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Space,
  Descriptions,
  Tag,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const PRIMARY_BLUE = "#164679";
const ERROR_RED = "#ff4d4f";

const ExtensionApplicationModal = ({ open, onClose, deferral, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting extension:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Apply for Extension"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={600}
      styles={{
        header: { backgroundColor: PRIMARY_BLUE },
        title: { color: "white" },
      }}
    >
      <div style={{ marginBottom: 24 }}>
        {/* Deferral Details */}
        <Descriptions size="small" bordered style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Deferral Number" span={3}>
            <strong>{deferral?.deferralNumber}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Customer" span={3}>
            {deferral?.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Current Days Sought" span={3}>
            <Tag color="blue">{deferral?.daysSought || 0} days</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            requestedDaysSought: deferral?.daysSought || 0,
            extensionReason: "",
          }}
        >
          {/* Requested Days */}
          <Form.Item
            label="Requested Days"
            name="requestedDaysSought"
            rules={[
              { required: true, message: "Please enter requested days" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const currentDays = deferral?.daysSought || 0;
                  if (value <= currentDays) {
                    return Promise.reject(
                      new Error(`Must be greater than ${currentDays} current days`)
                    );
                  }
                  if (value > currentDays + 90) {
                    return Promise.reject(
                      new Error("Cannot exceed 90 additional days")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: "100%" }}
              placeholder="Enter additional days needed"
            />
          </Form.Item>

          {/* Extension Reason */}
          <Form.Item
            label="Reason for Extension"
            name="extensionReason"
            rules={[
              { required: true, message: "Please provide a reason" },
              { min: 10, message: "Reason must be at least 10 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Explain why this extension is needed..."
              maxLength={500}
            />
          </Form.Item>

          {/* Info Box */}
          <div
            style={{
              backgroundColor: "#f0f5ff",
              border: `1px solid ${PRIMARY_BLUE}`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 12, color: PRIMARY_BLUE }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              <strong>Extension Workflow:</strong> This request will follow the
              same approval process as the original deferral:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>→ All selected approvers must approve</li>
                <li>→ Then Creator review</li>
                <li>→ Finally Checker review</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting || loading}
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              Submit Extension Request
            </Button>
          </Space>
        </Form>
      </div>
    </Modal>
  );
};

export default ExtensionApplicationModal;
