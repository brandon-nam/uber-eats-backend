import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { OrdersService } from "./orders.service";
import { Role } from "src/auth/auth-role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";

@Resolver()
export class OrdersResolver {
    constructor(private readonly ordersService: OrdersService) {}

    @Query((returns) => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(@AuthUser() user: User, @Args("input") getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput);
    }

    @Query((returns) => GetOrderOutput)
    async getOrder(@AuthUser() user: User, @Args("input") getOrderInput: GetOrderInput): Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput);
    }

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(@AuthUser() customer: User, @Args('input') createOrderInput: CreateOrderInput) : Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput);
    }

    @Mutation(returns => CreateOrderOutput)
    @Role(['Any'])
    async editOrder(@AuthUser() customer: User, @Args('input') editOrderInput: EditOrderInput) : Promise<EditOrderOutput> {
        return this.ordersService.editOrder(customer, editOrderInput);
    }
}
