import JWT from "jsonwebtoken";
import { User } from "@prisma/client";
import { JWTUser } from "../intefaces";

const JWT_SECRET = "kamal123";

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, JWT_SECRET);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRET ) as JWTUser;
    } catch (error) {
      console.log((error as Error).message);
      return null;
    }
  }
}

export default JWTService;
