import JwtProvider from "@utils/jwtProvider";
import { Request, Response, NextFunction } from "express";

const jwtProvider = new JwtProvider();

const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: "Token not exist"
    });
  }

  const tokenVerify = await jwtProvider.verifyAccessToken(token);
  if (tokenVerify.message === "jwt expired") {
    return res.status(401).json({
      message: tokenVerify.message
    });
  }

  next();
}

export default verifyAuth;