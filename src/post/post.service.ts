import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {DEFAULT_PAGE_SIZE} from "../constants";
import {CreatePostInput} from "./dto/create-post.input";
import {UpdatePostInput} from "./dto/update-post.input";

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {
  }

  async findAll(
    {
      skip = 0,
      take = DEFAULT_PAGE_SIZE
    }: {
      skip?: number,
      take?: number
    }
  ) {
    return this.prisma.post.findMany({
      skip,
      take
    });
  }

  async count() {
    return this.prisma.post.count()
  }

  findOne(id: number) {
    return this.prisma.post.findFirst({
      where: {
        id
      },
      include: {
        author: true,
        tags: true
      }
    })
  }

  async findByUser(
    {
      userId,
      skip,
      take
    }: {
      take: number | undefined;
      skip: number | undefined;
      userId: any
    }) {
    return this.prisma.post.findMany({
      where: {
        author: {
          id: userId
        }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        published: true,
        slug: true,
        title: true,
        thumbnail: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      take,
      skip
    });
  }

  async userPostCount(userId: number) {
    return this.prisma.post.count({
      where: {
        authorId: userId
      }
    })
  }

  create(
    {
      createPostInput,
      authorId
    }: {
      createPostInput: CreatePostInput;
      authorId: number
    }) {
    return this.prisma.post.create({
      data: {
        ...createPostInput,
        author: {
          connect: {
            id: authorId
          }
        },
        tags: {
          connectOrCreate: createPostInput.tags.map((tag) => ({
            where: {name: tag},
            create: {name: tag}
          }))
        }
      }
    })
  }

  async update(
    {
      userId,
      updatePostInput
    }: {
      updatePostInput: UpdatePostInput;
      userId: number
    }) {
    const authorIdMatched = await this.prisma.post.findUnique({
      where: {
        id: updatePostInput.postId,
        authorId: userId
      }
    })

    if (!authorIdMatched) throw new UnauthorizedException()

    const {postId, ...data} = updatePostInput

    return this.prisma.post.update({
      where: {
        id: postId
      },
      data: {
        ...data,
        tags: {
          set: [],
          connectOrCreate: updatePostInput.tags?.map(tag => ({
            where: {name: tag},
            create: {name: tag}
          }))
        }
      }
    })
  }
}
