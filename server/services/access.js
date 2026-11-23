const { CATEGORIES, STATUSES, DEPARTMENTS } = require('../constants');
const PRIORITIES = ['Low', 'Medium', 'High'];

const FINAL_STATUSES = ['Resolved', 'Rejected'];

function canReadComplaint(user, complaint) {
  if (user.role === 'admin') return true;
  if (user.role === 'department_official') return complaint.assignedDepartment === user.department;
  const citizenId = complaint.citizen && complaint.citizen._id ? complaint.citizen._id : complaint.citizen;
  return String(citizenId) === String(user._id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildAdminComplaintFilter(user, query = {}, now = new Date()) {
  const filter = user.role === 'department_official' ? { assignedDepartment: user.department } : {};
  const allowedFilters = { status: STATUSES, category: CATEGORIES, priority: PRIORITIES };
  for (const [key, values] of Object.entries(allowedFilters)) {
    if (typeof query[key] === 'string' && query[key] !== 'All' && values.includes(query[key])) filter[key] = query[key];
  }
  // Only an administrator may select a department filter. An official's
  // department is always anchored to the authenticated user record.
  if (user.role === 'admin' && query.assignedDepartment && query.assignedDepartment !== 'All'
    && DEPARTMENTS.includes(query.assignedDepartment)) {
    filter.assignedDepartment = query.assignedDepartment;
  }
  if (query.overdue === 'true') {
    filter.status = { $nin: FINAL_STATUSES };
    filter.slaDeadline = { $lt: now };
  }
  const search = String(query.q || '').trim().slice(0, 100);
  if (search) {
    const safeQuery = escapeRegex(search);
    filter.$or = [
      { complaintId: { $regex: safeQuery, $options: 'i' } },
      { title: { $regex: safeQuery, $options: 'i' } },
      { location: { $regex: safeQuery, $options: 'i' } },
    ];
  }
  return filter;
}

module.exports = { canReadComplaint, buildAdminComplaintFilter, escapeRegex };
