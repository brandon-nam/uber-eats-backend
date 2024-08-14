import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

import { CreateRestaurantInput } from "./create-restaurant.dto";
import { number } from "joi";

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
    @Field(type => Number)
    restaurantId: number; 
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
