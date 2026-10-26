import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "./roles.decorator";
import { UserRole } from "../../enums/user.enum";

export function AdminOnly() {
    return applyDecorators(
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    );
}