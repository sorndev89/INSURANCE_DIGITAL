export const VAT_RATE = 0.07
export const REGISTRATION_FEE = 20000
export const DEFAULT_BROKER_COMMISSION_RATE = 15 // % from Insurer
export const DEFAULT_AGENT_COMMISSION_RATE = 5 // % to Sales Agent
export const WHT_RATE = 0.05 // 5% withholding tax for agent commission

export const calculatePremium = ({
  basePremium = 0,
  discountPercent = 0,
  registrationFee = REGISTRATION_FEE,
  vatRate = VAT_RATE,
  brokerCommissionRate = DEFAULT_BROKER_COMMISSION_RATE,
  agentCommissionRate = DEFAULT_AGENT_COMMISSION_RATE,
} = {}) => {
  const base = Math.max(0, Number(basePremium) || 0)
  const discount = Math.min(100, Math.max(0, Number(discountPercent) || 0))
  const discountAmount = Math.round((base * discount) / 100)
  const netPremium = base - discountAmount
  const vatAmount = Math.round(netPremium * vatRate)
  const totalPremium = netPremium + vatAmount + registrationFee

  // Broker Financials
  const bCommRate = Math.max(0, Number(brokerCommissionRate) || 0)
  const brokerCommissionAmount = Math.round((netPremium * bCommRate) / 100)
  const netRemittanceToInsurer = Math.max(0, totalPremium - brokerCommissionAmount)

  // Agent Commission & Withholding Tax
  const aCommRate = Math.max(0, Number(agentCommissionRate) || 0)
  const agentCommissionAmount = Math.round((netPremium * aCommRate) / 100)
  const agentWhtAmount = Math.round(agentCommissionAmount * WHT_RATE)
  const agentNetPayout = Math.max(0, agentCommissionAmount - agentWhtAmount)

  // Broker Net Margin (Profit)
  const brokerNetMargin = Math.max(0, brokerCommissionAmount - agentCommissionAmount)

  return {
    basePremium: base,
    discountPercent: discount,
    discountAmount,
    netPremium,
    vatAmount,
    registrationFee,
    totalPremium,
    vatRate,
    // Broker & Agent splits
    brokerCommissionRate: bCommRate,
    brokerCommissionAmount,
    netRemittanceToInsurer,
    agentCommissionRate: aCommRate,
    agentCommissionAmount,
    agentWhtRate: WHT_RATE,
    agentWhtAmount,
    agentNetPayout,
    brokerNetMargin,
  }
}
