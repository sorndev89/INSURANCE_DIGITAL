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
  category: textOrNull(vehicle.category) || 'sedan',
  plateNumber: textOrNull(vehicle.plateNumber),
  make: textOrNull(vehicle.make),
  model: textOrNull(vehicle.model),
  year:
    Number.isFinite(Number(vehicle.year)) && Number(vehicle.year) > 0 ? Number(vehicle.year) : null,
  engineNumber: textOrNull(vehicle.engineNumber),
  chassisNumber: textOrNull(vehicle.chassisNumber),
  engineCapacity: textOrNull(vehicle.engineCapacity),
  seats: Number.isFinite(Number(vehicle.seats)) ? Number(vehicle.seats) : null,
  color: textOrNull(vehicle.color),
  usageType: textOrNull(vehicle.usageType) || 'private',
})

export const resolveAgentId = ({ auth, selectedAgentId, agents = [] } = {}) => {
  if (auth?.role === 'agent') {
    const matched = agents.find(
      (agent) => agent.userId && String(agent.userId) === String(auth.user?.id),
    )
    if (matched) return matched.id
    const ownAgentId = Number(auth.user?.agentId)
    if (Number.isInteger(ownAgentId) && ownAgentId > 0) return ownAgentId
    const selected = Number(selectedAgentId)
    return Number.isInteger(selected) && selected > 0 ? selected : null
  }
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
  agents = [],
  startDate = new Date().toISOString().slice(0, 10),
  endDate,
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
    customerDob: customer.dob || null,
    customerGender: customer.gender || null,
    customerAddress: customer.address || null,
    customerOccupation: customer.occupation || null,
    customerIdCardNumber: customer.idCardNumber || null,
    taxId: isCorporate ? customer.taxId || null : null,
    customerIdCardUrl: customer.idCardUrl || null,
    beneficiary: form?.beneficiary
      ? {
          name: form.beneficiary.name || null,
          relation: form.beneficiary.relation || null,
        }
      : null,
    agentId: resolveAgentId({ auth, selectedAgentId: form?.agentId, agents }),
    agentName: form?.agentName || auth?.displayName || auth?.user?.name || null,
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
    endDate: endDate || addYearsIso(startDate, 1),
    basePremium: Number(premium.basePremium) || 0,
    discountPercent: Number(form?.discountPercent) || 0,
    discountAmount: Number(premium.discountAmount) || 0,
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
