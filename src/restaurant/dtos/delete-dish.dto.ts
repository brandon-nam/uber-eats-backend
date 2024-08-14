import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";

@InputType()
export class DeleteDishInput {
    @Field(type => Number)
    id: number; 
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
