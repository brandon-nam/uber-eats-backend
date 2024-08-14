import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish, DishOption, DishOptionChoice } from "src/restaurant/entities/dish.entity";
import { Column, Entity, ManyToOne } from "typeorm";

// to be used in create order dto.
@InputType("OrderItemOptionInputType", { isAbstract: true })
@ObjectType()
export class OrderItemOption {
    @Field((type) => String)
    name: string;

    @Field((type) => String, { nullable: true })
    option?: string;

    // don't need extra as total will be calculated in the background.
}

// To be used in the order entity.
@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    @Field((type) => Dish)
    @ManyToOne((type) => Dish, { nullable: true, onDelete: "CASCADE" })
    dish: Dish;

    @Field((type) => [OrderItemOption], { nullable: true })
    @Column({ type: "json", nullable: true })
    options?: OrderItemOption[];
}
