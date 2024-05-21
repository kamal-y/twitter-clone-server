import axios from 'axios';
import { prismaClient } from '../../clients/db/index'
import { User } from '@prisma/client';
import { GraphqlContext } from '../../intefaces';
import { graphql } from 'graphql';
import UserService from '../../services/User';
import TweetService from '../../services/Tweet';
import { redisClient } from '../../clients/redis/redis';



const queries = {

    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const resultToken = await UserService.verifyGoogleAuthToken(token)
        return resultToken
    },

    getCurrentUserDetails: async (_parent: any, _args: any, context: GraphqlContext) => {
        const id = context.user?.id;

        if (!id) throw new Error('User not found');

        const user = await UserService.getUserById(id);

        return user;
    },

    getUserById: async (_parent: any, { id }: { id: string }, context: GraphqlContext) => {
        const user = await UserService.getUserById(id);

        return user;
    }
}

const mutations = {
    followUser: async (_parent: any, { to }: { to: string }, context: GraphqlContext) => {
        if (!context.user || !context.user.id) throw new Error("unauthorized")

        await UserService.followUser(context.user.id, to)
        await redisClient.del(`recommended_users:${context.user.id}`)
        return true
    },

    unFollowUser: async (_parent: any, { to }: { to: string }, context: GraphqlContext) => {
        if (!context.user || !context.user.id) throw new Error("unauthorized")

        await UserService.unFollowUser(context.user.id, to)
        await redisClient.del(`recommended_users:${context.user.id}`)
        return true
    },

    deleteTweetById: async(_p:any, {id}:{id:string},context: GraphqlContext)=>{
        // if (!context.user || !context.user.id) throw new Error("unauthorized")

        await UserService.deleteTweet(id)
        await redisClient.del("ALL_TWEETS")
        return true
    }
}

const extraResolvers = {
    User: {
        tweets: (parent: User) => UserService.getAllUserTweets(parent),

        follower: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: {
                    follower: true
                }
            })

            return result.map((el) => el.follower)

        },

        following: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    following: true
                }
            },
            )
            return result.map((el) => el.following)
        },

        recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
            if (!ctx.user) return [];

            const cachedValue = await redisClient.get(`recommended_users:${ctx.user.id}`)

            if(cachedValue) {
                return JSON.parse(cachedValue)
            }

            const myFollowings = await prismaClient.follows.findMany({
                where: {
                    follower: { id: ctx.user.id },
                },
                include: {
                    following: {
                        include: { follower: { include: { following: true } } },
                    },
                },
            });

            const users: User[] = [];

            for (const followings of myFollowings) {
                for (const followingOfFollowedUser of followings.following.follower) {
                    if (
                        followingOfFollowedUser.following.id !== ctx.user.id &&
                        myFollowings.findIndex(
                            (e) => e?.followingId === followingOfFollowedUser.following.id
                        ) < 0
                    ) {
                        users.push(followingOfFollowedUser.following);
                    }
                }
            }


            await redisClient.set(`recommended_users:${ctx.user.id}`, JSON.stringify(users))

            return users;
        },

    }
}

export const resolvers = { queries, extraResolvers, mutations }