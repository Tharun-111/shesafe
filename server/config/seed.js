const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const { Alert, Trip, Ride } = require('../models/index');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany();
  await EmergencyContact.deleteMany();
  await Alert.deleteMany();
  await Trip.deleteMany();
  await Ride.deleteMany();
  console.log('Cleared existing data');

  // Create demo users
  const user1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@shesafe.com',
    phone: '9876543210',
    password: 'demo1234',
    homeAddress: 'Koramangala, Bangalore',
  });

  const user2 = await User.create({
    name: 'Aisha Khan',
    email: 'aisha@shesafe.com',
    phone: '9876500001',
    password: 'demo1234',
    homeAddress: 'Bandra, Mumbai',
  });

  const user3 = await User.create({
    name: 'Neha Verma',
    email: 'neha@shesafe.com',
    phone: '9876500002',
    password: 'demo1234',
    homeAddress: 'Connaught Place, Delhi',
  });

  console.log('✅ Users created');

  // Emergency contacts for user1
  await EmergencyContact.create([
    {
      user: user1._id,
      name: 'Rahul Sharma',
      phone: '9111111111',
      relationship: 'Brother',
      email: 'rahul@example.com',
    },
    {
      user: user1._id,
      name: 'Sunita Sharma',
      phone: '9222222222',
      relationship: 'Mother',
    },
  ]);

  await EmergencyContact.create([
    {
      user: user2._id,
      name: 'Arjun Khan',
      phone: '9333333333',
      relationship: 'Husband',
    },
  ]);

  console.log('✅ Emergency contacts created');

  // Community alerts around Bangalore
  await Alert.create([
    {
      reportedBy: user2._id,
      reporterName: 'Aisha K.',
      type: 'POOR_LIGHTING',
      description: 'Very dark stretch near the underpass after 8 PM. No streetlights.',
      location: 'Silk Board Flyover Underpass',
      coords: { lat: 12.9177, lng: 77.6225 },
      votes: 12,
      severity: 'HIGH',
    },
    {
      reportedBy: user3._id,
      reporterName: 'Neha V.',
      type: 'HARASSMENT',
      description: 'Group of men on bikes harassing pedestrians near the park.',
      location: 'Cubbon Park North Gate',
      coords: { lat: 12.9795, lng: 77.5908 },
      votes: 8,
      severity: 'HIGH',
    },
    {
      reportedBy: user1._id,
      reporterName: 'Anonymous',
      type: 'UNSAFE_AREA',
      description: 'Isolated road with no CCTV. Avoid after 9 PM.',
      location: 'HSR Layout Sector 4',
      coords: { lat: 12.9121, lng: 77.6446 },
      votes: 5,
      severity: 'MEDIUM',
    },
    {
      reportedBy: user2._id,
      reporterName: 'Aisha K.',
      type: 'SUSPICIOUS',
      description: 'Suspicious person following women near ATM.',
      location: 'Indiranagar 100ft Road',
      coords: { lat: 12.9719, lng: 77.6412 },
      votes: 7,
      severity: 'MEDIUM',
    },
    {
      reportedBy: user3._id,
      reporterName: 'Anonymous',
      type: 'POOR_LIGHTING',
      description: 'No lighting on footpath, multiple potholes.',
      location: 'Koramangala 1st Block',
      coords: { lat: 12.9347, lng: 77.6243 },
      votes: 3,
      severity: 'LOW',
    },
  ]);

  console.log('✅ Community alerts seeded');

  // Sample trip history for user1
  await Trip.create([
    {
      user: user1._id,
      destination: 'Phoenix Mall, Whitefield',
      startLocation: 'Koramangala',
      eta: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'SAFE',
      markedSafeAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
      startCoords: { lat: 12.9347, lng: 77.6243 },
    },
    {
      user: user1._id,
      destination: 'Bangalore Airport',
      startLocation: 'HSR Layout',
      eta: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'SAFE',
      markedSafeAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      startCoords: { lat: 12.9121, lng: 77.6446 },
    },
  ]);

  // Sample rides for user1
  await Ride.create([
    {
      user: user1._id,
      vehicleNumber: 'KA 01 AB 1234',
      vehicleType: 'Cab',
      driverName: 'Ravi Kumar',
      fromLocation: 'Koramangala',
      toLocation: 'MG Road',
      coords: { lat: 12.9347, lng: 77.6243 },
    },
    {
      user: user1._id,
      vehicleNumber: 'KA 03 CD 5678',
      vehicleType: 'Auto',
      driverName: 'Suresh',
      fromLocation: 'HSR Layout',
      toLocation: 'Indiranagar',
      coords: { lat: 12.9121, lng: 77.6446 },
    },
  ]);

  console.log('✅ Trips and rides seeded');
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Demo Login Credentials:');
  console.log('  Email: priya@shesafe.com');
  console.log('  Password: demo1234');
  console.log('─────────────────────────────────');

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
