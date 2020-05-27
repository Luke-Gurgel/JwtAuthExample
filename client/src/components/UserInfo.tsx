import React from 'react'
import { setAccessToken } from '../auth/accessToken'
import {
  MeQuery,
  MeDocument,
  useMeQuery,
  useLogoutMutation,
} from '../generated/graphql'

const UserInfo: React.FC = () => {
  const { data, loading } = useMeQuery()
  const [logout] = useLogoutMutation()

  if (loading) return <p>Loading...</p>

  if (!data || !data.me) return <p>{'Not logged in'}</p>

  async function logUserOut() {
    try {
      await logout({
        update: store => {
          store.writeQuery<MeQuery>({ query: MeDocument, data: { me: null } })
        },
      })
      setAccessToken('')
    } catch (err) {
      console.log('logout error >>>', err)
    }
  }

  return (
    <>
      <p style={{ margin: '20px 0 0 0' }}>Current user id: {data.me?.id}</p>
      <p style={{ margin: 0 }}>Current user email: {data.me?.email}</p>
      <button onClick={logUserOut}>Log out</button>
    </>
  )
}

export default UserInfo
