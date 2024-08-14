import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

import { CreateRestaurantInput } from "./create-restaurant.dto";
import { number } from "joi";

@InputType()
export class DeleteRestaurantInput {
    @Field(type => Number)
    restaurantId: number; 
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
