import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
    imports: [UsersModule, JwtModule],
    providers: [
        {
            provide: APP_GUARD, 
            useClass: AuthGuard
        }
    ]
})
export class AuthModule {}
    