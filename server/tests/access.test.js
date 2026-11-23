const test = require('node:test');
const assert = require('node:assert/strict');
const { canReadComplaint, buildAdminComplaintFilter } = require('../services/access');

test('citizens can only read their own complaint even when populated', () => {
  const user = { _id: 'citizen-1', role: 'citizen' };
  assert.equal(canReadComplaint(user, { citizen: { _id: 'citizen-1', name: 'A Citizen' } }), true);
  assert.equal(canReadComplaint(user, { citizen: { _id: 'citizen-2', name: 'Other Citizen' } }), false);
});

test('department officials can only read their assigned department', () => {
  const user = { _id: 'official-1', role: 'department_official', department: 'Electrical' };
  assert.equal(canReadComplaint(user, { assignedDepartment: 'Electrical' }), true);
  assert.equal(canReadComplaint(user, { assignedDepartment: 'Sanitation' }), false);
});

test('department official cannot override server-side department scope with query parameters', () => {
  const user = { _id: 'official-1', role: 'department_official', department: 'Electrical' };
  const filter = buildAdminComplaintFilter(user, { assignedDepartment: 'Sanitation', q: 'lamp' });
  assert.equal(filter.assignedDepartment, 'Electrical');
  assert.equal(filter.$or[0].complaintId.$regex, 'lamp');
});

test('administrator can use a valid department filter', () => {
  const user = { _id: 'admin-1', role: 'admin' };
  const filter = buildAdminComplaintFilter(user, { assignedDepartment: 'Water Supply' });
  assert.equal(filter.assignedDepartment, 'Water Supply');
});
