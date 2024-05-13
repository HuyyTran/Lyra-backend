import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Model } from 'mongoose';
import { CategoryDetails } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async getListCategories() {
    try {
      const categories = await this.categoryModel.find({});
      return categories;
    } catch (error) {
      console.log(error);
    }
  }

  async getCategoryByIds(ids: string[]) {
    try {
      const categories = await this.categoryModel.find({
        categories: { $in: ids },
      });
      return categories;
    } catch (error) {
      console.log(error);
    }
  }

  async createCategory(category: CategoryDetails) {
    try {
      return await this.categoryModel.create(category);
    } catch (error) {
      console.log(error);
    }
  }

  async updateCategory(id: string, category: CategoryDetails) {
    try {
      return await this.categoryModel.findByIdAndUpdate({ _id: id }, category, {
        new: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
