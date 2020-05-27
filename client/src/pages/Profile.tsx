import React from 'react'
import { useForm } from 'react-hook-form'
import { setAccessToken } from '../auth/accessToken'
import { RouteComponentProps } from 'react-router-dom'
import { useUpdateEmailMutation } from '../generated/graphql'

interface ProfileFormData {
  email: string
}

const Profile: React.FC<RouteComponentProps> = ({ history }) => {
  const [updateEmail] = useUpdateEmailMutation()
  const { handleSubmit, register } = useForm<ProfileFormData>()

  async function onSubmit({ email }: ProfileFormData) {
    try {
      const { data, errors } = await updateEmail({
        variables: { newEmail: email },
      })
      if (errors) {
        throw Error(errors.toString())
      } else if (!data?.updateEmail) {
        throw Error('Responded with false')
      } else {
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
        <h2>Profile page</h2>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">New email</label>
        <br />
        <input
          required
          type="email"
          name="email"
          ref={register}
          placeholder="new email"
        />
        <br />
        <br />
        <button type="submit">Update email</button>
      </form>
    </main>
  )
}

export default Profile
