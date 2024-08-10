import { Field } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Entity } from "typeorm";

@Entity()
export class Restaurant extends CoreEntity {

    @Field(type => )
}