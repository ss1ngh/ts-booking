import {z} from 'zod';

export const createUserSchema = z.object({
    firstName : z.string().trim().min(1, "First Name can't be blank"),
    lastName : z.string().trim().min(1, "Last Name can't be blank"),
    email : z.email(),
    password : z.string()
        .min(8, "Password must be minimum 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;