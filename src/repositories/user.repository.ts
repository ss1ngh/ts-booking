import { Prisma } from "@prisma/client";
import { prisma } from '../config';
import { NotFoundError } from "../utils/AppError";

export const createUser = async(data : Prisma.UserCreateInput) => {
    return await  prisma.user.create({
        data : data
    });
}

export const deleteUser = async(userId : number) => {

    try {
        const response  = await prisma.user.delete({
            where : {userId}
        });
        return response;
    } catch (error : any) {
        if(error.code === 'P2025' ) {
            throw new NotFoundError("User");
        } else {
            throw error;
        }
    }
}

export const getUser = async(userId : number) => {
    return prisma.user.findUnique({
        where : {userId}
    });
}

export const getUserByEmail = async(email : string) => {
    return await prisma.user.findUnique({
        where : {email}
    });
}

export const updateUser = async(userId : number, data : Prisma.UserUpdateInput) => {
    try{
        return await prisma.user.update({
            where :{userId},
            data
        });
    } catch (error : any) {
        if(error.code === 'P2025') {
            throw new NotFoundError("User");
        } else {
            throw error;
        }
    }

}