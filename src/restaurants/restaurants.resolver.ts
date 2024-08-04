import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { RestaurantsService } from "./restaurants.service";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query((returns) => [Restaurant])
  async restaurants(): Promise<Restaurant[]> {
    return this.restaurantsService.findAll();
  }

  @Mutation((returns) => Boolean)
  async createRestaurant(@Args("createRestaurantInput") createRestaurantInput: CreateRestaurantDto): Promise<boolean> {
    try {
      this.restaurantsService.save(createRestaurantInput);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation((returns) => Boolean)
  async updateRestaurant(@Args("input") updateRestaurantDto: UpdateRestaurantDto): Promise<boolean> {
    try {
      this.restaurantsService.update(updateRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
