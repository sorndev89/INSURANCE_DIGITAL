import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  customers,
  insuranceCompanies,
  products,
  vehicles,
} from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { sequenceNumber, toNumber } from '../utils/list.js';

const splitName = (value: string) => {
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return { firstName: parts[0], lastName: '-' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const resolveCustomer = async (
  tenantId: number,
  input: { customerId?: unknown; customerName?: unknown; customerPhone?: unknown },
) => {
  const customerId = Number(input.customerId || 0);
  if (customerId) {
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)))
      .limit(1);
    if (!existing) throw ApiError.badRequest('Unknown customerId');
    return existing.id;
  }

  const name = typeof input.customerName === 'string' ? input.customerName.trim() : '';
  const phone = typeof input.customerPhone === 'string' ? input.customerPhone.trim() : '';
  if (!name) throw ApiError.badRequest('customerId or customerName is required');

  if (phone) {
    const [byPhone] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.tenantId, tenantId), eq(customers.phone, phone)))
      .limit(1);
    if (byPhone) return byPhone.id;
  }

  const { firstName, lastName } = splitName(name);
  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, tenantId));
  const count = toNumber(countRow?.total);
  const [result] = await db.insert(customers).values({
    tenantId,
    code: sequenceNumber('CUS-', count, 5),
    firstName,
    lastName,
    phone: phone || null,
    status: 'active',
  });
  return result.insertId;
};

export const resolveCompany = async (
  tenantId: number,
  input: { companyId?: unknown; companyCode?: unknown; companyName?: unknown },
) => {
  const companyId = Number(input.companyId || 0);
  if (companyId) {
    const [existing] = await db
      .select({ id: insuranceCompanies.id })
      .from(insuranceCompanies)
      .where(
        and(eq(insuranceCompanies.tenantId, tenantId), eq(insuranceCompanies.id, companyId)),
      )
      .limit(1);
    if (!existing) throw ApiError.badRequest('Unknown companyId');
    return existing.id;
  }

  const code = typeof input.companyCode === 'string' ? input.companyCode.trim() : '';
  const name = typeof input.companyName === 'string' ? input.companyName.trim() : '';
  if (code) {
    const [byCode] = await db
      .select({ id: insuranceCompanies.id })
      .from(insuranceCompanies)
      .where(
        and(eq(insuranceCompanies.tenantId, tenantId), eq(insuranceCompanies.code, code)),
      )
      .limit(1);
    if (byCode) return byCode.id;
  }

  if (!code && !name) return null;

  const [result] = await db.insert(insuranceCompanies).values({
    tenantId,
    code: code || `CO-${Date.now().toString().slice(-6)}`,
    name: name || code,
  });
  return result.insertId;
};

export const resolveProduct = async (
  tenantId: number,
  input: {
    productId?: unknown;
    productName?: unknown;
    productType?: unknown;
    companyId?: number | null;
  },
) => {
  const productId = Number(input.productId || 0);
  if (productId) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.id, productId)))
      .limit(1);
    if (!existing) throw ApiError.badRequest('Unknown productId');
    return existing.id;
  }

  const name = typeof input.productName === 'string' ? input.productName.trim() : '';
  if (!name) return null;

  const [byName] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.name, name)))
    .limit(1);
  if (byName) return byName.id;

  const [result] = await db.insert(products).values({
    tenantId,
    insuranceCompanyId: input.companyId ?? null,
    name,
    type:
      typeof input.productType === 'string' && input.productType.trim()
        ? input.productType.trim()
        : 'Motor',
  });
  return result.insertId;
};

export const resolveAgent = async (tenantId: number, value: unknown) => {
  const agentId = Number(value || 0);
  if (!agentId) return null;
  const [existing] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.tenantId, tenantId), eq(agents.id, agentId)))
    .limit(1);
  return existing?.id ?? null;
};

export const resolveVehicle = async (
  tenantId: number,
  customerId: number,
  input: {
    vehicleId?: unknown;
    vehiclePlate?: unknown;
    make?: unknown;
    model?: unknown;
    year?: unknown;
    engineNumber?: unknown;
    chassisNumber?: unknown;
    engineCapacity?: unknown;
    color?: unknown;
    usageType?: unknown;
  },
) => {
  const vehicleId = Number(input.vehicleId || 0);
  if (vehicleId) {
    const [existing] = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, vehicleId)))
      .limit(1);
    if (!existing) throw ApiError.badRequest('Unknown vehicleId');
    return existing.id;
  }

  const plate = typeof input.vehiclePlate === 'string' ? input.vehiclePlate.trim() : '';
  if (!plate) return null;

  const [byPlate] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.plateNumber, plate)))
    .limit(1);
  if (byPlate) return byPlate.id;

  const year = Number(input.year);
  const [result] = await db.insert(vehicles).values({
    tenantId,
    customerId,
    make: typeof input.make === 'string' && input.make.trim() ? input.make.trim() : 'Unknown',
    model: typeof input.model === 'string' && input.model.trim() ? input.model.trim() : 'Unknown',
    year: Number.isInteger(year) && year > 0 ? year : null,
    plateNumber: plate,
    engineNumber: typeof input.engineNumber === 'string' ? input.engineNumber : null,
    chassisNumber: typeof input.chassisNumber === 'string' ? input.chassisNumber : null,
    engineCapacity: typeof input.engineCapacity === 'string' ? input.engineCapacity : null,
    color: typeof input.color === 'string' ? input.color : null,
    usageType: typeof input.usageType === 'string' ? input.usageType : null,
  });
  return result.insertId;
};
