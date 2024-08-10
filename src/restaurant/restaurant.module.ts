import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Module({
  providers: [RestaurantService]
})
export class RestaurantModule {}
