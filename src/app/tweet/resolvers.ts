import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../intefaces";
import { Tweet } from "@prisma/client";

interface createTweetPayload {
    content: string;
    imageURL?: string;
    // userId : String;
}

const queries = {

    getAllTweets : () => prismaClient.tweet.findMany( { orderBy : {createdAt:"desc"} } )

}


const mutations = {
    createTweet: async (parent:any, {payload}:{payload : createTweetPayload}, context:GraphqlContext) => {
        if(!context.user){
            throw new Error("user is Unauthorized")

        }

        const tweet = await prismaClient.tweet.create({
            data : {
                content : payload.content,
                imageURL : payload.imageURL,
                author : { connect : { id : context.user.id } }
            }
        })

        return tweet;
    }

}

const extraResolvers = {
    Tweet : {
        author : (parent : Tweet) => prismaClient.user.findUnique({ where : {id : parent.authorId}})
    }
}

const resolvers = { mutations , extraResolvers , queries}
export default resolvers;