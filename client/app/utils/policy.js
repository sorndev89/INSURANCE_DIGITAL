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
  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

  return {
    customerId: hasExistingCustomer ? customerId : null,
    customerName,
    customerPhone: customer.phone || null,
    customerIdCardUrl: customer.idCardUrl || null,
    agentId: resolveAgentId({ auth, selectedAgentId: form?.agentId }),
    agentName: auth?.displayName || auth?.user?.name || null,
    companyCode: product?.companyCode || null,
    companyName: company?.name || product?.companyCode || null,
    productId: product?.id ?? null,
    productType: product?.type || null,
    productName: product?.name || null,
    vehicle: vehiclePayload,
    vehiclePlate: vehiclePayload.plateNumber,
    quotationId: Number.isInteger(Number(form?.quotationId)) ? Number(form.quotationId) : null,
    startDate,
    endDate: addYearsIso(startDate, 1),
    discountPercent: Number(form?.discountPercent) || 0,
    netPremium: Number(form?.premium?.netPremium) || 0,
    vatAmount: Number(form?.premium?.vatAmount) || 0,
    registrationFee: Number(form?.premium?.registrationFee) || 0,
    totalPremium: Number(form?.premium?.totalPremium) || 0,
    status: form?.status || 'pending',
  }
}
