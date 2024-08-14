import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreEntity } from "src/common/entities/core.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

@InputType()
export class RestaurantInput {
    @Field(type => Number) 
    id: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
    @Field(type => Restaurant)
    restaurant?: Restaurant; 
}