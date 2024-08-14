import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";
import { Order, OrderStatus } from "../entities/order.entity";

@InputType()
export class GetOrdersInput {
    @Field(type => OrderStatus)
    orderStatus?: OrderStatus; 
}


@ObjectType() 
export class GetOrdersOutput extends CoreOutput {
    @Field(type => [Order]) 
    orders: Order[]; 
}