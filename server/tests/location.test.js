const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAndNormalizeCoordinates } = require('../services/location');
const { Complaint } = require('../models/Complaint');
const { buildAdminComplaintFilter, canReadComplaint } = require('../services/access');

test('missing or empty coordinates return null (text-only submission)', () => {
  assert.equal(validateAndNormalizeCoordinates(null), null);
  assert.equal(validateAndNormalizeCoordinates(undefined), null);
  assert.equal(validateAndNormalizeCoordinates(''), null);
  assert.equal(validateAndNormalizeCoordinates('   '), null);
});

test('valid boundary values for longitude and latitude are accepted', () => {
  // Center
  assert.deepEqual(validateAndNormalizeCoordinates([0, 0]), {
    type: 'Point',
    coordinates: [0, 0],
  });

  // Minimum boundaries: longitude -180, latitude -90
  assert.deepEqual(validateAndNormalizeCoordinates([-180, -90]), {
    type: 'Point',
    coordinates: [-180, -90],
  });

  // Maximum boundaries: longitude 180, latitude 90
  assert.deepEqual(validateAndNormalizeCoordinates([180, 90]), {
    type: 'Point',
    coordinates: [180, 90],
  });

  // Typical civic location (e.g. New Delhi: 77.2090 E, 28.6139 N)
  assert.deepEqual(validateAndNormalizeCoordinates([77.209, 28.6139]), {
    type: 'Point',
    coordinates: [77.209, 28.6139],
  });
});

test('accepts valid GeoJSON object and JSON strings', () => {
  const geoObj = { type: 'Point', coordinates: [77.209, 28.6139] };
  assert.deepEqual(validateAndNormalizeCoordinates(geoObj), {
    type: 'Point',
    coordinates: [77.209, 28.6139],
  });

  const jsonStr = JSON.stringify(geoObj);
  assert.deepEqual(validateAndNormalizeCoordinates(jsonStr), {
    type: 'Point',
    coordinates: [77.209, 28.6139],
  });

  const arrayJson = JSON.stringify([72.8777, 19.076]);
  assert.deepEqual(validateAndNormalizeCoordinates(arrayJson), {
    type: 'Point',
    coordinates: [72.8777, 19.076],
  });

  // Object with latitude and longitude properties
  assert.deepEqual(
    validateAndNormalizeCoordinates({ latitude: 19.076, longitude: 72.8777 }),
    {
      type: 'Point',
      coordinates: [72.8777, 19.076],
    },
  );
});

test('rejects out-of-range longitude', () => {
  assert.throws(
    () => validateAndNormalizeCoordinates([180.001, 25.0]),
    /Longitude must be between -180 and 180/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([-180.5, 25.0]),
    /Longitude must be between -180 and 180/i,
  );
});

test('rejects out-of-range latitude', () => {
  assert.throws(
    () => validateAndNormalizeCoordinates([77.0, 90.0001]),
    /Latitude must be between -90 and 90/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([77.0, -90.1]),
    /Latitude must be between -90 and 90/i,
  );
});

test('rejects malformed arrays and non-numeric values', () => {
  assert.throws(
    () => validateAndNormalizeCoordinates([]),
    /Coordinates must be an array of exactly two numbers/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([77.0]),
    /Coordinates must be an array of exactly two numbers/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([77.0, 28.0, 100.0]),
    /Coordinates must be an array of exactly two numbers/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates(['not-a-number', 28.0]),
    /Longitude must be a valid finite number/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([77.0, 'bad-latitude']),
    /Latitude must be a valid finite number/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates([NaN, 28.0]),
    /Longitude must be a valid finite number/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates('{ malformed json }'),
    /Coordinates must be valid GeoJSON/i,
  );
  assert.throws(
    () => validateAndNormalizeCoordinates({ type: 'Polygon', coordinates: [] }),
    /GeoJSON type must be "Point"/i,
  );
});

test('Complaint model defaults geoLocation to null when omitted', () => {
  const complaint = new Complaint({
    complaintId: 'UP-TEST-1',
    title: 'Test Complaint for Geo',
    description: 'This is a test description of sufficient length for validation.',
    category: 'Roads',
    location: '123 Test Street',
    citizen: '60c72b2f9b1d8b2bad000001',
    slaDeadline: new Date(),
  });

  assert.equal(complaint.geoLocation, null);
});

test('Complaint model accepts valid geoLocation and validates schema', () => {
  const complaint = new Complaint({
    complaintId: 'UP-TEST-2',
    title: 'Pothole at Intersection',
    description: 'Deep pothole causing traffic hazards on main road.',
    category: 'Roads',
    location: 'Connaught Place, New Delhi',
    geoLocation: {
      type: 'Point',
      coordinates: [77.2167, 28.6328],
    },
    citizen: '60c72b2f9b1d8b2bad000001',
    slaDeadline: new Date(),
  });

  assert.ok(complaint.geoLocation);
  assert.equal(complaint.geoLocation.type, 'Point');
  assert.deepEqual(complaint.geoLocation.coordinates, [77.2167, 28.6328]);
});

test('Complaint model schema validator catches out-of-bounds coordinates', async () => {
  const badComplaint = new Complaint({
    complaintId: 'UP-TEST-3',
    title: 'Out of bounds complaint',
    description: 'Test description with invalid coordinates in model.',
    category: 'Roads',
    location: 'Outer Space',
    geoLocation: {
      type: 'Point',
      coordinates: [195.0, 28.0],
    },
    citizen: '60c72b2f9b1d8b2bad000001',
    slaDeadline: new Date(),
  });

  await assert.rejects(async () => {
    await badComplaint.validate();
  }, /geoLocation\.coordinates/);
});

test('admin map filter restricts department officials to their assigned department', () => {
  const official = {
    _id: 'official-1',
    role: 'department_official',
    department: 'Roads',
  };

  // Official attempts to query Water department on map
  const filter = buildAdminComplaintFilter(official, {
    assignedDepartment: 'Water Supply',
  });
  assert.equal(filter.assignedDepartment, 'Roads');
});

test('admin map filter allows administrator to query all or filter by department', () => {
  const admin = {
    _id: 'admin-1',
    role: 'admin',
  };

  const allFilter = buildAdminComplaintFilter(admin, {});
  assert.equal(allFilter.assignedDepartment, undefined);

  const deptFilter = buildAdminComplaintFilter(admin, {
    assignedDepartment: 'Sanitation',
  });
  assert.equal(deptFilter.assignedDepartment, 'Sanitation');
});

test('admin map endpoint role gate rejects citizens with 403', () => {
  const { allowRoles } = require('../middleware/auth');
  const adminOrOfficial = allowRoles('admin', 'department_official');

  let statusCode = 200;
  let responseData = null;
  const mockRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  const citizenReq = { user: { _id: 'citizen-1', role: 'citizen' } };
  let nextCalled = false;
  adminOrOfficial(citizenReq, mockRes, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.equal(responseData.success, false);
});

test('admin map endpoint role gate allows administrators and officials', () => {
  const { allowRoles } = require('../middleware/auth');
  const adminOrOfficial = allowRoles('admin', 'department_official');

  let nextAdmin = false;
  adminOrOfficial({ user: { _id: 'admin-1', role: 'admin' } }, {}, () => {
    nextAdmin = true;
  });
  assert.equal(nextAdmin, true);

  let nextOfficial = false;
  adminOrOfficial(
    { user: { _id: 'official-1', role: 'department_official', department: 'Roads' } },
    {},
    () => {
      nextOfficial = true;
    },
  );
  assert.equal(nextOfficial, true);
});

test('citizen can only read their own complaint coordinates', () => {
  const citizenA = { _id: 'citizen-a', role: 'citizen' };
  const citizenB = { _id: 'citizen-b', role: 'citizen' };

  const complaintA = {
    complaintId: 'UP-1',
    citizen: 'citizen-a',
    geoLocation: { type: 'Point', coordinates: [77.2, 28.6] },
  };

  assert.equal(canReadComplaint(citizenA, complaintA), true);
  assert.equal(canReadComplaint(citizenB, complaintA), false);
});
