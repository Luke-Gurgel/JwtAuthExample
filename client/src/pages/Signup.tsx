import React from 'react'
import { AuthFormData } from '../types'
import { useForm } from 'react-hook-form'
import { useSignupMutation } from '../generated/graphql'
import { RouteComponentProps } from 'react-router-dom'

const Signup: React.FC<RouteComponentProps> = ({ history }) => {
  const [signup] = useSignupMutation()
  const { handleSubmit, register } = useForm<AuthFormData>()

  const onSubmit = async ({ email, password }: AuthFormData) => {
    try {
      const { data, errors } = await signup({ variables: { email, password } })
      if (errors) throw Error(errors.toString())
      else if (data?.signup === false) throw Error('signup was false')
      else history.push('/')
    } catch (err) {
      console.log('error >>>', err)
      alert('Nope, sorry.')
    }
  }

  return (
    <main>
      <header>
        <h2>Signup page</h2>
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
        <button type="submit">Sign up</button>
      </form>
    </main>
  )
}

export default Signup
