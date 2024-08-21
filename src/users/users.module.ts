import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { Verification } from './entities/verification.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';


@Module({
    imports: [TypeOrmModule.forFeature([User, Verification, Restaurant])],
    providers: [UsersService, UsersResolver],
    exports: [UsersService]
})
export class UsersModule {}
