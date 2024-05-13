import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: Model<BlogDocument>,
  ) {}

  async getBlogs() {
    try {
      const blogs = await this.blogModel.find();
      return blogs;
    } catch (error) {
      console.log(error);
    }
  }

  async getBlogById(id: string) {
    try {
      const blog = (await this.blogModel.findById(id)).populated('author');
      return blog;
    } catch (error) {
      console.log(error);
    }
  }

  async createBlog(blog: Blog) {
    try {
      const newBlog = await this.blogModel.create(blog);
      return newBlog;
    } catch (error) {
      console.log(error);
    }
  }

  async updateBlog(id: string, blog: Blog) {
    try {
      const updatedBlog = await this.blogModel.findByIdAndUpdate(id, blog, {
        new: true,
      });
      return updatedBlog;
    } catch (error) {
      console.log(error);
    }
  }
}
