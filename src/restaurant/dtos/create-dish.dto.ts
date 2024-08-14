import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";
import { string } from "joi";
import { Dish } from "../entities/dish.entity";

@InputType()
export class CreateDishInput extends PickType(Dish, ["name", "price", "description", "options"], InputType) {
    
    @Field(type => Int)
    restaurantId: number; 
}


@ObjectType() 
export class CreateDishOutput extends CoreOutput {

}