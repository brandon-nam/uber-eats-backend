import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreEntity } from "src/common/entities/core.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

@InputType()
export class SearchRestaurantInput extends PaginationInput {
    @Field(type => String) 
    query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
    @Field(type => [Restaurant])
    restaurants?: Restaurant[]; 
}