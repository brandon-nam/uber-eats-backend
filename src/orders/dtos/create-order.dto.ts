import { Field, Float, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";

@InputType()
class CreateOrderItemInput {
    @Field(type => Int) 
    dishId: number; 

    @Field(type => [OrderItemOption], { nullable: true })
    options?: OrderItemOption[]; 

    @Field(type => Int)
    price: number; 
}

@InputType()
export class CreateOrderInput {
    @Field(type => Int)
    restaurantId: number; 

    @Field(type => [CreateOrderItemInput])
    createOrderInput: CreateOrderItemInput[]; 
}


@ObjectType() 
export class CreateOrderOutput extends CoreOutput {
    @Field(type => Number, { nullable: true })
    orderId?: number; 
}