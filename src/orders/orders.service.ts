import { Injectable } from "@nestjs/common";
import { Order, OrderStatus } from "./entities/order.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Dish, DishOption } from "src/restaurant/entities/dish.entity";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>
    ) {}

    async createOrder(customer: User, { restaurantId, createOrderInput }: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                return {
                    ok: false,
                    error: null,
                };
            }

            let orderFinalPrice = 0;
            let orderItems: OrderItem[] = [];

            for (const item of createOrderInput) {
                const dish = await this.dishRepository.findOne({ where: { id: item.dishId } });
                if (!dish) {
                    return {
                        ok: false,
                        error: "Cannot find the dish.",
                    };
                }

                let dishTotalPrice = dish.price;

                for (const itemOption of item.options) {
                    const matchingOption = dish.options.find((dishOption) => {
                        return dishOption.name === itemOption.name;
                    });

                    if (matchingOption) {
                        if (matchingOption.extra) {
                            dishTotalPrice += matchingOption.extra;
                            continue;
                        }

                        if (matchingOption.choices) {
                            const matchingChoice = matchingOption.choices.find((choice) => {
                                return choice.name === itemOption.option;
                            });

                            if (matchingChoice) {
                                dishTotalPrice += matchingChoice.extra;
                            }
                        }
                    }
                }

                orderFinalPrice += dishTotalPrice;

                const orderItem = await this.orderItems.save(this.orderItems.create({ dish: dish, options: item.options }));
                orderItems.push(orderItem);
            }

            await this.orderRepository.save(
                this.orderRepository.create({
                    customer: customer,
                    items: orderItems,
                    total: orderFinalPrice,
                    restaurant: restaurant,
                })
            );

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async getOrders(user: User, { orderStatus }: GetOrdersInput): Promise<GetOrdersOutput> {
        if (user.role === UserRole.Client) {
            const orders = await this.orderRepository.find({
                where: {
                    customer: {
                        id: user.id,
                    },
                    orderStatus: orderStatus && orderStatus,
                },
            });
            return {
                ok: true,
                orders: orders,
            };
        } else if (user.role === UserRole.Delivery) {
            const orders = await this.orderRepository.find({
                where: {
                    driver: {
                        id: user.id,
                    },
                    orderStatus: orderStatus && orderStatus,
                },
            });
            return {
                ok: true,
                orders: orders,
            };
        } else if (user.role === UserRole.Owner) {
            const restaurants = await this.restaurants.find({
                where: {
                    owner: {
                        id: user.id,
                    },
                },
                relations: ["orders"],
            });

            const orders = restaurants
                .flatMap((restaurant) => {
                    return restaurant.orders;
                })
                .filter((order) => order.orderStatus === orderStatus);

            return {
                ok: true,
                orders,
            };
        }
    }

    async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
        try {
            const order = await this.orderRepository.findOne({
                where: {
                    id: id,
                },
                relations: ["restaurant"],
            });

            if (!order) {
                return {
                    ok: false,
                    error: "Cannot find order.",
                };
            }

            if (!this.canSee(order, user)) {
                return {
                    ok: false,
                    error: "You are not authorized.",
                };
            }

            return {
                ok: true,
                order: order,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async editOrder(user: User, { id, orderStatus }: EditOrderInput): Promise<EditOrderOutput> {
        try {
            const order = await this.orderRepository.findOne({
                where: {
                    id: id,
                },
                relations:["restaurant"]
            });

            if (!this.canSee(order, user)) {
                return {
                    ok: false,
                    error: "You are not authorized.",
                };
            }

            let editedOrderStatus = null;

            if (user.role === UserRole.Client) {
                if (order.orderStatus === OrderStatus.Pending && orderStatus === OrderStatus.Cancelled) {
                    editedOrderStatus = OrderStatus.Cancelled;
                }
            } else if (user.role === UserRole.Delivery) {
                if (
                    orderStatus === OrderStatus.MatchingDriver ||
                    orderStatus === OrderStatus.PickedUp ||
                    orderStatus === OrderStatus.Delivered
                ) {
                    editedOrderStatus = orderStatus;
                }
            } else if (user.role === UserRole.Owner) {
                if (orderStatus === OrderStatus.Cooking || orderStatus === OrderStatus.Cooked) {
                    editedOrderStatus = orderStatus;
                }
            }

            order.orderStatus = editedOrderStatus;
            await this.orderRepository.save(order);

            return {
                ok: true,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    private canSee(order: Order, user: User) {
        let canSee = true;
        if (user.role === UserRole.Client && user.id !== order.customerId) {
            canSee = false;
        }

        if (user.role === UserRole.Delivery && user.id !== order.driverId) {
            canSee = false;
        }

        if (user.role === UserRole.Owner && user.id !== order.restaurant.ownerId) {
            canSee = false;
        }
        return canSee;
    }
}
