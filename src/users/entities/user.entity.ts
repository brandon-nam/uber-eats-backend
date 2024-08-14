import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, RelationId } from "typeorm";
import * as bcrypt from 'bcrypt'; 
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";
import { Restaurant } from "src/restaurant/entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";

export enum UserRole {
    Client = 'Client', 
    Owner = 'Owner', 
    Delivery = 'Delivery'
}

registerEnumType(UserRole, { name: 'UserRole' })

@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column()
    @Field(type => String)
    @IsEmail()
    email: string; 

    @Column()
    @Field(type => String)
    @IsString()
    password: string;
    
    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, (restaurant) => restaurant.owner)
    restaurants: Restaurant[];

    @Field(type => [Order]) 
    @OneToMany(type => Order, (order) => order.driver)
    rides: Order[];

    @Field(type => [Order]) 
    @OneToMany(type => Order, (order) => order.customer)
    orders: Order[];

    @BeforeUpdate()
    @BeforeInsert()
    async hashPassword(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10)
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(aPassword, this.password); 
        } catch(error) {
            console.log(error); 
            throw new InternalServerErrorException(); 
        }
    }
}