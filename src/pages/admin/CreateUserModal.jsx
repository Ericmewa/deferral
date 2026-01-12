// export default CreateUserModal;
import React, { useMemo } from "react";
import { Modal, Input, Select, Form, Button } from "antd";

const roleOptions = [
  { value: "rm", label: "Relationship Manager" },
  { value: "approver", label: "Approver" },
  { value: "cocreator", label: "CO Creator" },
   { value: "customer", label: "Customer" },
  { value: "cochecker", label: "CO Checker" },
  { value: "admin", label: "Admin" },
];

const CreateUserModal = ({
  visible,
  loading,
  formData,
  setFormData,
  onCreate,
  onClose,
}) => {
  const roles = useMemo(() => roleOptions, []);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose={false}
      width={380}
      className="dark:bg-gray-900"
      styles={{ body: { padding: "10px 16px", background: "var(--modal-bg)" } }}
      title={
        <div className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
          Create New User
        </div>
      }
    >
      <div className="dark:bg-gray-900">
        <Form
          layout="vertical"
          onFinish={onCreate}
          className="space-y-3 sm:space-y-2"
        >
          {/* NAME */}
          <Form.Item
            label={
              <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Name
              </span>
            }
            required
            className="mb-2"
          >
            <Input
              size="middle"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-md dark:bg-gray-800 dark:text-gray-100"
            />
          </Form.Item>

          {/* EMAIL */}
          <Form.Item
            label={
              <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Email
              </span>
            }
            required
            className="mb-2"
          >
            <Input
              type="email"
              size="middle"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="rounded-md dark:bg-gray-800 dark:text-gray-100"
            />
          </Form.Item>

          {/* PASSWORD */}
          <Form.Item
            label={
              <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Password
              </span>
            }
            required
            className="mb-2"
          >
            <Input.Password
              size="middle"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="rounded-md dark:bg-gray-800 dark:text-gray-100"
            />
          </Form.Item>

          {/* ROLE */}
          <Form.Item
            label={
              <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Role
              </span>
            }
            className="mb-3"
          >
            <Select
              size="middle"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={roles}
              className="rounded-md dark:bg-gray-800 dark:text-gray-100"
              popupMatchSelectWidth={260}
            />
          </Form.Item>

          {/* POSITION (only for approvers) */}
          {formData.role === 'approver' && (
            <Form.Item
              label={<span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Position / Title</span>}
              className="mb-3"
            >
              <Input
                size="middle"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Head of Business Segment"
                className="rounded-md dark:bg-gray-800 dark:text-gray-100"
              />
            </Form.Item>
          )}

          {/* BUTTON */}
          <Button
            htmlType="submit"
            type="primary"
            block
            loading={loading}
            className="h-9 text-sm font-medium rounded-md
                       bg-gray-700 dark:bg-gray-600 
                       hover:bg-gray-800 dark:hover:bg-gray-500 
                       text-white"
          >
            Create User
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
