import axios from 'axios';
import {prismaClient} from '../../clients/db/index'
import {User}  from '@prisma/client';
import JWTservice from '../../services/jwt';
import {  GraphqlContext } from '../../intefaces';
import { graphql } from 'graphql';


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

const queries = {

    verifyGoogleToken: async (parent : any, {token}:{ token: string }) => {

        const googleToken = token;

        try {
            // Verify the token
            const googleOauthUrl = new URL(GOOGLE_OAUTH_URL);
            googleOauthUrl.searchParams.set('id_token', googleToken);

            const { data } = await  axios.get<GoogleOauthResponse>(googleOauthUrl.toString(),
            {
                responseType: 'json'
            });

            const checkUserExist = await prismaClient.user.findUnique({ 
                where: { email: data.email } 
            });

            if(!checkUserExist) {
                // Create user
                const newUser = await prismaClient.user.create({
                    data: {
                        email: data.email,
                        firstName : data.given_name,
                        lastName : data.family_name,
                        profileImageUrl :data.picture
                    }
                });
            }

            const userInDB = await prismaClient.user.findUnique({ where: { email: data.email } });

            if(!userInDB)  throw new Error('User not found');

            const Usertoken = JWTservice.generateTokenForUser(userInDB);

            return Usertoken
        } catch (err: any) {
            console.log('Error in verifying Google token:', err.message);
            return null;
        }
    },

    getCurrentUserDetails: async (_parent: any, _args: any, context: GraphqlContext) => {
        const id = context.user?.id;

        if (!id) throw new Error('User not found');

        const user = await prismaClient.user.findUnique({ where: { id } });

        return user;
    }
}

export const resolvers = { queries }