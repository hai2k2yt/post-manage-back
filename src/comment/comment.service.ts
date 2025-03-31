import {Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {DEFAULT_PAGE_SIZE} from "../constants";
import {Prisma} from "@prisma/client";
import {CreateCommentInput} from "./dto/create-comment.input";

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService
  ) {
  }

  async findOneByPost(
    {
      postId,
      take,
      skip
    }: {
      take: number;
      skip: number;
      postId: number
    }) {
    return this.prisma.comment.findMany({
      where: {
        postId
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc" as Prisma.SortOrder,
      },
      skip: skip ?? 0,
      take: take ?? DEFAULT_PAGE_SIZE,
    });
  }

  async count(postId: number) {
    return this.prisma.comment.count({
      where: {
        postId
      }
    })
  }

  async create(createCommentInput: CreateCommentInput, authorId: number) {
    return this.prisma.comment.create({
      data: {
        content: createCommentInput.content,
        post: {
          connect: {
            id: createCommentInput.postId
          }
        },
        author: {
          connect: {
            id: authorId
          }
        }
      }
    });
  }
}
