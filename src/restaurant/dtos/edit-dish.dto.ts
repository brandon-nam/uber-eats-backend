import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

import { CreateRestaurantInput } from "./create-restaurant.dto";
import { number } from "joi";
import { Dish } from "../entities/dish.entity";

@InputType()
export class EditDishInput extends PartialType(PickType(Dish, ["name", "description", "price", "options"], InputType)) {
    @Field(type => Number)
    id: number; 
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
