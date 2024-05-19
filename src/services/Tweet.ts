import { Tweet } from "@prisma/client";
import { prismaClient } from "../clients/db";
import { redisClient } from "../clients/redis/redis";

export interface createTweetPayload {
    content: string;
    imageURL?: string;
    userId : string;
}

class TweetService{

    public static async createTweet(data : createTweetPayload ){

        const rateLimitFlag = await redisClient.get(`RATE_LIMIT:Tweet:${data.userId}`)

        if(rateLimitFlag) throw new Error("please wait....")

        const updatedTweets =  prismaClient.tweet.create({
            data:{
                content:data.content,
                imageURL:data.imageURL,
                author:{connect:{id:data.userId}}
            }
        })

        await redisClient.setex(`RATE_LIMIT:Tweet:${data.userId}`,10,1)

        await redisClient.del("ALL_TWEETS")

        return updatedTweets
    }

    public static async getAllTweets(){
        const allTweetsthroughRedis = await redisClient.get("ALL_TWEETS")

        if(allTweetsthroughRedis) return JSON.parse(allTweetsthroughRedis)

        const tweets = await prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } })


        await redisClient.set('ALL_TWEETS',JSON.stringify(tweets))

        return tweets 
    }

    public static getTweetAuthor(parent:Tweet){
        return prismaClient.user.findUnique({ where: { id: parent.authorId } })
    }
}

export default TweetService