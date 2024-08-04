import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {
    @Field(type => Int)
    @PrimaryGeneratedColumn()
    id: Number

    @Field(type => String)
    @Column()
    name: string;

    @Field(type => Boolean, { nullable: true })
    @IsOptional()
    @Column({ default: true })
    isVegan: boolean;

    @Field(type => String)
    @Column()
    address: string; 

    @Field(type => String)
    @Column()
    ownerName: string;

    @Field(type => String)
    @Column()
    categoryName: string;
}