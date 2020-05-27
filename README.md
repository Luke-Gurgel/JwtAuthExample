# JWT Authentication Example

This experiment is based on an awesome post by the Hasura team that can be found [here](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/) and [this youtube video](https://youtu.be/25GS0MLT8JU). It's essentially a set of recommendations about how to handle [JSON Web Tokens](https://jwt.io/introduction/) on frontend clients.

The general idea is to have a server application that enables a frontend client to:
  1. Sign up
  2. Log in
  3. Log out
  4. List users
  5. View current authenticated user
  6. Update user email

### The Backend

The server application was built with Node, TypeScript, Express, Apollo Server Express and TypeORM to expose a GraphQL API that has just one resolver for queries and mutations related to users.

The Database of choice is PostgreSQL, which is only used for storing user records in this example.

### The Frontend

The client application focuses only on consuming the services that our server provides, which are listed above. It was developed with React, TypeScript, React Apollo Client, React Router Dom, and the GraphQL Codegen CLI.

### Summary

The post mentioned above is pretty thorough and I definitely recommend reading it. However, I'll try to summarize the implementation details and some other considerations below.

#### Login & Persisting Sessions

The Frontend client offers standard email and password registration and login flows. Upon log in, the server sends back an access token in the response body and a refresh token in an http only cookie.

The access token is used to authenticate API calls and pertains to a particular user. It's good practice for access tokens to be short-lived in case it gets stolen, so we set an expiry value of 15 minutes.

```javascript
// JWT creation on the server

function createAccessToken({ id, tokenVersion }: User) {
  return sign(
    { tokenVersion, userId: id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  )
}

function createRefreshToken({ id, tokenVersion }: User) {
  return sign(
    { tokenVersion, userId: id },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  )
}

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(
    process.env.REFRESH_TOKEN_COOKIE_NAME!,
    refreshToken,
    { httpOnly: true, path: '/refresh_token' }
  )
}
```

Refresh tokens can be used to get new access tokens when they expire, which allows sessions can be persisted. We also set the `path` property in the cookie options so that the refresh token is only included in requests to a specific route for renewing the tokens.

The server sends back the refresh token as an `HttpOnly` cookie, which is safer than localstorage or regular cookies, since it can't be read by client side JavaScript. This helps mitigate risks of [XSS](https://owasp.org/www-community/attacks/xss/) and [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) atacks.

#### Silent Refresh

Being able to silently refresh access tokens when they expire is crucial for the user experience, since they can expire during sessions.

There's a very nice library that abstracts away the silent refresh process called `apollo-link-token-refresh`.

```javascript
// Apollo client setup on the frontend
import { TokenRefreshLink } from 'apollo-link-token-refresh'

const tokenRefreshLink = new TokenRefreshLink({
  accessTokenField: 'accessToken',
  isTokenValidOrUndefined: isAccessTokenValid,
  fetchAccessToken: () => {
    return fetch('<url>/refresh_token', {
      credentials: 'include',
      method: 'POST',
    })
  },
  handleError: err => console.log(err),
  handleFetch: accessToken => setAccessToken(accessToken),
})

const gqlClient = new ApolloClient({
  link: ApolloLink.from([tokenRefreshLink, ...otherLinks]),
  cache: new InMemoryCache(),
});
```

