import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { ObjectId, Repository } from "typeorm";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>
  ) {}


  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  save(createRestaurantDto : CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    return this.restaurantRepository.save(newRestaurant)
  }

  update(updateRestaurantDto : UpdateRestaurantDto) {
    return this.restaurantRepository.update(updateRestaurantDto.id, updateRestaurantDto.data);
  }
}
