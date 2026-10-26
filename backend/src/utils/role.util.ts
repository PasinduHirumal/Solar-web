import { UserRole } from '../modules/identity/enums/user.enum';

export function isAdminRole(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}