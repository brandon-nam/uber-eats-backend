import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { User } from "src/users/entities/user.entity";
import { Dish } from "./dish.entity";
import { Order } from "src/orders/entities/order.entity";

@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string; 

    @Field(type => Category, { nullable: true })
    @ManyToOne(type => Category, (category) => category.restaurants, {
        nullable: true,
        onDelete: "SET NULL"
    })
    category: Category;

    @Field((type) => [Dish], { nullable: true })
    @OneToMany(type => Dish, (dish) => dish.restaurant)
    menu: Dish[];

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    address: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImage: string;

    @Field(type => User)
    @ManyToOne(type => User, (user) => user.restaurants, { onDelete: "CASCADE" })
    owner: User;

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number; 

    @Field(type => [Order])
    @OneToMany(type => Order, (order) => order.restaurant)
    orders: Order[]
}