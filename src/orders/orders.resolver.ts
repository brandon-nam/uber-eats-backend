import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { OrdersService } from "./orders.service";
import { Role } from "src/auth/auth-role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { Inject } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { Order } from "./entities/order.entity";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";

@Resolver()
export class OrdersResolver {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub
    ) {}

    @Query((returns) => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(@AuthUser() user: User, @Args("input") getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput);
    }

    @Query((returns) => GetOrderOutput)
    async getOrder(@AuthUser() user: User, @Args("input") getOrderInput: GetOrderInput): Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput);
    }

    @Mutation((returns) => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(@AuthUser() customer: User, @Args("input") createOrderInput: CreateOrderInput): Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput);
    }

    @Mutation((returns) => CreateOrderOutput)
    @Role(["Any"])
    async editOrder(@AuthUser() customer: User, @Args("input") editOrderInput: EditOrderInput): Promise<EditOrderOutput> {
        return this.ordersService.editOrder(customer, editOrderInput);
    }

    @Mutation((returns) => TakeOrderOutput)
    @Role(["Delivery"])
    takeOrder(@AuthUser() driver: User, @Args("input") takeOrderInput: TakeOrderInput): Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver, takeOrderInput);
    }

    @Subscription((returns) => Order, {
        filter: ({ pendingOrders }, _, { user }) => {
            return pendingOrders.ownerId === user.id;
        },
        resolve: ({ pendingOrders }, _, __) => {
            return pendingOrders.newOrder;
        },
    })
    @Role(["Owner"])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription((returns) => Order, {
        resolve: (updated) => {
            return updated;
        },
    })
    @Role(["Delivery"])
    cookedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription((returns) => Order, {
        filter: ({ orderUpdates: order }, { input }, { user }) => {
            console.log(order);
            console.log(input);
            if (order.driverId !== user.id && order.customerId !== user.id && order.restaurant.ownerId !== user.id) {
                return false;
            }
            return order.id === input.id;
        },
    })
    @Role(["Any"])
    orderUpdates(@Args("input") orderUpdatesInput: OrderUpdatesInput) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }
}
