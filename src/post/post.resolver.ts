import {Args, Context, Int, Query, Resolver} from '@nestjs/graphql';
import {PostService} from './post.service';
import {Post} from './entities/post.entity';
import {UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/guards/jwt-auth/jwt-auth.guard";
import {DEFAULT_PAGE_SIZE} from "../constants";

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {
  }

  // @UseGuards(JwtAuthGuard)
  @Query(() => [Post], {name: 'posts'})
  findAll(
    @Context() context,
    @Args('skip', {nullable: true}) skip?: number,
    @Args('take', {nullable: true}) take?: number
  ) {
    const user = context.req.user

    return this.postService.findAll({skip, take});
  }

  @Query(() => Int, {name: 'postCount'})
  count() {
    return this.postService.count()
  }

  @Query(() => Post)
  getPostById(
    @Args("id", {type: () => Int}) id: number
  ) {
    return this.postService.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Post])
  getUserPosts(
    @Context() context,
    @Args('skip', {nullable: true, type: () => Int})
      skip?: number,
    @Args('take', {nullable: true, type: () => Int})
      take?: number
  ) {
    const userId = context.req.user.id
    return this.postService.findByUser(
      {
        userId,
        skip: skip ?? 0,
        take: take ?? DEFAULT_PAGE_SIZE
      })
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Int)
  userPostCount(@Context() context) {
    const userId = context.req.user.id

    return this.postService.userPostCount(userId)
  }
}
