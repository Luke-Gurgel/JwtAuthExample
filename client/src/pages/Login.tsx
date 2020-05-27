import React from 'react'
import { AuthFormData } from '../types'
import { useForm } from 'react-hook-form'
import { setAccessToken } from '../auth/accessToken'
import { RouteComponentProps } from 'react-router-dom'
import { useLoginMutation, MeQuery, MeDocument } from '../generated/graphql'

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [login] = useLoginMutation()
  const { handleSubmit, register } = useForm<AuthFormData>()

  async function onSubmit({ email, password }: AuthFormData) {
    try {
      const { data, errors } = await login({
        variables: { email, password },
        update: (store, { data }) => {
          if (!data) return null
          store.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.login.user },
          })
        },
      })
      if (errors) {
        throw Error(errors.toString())
      } else if (!data?.login.accessToken) {
        throw Error('accessToken was null')
      } else {
        setAccessToken(data.login.accessToken)
        history.push('/')
      }
    } catch (err) {
      console.log('error >>>', err)
      alert("Well, that didn't work.")
    }
  }

  return (
    <main>
      <header>
        <h2>Login page</h2>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Email</label>
        <br />
        <input
          required
          type="email"
          name="email"
          ref={register}
          placeholder="your email"
        />
        <br />
        <br />
        <label htmlFor="password">Password</label>
        <br />
        <input
          required
          ref={register}
          type="password"
          name="password"
          placeholder="your password"
        />
        <br />
        <br />
        <button type="submit">Log in</button>
      </form>
    </main>
  )
}

export default Login
