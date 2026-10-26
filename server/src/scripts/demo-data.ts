import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  claims,
  commissions,
  customers,
  insuranceCompanies,
  invoices,
  payments,
  policies,
  products,
  quotations,
  teams,
  tenants,
  users,
  vehicles,
} from '../db/schema.js';
import { env } from '../config/env.js';
import { hashPassword } from '../utils/auth.js';
import { invalidateTenantCache } from '../services/tenantCache.js';

const iso = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const ensureAgentUser = async (tenantId: number, username: string, email: string, phone: string) => {
  const [existing] = await db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
    .limit(1);
  if (existing) return existing.id;
  const [result] = await db.insert(users).values({
    tenantId,
    username,
    email,
    password: await hashPassword('Demo@1234'),
    role: 'agent',
    phone,
    status: 'active',
  });
  return result.insertId;
};

export const seedDemoData = async () => {
  if (env.isProduction) {
    console.log('[demo] skipped in production');
    return;
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, env.defaultTenantSlug))
    .limit(1);
  if (!tenant) throw new Error(`Default tenant "${env.defaultTenantSlug}" not found`);

  const tenantId = tenant.id;
  const [existingPolicy] = await db
    .select({ id: policies.id })
    .from(policies)
    .where(eq(policies.tenantId, tenantId))
    .limit(1);
  if (existingPolicy) {
    console.log('[demo] tenant already has policies, skipping');
    return;
  }

  const [team1] = await db.insert(teams).values({
    tenantId,
    name: 'ທີມ ວຽງຈັນ ສະຕາຣ໌',
    location: 'ນະຄອນຫຼວງວຽງຈັນ',
    headName: 'ສົມສັກ ມະນີວົງ',
    members: 12,
    monthlySales: '320000000',
    status: 'active',
  });
  const [team2] = await db.insert(teams).values({
    tenantId,
    name: 'ທີມ ປາກເຊ ແຊ້ມປຽນ',
    location: 'ແຂວງຈຳປາສັກ',
    headName: 'ບຸນມີ ສີປະເສີດ',
    members: 8,
    monthlySales: '210000000',
    status: 'active',
  });

  await db.insert(insuranceCompanies).values([
    { tenantId, code: 'DHP', name: 'ບໍລິສັດ ດີ ເອັຊ ພີ ປະກັນໄພ', contactPerson: 'ທ່ານ ສົມພອນ' },
    { tenantId, code: 'APA', name: 'ບໍລິສັດ ເອ ພີ ເອ ປະກັນໄພ', contactPerson: 'ທ່ານ ນາງ ວິໄລ' },
    { tenantId, code: 'AGL', name: 'ບໍລິສັດ ອັກຄີ ລາວ', contactPerson: 'ທ່ານ ຄຳແພງ' },
  ]);
  const companyList = await db
    .select()
    .from(insuranceCompanies)
    .where(eq(insuranceCompanies.tenantId, tenantId));
  const companyByCode = new Map(companyList.map((row) => [row.code, row.id]));
  const companyIds = ['DHP', 'APA', 'AGL'].map((code) => companyByCode.get(code)!);

  await db.insert(products).values([
    { tenantId, insuranceCompanyId: companyIds[0], name: 'ລົດຍົນ ຊັ້ນ 1', type: 'Motor', description: 'ຄຸ້ມຄອງຄົບວົງຈອນ' },
    { tenantId, insuranceCompanyId: companyIds[0], name: 'ລົດຍົນ ຊັ້ນ 2', type: 'Motor', description: 'ຄຸ້ມຄອງພື້ນຖານ' },
    { tenantId, insuranceCompanyId: companyIds[1], name: 'ສຸຂະພາບ ຄອມຟອດ', type: 'Health', description: 'ຄຸ້ມຄອງຜູ້ປ່ວຍໃນ' },
    { tenantId, insuranceCompanyId: companyIds[1], name: 'ອຸບັດຕິເຫດ ສ່ວນຕົວ', type: 'Accident', description: 'ຄຸ້ມຄອງອຸບັດຕິເຫດ' },
    { tenantId, insuranceCompanyId: companyIds[2], name: 'ອັກຄີໄພ ເຮືອນ', type: 'Fire', description: 'ຄຸ້ມຄອງເຮືອນ ແລະ ຊັບສິນ' },
  ]);
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId));
  const productByName = new Map(productList.map((row) => [row.name, row.id]));
  const productIds = [
    'ລົດຍົນ ຊັ້ນ 1',
    'ລົດຍົນ ຊັ້ນ 2',
    'ສຸຂະພາບ ຄອມຟອດ',
    'ອຸບັດຕິເຫດ ສ່ວນຕົວ',
    'ອັກຄີໄພ ເຮືອນ',
  ].map((name) => productByName.get(name)!);

  await db.insert(customers).values([
    {
      tenantId, code: 'CUS-00001', firstName: 'ສົມສັກ', lastName: 'ບຸນທະວີ', gender: 'male',
      dob: '1988-04-12', phone: '020 5555 1234', email: 'somsak.b@gmail.com',
      address: 'ບ້ານ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ', occupation: 'ພະນັກງານລັດຖະກອນ',
    },
    {
      tenantId, code: 'CUS-00002', firstName: 'ນິດຊາ', lastName: 'ສີສຸວັນ', gender: 'female',
      dob: '1992-08-20', phone: '020 7777 8888', email: 'nicha.s@hotmail.com',
      address: 'ບ້ານ ໂພນພະເນົາ, ນະຄອນຫຼວງວຽງຈັນ', occupation: 'ພະນັກງານບໍລິສັດ',
    },
    {
      tenantId, code: 'CUS-00003', firstName: 'ການ', lastName: 'ພົມມະສານ', gender: 'male',
      dob: '1985-11-03', phone: '020 2222 3333', email: 'karn.p@yahoo.com',
      address: 'ບ້ານ ທົ່ງສັງຫານ, ນະຄອນຫຼວງວຽງຈັນ', occupation: 'ທຸລະກິດສ່ວນຕົວ',
    },
  ]);
  const customerList = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId));
  const customerByCode = new Map(customerList.map((row) => [row.code, row.id]));
  const customerIds = ['CUS-00001', 'CUS-00002', 'CUS-00003'].map((code) => customerByCode.get(code)!);

  await db.insert(vehicles).values([
    {
      tenantId, customerId: customerIds[0], make: 'Toyota', model: 'Camry', year: 2022,
      plateNumber: 'ກກ 1234', engineNumber: 'ENG-001', chassisNumber: 'CH-001',
      engineCapacity: '2500', color: 'ຂາວ', usageType: 'private',
    },
    {
      tenantId, customerId: customerIds[2], make: 'Honda', model: 'CR-V', year: 2023,
      plateNumber: 'ກຂ 5678', engineNumber: 'ENG-002', chassisNumber: 'CH-002',
      engineCapacity: '2000', color: 'ດຳ', usageType: 'private',
    },
  ]);
  const vehicleList = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.tenantId, tenantId));
  const vehicleByPlate = new Map(vehicleList.map((row) => [row.plateNumber, row.id]));
  const vehicleIds = ['ກກ 1234', 'ກຂ 5678'].map((plate) => vehicleByPlate.get(plate)!);

  const agentUser1 = await ensureAgentUser(tenantId, 'ຄຳພູ ວົງວິຫານ', 'agent@saiyfon.com', '020 2222 3333');
  const agentUser2 = await ensureAgentUser(tenantId, 'ມະລິ ເພັດສະຫວັນ', 'agent2@saiyfon.com', '020 5454 6767');

  await db.insert(agents).values([
    {
      tenantId, userId: agentUser1, teamId: team1.insertId, agentCode: 'SB_001',
      level: 'Senior', commissionRate: '5.00', salesTarget: '500000000', creditLimit: '100000000',
    },
    {
      tenantId, userId: agentUser2, teamId: team2.insertId, agentCode: 'SB_002',
      level: 'Manager', commissionRate: '7.00', salesTarget: '800000000', creditLimit: '150000000',
    },
  ]);
  const agentList = await db
    .select()
    .from(agents)
    .where(eq(agents.tenantId, tenantId));
  const agentByCode = new Map(agentList.map((row) => [row.agentCode, row.id]));
  const agentIds = ['SB_001', 'SB_002'].map((code) => agentByCode.get(code)!);

  const policyPayloads = [
    {
      tenantId, policyNumber: 'P-2026-000001', customerId: customerIds[0], agentId: agentIds[0],
      vehicleId: vehicleIds[0], insuranceCompanyId: companyIds[0], productId: productIds[0],
      startDate: iso(-5), endDate: iso(360), netPremium: '1400000', vatAmount: '98000',
      registrationFee: '20000', totalPremium: '1518000', status: 'active',
    },
    {
      tenantId, policyNumber: 'P-2026-000002', customerId: customerIds[1], agentId: agentIds[1],
      vehicleId: null, insuranceCompanyId: companyIds[1], productId: productIds[2],
      startDate: iso(-120), endDate: iso(245), netPremium: '2990654', vatAmount: '209346',
      registrationFee: '20000', totalPremium: '3220000', status: 'active',
    },
    {
      tenantId, policyNumber: 'P-2026-000003', customerId: customerIds[2], agentId: agentIds[0],
      vehicleId: vehicleIds[1], insuranceCompanyId: companyIds[0], productId: productIds[1],
      startDate: iso(-300), endDate: iso(20), netPremium: '1200000', vatAmount: '84000',
      registrationFee: '20000', totalPremium: '1304000', status: 'active',
    },
  ];
  await db.insert(policies).values(policyPayloads);
  const policyList = await db
    .select()
    .from(policies)
    .where(eq(policies.tenantId, tenantId));
  const policyByNumber = new Map(policyList.map((row) => [row.policyNumber, row.id]));
  const policyIds = ['P-2026-000001', 'P-2026-000002', 'P-2026-000003'].map(
    (number) => policyByNumber.get(number)!,
  );

  await db.insert(commissions).values([
    { tenantId, agentId: agentIds[0], policyId: policyIds[0], rate: '5.00', amount: '70000', status: 'pending' },
    { tenantId, agentId: agentIds[1], policyId: policyIds[1], rate: '7.00', amount: '209346', status: 'paid', paidAt: iso(-20) },
    { tenantId, agentId: agentIds[0], policyId: policyIds[2], rate: '5.00', amount: '60000', status: 'pending' },
  ]);

  await db.insert(quotations).values([
    {
      tenantId, reference: 'QT-26001', customerId: customerIds[2], productId: productIds[4],
      premium: '12500000', validUntil: iso(20), status: 'sent',
    },
    {
      tenantId, reference: 'QT-26002', customerId: customerIds[0], productId: productIds[1],
      premium: '1200000', validUntil: iso(10), status: 'draft',
    },
  ]);

  await db.insert(claims).values([
    {
      tenantId, claimNumber: 'CLM-26-001', policyId: policyIds[0], customerId: customerIds[0],
      type: 'Motor', incidentDate: iso(-10), amount: '2500000', coverageLimit: '50000000',
      status: 'pending', attachments: ['damage-photo-1.jpg'],
    },
    {
      tenantId, claimNumber: 'CLM-26-002', policyId: policyIds[1], customerId: customerIds[1],
      type: 'Health', incidentDate: iso(-25), amount: '1200000', coverageLimit: '100000000',
      status: 'approved', attachments: ['hospital-bill.pdf'],
    },
  ]);

  await db.insert(invoices).values([
    {
      tenantId, invoiceNumber: 'INV-26-0001', policyId: policyIds[0], amount: '1518000',
      issuedDate: iso(-180), dueDate: iso(-170), status: 'paid',
    },
    {
      tenantId, invoiceNumber: 'INV-26-0002', policyId: policyIds[2], amount: '1304000',
      issuedDate: iso(-20), dueDate: iso(10), status: 'unpaid',
    },
  ]);

  const invoiceList = await db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, tenantId));
  const invoiceByNumber = new Map(invoiceList.map((row) => [row.invoiceNumber, row.id]));

  await db.insert(payments).values({
    tenantId, receiptNumber: 'RCP-26-0001', invoiceId: invoiceByNumber.get('INV-26-0001')!, amount: '1518000',
    method: 'bcel', paidAt: iso(-175), status: 'completed',
  });

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(eq(policies.tenantId, tenantId));

  await invalidateTenantCache();
  console.log(`[demo] seeded tenant ${tenant.slug}: ${Number(countRow?.total)} policies`);
};
