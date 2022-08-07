import { Form } from '@remix-run/react'
import type { FC } from 'react'

type Props = {
  name: string
  content: string
  isOwner: boolean
  canDelete?: boolean
}

export const JokeDisplay: FC<Props> = ({ name, content, isOwner, canDelete = true }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>{content}</p>
      {isOwner ? (
        <Form method='post'>
          <input type='hidden' name='_method' value='delete' />
          <button type='submit' className='button' disabled={!canDelete}>
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  )
}
