import bcrypt from 'bcrypt'; // You need this to hash passwords manually
import { faker } from '@faker-js/faker';
import User from './src/models/userModel.ts'; // Adjust path to your userModel
import dotenv from 'dotenv';
import db from "./src/config/db.ts";

dotenv.config();
db(); // Initialize DB connection

const USERS_TO_CREATE = 20; // How many random users to add

const seedUsers = async () => {
  try {
    // 1. Clear existing users
    // await User.deleteMany({});
    console.log('Existing users cleared.');

    // 2. Prepare the password hash
    // We hash '123456' ONCE to save CPU time during the loop
    const salt = await bcrypt.genSalt(12);
    const genericPassword = await bcrypt.hash('password_of_your_choice', salt);

    const userBuffer = [];

    // 3. Create Fixed Test Accounts (So you always know how to login)
    
    // --- ADMIN USER ---
    userBuffer.push({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: genericPassword, // Already hashed
      role: 'admin',
      emailVerified: true,
      isActive: true,
    });

    // --- STANDARD USER ---
    userBuffer.push({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'user@example.com',
      password: genericPassword,
      role: 'user',
      emailVerified: true,
      isActive: true,
    });

    // 4. Create Random Dummy Users
    for (let i = 0; i < USERS_TO_CREATE; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      // We ensure unique emails by appending the index or using faker properly
      // .toLowerCase() is used because your schema enforces it
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      userBuffer.push({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: genericPassword, // Everyone gets password '123456'
        role: 'user', // Default role
        emailVerified: Math.random() > 0.5, // 50% chance verified
        isActive: true,
      });
    }

    // 5. Bulk Insert
    // Note: insertMany does NOT trigger the pre('save') hook in your schema.
    // That is why we hashed the password manually above.
    await User.insertMany(userBuffer);

    console.log(`✅ Successfully seeded ${userBuffer.length} users.`);
    console.log('---------------------------------------------------');
    console.log('Credentials for testing:');
    console.log('Admin: admin@example.com  / 123456');
    console.log('User:  user@example.com   / 123456');
    console.log('---------------------------------------------------');
    
    process.exit();

  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();