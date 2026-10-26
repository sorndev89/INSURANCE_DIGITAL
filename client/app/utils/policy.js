const textOrNull = (value) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export const addYearsIso = (isoDate, years) => {
  const next = new Date(isoDate)
  if (Number.isNaN(next.getTime())) return isoDate
  next.setFullYear(next.getFullYear() + years)
  return next.toISOString().slice(0, 10)
}

export const buildVehiclePayload = (vehicle = {}) => ({
  plateNumber: textOrNull(vehicle.plateNumber),
  make: textOrNull(vehicle.make),
  model: textOrNull(vehicle.model),
  year:
    Number.isFinite(Number(vehicle.year)) && Number(vehicle.year) > 0 ? Number(vehicle.year) : null,
  engineNumber: textOrNull(vehicle.engineNumber),
  chassisNumber: textOrNull(vehicle.chassisNumber),
  engineCapacity: textOrNull(vehicle.engineCapacity),
  color: textOrNull(vehicle.color),
  usageType: textOrNull(vehicle.usageType) || 'private',
})

export const resolveAgentId = ({ auth, selectedAgentId } = {}) => {
  if (auth?.role === 'agent') return auth.user?.id ?? null
  const numeric = Number(selectedAgentId)
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null
}

const splitCustomerName = (value) => {
  const parts = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export const customerNameParts = splitCustomerName

export const buildPolicyPayload = ({
  form,
  auth,
  product,
  company,
  startDate = new Date().toISOString().slice(0, 10),
} = {}) => {
  const customer = form?.customer || {}
  const vehiclePayload = buildVehiclePayload(form?.vehicle || {})
  const customerId = Number(form?.customerId)
  const hasExistingCustomer = Number.isInteger(customerId) && customerId > 0
  const isCorporate = form?.customerType === 'corporate'
  const customerName = isCorporate
    ? (customer.companyName || customer.firstName || '').trim()
    : `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

  const premium = form?.premium || {}

  return {
    customerId: hasExistingCustomer ? customerId : null,
    customerType: form?.customerType || 'individual',
    customerName,
    customerPhone: customer.phone || null,
    taxId: isCorporate ? customer.taxId || null : null,
    customerIdCardUrl: customer.idCardUrl || null,
    beneficiary: form?.beneficiary
      ? {
          name: form.beneficiary.name || null,
          relation: form.beneficiary.relation || null,
        }
      : null,
    agentId: resolveAgentId({ auth, selectedAgentId: form?.agentId }),
    agentName: auth?.displayName || auth?.user?.name || null,
    insuranceCompanyId: company?.id || product?.companyId || null,
    companyCode: company?.code || product?.companyCode || null,
    companyName: company?.name || product?.companyCode || null,
    insurerPolicyNumber: textOrNull(form?.insurerPolicyNumber),
    productId: product?.id ?? null,
    productType: product?.type || null,
    productName: product?.name || null,
    vehicle: vehiclePayload,
    vehiclePlate: vehiclePayload.plateNumber,
    quotationId: Number.isInteger(Number(form?.quotationId)) ? Number(form.quotationId) : null,
    startDate,
    endDate: addYearsIso(startDate, 1),
    discountPercent: Number(form?.discountPercent) || 0,
    netPremium: Number(premium.netPremium) || 0,
    vatAmount: Number(premium.vatAmount) || 0,
    registrationFee: Number(premium.registrationFee) || 0,
    totalPremium: Number(premium.totalPremium) || 0,
    // Broker Commission & Insurer Remittance
    brokerCommissionRate: Number(premium.brokerCommissionRate) || 0,
    brokerCommissionAmount: Number(premium.brokerCommissionAmount) || 0,
    netRemittanceToInsurer: Number(premium.netRemittanceToInsurer) || 0,
    // Agent Commission
    agentCommissionRate: Number(premium.agentCommissionRate) || 0,
    agentCommissionAmount: Number(premium.agentCommissionAmount) || 0,
    agentNetPayout: Number(premium.agentNetPayout) || 0,
    brokerNetMargin: Number(premium.brokerNetMargin) || 0,
    policyDocumentUrl: form?.policyDocumentUrl || null,
    status: form?.status || 'pending',
  }
}
