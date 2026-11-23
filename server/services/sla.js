const { Complaint } = require('../models/Complaint');

async function applySlaEscalations() {
  const now = new Date();
  const overdue = await Complaint.find({
    status: { $nin: ['Resolved', 'Rejected'] },
    slaDeadline: { $lt: now },
    isEscalated: false,
  }).select('_id complaintId').lean();

  if (!overdue.length) return 0;

  await Promise.all(overdue.map(({ _id, complaintId }) => Complaint.updateOne(
    { _id, isEscalated: false },
    {
      $set: { isEscalated: true, escalatedAt: now },
      $push: { history: {
        action: 'SLA escalation',
        note: `The resolution target for ${complaintId} passed. Flagged for administrator attention.`,
        changedByName: 'UrbanPulse SLA monitor',
        createdAt: now,
      } },
    },
  )));

  return overdue.length;
}

function isOverdue(complaint) {
  return !['Resolved', 'Rejected'].includes(complaint.status) && new Date(complaint.slaDeadline) < new Date();
}

module.exports = { applySlaEscalations, isOverdue };
