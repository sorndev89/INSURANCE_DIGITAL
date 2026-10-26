import { Router } from 'express';
import type { RequestHandler } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { enforcePlanLimit } from '../middleware/limits.js';
import {
  createCustomer,
  customerStats,
  agentStats,
  createAgent,
  getCustomer,
  getAgent,
  listAgents,
  listCompanies,
  listCustomers,
  listProducts,
  listTeams,
  createTeam,
  updateCustomer,
} from '../controllers/directory.js';
import {
  createPolicy,
  createQuotation,
  getPolicy,
  getQuotation,
  listPolicies,
  listQuotations,
  policyStats,
  quotationStats,
  updatePolicyStatus,
  updateQuotationStatus,
} from '../controllers/policies.js';
import {
  claimStats,
  createClaim,
  getClaim,
  listClaims,
  updateClaimStatus,
} from '../controllers/claims.js';
import {
  commissionStats,
  createInvoice,
  createPayment,
  invoiceStats,
  listCommissions,
  listInvoices,
  listPayments,
  paymentStats,
  payCommission,
} from '../controllers/finance.js';
import { getDashboard } from '../controllers/dashboard.js';
import { uploadFile } from '../controllers/uploads.js';
import { get as getSettings, update as updateSettings } from '../controllers/settings.js';

export const createTenantDataRouter = (gate: RequestHandler[] = []) => {
  const router = Router();
  const auth = [...gate, authMiddleware];
  const adminStaff = [...auth, requireRole('admin', 'staff')];
  const fieldRoles = [...auth, requireRole('admin', 'staff', 'agent')];

  router.get('/dashboard', ...auth, getDashboard);
  router.get('/settings', ...auth, getSettings);
  router.patch('/settings', ...auth, requireRole('admin'), updateSettings);
  router.post('/uploads', ...auth, uploadFile);

  router.get('/customers', ...auth, listCustomers);
  router.get('/customers/stats', ...auth, customerStats);
  router.get('/customers/:id', ...auth, getCustomer);
  router.post('/customers', ...fieldRoles, createCustomer);
  router.patch('/customers/:id', ...fieldRoles, updateCustomer);

  router.get('/agents', ...auth, listAgents);
  router.get('/agents/stats', ...auth, agentStats);
  router.get('/agents/:id', ...auth, getAgent);
  router.post('/agents', ...adminStaff, createAgent);
  router.get('/teams', ...auth, listTeams);
  router.post('/teams', ...adminStaff, createTeam);
  router.get('/companies', ...auth, listCompanies);
  router.get('/products', ...auth, listProducts);

  router.get('/policies', ...auth, listPolicies);
  router.get('/policies/stats', ...auth, policyStats);
  router.get('/policies/:id', ...auth, getPolicy);
  router.post('/policies', ...fieldRoles, enforcePlanLimit('maxPolicies'), createPolicy);
  router.patch('/policies/:id/status', ...fieldRoles, updatePolicyStatus);

  router.get('/quotations', ...auth, listQuotations);
  router.get('/quotations/stats', ...auth, quotationStats);
  router.get('/quotations/:id', ...auth, getQuotation);
  router.post('/quotations', ...fieldRoles, createQuotation);
  router.patch('/quotations/:id/status', ...fieldRoles, updateQuotationStatus);

  router.get('/claims', ...auth, listClaims);
  router.get('/claims/stats', ...auth, claimStats);
  router.get('/claims/:id', ...auth, getClaim);
  router.post('/claims', ...fieldRoles, createClaim);
  router.patch('/claims/:id/status', ...fieldRoles, updateClaimStatus);

  router.get('/commissions', ...auth, listCommissions);
  router.get('/commissions/stats', ...auth, commissionStats);
  router.post('/commissions/:id/pay', ...adminStaff, payCommission);

  router.get('/invoices', ...auth, listInvoices);
  router.get('/invoices/stats', ...auth, invoiceStats);
  router.post('/invoices', ...adminStaff, createInvoice);
  router.get('/payments', ...auth, listPayments);
  router.get('/payments/stats', ...auth, paymentStats);
  router.post('/payments', ...adminStaff, createPayment);

  return router;
};
