/**
 * Seed script to populate the database with realistic sample data.
 * Run with: node src/seed.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const seedData = [
  // Personal Income
  { amount: 3500, transaction_type: 'PERSONAL_INCOME', description: 'Monthly salary', date: new Date('2024-01-01') },
  { amount: 250, transaction_type: 'PERSONAL_INCOME', description: 'Freelance project payment', date: new Date('2024-01-15') },
  { amount: 3500, transaction_type: 'PERSONAL_INCOME', description: 'Monthly salary', date: new Date('2024-02-01') },

  // Personal Expenses
  { amount: 1200, transaction_type: 'PERSONAL_EXPENSE', description: 'Rent', date: new Date('2024-01-05') },
  { amount: 85, transaction_type: 'PERSONAL_EXPENSE', description: 'Groceries', date: new Date('2024-01-10') },
  { amount: 45, transaction_type: 'PERSONAL_EXPENSE', description: 'Internet bill', date: new Date('2024-01-12') },
  { amount: 120, transaction_type: 'PERSONAL_EXPENSE', description: 'Electricity bill', date: new Date('2024-01-20') },
  { amount: 60, transaction_type: 'PERSONAL_EXPENSE', description: 'Dinner out', date: new Date('2024-01-25') },
  { amount: 1200, transaction_type: 'PERSONAL_EXPENSE', description: 'Rent', date: new Date('2024-02-05') },

  // Lent to Friends
  { amount: 150, transaction_type: 'LENT_TO_FRIEND', friend_name: 'Alice', description: 'Concert tickets float', date: new Date('2024-01-08') },
  { amount: 80, transaction_type: 'LENT_TO_FRIEND', friend_name: 'Bob', description: 'Lunch split - his share', date: new Date('2024-01-14') },
  { amount: 200, transaction_type: 'LENT_TO_FRIEND', friend_name: 'Alice', description: 'Emergency cash', date: new Date('2024-01-22') },
  { amount: 50, transaction_type: 'LENT_TO_FRIEND', friend_name: 'Charlie', description: 'Parking meter', date: new Date('2024-02-03') },

  // Borrowed from Friends
  { amount: 30, transaction_type: 'BORROWED_FROM_FRIEND', friend_name: 'Bob', description: 'Coffee run - forgot wallet', date: new Date('2024-01-18') },
  { amount: 100, transaction_type: 'BORROWED_FROM_FRIEND', friend_name: 'Diana', description: 'Shared Airbnb deposit', date: new Date('2024-01-30') },
  { amount: 45, transaction_type: 'BORROWED_FROM_FRIEND', friend_name: 'Charlie', description: 'Taxi home split', date: new Date('2024-02-07') },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.transaction.deleteMany();
  console.log('   Cleared existing transactions');

  // Insert seed data
  let created = 0;
  for (const item of seedData) {
    await prisma.transaction.create({ data: item });
    created++;
  }

  console.log(`✅ Seeded ${created} transactions successfully!`);
  console.log('\nSummary:');
  console.log('  Friends: Alice, Bob, Charlie, Diana');
  console.log('  Alice owes you: $350.00');
  console.log('  Bob owes you:   $50.00 (lent $80, borrowed $30)');
  console.log('  Charlie:        $5.00 net (lent $50, borrowed $45)');
  console.log('  Diana:          you owe $100.00');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
