import React from 'react'
import { Link } from 'react-router-dom'
import { useUsersQuery } from '../generated/graphql'

interface Props {}

const Home: React.FC<Props> = props => {
  const { data, loading, error } = useUsersQuery({
    fetchPolicy: 'network-only',
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    console.log(error)
    return <div>{error.message}</div>
  }

  return (
    <main>
      <header>
        <h2>Home page</h2>
      </header>
      <section>
        <ul>
          {data?.users.map(user => (
            <li key={user.id}>
              <small>ID: {user.id}</small>
              <p style={{ margin: 0 }}>
                <strong>Email: {user.email}</strong>
              </p>
              <small>Token version: {user.tokenVersion}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Home
