import {PrismaClient} from "@prisma/client"
import {faker} from '@faker-js/faker'
import {hash} from "argon2";

const prisma = new PrismaClient()

function generateSlug(title: string): string {
  return title.toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

async function main() {
  const defaultPassword = await hash("123")

  const users = Array.from({length: 10}).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    bio: faker.lorem.sentence(),
    avatar: faker.image.avatar(),
    password: defaultPassword
  }))

  await prisma.user.createMany({
    data: users
  })

  const posts = Array.from({length: 400}).map(() => ({
    title: faker.lorem.sentence(),
    slug: generateSlug(faker.lorem.sentence()),
    content: faker.lorem.paragraphs(3),
    thumbnail: faker.image.urlLoremFlickr(),
    authorId: faker.number.int({min: 1, max: 10}),
    published: true
  }))

  // 1️⃣ Seed posts bằng batch nhỏ
  const batchSize = 20;

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    await prisma.post.createMany({
      data: batch,
    });
  }

// 2️⃣ Lấy lại danh sách postId từ database
  const postList = await prisma.post.findMany({ select: { id: true } });
  const postIds = postList.map((post) => post.id);

// 3️⃣ Seed comments với batch nhỏ
  for (let i = 0; i < postIds.length; i += batchSize) {
    const batch = postIds.slice(i, i + batchSize);
    await prisma.comment.createMany({
      data: batch.flatMap((postId) =>
        Array.from({ length: 20 }).map(() => ({
          content: faker.lorem.sentence(),
          authorId: faker.number.int({min: 1, max: 10}),
          postId,
        }))
      ),
    });
  }



  console.log('Seeding completed')
}

main().then(() => {
  prisma.$disconnect()
  process.exit(0)
}).catch(e => {
  prisma.$disconnect()
  console.error(e)
  process.exit(1)
})