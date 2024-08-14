import { Injectable } from "@nestjs/common";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { ILike, Like, Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { Category } from "./entities/category.entity";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { AllRestaurantsInput, AllRestaurantsOutput } from "./dtos/all-restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { Dish } from "./entities/dish.entity";
import { create } from "domain";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
        @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
        private readonly categoryRepository: CategoryRepository
    ) {}

    async createRestaurant(
        user: User,
        { name, address, coverImage, categoryName }: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        try {
            const category = await this.categoryRepository.getOrCreate(categoryName);

            const newRestaurant = this.restaurantRepository.create({ name, address, coverImage, category });
            newRestaurant.owner = user;
            await this.restaurantRepository.save(newRestaurant);

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async editRestaurant(user: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
        try {
            await this.restaurantCheck(user.id, editRestaurantInput.restaurantId);

            let category = null;
            if (editRestaurantInput.categoryName) {
                category = await this.categoryRepository.getOrCreate(editRestaurantInput.categoryName);
            }

            const { categoryName, restaurantId, ...rest } = editRestaurantInput;

            this.restaurantRepository.update(restaurantId, {
                ...rest,
                category: category && { ...category },
            });

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async deleteRestaurant(user: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        try {
            await this.restaurantCheck(user.id, restaurantId);
            this.restaurantRepository.delete(restaurantId);

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async findRestaurantById({ id }: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurantRepository.findOne({ where: { id: id }, relations: ["menu"] });
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Cannot find restaurant with that id",
                };
            }

            return {
                ok: true,
                restaurant: restaurant,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async searchRestaurant({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalCount] = await this.restaurantRepository.findAndCount({
                where: {
                    name: ILike(`%${query}%`),
                },
                take: 25,
                skip: (page - 1) * 25,
            });

            if (totalCount == 0) {
                return {
                    ok: false,
                    error: "Could not search for restaurants",
                };
            }

            return {
                ok: true,
                restaurants: restaurants,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / 25),
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    private async restaurantCheck(userId: number, restaurantId: number) {
        const restaurantToEdit = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
        try {

            if (!restaurantToEdit) {
                throw new Error("Restaurant doesn't exist.");
            }
            
            if (restaurantToEdit.ownerId !== userId) {
                throw new Error("You are not the owner of this restaurant.");
            }
            
            return restaurantToEdit; 
        } catch(e) {
            throw e
        }
    }

    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const allCategories = await this.categoryRepository.find();
            return {
                ok: true,
                categories: allCategories,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async countRestaurants(category: Category) {
        return this.restaurantRepository.count({ where: { category: { id: category.id } } });
    }

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categoryRepository.findOne({ where: { slug: slug } });

            if (!category) {
                return {
                    ok: false,
                    error: "Category not found",
                };
            }

            const MAX_RESTAURANTS_PER_PAGE = 25;

            const restaurants = await this.restaurantRepository.find({
                where: { category: { id: category.id } },
                take: MAX_RESTAURANTS_PER_PAGE,
                skip: (page - 1) * MAX_RESTAURANTS_PER_PAGE,
            });

            category.restaurants = restaurants;

            const totalCountOfRestaurants = await this.countRestaurants(category);

            return {
                ok: true,
                category: category,
                restaurants: restaurants,
                totalPages: Math.ceil(totalCountOfRestaurants / MAX_RESTAURANTS_PER_PAGE),
            };
        } catch (e) {
            return {
                ok: false,
                error: "Cannot load category",
            };
        }
    }

    async allRestaurants({ page }: AllRestaurantsInput): Promise<AllRestaurantsOutput> {
        try {
            const [restaurants, totalCountOfRestaurants] = await this.restaurantRepository.findAndCount({
                take: 25,
                skip: (page - 1) * 25,
            });

            return {
                ok: true,
                restaurants: restaurants,
                totalPages: Math.ceil(totalCountOfRestaurants / 25),
                totalCount: totalCountOfRestaurants,
            };
        } catch (e) {
            return {
                ok: false,
                error: "Cannot load restaurants",
            };
        }
    }

    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
        try {
            const restaurant = await this.restaurantCheck(owner.id, createDishInput.restaurantId); 

            await this.dishRepository.save(this.dishRepository.create({...createDishInput, restaurant}));

            return {
                ok: true,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async deleteDish(user: User, deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
        try {
            const dish = await this.dishRepository.findOne({ where: {id: deleteDishInput.id}, relations: ["restaurant"] }); 

            if(!dish) {
                return {
                    ok: false,
                    error: "Cannot find dish",
                };
            }

            if(dish.restaurant.ownerId !== user.id) {
                return {
                    ok: false,
                    error: "You are not authorized.",
                }; 
            }
            
            await this.dishRepository.delete(deleteDishInput.id); 

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }

    async editDish(user: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
        try {
            const dish = await this.dishRepository.findOne({ where: {id: editDishInput.id}, relations: ["restaurant"] }); 

            if(!dish) {
                return {
                    ok: false,
                    error: "Cannot find dish",
                };
            }

            if(dish.restaurant.ownerId !== user.id) {
                return {
                    ok: false,
                    error: "You are not authorized.",
                }; 
            }

            await this.dishRepository.update(dish.id, {
                ...editDishInput
            });

            return {
                ok: true,
                error: null,
            };
        } catch (e) {
            return {
                ok: false,
                error: e,
            };
        }
    }
}
