import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting seed...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'dayjoy' },
    update: {},
    create: { name: 'Dayjoy Enterprise', slug: 'dayjoy', status: 'ACTIVE' },
  });
  console.log('✅ Created tenant');

  const adminRole = await prisma.role.create({
    data: { tenant_id: tenant.id, name: 'Admin', description: 'Full access', is_system: true },
  });
  console.log('✅ Created roles');

  const adminUser = await prisma.user.create({
    data: {
      tenant_id: tenant.id,
      email: 'admin@dayjoy.com',
      password_hash: await hashPassword('admin123'),
      first_name: 'System',
      last_name: 'Administrator',
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.create({
    data: { user_id: adminUser.id, role_id: adminRole.id, tenant_id: tenant.id },
  });
  console.log('✅ Created admin user');

  const demoUsers = [
    { email: 'john@dayjoy.com', firstName: 'John', lastName: 'Doe' },
    { email: 'jane@dayjoy.com', firstName: 'Jane', lastName: 'Smith' },
  ];
  for (const u of demoUsers) {
    await prisma.user.create({
      data: {
        tenant_id: tenant.id,
        email: u.email,
        password_hash: await hashPassword('password123'),
        first_name: u.firstName,
        last_name: u.lastName,
        status: 'ACTIVE',
      },
    });
  }
  console.log('✅ Created demo users');

  await prisma.product.createMany({
    data: [
      { tenant_id: tenant.id, sku: 'SUP-001', name: 'Vitamin D3', price: 29.99, inventory_count: 100, status: 'ACTIVE' },
      { tenant_id: tenant.id, sku: 'SUP-002', name: 'Omega-3', price: 39.99, inventory_count: 75, status: 'ACTIVE' },
      { tenant_id: tenant.id, sku: 'WEL-001', name: 'Probiotic', price: 49.99, inventory_count: 50, status: 'ACTIVE' },
    ],
  });
  console.log('✅ Created products');

  await prisma.customer.createMany({
    data: [
      { tenant_id: tenant.id, customer_type: 'INDIVIDUAL', first_name: 'Alice', last_name: 'Johnson', email: 'alice@email.com' },
      { tenant_id: tenant.id, customer_type: 'BUSINESS', company_name: 'Tech Solutions Inc', email: 'contact@techsolutions.com' },
    ],
  });
  console.log('✅ Created customers');

  await prisma.aiAgent.createMany({
    data: [
      { tenant_id: tenant.id, name: 'Dayjoy Support Agent', type: 'SUPPORT', configuration: { model: 'gpt-4', temperature: 0.7 } },
      { tenant_id: tenant.id, name: 'Dayjoy Sales Agent', type: 'SALES', configuration: { model: 'gpt-4', temperature: 0.8 } },
      { tenant_id: tenant.id, name: 'Dayjoy Voice Agent', type: 'VOICE', configuration: { model: 'gpt-4', temperature: 0.7 } },
    ],
  });
  console.log('✅ Created AI agents');

  console.log('\n🎉 Seed completed!');
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@dayjoy.com / admin123');
  console.log('   Demo: john@dayjoy.com / password123');
  console.log('   Demo: jane@dayjoy.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
