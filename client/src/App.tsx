import React, { useState, useEffect } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { setAccessToken } from './auth/accessToken'
import gqlClient from './gql/client'
import Router from './Router'
import './App.css'

const App: React.FC = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4000/refresh_token', {
      credentials: 'include',
      method: 'POST',
    })
      .then(async res => {
        if (!res.ok) throw Error('Response status is not OK')
        const { accessToken }: { accessToken: string } = await res.json()
        setAccessToken(accessToken)
      })
      .catch(err => console.log('error >>>', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ApolloProvider client={gqlClient}>
      <Router />
    </ApolloProvider>
  )
}

export default App
