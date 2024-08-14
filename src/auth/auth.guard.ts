import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { AllowedRoles } from "./auth-role.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const role = this.reflector.get<AllowedRoles>('roles', context.getHandler());

        if(!role) {
            return true; 
        }

        const gqlContext = GqlExecutionContext.create(context).getContext(); 
        const user = gqlContext['user'];
        if (!user) {
            return false;
        }

        if(role.includes('Any')) {
            return true; 
        }

        return role.includes(user.role); 
    }
}