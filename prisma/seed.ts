import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const db = new PrismaClient()

async function seed(): Promise<void> {
  const categoriesResponse = await fetch('https://api.chucknorris.io/jokes/categories')
  const categories = (await categoriesResponse.json()) as string[]

  const jokes = await Promise.all(
    categories.map((category): Promise<{ name: string; content: string }> => {
      return new Promise((resolve, reject) => {
        fetch(`https://api.chucknorris.io/jokes/random?category=${category}`)
          .then(res => {
            return res.json() as Promise<{ value: string }>
          })
          .then(rawJoke => {
            resolve({
              name: category.charAt(0).toUpperCase() + category.slice(1),
              content: rawJoke.value,
            })
          })
          .catch(reject)
      })
    }),
  )

  const kody = await db.user.upsert({
    where: {
      username: 'kody',
    },
    update: {},
    create: {
      username: 'kody',
      // this is a hashed version of "twixrox"
      passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    },
  })

  await Promise.all(
    jokes.map(joke => {
      const data = { jokesterId: kody.id, ...joke }
      return db.joke.create({ data })
    }),
  )
}

seed()
  .then(() => console.info('✅ Seed completed!'))
  .catch(error => {
    console.info('❌ Seed failed')
    console.error(error)
  })
