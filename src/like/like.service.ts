import {BadRequestException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class LikeService {
  constructor(
    private readonly prisma: PrismaService
  ) {
  }

  async likePost({postId, userId}: {postId: number; userId: number}) {
    try {
      return !!(await this.prisma.like.create({
        data: {
          postId,
          userId
        }
      }))
    } catch (e) {
      throw new BadRequestException("You have already liked this post")
    }
  }

  async unlikePost({postId, userId}: {postId: number; userId: number}) {
    try {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            postId,
            userId
          }
        }
      })

      return true
    } catch (e) {
      throw new BadRequestException("You have already unliked this post")
    }
  }

  async getPostLikesCount(postId: number) {
    return this.prisma.like.count({
      where: {
        postId
      }
    })
  }

  async userLikedPost({userId, postId}: {postId: number; userId: number}) {
    return !!(await this.prisma.like.findFirst({
      where: {
        userId,
        postId
      }
    }));
  }
}
