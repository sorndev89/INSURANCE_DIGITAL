import { VEHICLE_CATEGORIES, VEHICLE_USAGE_OPTIONS } from './constants'

export const getVehicleCategory = (value) =>
  VEHICLE_CATEGORIES.find((item) => item.value === value) || VEHICLE_CATEGORIES[0]

export const getVehicleUsage = (value) =>
  VEHICLE_USAGE_OPTIONS.find((item) => item.value === value) || VEHICLE_USAGE_OPTIONS[0]

export const resolveBasePremium = ({ basePremium = 0, category = 'sedan', usage = 'private' }) => {
  const base = Math.max(0, Number(basePremium) || 0)
  const categoryFactor = getVehicleCategory(category).factor
  const usageFactor = getVehicleUsage(usage).factor
  return Math.round(base * categoryFactor * usageFactor)
}

export const vehiclePricingBreakdown = ({
  basePremium = 0,
  category = 'sedan',
  usage = 'private',
}) => {
  const base = Math.max(0, Number(basePremium) || 0)
  const categoryMeta = getVehicleCategory(category)
  const usageMeta = getVehicleUsage(usage)
  const adjusted = resolveBasePremium({ basePremium: base, category, usage })
  return {
    basePremium: base,
    category: categoryMeta,
    usage: usageMeta,
    categoryAmount: Math.round(base * (categoryMeta.factor - 1)),
    usageAmount: adjusted - Math.round(base * categoryMeta.factor),
    adjustedBasePremium: adjusted,
  }
}
