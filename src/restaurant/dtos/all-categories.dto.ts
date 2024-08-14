import { CoreOutput } from "src/common/dtos/output.dto";
import { Category } from "../entities/category.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
    @Field(type => [Category])
    categories?: Category[]; 
}