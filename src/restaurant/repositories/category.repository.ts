import { User } from "src/users/entities/user.entity";
import { Category } from "../entities/category.entity";
import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(private dataSource: DataSource) {
        super(Category, dataSource.createEntityManager());
    }

    async getOrCreate(name: string) {
        const slug = name.replace(/ /g, "-").toLowerCase();

        let category = await this.findOne({ where: { slug: slug } });
        if (!category) {
            category = this.create({ slug: slug, name: name });
        }
        return this.save(category);
    }
}
