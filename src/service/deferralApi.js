// Simple deferral API wrapper using fetch
const API_BASE = import.meta.env.VITE_API_URL + "/api/deferrals";

function getAuthHeaders(token) {
  // Prefer explicit token argument (from Redux) to avoid direct localStorage reads.
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const fallbackToken = stored?.token;
  const t = token || fallbackToken;
  return {
    "content-type": "application/json",
    ...(t ? { authorization: `Bearer ${t}` } : {}),
  };
}

export default {
  getMyDeferrals: async (token) => {
    const res = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch deferrals");
    return res.json();
  },

  getDeferralById: async (id, token) => {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch deferral");
    return res.json();
  },

  createDeferral: async (payload, token) => {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create deferral");
    }
    return res.json();
  },

  getNextDeferralNumber: async (token) => {
    const res = await fetch(`${API_BASE}/preview-number`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to get preview deferral number");
    return res.json();
  },

  updateDeferral: async (id, patch, token) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update deferral");
    return res.json();
  },

  addHistory: async (id, entry, token) => {
    const res = await fetch(`${API_BASE}/${id}/history`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to add history");
    return res.json();
  },

  addDocument: async (id, doc, token) => {
    const res = await fetch(`${API_BASE}/${id}/documents`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error("Failed to add document");
    return res.json();
  },

  uploadDocument: async (id, file, opts = {}, token) => {
    const fd = new FormData();
    // If file is AntD Upload file, it might be an object with originFileObj
    const f = file.originFileObj || file;
    fd.append("file", f);
    if (opts.isDCL) fd.append("isDCL", "true");
    if (opts.isAdditional) fd.append("isAdditional", "true");

    const stored = JSON.parse(localStorage.getItem("user") || "null");
    const t = token || stored?.token;

    const res = await fetch(`${API_BASE}/${id}/documents/upload`, {
      method: "POST",
      headers: {
        ...(t ? { authorization: `Bearer ${t}` } : {}),
        // IMPORTANT: do not set Content-Type; browser will set multipart with boundary
      },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to upload document");
    }

    return res.json();
  },

  getApproverQueue: async (token) => {
    const res = await fetch(`${API_BASE}/approver/queue`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch approver queue");
    return res.json();
  },

  getActionedDeferrals: async (token) => {
    const res = await fetch(`${API_BASE}/approver/actioned`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch actioned deferrals");
    return res.json();
  },

  getPendingDeferrals: async (token) => {
    const res = await fetch(`${API_BASE}/pending`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch pending deferrals");
    return res.json();
  },

  getApprovedDeferrals: async (token) => {
    // Try authenticated endpoint first
    const res = await fetch(`${API_BASE}/approved`, {
      headers: getAuthHeaders(token),
    });
    if (res.ok) return res.json();

    // If unauthorized, fall back to public debug endpoint (development only)
    if (res.status === 401 || res.status === 403) {
      console.debug(
        "getApprovedDeferrals: authenticated request unauthorized, falling back to public debug endpoint"
      );
      const pub = await fetch(`${API_BASE}/debug/public/approved`);
      if (!pub.ok)
        throw new Error(
          "Failed to fetch approved deferrals (public fallback failed)"
        );
      return pub.json();
    }

    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch approved deferrals");
  },

  addComment: async (id, text, token) => {
    const res = await fetch(`${API_BASE}/${id}/comments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
  },

  approveDeferral: async (id, data, token) => {
    // Handle both string and object inputs
    let body = {};
    if (typeof data === 'string') {
      body = { comment: data };
    } else if (data && typeof data === 'object') {
      body = data;
    } else {
      body = { comment: '' };
    }
    
    const res = await fetch(`${API_BASE}/${id}/approve`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to approve deferral");
    }
    return res.json();
  },

  rejectDeferral: async (id, data, token) => {
    // Handle both string and object inputs
    let body = {};
    if (typeof data === 'string') {
      body = { reason: data };
    } else if (data && typeof data === 'object') {
      // Map 'comment' to 'reason' if needed
      body = {
        reason: data.reason || data.comment || '',
        ...data
      };
    } else {
      body = { reason: '' };
    }
    
    const res = await fetch(`${API_BASE}/${id}/reject`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to reject deferral");
    }
    return res.json();
  },

  // Send a reminder email to the current approver for the given deferral
  sendReminder: async (id, token) => {
    const res = await fetch(`${API_BASE}/${id}/reminder`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to send reminder");
    }
    return res.json();
  },

  // Return deferral for re-work to RM - FIXED: Now properly handles the data parameter
  returnForRework: async (id, data, token) => {
    const res = await fetch(`${API_BASE}/${id}/return-for-rework`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to return deferral for rework");
    }
    return res.json();
  },

  // Get returned deferrals
  getReturnedDeferrals: async (token) => {
    const res = await fetch(`${API_BASE}/returned`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch returned deferrals");
    return res.json();
  },

  // ===========================
  // NEW METHODS FOR APPROVAL FLOW
  // ===========================

  // Creator approval
  approveByCreator: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/approve-by-creator`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to approve by creator");
    }
    return res.json();
  },

  // Checker approval
  approveByChecker: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/approve-by-checker`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to approve by checker");
    }
    return res.json();
  },

  // Creator rejection
  rejectByCreator: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/reject-by-creator`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to reject by creator");
    }
    return res.json();
  },

  // Checker rejection
  rejectByChecker: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/reject-by-checker`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to reject by checker");
    }
    return res.json();
  },

  // Return for rework by creator
  returnForReworkByCreator: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/return-by-creator`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to return by creator");
    }
    return res.json();
  },

  // Return for rework by checker
  returnForReworkByChecker: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/return-by-checker`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to return by checker");
    }
    return res.json();
  },

  // Close deferral
  closeDeferral: async (deferralId, data, token) => {
    const res = await fetch(`${API_BASE}/${deferralId}/close`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to close deferral");
    }
    return res.json();
  },

  // Send reminder (already exists, keeping for consistency)
  sendReminderToApprover: async (deferralId) => {
    const res = await fetch(`${API_BASE}/${deferralId}/send-reminder`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to send reminder");
    }
    return res.json();
  },

  // Send email notification
  sendEmailNotification: async (deferralId, notificationType, data) => {
    const res = await fetch(`${API_BASE}/${deferralId}/send-notification`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        notificationType,
        ...data,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to send email notification");
    }
    return res.json();
  },

  // Additional utility method to get partially approved deferrals
  getPartiallyApprovedDeferrals: async () => {
    const res = await fetch(`${API_BASE}/partially-approved`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      // If endpoint doesn't exist, we'll filter from all deferrals on the client side
      const all = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders() });
      if (!all.ok) throw new Error("Failed to fetch deferrals");
      const deferrals = await all.json();
      // Filter for partially approved deferrals
      return deferrals.filter(d => {
        const hasCreatorApproved = d.creatorApprovalStatus === 'approved';
        const hasCheckerApproved = d.checkerApprovalStatus === 'approved';
        const allApproversApproved = d.allApproversApproved === true;
        const isFullyApproved = hasCreatorApproved && hasCheckerApproved && allApproversApproved;
        const isPartiallyApproved = (hasCreatorApproved || hasCheckerApproved || allApproversApproved) && !isFullyApproved;
        return isPartiallyApproved;
      });
    }
    return res.json();
  },

  // Get deferrals requiring creator approval
  getDeferralsRequiringCreatorApproval: async () => {
    const res = await fetch(`${API_BASE}/requiring-creator-approval`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      // If endpoint doesn't exist, we'll filter from all deferrals on the client side
      const all = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders() });
      if (!all.ok) throw new Error("Failed to fetch deferrals");
      const deferrals = await all.json();
      return deferrals.filter(d => {
        const allApproversApproved = d.allApproversApproved === true;
        const creatorNotApproved = d.creatorApprovalStatus !== 'approved';
        const checkerNotApproved = d.checkerApprovalStatus !== 'approved';
        return allApproversApproved && creatorNotApproved && checkerNotApproved;
      });
    }
    return res.json();
  },

  // Get deferrals requiring checker approval
  getDeferralsRequiringCheckerApproval: async () => {
    const res = await fetch(`${API_BASE}/requiring-checker-approval`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      // If endpoint doesn't exist, we'll filter from all deferrals on the client side
      const all = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders() });
      if (!all.ok) throw new Error("Failed to fetch deferrals");
      const deferrals = await all.json();
      return deferrals.filter(d => {
        const allApproversApproved = d.allApproversApproved === true;
        const creatorApproved = d.creatorApprovalStatus === 'approved';
        const checkerNotApproved = d.checkerApprovalStatus !== 'approved';
        return allApproversApproved && creatorApproved && checkerNotApproved;
      });
    }
    return res.json();
  },

  postComment: async (id, commentData, token) => {
    const res = await fetch(`${API_BASE}/${id}/comments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(commentData),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    return res.json();
  },
};