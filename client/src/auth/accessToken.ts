import decodeJwt from 'jwt-decode'

let accessToken = ''

export function getAccessToken(): string {
  return accessToken
}

export function setAccessToken(token: string) {
  accessToken = token
}

export function isAccessTokenValid(): boolean {
  if (!accessToken) return false

  try {
    const { exp } = decodeJwt(accessToken)
    if (Date.now() >= exp * 1000) throw Error('Access token has expired')
    return true
  } catch {
    return false
  }
}