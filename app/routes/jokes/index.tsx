import type { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, NavLink, useLoaderData } from '@remix-run/react'

import { db } from '~/utils/db.server'

type LoaderData = {
  jokes: Array<{ id: string; name: string }>
  prevPage?: string
  currentPage: string
  nextPage?: string
}

const JOKES_PER_PAGE = 5

export const loader: LoaderFunction = async ({ request }) => {
  const rawPage = new URL(request.url).searchParams.get('page')

  if (rawPage === '1') {
    return redirect('/jokes')
  }

  const page = rawPage ? Number.parseInt(rawPage, 10) : 1

  if (Number.isNaN(page) || page < 1) {
    return redirect('/jokes')
  }

  const jokesCount = await db.joke.count()

  const maxPage = Math.max(Math.ceil(jokesCount / JOKES_PER_PAGE), 1)

  if (page > maxPage) {
    return redirect(`/jokes?page=${maxPage}`)
  }

  let prevPage = page - 1
  if (prevPage < 1) {
    prevPage = 1
  }

  let nextPage = page + 1
  if (nextPage > maxPage) {
    nextPage = maxPage
  }

  const data: LoaderData = {
    jokes: await db.joke.findMany({
      take: JOKES_PER_PAGE,
      skip: (page - 1) * JOKES_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    }),
    prevPage: page === 1 ? undefined : `/jokes?page=${prevPage}`,
    currentPage: page === 1 ? '/jokes' : `/jokes?page=${page}`,
    nextPage: page === maxPage ? undefined : `/jokes?page=${nextPage}`,
  }

  return json(data)
}

const NoJokes = () => <div className='error-container'>There are no jokes to display.</div>

const JokesIndexRoute = () => {
  const { jokes, prevPage, currentPage, nextPage } = useLoaderData<LoaderData>()

  return (
    <div>
      <Link to='new' className='button mb'>
        Add joke
      </Link>
      <h2>Jokes</h2>

      {jokes.length ? (
        <div className='jokes-list'>
          <ul>
            {jokes.map(joke => (
              <li key={joke.id}>
                <NavLink prefetch='intent' to={`${joke.id}?prevPage=${currentPage}`}>
                  {joke.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className='jokes-pagination'>
            {prevPage ? (
              <Link to={prevPage} className='button'>
                Prev
              </Link>
            ) : (
              <button disabled className='button'>
                Prev
              </button>
            )}
            {nextPage ? (
              <Link to={nextPage} className='button'>
                Next
              </Link>
            ) : (
              <button disabled className='button'>
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <NoJokes />
      )}
    </div>
  )
}

export const ErrorBoundary = () => {
  return <div className='error-container'>I did a whoopsies.</div>
}

export default JokesIndexRoute
