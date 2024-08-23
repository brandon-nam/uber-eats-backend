import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { UsersModule } from "./users/users.module";
import { CommonModule } from "./common/common.module";
import { User } from "./users/entities/user.entity";
import { JwtModule } from "./jwt/jwt.module";
import { JwtMiddleware } from "./jwt/jwt.middleware";
import { AuthModule } from "./auth/auth.module";
import { Verification } from "./users/entities/verification.entity";
import { MailModule } from "./mail/mail.module";
import { RestaurantModule } from "./restaurant/restaurant.module";
import { Restaurant } from "./restaurant/entities/restaurant.entity";
import { Category } from "./restaurant/entities/category.entity";
import { Dish } from "./restaurant/entities/dish.entity";
import { OrdersModule } from "./orders/orders.module";
import { Order } from "./orders/entities/order.entity";
import { OrderItem } from "./orders/entities/order-item.entity";
import { Context } from "graphql-ws";
import { TOKEN_KEY_HTTP, TOKEN_KEY_WS } from "./common/common.constants";
import { UploadsModule } from './uploads/uploads.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === "dev" ? ".env.development.local" : ".env.test.local",
            ignoreEnvFile: process.env.NODE_ENV === "production",
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid("dev", "production", "test"),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.string().required(),
                DB_USERNAME: Joi.string().required(),
                DB_DATABASE: Joi.string().required(),
                PRIVATE_KEY: Joi.string().required(),
                MAILGUN_API_KEY: Joi.string().required(),
                DOMAIN_NAME: Joi.string().required(),
                MAILGUN_FROM_EMAIL: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem],
            synchronize: process.env.NODE_ENV !== "prod",
            logging: process.env.NODE_ENV !== "prod" && process.env.NODE_ENV !== "test",
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            context: ({ req, extra }) => {
                return { token: req ? req.headers[TOKEN_KEY_HTTP] : extra[TOKEN_KEY_WS] };
            },

            subscriptions: {
                "graphql-ws": {
                    onConnect: (context: Context) => {
                        let { connectionParams, extra } = context;
                        console.log("connection params: \n \n \n", connectionParams[TOKEN_KEY_WS]);
                        extra[TOKEN_KEY_WS] = connectionParams[TOKEN_KEY_WS];
                    },
                },
            },
        }),
        JwtModule.forRoot({
            privateKey: process.env.PRIVATE_KEY,
        }),
        UsersModule,
        CommonModule,
        AuthModule,
        MailModule.forRoot({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.DOMAIN_NAME,
            fromEmail: process.env.MAILGUN_FROM_EMAIL,
        }),
        RestaurantModule,
        OrdersModule,
        CommonModule,
        UploadsModule,
    ],
    controllers: [],
    providers: [],
})
//implements NestModule
export class AppModule {
    // configure(consumer: MiddlewareConsumer) {
    //     consumer.apply(JwtMiddleware).forRoutes({
    //         path: "/graphql",
    //         method: RequestMethod.POST,
    //     });
    // }
}
