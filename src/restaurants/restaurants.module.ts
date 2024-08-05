import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant])],
    providers: [RestaurantResolver, RestaurantsService], 
})
export class RestaurantsModule {}