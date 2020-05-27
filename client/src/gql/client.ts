import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import { ApolloLink, Observable } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import { getAccessToken, setAccessToken, isAccessTokenValid } from '../auth/accessToken'

const tokenRefreshLink = new TokenRefreshLink({
  accessTokenField: 'accessToken',
  isTokenValidOrUndefined: isAccessTokenValid,
  fetchAccessToken: () => {
    return fetch('http://localhost:4000/refresh_token', {
      credentials: 'include',
      method: 'POST',
    })
  },
  handleError: err => {
    console.log(err)
    console.log('isAccessTokenValid >>>', isAccessTokenValid())
  },
  handleFetch: accessToken => setAccessToken(accessToken),
})

const requestLink = new ApolloLink((operation, forward) =>
  new Observable(observer => {
    let handle: any
    Promise.resolve(operation)
      .then((operation) => {
        operation.setContext({ headers: { authorization: `Bearer ${getAccessToken()}` } })
      })
      .then(() => {
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(observer.error.bind(observer));

    return () => {
      if (handle) handle.unsubscribe();
    };
  })
);

const link = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include'
})

const gqlClient = new ApolloClient({
  link: ApolloLink.from([tokenRefreshLink as any, requestLink, link]),
  cache: new InMemoryCache(),
});

export default gqlClient