import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('blog')
@ApiTags('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // Get list of blogs
  @Get()
  @ApiOperation({ summary: 'Get list of blogs' })
  @ApiOkResponse({
    description: 'The list of blogs has been successfully retrieved.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          author: {
            type: 'string',
            description: 'The author of the blog.',
          },
          title: {
            type: 'string',
            description: 'The title of the blog.',
          },
          content: {
            type: 'string',
            description: 'The content of the blog.',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The creation date of the blog.',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The update date of the blog.',
          },
        },
      },
      description: 'The list of blogs',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the list of blogs',
  })
  async blogs() {
    return this.blogService.getBlogs();
  }

  // Get blog details
  @Get(':id')
  @ApiParam({ name: 'id', description: 'The ID of the blog' })
  @ApiOperation({ summary: 'Get blog details' })
  @ApiOkResponse({
    description: 'The blog details have been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        author: {
          type: 'string',
          description: 'The author of the blog.',
        },
        title: {
          type: 'string',
          description: 'The title of the blog.',
        },
        content: {
          type: 'string',
          description: 'The content of the blog.',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'The creation date of the blog.',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'The update date of the blog.',
        },
      },
      description: 'Details of the blog with the given ID.',
    },
  })
  @ApiBadRequestResponse({ description: 'Blog is not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve the blog details',
  })
  async getBlogById(@Param('id') blogId: string) {
    return this.blogService.getBlogById(blogId);
  }
}
