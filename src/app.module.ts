import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { Restaurant } from "./restaurants/entities/restaurant.entity";
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from "./users/entities/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: process.env.NODE_ENV === "dev" 
        ? ".env.development.local"
        : ".env.test.local",
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod'), 
        DB_HOST: Joi.string().required(), 
        DB_PORT: Joi.string().required(), 
        DB_USERNAME: Joi.string().required(), 
        DB_DATABASE: Joi.string().required(), 
      })
    }), 
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username:process.env.DB_USERNAME,
      database:process.env.DB_DATABASE,
      entities: [Restaurant, User],
      synchronize: process.env.NODE_ENV !== "prod",
      logging: process.env.NODE_ENV !== "prod" 
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    RestaurantsModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
