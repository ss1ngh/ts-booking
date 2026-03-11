import { Prisma } from "@prisma/client";
import { prisma } from '../config';
import { AppError, NotFoundError } from "../utils/AppError";
import { CreateUserInput, UpdateUserInput } from "../types";
import bcrypt from 'bcrypt';

const safeUserSelect = {
    userId: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;


export const createUser = async(data : CreateUserInput) => {
    try {
        //hash password before it reached DB
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return await prisma.user.create({
            data : {
                email : data.email,
                firstName : data.firstName,
                lastName : data.lastName,
                password : hashedPassword
            },
            select : safeUserSelect
        });
    } catch (error : unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new AppError('Email already in use', 409);
        }
        throw error;
    }
}

export const deleteUser = async(userId : number) => {

    try {
        return await prisma.user.delete({
            where : {userId},
            select: safeUserSelect
        });
    } catch (error : unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === 'P2025' ) {
                throw new NotFoundError("User");
            } 
        }
        throw error;
    }
}

export const getUser = async(userId : number) => {
    return prisma.user.findUnique({
        where : {userId},
        select : safeUserSelect
    });
}

export const getUserByEmail = async(email : string) => {
    return await prisma.user.findUnique({
        where : {email},
        select: safeUserSelect
    });
}

export const updateUser = async(userId : number, data : UpdateUserInput) => {
    try{
        const updatePayload : Prisma.UserUpdateInput = {};

        //selective whitelisting for updates
        if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
        if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
        if (data.email !== undefined) updatePayload.email = data.email;

        //handle password hashing if password is being updated
        if(data.password !== undefined) {
            updatePayload.password = await bcrypt.hash(data.password, 10);
        }

        return await prisma.user.update({
            where :{userId},
            data : updatePayload,
            select : safeUserSelect
        });
    } catch (error : unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if(error.code === 'P2025') {
                throw new NotFoundError("User");
            }
        }
        throw error;
    }

}