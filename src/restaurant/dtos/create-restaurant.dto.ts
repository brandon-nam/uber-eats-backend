import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CoreOutput } from "src/common/dtos/output.dto";
import { string } from "joi";

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ["name", "address", "coverImage"], InputType) {
    
    @Field(type => String)
    categoryName: string;
}


@ObjectType() 
export class CreateRestaurantOutput extends CoreOutput {

}