// scripts/initDb.ts
const admin = require('firebase-admin');

// Initialize without credentials for emulator use
admin.initializeApp({
  projectId: 'matchpoint-63148'
});

// Point to the Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Create a test user
    const userId = 'test-user-1';
    await db.collection('users').doc(userId).set({
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: true
    });
    console.log('Created test user');

    // Create a test group
    const groupId = 'test-group-1';
    await db.collection('groups').doc(groupId).set({
      id: groupId,
      name: 'Tennis Club',
      description: 'Weekly tennis matches',
      sport: 'Tennis',
      isPublic: true,
      location: 'City Tennis Courts',
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      memberCount: 1
    });
    console.log('Created test group');

    // Add user as group member
    const membershipId = `${groupId}_${userId}`;
    await db.collection('groupMembers').doc(membershipId).set({
      id: membershipId,
      groupId: groupId,
      userId: userId,
      role: 'admin',
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Added user as group member');

    // Create a test game
    const gameId = 'test-game-1';
    await db.collection('games').doc(gameId).set({
      id: gameId,
      title: 'Sunday Tennis Match',
      description: 'Friendly doubles match',
      groupId: groupId,
      sport: 'Tennis',
      location: 'City Tennis Courts',
      date: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      status: 'UPCOMING',
      maxParticipants: 4,
      currentParticipants: 1,
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Created test game');

    // Add user as game participant
    const participantId = `${gameId}_${userId}`;
    await db.collection('gameParticipants').doc(participantId).set({
      id: participantId,
      gameId: gameId,
      userId: userId,
      status: 'CONFIRMED',
      isGuest: false,
      registeredAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Added user as game participant');

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
