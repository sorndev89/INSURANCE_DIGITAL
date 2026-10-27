import { Router } from 'express';
import type { RequestHandler } from 'express';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { enforcePlanLimit } from '../middleware/limits.js';
import {
  createCustomer,
  customerStats,
  agentStats,
  agentOptions,
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
import {
  exportReport,
  reportAgents,
  reportClaims,
  reportCommissions,
  reportCustomers,
  reportFinance,
  reportPolicies,
  reportQuotations,
  reportSales,
  reportSummary,
  reportTeams,
} from '../controllers/reports.js';
import { uploadFile } from '../controllers/uploads.js';
import { get as getSettings, update as updateSettings } from '../controllers/settings.js';
import {
  catalog as roleCatalog,
  create as createRole,
  list as listRoles,
  options as roleOptions,
  remove as removeRole,
  update as updateRole,
} from '../controllers/roles.js';

export const createTenantDataRouter = (gate: RequestHandler[] = []) => {
  const router = Router();
  const auth = [...gate, authMiddleware];
  const can = (permission: string) => [...auth, requirePermission(permission)];

  router.get('/dashboard', ...can('dashboard.view'), getDashboard);

  router.get('/reports/summary', ...can('report.view'), reportSummary);
  router.get('/reports/sales', ...can('report.view'), reportSales);
  router.get('/reports/policies', ...can('report.view'), reportPolicies);
  router.get('/reports/quotations', ...can('report.view'), reportQuotations);
  router.get('/reports/claims', ...can('report.view'), reportClaims);
  router.get('/reports/customers', ...can('report.view'), reportCustomers);
  router.get('/reports/agents', ...can('report.view'), reportAgents);
  router.get('/reports/teams', ...can('report.view'), reportTeams);
  router.get('/reports/commissions', ...can('report.view'), reportCommissions);
  router.get('/reports/finance', ...can('report.view'), reportFinance);
  router.get('/reports/export', ...can('report.export'), exportReport);
  router.get('/settings', ...auth, getSettings);
  router.patch('/settings', ...can('settings.manage'), updateSettings);

  router.get('/roles', ...can('role.manage'), listRoles);
  router.get('/roles/permissions', ...can('role.manage'), roleCatalog);
  router.get('/roles/options', ...can('role.manage'), roleOptions);
  router.post('/roles', ...can('role.manage'), createRole);
  router.patch('/roles/:id', ...can('role.manage'), updateRole);
  router.delete('/roles/:id', ...can('role.manage'), removeRole);

  router.post('/uploads', ...auth, uploadFile);

  router.get('/customers', ...can('customer.view'), listCustomers);
  router.get('/customers/stats', ...can('customer.view'), customerStats);
  router.get('/customers/:id', ...can('customer.view'), getCustomer);
  router.post('/customers', ...can('customer.create'), createCustomer);
  router.patch('/customers/:id', ...can('customer.update'), updateCustomer);

  router.get('/agents/options', ...auth, agentOptions);
  router.get('/agents', ...can('agent.view'), listAgents);
  router.get('/agents/stats', ...can('agent.view'), agentStats);
  router.get('/agents/:id', ...can('agent.view'), getAgent);
  router.post('/agents', ...can('agent.manage'), createAgent);
  router.get('/teams', ...can('team.view'), listTeams);
  router.post('/teams', ...can('team.manage'), createTeam);
  router.get('/companies', ...auth, listCompanies);
  router.get('/products', ...auth, listProducts);

  router.get('/policies', ...can('policy.view'), listPolicies);
  router.get('/policies/stats', ...can('policy.view'), policyStats);
  router.get('/policies/:id', ...can('policy.view'), getPolicy);
  router.post('/policies', ...can('policy.create'), enforcePlanLimit('maxPolicies'), createPolicy);
  router.patch('/policies/:id/status', ...can('policy.update'), updatePolicyStatus);

  router.get('/quotations', ...can('quotation.view'), listQuotations);
  router.get('/quotations/stats', ...can('quotation.view'), quotationStats);
  router.get('/quotations/:id', ...can('quotation.view'), getQuotation);
  router.post('/quotations', ...can('quotation.create'), createQuotation);
  router.patch('/quotations/:id/status', ...can('quotation.update'), updateQuotationStatus);

  router.get('/claims', ...can('claim.view'), listClaims);
  router.get('/claims/stats', ...can('claim.view'), claimStats);
  router.get('/claims/:id', ...can('claim.view'), getClaim);
  router.post('/claims', ...can('claim.create'), createClaim);
  router.patch('/claims/:id/status', ...can('claim.process'), updateClaimStatus);

  router.get('/commissions', ...can('commission.view'), listCommissions);
  router.get('/commissions/stats', ...can('commission.view'), commissionStats);
  router.post('/commissions/:id/pay', ...can('commission.pay'), payCommission);

  router.get('/invoices', ...can('finance.view'), listInvoices);
  router.get('/invoices/stats', ...can('finance.view'), invoiceStats);
  router.post('/invoices', ...can('finance.manage'), createInvoice);
  router.get('/payments', ...can('finance.view'), listPayments);
  router.get('/payments/stats', ...can('finance.view'), paymentStats);
  router.post('/payments', ...can('payment.create'), createPayment);

  return router;
};
