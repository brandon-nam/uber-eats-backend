import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restaurant.resolver';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Dish])],
  providers: [RestaurantService, RestaurantResolver, CategoryRepository, CategoryResolver, DishResolver],
  exports: [RestaurantService]
})
export class RestaurantModule {}
