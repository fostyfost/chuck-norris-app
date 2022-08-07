import type { LinksFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import stylesUrl from '~/styles/jokes.css'
import { getUser } from '~/utils/session.server'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }]
}

type LoaderData = Awaited<ReturnType<typeof getUser>>

export const loader: LoaderFunction = async ({ request }) => {
  const user: LoaderData = await getUser(request)
  return json(user)
}

const JokesRoute = () => {
  const user = useLoaderData<LoaderData>()

  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Chuck Norris Jokes' aria-label='Chuck Norris Jokes'>
              <span className='logo'>👊</span>
              <span className='logo-medium'>Chuck Norris J👊KES</span>
            </Link>
          </h1>
          {user ? (
            <div className='user-info'>
              <span>{`Hi ${user.username}`}</span>
              <form action='/logout' method='post'>
                <button type='submit' className='button'>
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to='/login'>Login</Link>
          )}
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container jokes-outlet'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default JokesRoute
