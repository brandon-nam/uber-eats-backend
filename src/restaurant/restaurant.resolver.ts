import { Args, InputType, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurant.service";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/auth-role.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { Category } from "./entities/category.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { AllRestaurantsInput, AllRestaurantsOutput } from "./dtos/all-restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Dish } from "./entities/dish.entity";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { MyRestaurantsOutput } from "src/users/dtos/my-restaurants.dto";

@Resolver((of) => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Query((returns) => RestaurantOutput)
    restaurant(@Args("input") restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
        return this.restaurantService.findRestaurantById(restaurantInput);
    }

    @Query((returns) => SearchRestaurantOutput)
    searchRestaurant(@Args("input") searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurant(searchRestaurantInput);
    }

    @Query((returns) => AllRestaurantsOutput)
    allRestaurants(@Args("input") restaurantsInput: AllRestaurantsInput): Promise<AllRestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsInput);
    }

    @Query((returns) => MyRestaurantsOutput)
    @Role(["Owner"])
    async myRestaurants(@AuthUser() authUser: User): Promise<MyRestaurantsOutput> {
        return this.restaurantService.myRestaurants(authUser); 
    }

    @Mutation((returns) => CreateRestaurantOutput)
    @Role(["Owner"])
    createRestaurant(
        @AuthUser() authUser: User,
        @Args("input") createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
    }

    @Mutation((returns) => EditRestaurantOutput)
    @Role(["Owner"])
    editRestaurant(
        @AuthUser() authUser: User,
        @Args("input") editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(authUser, editRestaurantInput);
    }

    @Mutation((returns) => DeleteRestaurantOutput)
    @Role(["Owner"])
    deleteRestaurant(
        @AuthUser() authUser: User,
        @Args("input") deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(authUser, deleteRestaurantInput);
    }
}

@Resolver((of) => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    // For displaying every category that exists
    @Query((returns) => AllCategoriesOutput)
    async allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    // For displaying the number of restaurants with a category
    @ResolveField((type) => Number)
    async restaurantCount(@Parent() category: Category): Promise<number> {
        return await this.restaurantService.countRestaurants(category);
    }

    @Query((returns) => CategoryOutput)
    async category(@Args("input") categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }
}

@Resolver((of) => Dish)
export class DishResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Mutation((returns) => CreateDishOutput)
    @Role(["Owner"])
    async createDish(@AuthUser() owner: User, @Args("input") createDishInput: CreateDishInput): Promise<CreateDishOutput> {
        return this.restaurantService.createDish(owner, createDishInput);
    }

    @Mutation((returns) => DeleteDishOutput)
    @Role(["Owner"])
    async deleteDish(@AuthUser() owner: User, @Args("input") deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput);
    }

    @Mutation((returns) => EditDishOutput)
    @Role(["Owner"])
    async editDish(@AuthUser() owner: User, @Args("input") editDishInput: EditDishInput): Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput);
    }
}
