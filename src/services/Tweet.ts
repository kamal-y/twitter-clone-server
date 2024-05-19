import { Tweet } from "@prisma/client";
import { prismaClient } from "../clients/db";

export interface createTweetPayload {
    content: string;
    imageURL?: string;
    userId : string;
}

class TweetService{

    public static createTweet(data : createTweetPayload ){

        return prismaClient.tweet.create({
            data:{
                content:data.content,
                imageURL:data.imageURL,
                author:{connect:{id:data.userId}}
            }
        })
    }

    public static getAllTweets(){
        return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } })
    }

    public static getTweetAuthor(parent:Tweet){
        return prismaClient.user.findUnique({ where: { id: parent.authorId } })
    }
}

export default TweetService