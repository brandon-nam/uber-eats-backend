import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { IsEnum } from "class-validator";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    Cancelled = "Cancelled",
    Pending = "Pending",
    Cooking = "Cooking",
    Cooked = "Cooked",
    MatchingDriver = "MatchingDriver",
    PickedUp = "PickedUp",
    Delivered = "Delivered",
}

registerEnumType(OrderStatus, { name: "OrderStatus" });

@ObjectType()
@Entity()
export class Order extends CoreEntity {
    @Field((type) => User, { nullable: true })
    @ManyToOne((type) => User, (user) => user.orders, { onDelete: "SET NULL", nullable: true, eager: true })
    customer?: User;

    @RelationId((order: Order) => order.customer)
    customerId?: number; 

    @Field((type) => User, {nullable: true})
    @ManyToOne((type) => User, (user) => user.rides, { onDelete: "SET NULL", nullable: true, eager: true })
    driver?: User;

    @RelationId((order: Order) => order.driver)
    driverId?: number; 

    @Field((type) => [OrderItem])
    @ManyToMany((type) => OrderItem, { eager: true})
    @JoinTable()
    items: OrderItem[];

    @Column({ nullable: true })
    @Field((type) => Float, { nullable: true })
    total?: number;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Pending })
    @Field((type) => OrderStatus)
    @IsEnum(OrderStatus)
    orderStatus: OrderStatus;

    @Field((type) => Restaurant)
    @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, { onDelete: "SET NULL", nullable: true, eager: true })
    restaurant?: Restaurant;
}
