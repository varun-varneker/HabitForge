// One-time migration script to add usernameLowercase field to existing users
// Run this once with: node migrate-usernames.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Your Firebase config (copy from src/firebase.js)
const firebaseConfig = {
  // Add your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsernames() {
  console.log('Starting username migration...');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`Found ${snapshot.size} users to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      
      // Check if usernameLowercase already exists
      if (data.usernameLowercase) {
        console.log(`Skipping ${data.username} - already has usernameLowercase`);
        skipped++;
        continue;
      }
      
      // Add usernameLowercase field
      if (data.username) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          usernameLowercase: data.username.toLowerCase()
        });
        console.log(`✓ Migrated: ${data.username} → ${data.username.toLowerCase()}`);
        migrated++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${snapshot.size}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateUsernames();
