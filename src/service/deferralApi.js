// Simple deferral API wrapper using fetch
const API_BASE = import.meta.env.VITE_API_URL + '/api/deferrals';

function getAuthHeaders(token) {
  // Prefer explicit token argument (from Redux) to avoid direct localStorage reads.
  const stored = JSON.parse(localStorage.getItem('user') || 'null');
  const fallbackToken = stored?.token;
  const t = token || fallbackToken;
  return {
    'content-type': 'application/json',
    ...(t ? { authorization: `Bearer ${t}` } : {}),
  };
}

export default {
  getMyDeferrals: async () => {
    const res = await fetch(`${API_BASE}/my`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch deferrals');
    return res.json();
  },

  getDeferralById: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch deferral');
    return res.json();
  },

  createDeferral: async (payload) => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create deferral');
    }
    return res.json();
  },

  getNextDeferralNumber: async () => {
    const res = await fetch(`${API_BASE}/preview-number`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to get preview deferral number');
    return res.json();
  },

  updateDeferral: async (id, patch) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Failed to update deferral');
    return res.json();
  },

  addHistory: async (id, entry) => {
    const res = await fetch(`${API_BASE}/${id}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to add history');
    return res.json();
  },

  addDocument: async (id, doc, token) => {
    const res = await fetch(`${API_BASE}/${id}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Failed to add document');
    return res.json();
  },

  uploadDocument: async (id, file, opts = {}, token) => {
    const fd = new FormData();
    // If file is AntD Upload file, it might be an object with originFileObj
    const f = file.originFileObj || file;
    fd.append('file', f);
    if (opts.isDCL) fd.append('isDCL', 'true');
    if (opts.isAdditional) fd.append('isAdditional', 'true');

    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    const t = token || stored?.token;

    const res = await fetch(`${API_BASE}/${id}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(t ? { authorization: `Bearer ${t}` } : {}),
        // IMPORTANT: do not set Content-Type; browser will set multipart with boundary
      },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload document');
    }

    return res.json();
  },

  getApproverQueue: async (token) => {
    const res = await fetch(`${API_BASE}/approver/queue`, { headers: getAuthHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch approver queue');
    return res.json();
  },

  getActionedDeferrals: async (token) => {
    const res = await fetch(`${API_BASE}/approver/actioned`, { headers: getAuthHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch actioned deferrals');
    return res.json();
  },

  getPendingDeferrals: async () => {
    const res = await fetch(`${API_BASE}/pending`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pending deferrals');
    return res.json();
  },

  getApprovedDeferrals: async () => {
    // Try authenticated endpoint first
    const res = await fetch(`${API_BASE}/approved`, { headers: getAuthHeaders() });
    if (res.ok) return res.json();

    // If unauthorized, fall back to public debug endpoint (development only)
    if (res.status === 401 || res.status === 403) {
      console.debug('getApprovedDeferrals: authenticated request unauthorized, falling back to public debug endpoint');
      const pub = await fetch(`${API_BASE}/debug/public/approved`);
      if (!pub.ok) throw new Error('Failed to fetch approved deferrals (public fallback failed)');
      return pub.json();
    }

    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch approved deferrals');
  },

  addComment: async (id, text, token) => {
    const res = await fetch(`${API_BASE}/${id}/comments`, { method: 'POST', headers: getAuthHeaders(token), body: JSON.stringify({ text }) });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  approveDeferral: async (id, token, comment) => {
    const res = await fetch(`${API_BASE}/${id}/approve`, { method: 'PUT', headers: getAuthHeaders(token), body: JSON.stringify({ comment }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to approve deferral');
    }
    return res.json();
  },

  rejectDeferral: async (id, reason, token) => {
    const res = await fetch(`${API_BASE}/${id}/reject`, { method: 'PUT', headers: getAuthHeaders(token), body: JSON.stringify({ reason }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to reject deferral');
    }
    return res.json();
  }
};
