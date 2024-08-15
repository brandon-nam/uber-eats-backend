import { InputType, ObjectType, PickType } from "@nestjs/graphql"
import { Order } from "../entities/order.entity"
import { CoreOutput } from "src/common/dtos/output.dto"

@InputType()
export class OrderUpdatesInput extends PickType(Order, ["id"], InputType) {

}
@ObjectType()
export class OrderUpdatesOutput extends CoreOutput {

}