import { user } from "@/types/default";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || 'default_secret';
const expirentTime = process.env.JWT_EXPIRENTTIME || "1600";
const refreshExpirentTime = process.env.JWT_REFRESH_EXPIRENTTIME || "604800"

class JwtProvider {
  async signAccessToken (user: user, callback: any){
    try {
      jwt.sign(
        {
          id: user.id
        },
        secret,
        {
          issuer: process.env.JWT_ISSUER,
          algorithm: "HS256",
          expiresIn: parseInt(expirentTime),
        },
        (error, token) => {
          if (error) {
            callback(error, null);
          }
          else if (token) {
            callback(null, token);
          }
        }
      );
    } catch (err) {
      console.error(err);
      callback(err, null);
    }
  };

  async signRefreshToken(callback: any) {
    try {
      jwt.sign(
        {},
        secret,
        {
          issuer: process.env.JWT_ISSUER,
          algorithm: "HS256",
          expiresIn: parseInt(refreshExpirentTime),
        },
        (error, token) => {
          if (error) {
            callback(error, null);
          }
          else if (token) {
            callback(null, token);
          }
        }
      );
    } catch (err) {
      console.error(err);
      callback(err, null);
    }
  }

  async verifyAccessToken(token: string) {
    let decoded: any = null;
    try {
      decoded = await jwt.verify(token, secret)
      return {
        id: decoded.id,
      }
    } catch (err: any) {
      return {
        message: err.message
      }
    }
  }

  async verifyRefreshToken(refresh: string) {
    try {
      await jwt.verify(refresh, secret);
      return true;
    } catch (err) {
      return false;
    }
  };
}

export default JwtProvider;