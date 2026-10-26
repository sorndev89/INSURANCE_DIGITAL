import { and, eq, ne, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import type { Transaction } from '../db/index.js';
import {
  agents,
  claims,
  commissions,
  commissionRates,
  customers,
  insuranceCompanies,
  invoices,
  payments,
  policies,
  products,
  quotations,
  teams,
  users,
  vehicles,
} from '../db/schema.js';
import { hashPassword } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';

const iso = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const countTenantTable = async (
  tx: Transaction,
  tenantId: number,
  table:
    | typeof teams
    | typeof customers
    | typeof agents
    | typeof insuranceCompanies
    | typeof products
    | typeof vehicles
    | typeof policies
    | typeof commissionRates
    | typeof quotations
    | typeof claims
    | typeof invoices
    | typeof payments
    | typeof commissions,
) => {
  const [row] = await tx
    .select({ total: sql<number>`count(*)` })
    .from(table)
    .where(eq(table.tenantId, tenantId));
  return Number(row?.total ?? 0);
};

export type TenantDataCounts = {
  teams: number;
  users: number;
  customers: number;
  agents: number;
  insuranceCompanies: number;
  products: number;
  vehicles: number;
  policies: number;
  commissionRates: number;
  quotations: number;
  claims: number;
  invoices: number;
  payments: number;
  commissions: number;
};

export const countTenantData = async (
  tx: Transaction,
  tenantId: number,
): Promise<TenantDataCounts> => {
  const [usersCount] = await tx
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), ne(users.role, 'admin')));

  return {
    teams: await countTenantTable(tx, tenantId, teams),
    users: Number(usersCount?.total ?? 0),
    customers: await countTenantTable(tx, tenantId, customers),
    agents: await countTenantTable(tx, tenantId, agents),
    insuranceCompanies: await countTenantTable(tx, tenantId, insuranceCompanies),
    products: await countTenantTable(tx, tenantId, products),
    vehicles: await countTenantTable(tx, tenantId, vehicles),
    policies: await countTenantTable(tx, tenantId, policies),
    commissionRates: await countTenantTable(tx, tenantId, commissionRates),
    quotations: await countTenantTable(tx, tenantId, quotations),
    claims: await countTenantTable(tx, tenantId, claims),
    invoices: await countTenantTable(tx, tenantId, invoices),
    payments: await countTenantTable(tx, tenantId, payments),
    commissions: await countTenantTable(tx, tenantId, commissions),
  };
};

export const hasTenantBusinessData = (counts: TenantDataCounts) =>
  Object.values(counts).some((count) => count > 0);

const ensureAgentUser = async (
  tx: Transaction,
  tenantId: number,
  username: string,
  email: string,
  phone: string,
) => {
  const [existing] = await tx
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
    .limit(1);
  if (existing) {
    if (existing.role === 'agent') return existing.id;
    throw ApiError.conflict(
      `ອີເມວ ${email} ຖືກໃຊ້ໂດຍຜູ້ໃຊ້ອື່ນແລ້ວ. ກະລຸນາປ່ຽນ ຫຼື Reset ຂໍ້ມູນ tenant ກ່ອນ.`,
    );
  }
  const [result] = await tx.insert(users).values({
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

export const seedTenantDemoData = async (tenantId: number) => {
  return db.transaction(async (tx) => {
    const before = await countTenantData(tx, tenantId);
    if (hasTenantBusinessData(before)) {
      throw ApiError.conflict(
        'Tenant ມີຂໍ້ມູນຢູ່ແລ້ວ. ກະລຸນາ Reset ຂໍ້ມູນ tenant ກ່ອນສ້າງຂໍ້ມູນ Demo.',
        { counts: before },
      );
    }

    const [team1] = await tx.insert(teams).values({
      tenantId,
      name: 'ທີມ ວຽງຈັນ ສະຕາຣ໌',
      location: 'ນະຄອນຫຼວງວຽງຈັນ',
      headName: 'ສົມສັກ ມະນີວົງ',
      members: 12,
      monthlySales: '320000000',
      status: 'active',
    });
    const [team2] = await tx.insert(teams).values({
      tenantId,
      name: 'ທີມ ປາກເຊ ແຊ້ມປຽນ',
      location: 'ແຂວງຈຳປາສັກ',
      headName: 'ບຸນມີ ສີປະເສີດ',
      members: 8,
      monthlySales: '210000000',
      status: 'active',
    });

    await tx.insert(insuranceCompanies).values([
      { tenantId, code: 'DHP', name: 'ບໍລິສັດ ດີ ເອັຊ ພີ ປະກັນໄພ', contactPerson: 'ທ່ານ ສົມພອນ' },
      { tenantId, code: 'APA', name: 'ບໍລິສັດ ເອ ພີ ເອ ປະກັນໄພ', contactPerson: 'ທ່ານ ນາງ ວິໄລ' },
      { tenantId, code: 'AGL', name: 'ບໍລິສັດ ອັກຄີ ລາວ', contactPerson: 'ທ່ານ ຄຳແພງ' },
    ]);
    const companyList = await tx
      .select()
      .from(insuranceCompanies)
      .where(eq(insuranceCompanies.tenantId, tenantId));
    const companyByCode = new Map(companyList.map((row) => [row.code, row.id]));
    const companyIds = ['DHP', 'APA', 'AGL'].map((code) => companyByCode.get(code)!);

    await tx.insert(products).values([
      { tenantId, insuranceCompanyId: companyIds[0], name: 'ລົດຍົນ ຊັ້ນ 1', type: 'Motor', description: 'ຄຸ້ມຄອງຄົບວົງຈອນ' },
      { tenantId, insuranceCompanyId: companyIds[0], name: 'ລົດຍົນ ຊັ້ນ 2', type: 'Motor', description: 'ຄຸ້ມຄອງພື້ນຖານ' },
      { tenantId, insuranceCompanyId: companyIds[1], name: 'ສຸຂະພາບ ຄອມຟອດ', type: 'Health', description: 'ຄຸ້ມຄອງຜູ້ປ່ວຍໃນ' },
      { tenantId, insuranceCompanyId: companyIds[1], name: 'ອຸບັດຕິເຫດ ສ່ວນຕົວ', type: 'Accident', description: 'ຄຸ້ມຄອງອຸບັດຕິເຫດ' },
      { tenantId, insuranceCompanyId: companyIds[2], name: 'ອັກຄີໄພ ເຮືອນ', type: 'Fire', description: 'ຄຸ້ມຄອງເຮືອນ ແລະ ຊັບສິນ' },
    ]);
    const productList = await tx
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

    await tx.insert(customers).values([
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
    const customerList = await tx
      .select()
      .from(customers)
      .where(eq(customers.tenantId, tenantId));
    const customerByCode = new Map(customerList.map((row) => [row.code, row.id]));
    const customerIds = ['CUS-00001', 'CUS-00002', 'CUS-00003'].map(
      (code) => customerByCode.get(code)!,
    );

    await tx.insert(vehicles).values([
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
    const vehicleList = await tx
      .select()
      .from(vehicles)
      .where(eq(vehicles.tenantId, tenantId));
    const vehicleByPlate = new Map(vehicleList.map((row) => [row.plateNumber, row.id]));
    const vehicleIds = ['ກກ 1234', 'ກຂ 5678'].map((plate) => vehicleByPlate.get(plate)!);

    const agentUser1 = await ensureAgentUser(
      tx,
      tenantId,
      'ຄຳພູ ວົງວິຫານ',
      'agent@saiyfon.com',
      '020 2222 3333',
    );
    const agentUser2 = await ensureAgentUser(
      tx,
      tenantId,
      'ມະລິ ເພັດສະຫວັນ',
      'agent2@saiyfon.com',
      '020 5454 6767',
    );

    await tx.insert(agents).values([
      {
        tenantId, userId: agentUser1, teamId: team1.insertId, agentCode: 'SB_001',
        level: 'Senior', commissionRate: '5.00', salesTarget: '500000000', creditLimit: '100000000',
      },
      {
        tenantId, userId: agentUser2, teamId: team2.insertId, agentCode: 'SB_002',
        level: 'Manager', commissionRate: '7.00', salesTarget: '800000000', creditLimit: '150000000',
      },
    ]);
    const agentList = await tx
      .select()
      .from(agents)
      .where(eq(agents.tenantId, tenantId));
    const agentByCode = new Map(agentList.map((row) => [row.agentCode, row.id]));
    const agentIds = ['SB_001', 'SB_002'].map((code) => agentByCode.get(code)!);

    await tx.insert(policies).values([
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
    ]);
    const policyList = await tx
      .select()
      .from(policies)
      .where(eq(policies.tenantId, tenantId));
    const policyByNumber = new Map(policyList.map((row) => [row.policyNumber, row.id]));
    const policyIds = ['P-2026-000001', 'P-2026-000002', 'P-2026-000003'].map(
      (number) => policyByNumber.get(number)!,
    );

    await tx.insert(commissions).values([
      { tenantId, agentId: agentIds[0], policyId: policyIds[0], rate: '5.00', amount: '70000', status: 'pending' },
      { tenantId, agentId: agentIds[1], policyId: policyIds[1], rate: '7.00', amount: '209346', status: 'paid', paidAt: iso(-20) },
      { tenantId, agentId: agentIds[0], policyId: policyIds[2], rate: '5.00', amount: '60000', status: 'pending' },
    ]);

    await tx.insert(quotations).values([
      {
        tenantId, reference: 'QT-26001', customerId: customerIds[2], productId: productIds[4],
        premium: '12500000', validUntil: iso(20), status: 'sent',
      },
      {
        tenantId, reference: 'QT-26002', customerId: customerIds[0], productId: productIds[1],
        premium: '1200000', validUntil: iso(10), status: 'draft',
      },
    ]);

    await tx.insert(claims).values([
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

    await tx.insert(invoices).values([
      {
        tenantId, invoiceNumber: 'INV-26-0001', policyId: policyIds[0], amount: '1518000',
        issuedDate: iso(-180), dueDate: iso(-170), status: 'paid',
      },
      {
        tenantId, invoiceNumber: 'INV-26-0002', policyId: policyIds[2], amount: '1304000',
        issuedDate: iso(-20), dueDate: iso(10), status: 'unpaid',
      },
    ]);

    const invoiceList = await tx
      .select()
      .from(invoices)
      .where(eq(invoices.tenantId, tenantId));
    const invoiceByNumber = new Map(invoiceList.map((row) => [row.invoiceNumber, row.id]));

    await tx.insert(payments).values({
      tenantId, receiptNumber: 'RCP-26-0001', invoiceId: invoiceByNumber.get('INV-26-0001')!, amount: '1518000',
      method: 'bcel', paidAt: iso(-175), status: 'completed',
    });

    return countTenantData(tx, tenantId);
  });
};

export const resetTenantData = async (tenantId: number) => {
  return db.transaction(async (tx) => {
    const before = await countTenantData(tx, tenantId);

    await tx.delete(payments).where(eq(payments.tenantId, tenantId));
    await tx.delete(commissions).where(eq(commissions.tenantId, tenantId));
    await tx.delete(claims).where(eq(claims.tenantId, tenantId));
    await tx.delete(invoices).where(eq(invoices.tenantId, tenantId));
    await tx.delete(quotations).where(eq(quotations.tenantId, tenantId));
    await tx.delete(commissionRates).where(eq(commissionRates.tenantId, tenantId));
    await tx.delete(policies).where(eq(policies.tenantId, tenantId));
    await tx.delete(vehicles).where(eq(vehicles.tenantId, tenantId));
    await tx.delete(agents).where(eq(agents.tenantId, tenantId));
    await tx.delete(products).where(eq(products.tenantId, tenantId));
    await tx.delete(insuranceCompanies).where(eq(insuranceCompanies.tenantId, tenantId));
    await tx.delete(customers).where(eq(customers.tenantId, tenantId));
    await tx.delete(teams).where(eq(teams.tenantId, tenantId));
    await tx
      .delete(users)
      .where(and(eq(users.tenantId, tenantId), ne(users.role, 'admin')));

    return { deletedCounts: before, remaining: await countTenantData(tx, tenantId) };
  });
};
