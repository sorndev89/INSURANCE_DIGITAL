export const TENANT_PREFIX = '/tenant'
export const PUBLIC_PREFIX = '/public'
export const PLATFORM_PREFIX = '/platform'

const normalize = (path) => (path.startsWith('/') ? path : `/${path}`)

export const tenantPath = (path) => `${TENANT_PREFIX}${normalize(path)}`
export const publicPath = (path) => `${PUBLIC_PREFIX}${normalize(path)}`
export const platformPath = (path) => `${PLATFORM_PREFIX}${normalize(path)}`
