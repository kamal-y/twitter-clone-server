import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTservice from './jwt';
import { PrismaClient, User } from "@prisma/client";

const GOOGLE_OAUTH_URL = 'https://oauth2.googleapis.com/tokeninfo';

interface GoogleOauthResponse {
    iss?: string; // Issuer
    azp?: string; // Authorized Party
    aud?: string; // Audience
    sub?: string; // Subject
    email: string; // Email
    email_verified?: string; // Email Verified
    nbf?: string; // Not Before
    name?: string; // Name
    picture?: string; // Picture
    given_name: string; // Given Name
    family_name: string; // Given Name
    locale?: string; // Locale
    iat?: string; // Issued At
    exp?: string; // Expiration Time
    jti?: string; // JWT ID
    alg?: string; // Algorithm
    kid?: string; // Key ID
    typ?: string; // Type
}

class UserService {

    public static async verifyGoogleAuthToken(token: string) {
        const googleToken = token;

        try {
            // Verify the token
            const googleOauthUrl = new URL(GOOGLE_OAUTH_URL);
            googleOauthUrl.searchParams.set('id_token', googleToken);

            const { data } = await axios.get<GoogleOauthResponse>(googleOauthUrl.toString(),
                {
                    responseType: 'json'
                });

            const checkUserExist = await prismaClient.user.findUnique({
                where: { email: data.email }
            });

            if (!checkUserExist) {
                // Create user
                const newUser = await prismaClient.user.create({
                    data: {
                        email: data.email,
                        firstName: data.given_name,
                        lastName: data.family_name,
                        profileImageUrl: data.picture
                    }
                });
            }

            const userInDB = await prismaClient.user.findUnique({ where: { email: data.email } });

            if (!userInDB) throw new Error('User not found');

            const Usertoken = JWTservice.generateTokenForUser(userInDB);

            return Usertoken
        } catch (err: any) {
            console.log('Error in verifying Google token:', err.message);
            return null;
        }
    }

    public static async getUserById(id: string) {
        return await prismaClient.user.findUnique({ where: { id } })
    }

    public static getAllUserTweets(parent: User) {
        return prismaClient.tweet.findMany({ where: { authorId: parent.id }, orderBy:{createdAt:"desc"} })
    }

    public static followUser(from: string, to: string) {

        return prismaClient.follows.create(
            {
                data: {
                    follower: { connect: { id: from } },
                    following: { connect: { id: to } }
                }
            }
        )
    }

    public static async unFollowUser(from: string, to: string) {
        const followRecord = await prismaClient.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: from,
                    followingId: to
                }
            }
        });
    
        if (!followRecord) {
            throw new Error('Follow record does not exist.');
        }

        return prismaClient.follows.delete(
            
            {
                where: { followerId_followingId: { followerId: from, followingId: to } }
            }
        )
    }

    public static async deleteTweet(id:string){
        return await prismaClient.tweet.delete({where:{id}})
    }
}

export default UserService