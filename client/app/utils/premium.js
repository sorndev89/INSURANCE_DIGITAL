export const VAT_RATE = 0.07
export const REGISTRATION_FEE = 20000

export const calculatePremium = ({
  basePremium = 0,
  discountPercent = 0,
  registrationFee = REGISTRATION_FEE,
  vatRate = VAT_RATE,
} = {}) => {
  const base = Math.max(0, Number(basePremium) || 0)
  const discount = Math.min(100, Math.max(0, Number(discountPercent) || 0))
  const discountAmount = Math.round((base * discount) / 100)
  const netPremium = base - discountAmount
  const vatAmount = Math.round(netPremium * vatRate)
  const totalPremium = netPremium + vatAmount + registrationFee

  return {
    basePremium: base,
    discountPercent: discount,
    discountAmount,
    netPremium,
    vatAmount,
    registrationFee,
    totalPremium,
    vatRate,
  }
}
