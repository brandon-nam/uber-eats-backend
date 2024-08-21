import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";

@ObjectType()
export class MyRestaurantsOutput extends CoreOutput {
    @Field(type => [Restaurant], { nullable: true }) 
    restaurants?: Restaurant[];
}