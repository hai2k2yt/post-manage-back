import {Resolver, Query, Mutation, Args, Int, Context} from '@nestjs/graphql';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { CreateLikeInput } from './dto/create-like.input';
import { UpdateLikeInput } from './dto/update-like.input';
import {UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/guards/jwt-auth/jwt-auth.guard";

@Resolver(() => Like)
export class LikeResolver {
  constructor(
    private readonly likeService: LikeService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  likePost(
    @Context() context,
    @Args("postId", {type: () => Int})
    postId: number
  ) {
    const userId = context.req.user.id
    return this.likeService.likePost({postId, userId})
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  unlikePost(
    @Context() context,
    @Args("postId", {type: () => Int})
      postId: number
  ) {
    const userId = context.req.user.id
    return this.likeService.unlikePost({postId, userId})
  }

  @Query(() => Int)
  postLikesCount(
    @Args('postId', {type: () => Int}) postId: number
  ) {
    return this.likeService.getPostLikesCount(postId)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  userLikedPost(
    @Context() context,
    @Args('postId', {type: () => Int}) postId: number
  ) {
    const userId = context.req.user.id
    return this.likeService.userLikedPost({
      postId,
      userId
    })
  }
}
