import {z} from 'zod';

const createUserSchema = z.object({
    firstName : z.string().min(1, "First Name can't be blank"),
    lastName : z.string().min(1, "Last Name can't be blank"),
    email : z.email(),
    password : z.string().min(8, "Password must be minimum 8 characters"),
});

const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;