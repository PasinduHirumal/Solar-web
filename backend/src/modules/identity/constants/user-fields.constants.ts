import { UserEntity } from "../entities/user.entity";

export const USER_FIELDS: (keyof UserEntity)[] = [
    'id', 'email', 'name', //'phone', 'address',
];