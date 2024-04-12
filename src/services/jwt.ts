import { User } from "@prisma/client";
import JWT from "jsonwebtoken";


const JWT_SECRET = '$ecretKey123'

class JWTservice {

    public static generateToken(user  : User) {
        // create payload
        const payload = {
            id: user?.id,
            email: user?.email,
        }

        // generate token
        const token = JWT.sign(payload, JWT_SECRET);

        return token;

    }
}

export default JWTservice;