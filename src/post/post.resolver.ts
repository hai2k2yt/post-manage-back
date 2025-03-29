import {Args, Context, Int, Query, Resolver} from '@nestjs/graphql';
import {PostService} from './post.service';
import {Post} from './entities/post.entity';

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
}
