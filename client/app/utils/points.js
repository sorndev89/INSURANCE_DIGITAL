export const POINTS_PER_POLICY = 5000
export const POINT_VALUE_KIP = 3000
export const POINT_STEP = 1000

export const pointsToKip = (points = 0) =>
  Math.round((Math.max(0, Number(points) || 0) / POINT_STEP) * POINT_VALUE_KIP)

export const pointsFromPolicies = (policyCount = 0) =>
  Math.max(0, Number(policyCount) || 0) * POINTS_PER_POLICY

export const pointsToPolicies = (points = 0) =>
  Math.floor(Math.max(0, Number(points) || 0) / POINTS_PER_POLICY)

export const formatPoints = (points = 0) =>
  `${Math.max(0, Number(points) || 0).toLocaleString('en-US')} ຄະແນນ`
