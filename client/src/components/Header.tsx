import React from 'react'
import { Link } from 'react-router-dom'
import UserInfo from './UserInfo'

const Header: React.FC = () => {
  return (
    <header>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/signup">Signup</Link>
      </div>
      <div>
        <Link to="/login">Login</Link>
      </div>
      <div>
        <Link to="/profile">Profile</Link>
      </div>
      <UserInfo />
    </header>
  )
}

export default Header
