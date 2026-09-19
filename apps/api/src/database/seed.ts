import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting FarmStock database seeding...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.rentalAvailability.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Farmer@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@farmstock.com',
      phone: '+91 9822000001',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'FarmStock Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          bio: 'System Administrator managing the FarmStock platform.',
          preferredLang: 'en',
          state: 'Maharashtra',
          district: 'Pune',
          taluka: 'Haveli',
          villageOrCity: 'Pune City',
          pincode: '411001',
          isPhonePublic: true,
        },
      },
    },
  });

  const ramesh = await prisma.user.create({
    data: {
      email: 'ramesh.patil@farmstock.com',
      phone: '+91 9822112233',
      passwordHash,
      role: 'FARMER',
      isVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Ramesh Patil',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
          bio: 'Sugarcane and Soybean progressive farmer with 15 years experience in mechanized farming.',
          preferredLang: 'mr',
          state: 'Maharashtra',
          district: 'Satara',
          taluka: 'Karad',
          villageOrCity: 'Vadgaon',
          pincode: '415110',
          isPhonePublic: true,
        },
      },
    },
  });

  const suresh = await prisma.user.create({
    data: {
      email: 'suresh.shinde@farmstock.com',
      phone: '+91 9822445566',
      passwordHash,
      role: 'FARMER',
      isVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Suresh Shinde',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
          bio: 'Vegetable and crop farmer in Kolhapur looking to rent high-power tractors and tillers.',
          preferredLang: 'mr',
          state: 'Maharashtra',
          district: 'Kolhapur',
          taluka: 'Hatkanangle',
          villageOrCity: 'Shiroli',
          pincode: '416122',
          isPhonePublic: true,
        },
      },
    },
  });

  const gurpreet = await prisma.user.create({
    data: {
      email: 'gurpreet.singh@farmstock.com',
      phone: '+91 9876543210',
      passwordHash,
      role: 'FARMER',
      isVerified: true,
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Gurpreet Singh',
          avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
          bio: 'Wheat & paddy farmer offering heavy machinery rentals including combine harvesters and rotavators.',
          preferredLang: 'hi',
          state: 'Punjab',
          district: 'Ludhiana',
          taluka: 'Jagraon',
          villageOrCity: 'Sidhwan Bet',
          pincode: '142033',
          isPhonePublic: true,
        },
      },
    },
  });

  console.log('✅ Users created: Admin, Ramesh, Suresh, Gurpreet');

  // 2. Categories
  const categoriesData = [
    { name: 'Tractors', slug: 'tractors', icon: 'Tractor', description: 'Utility, 4WD, and compact tractors for all farming operations' },
    { name: 'Harvesters', slug: 'harvesters', icon: 'Scissors', description: 'Combine harvesters for wheat, paddy, and multi-crop harvesting' },
    { name: 'Rotavators', slug: 'rotavators', icon: 'Cog', description: 'Rotary tillers for superior seedbed soil preparation' },
    { name: 'Cultivators', slug: 'cultivators', icon: 'Sparkles', description: 'Tine and spring-loaded cultivators for secondary tillage' },
    { name: 'Seeders and Seed Drills', slug: 'seeders-and-seed-drills', icon: 'Sprout', description: 'Precision seed drills, pneumatic seeders, and planters' },
    { name: 'Ploughs', slug: 'ploughs', icon: 'Compass', description: 'Mouldboard, disc, and reversible hydraulic ploughs' },
    { name: 'Threshers', slug: 'threshers', icon: 'Wind', description: 'Multi-crop threshers for grain and pulse separation' },
    { name: 'Sprayers', slug: 'sprayers', icon: 'Droplets', description: 'Battery, tractor-mounted boom, and knapsack pesticide sprayers' },
    { name: 'Irrigation Systems', slug: 'irrigation-systems', icon: 'Waves', description: 'Drip lines, sprinkler kits, and micro-irrigation hardware' },
    { name: 'Water Pumps', slug: 'water-pumps', icon: 'Gauge', description: 'Submersible, monoblock, and diesel water pumps' },
    { name: 'Agricultural Trailers', slug: 'agricultural-trailers', icon: 'Truck', description: 'Tipping and non-tipping hydraulic farm trailers' },
    { name: 'Power Tillers', slug: 'power-tillers', icon: 'Zap', description: 'Two-wheel walking tractors and mini weeders' },
    { name: 'Chaff Cutters', slug: 'chaff-cutters', icon: 'Layers', description: 'Electric and manual cattle fodder chaff cutters' },
    { name: 'Solar Agricultural Equipment', slug: 'solar-agricultural-equipment', icon: 'Sun', description: 'Solar water pumping systems and solar fencing' },
    { name: 'Other Agricultural Tools', slug: 'other-agricultural-tools', icon: 'Wrench', description: 'Augers, post hole diggers, hedge trimmers, and hand tools' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log('✅ 15 Categories seeded');
  console.log('ℹ️ Product catalog is empty. Products appear only when a user adds them.');
  console.log('🎉 FarmStock Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
