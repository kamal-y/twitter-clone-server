import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../intefaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Tweet } from "@prisma/client";
import TweetService, { createTweetPayload } from "../../services/Tweet";

const s3Client = new S3Client({
    region:process.env.AWS_DEFAULT_REGION
})



const queries = {

    getAllTweets: () => TweetService.getAllTweets(),

    getSignedUrlForTweet: async (parent: any, { imageType, imageName }: { imageType: string, imageName: string }, context: GraphqlContext) => {
        if (!context.user || !context.user.id) throw new Error("user is Unauthorized")

        const imageTypes = ['jpg', 'jpeg', 'png', 'webp'];

        if (!imageTypes.includes(imageType.toLowerCase())) throw new Error("Image Type is Invalid")

        const putObjectCommand = new PutObjectCommand({
            
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${context.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
        })

        const signedUrl = await getSignedUrl( s3Client, putObjectCommand);

        return signedUrl
    }

}


const mutations = {
    createTweet: async (parent: any, { payload }: { payload : createTweetPayload }, context: GraphqlContext) => {
        if (!context.user) {
            throw new Error("user is Unauthorized")

        }

        const tweet = await TweetService.createTweet({
            ...payload,
            userId:context.user.id
        })

        return tweet;
    }

}

const extraResolvers = {
    Tweet: {
        author: (parent: Tweet) => TweetService.getTweetAuthor(parent)
    }
}

const resolvers = { mutations, extraResolvers, queries }
export default resolvers;