import { requestAuthCheckDto, requestLoginUserDto, requestLogoutUserDto, requestRefreshAccessTokenDto, requestRegisterUserDto, checkUserDto, updateUserDto, resetPasswordDto, updateGroupDto, updateNameDto, deleteUserDto, updatePhoneDto,updateBirthDto } from "@dtos/authDto";
import bcrypt from "bcryptjs";
import { user } from "@/types/default";
import UserRepository from "@repositories/userRepository";
import JwtProvider from "@utils/jwtProvider";
import redisClient from "@utils/redis";
import { decode } from "jsonwebtoken";


const userRepository = new UserRepository();
const jwtProvider = new JwtProvider();

const normalizeHash = (hash?: string | Buffer | null): string => {
  if (!hash) return "";
  return typeof hash === "string" ? hash : hash.toString("utf8");
};


class UserService {
  async login(userDTO: requestLoginUserDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(userDTO.userId);
      if (!user) {
        return ({
          ok: 0,
          message: "Unregisterd user"
        })
      };

      if (user.isDeleted) {
        return ({
          ok: 0,
          message: "Deleted user"
        })
      };

      const storedHash = normalizeHash(user.password);
      const isPasswordCorrect = await bcrypt.compare(userDTO.password, storedHash);
      if (!isPasswordCorrect) {
        return ({
          ok: 0,
          message: "Incorrect password"
        })
      };

      const accessToken = await new Promise((resolve, reject) => {
        jwtProvider.signAccessToken(user, (err: any, accessToken: string) => {
          if (err) reject(err);
          resolve(accessToken);
        });
      });

      if (userDTO.autoLogin) {
        const refreshToken = await new Promise((resolve, reject) => {
          jwtProvider.signRefreshToken((err: any, refreshToken: string) => {
            if (err) reject(err);
            resolve(refreshToken);
          });
        });
        await redisClient.set(String(user.id), String(refreshToken));
        return ({
          ok: 1,
          message: "Authorize success",
          accessToken,
          refreshToken,
          user
        });
      }

      return ({
        ok: 1,
        message: "Authorize success",
        accessToken,
        user
      });
    } catch(err) {
      throw err;
    }
  }
  async logout(userDTO: requestLogoutUserDto) {
    try {
      let stringId = String(userDTO.id);
      const n = await redisClient.exists(stringId);
      n && await redisClient.del(stringId);
      return ({
        ok: 1,
      });
    } catch(err: any) {
      throw err;
    }
  }
  async register(userDTO: requestRegisterUserDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(userDTO.userId);
      const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{10,}$/;

      if (user) {
        return ({
          ok: 0,
          message: "Duplicated id"
        })
      };

      if (!userDTO) {
        return ({
          ok: 0,
          message: "Invalid request"
        });
      }
      if (!passwordPattern.test(userDTO.password)) {
        return ({
          ok: 0,
          message: "Password pattern unfulfilled"
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(userDTO.password, salt);

      await userRepository.createUser(userDTO, hash);

      return ({
        ok: 1,
        message: "Register success",
      });
    } catch(err) {
      throw err;
    }
  }
  async refreshAccessToken(userDTO: requestRefreshAccessTokenDto) {
    try {
      const decodedAccessToken: any = await decode(userDTO.accessToken);
      const refreshToken: any = await redisClient.get(String(decodedAccessToken.id));
      if (userDTO.refreshToken !== refreshToken) {
        return ({
          ok: 0,
          message: "Token does not match"
        });
      }

      const verifyRefreshTokenResult = await jwtProvider.verifyRefreshToken(refreshToken);
      if (!verifyRefreshTokenResult) {
        return ({
          ok: 0,
          message: "Invaild refresh token"
        });
      }

      const accessToken = await new Promise((resolve, reject) => {
        jwtProvider.signAccessToken(decodedAccessToken, (err: any, accessToken: string) => {
          if (err) reject(err);
          resolve(accessToken);
        });
      });

      const user: user | null = await userRepository.findUserById(decodedAccessToken.id);

      return ({
        ok: 1,
        message: "Token reissue success",
        user,
        accessToken,
      });
    } catch(err) {
      throw err;
    }
  }
  async authCheck(userDTO: requestAuthCheckDto) {
    try {
      const decodedAccessToken: any = await decode(userDTO.accessToken);
      if (!decodedAccessToken) {
        return ({
          ok: 1,
          message: "Unauthorized user"
        })
      }
      const user: user | null = await userRepository.findUserByUserId(String(decodedAccessToken.id));
      return ({
        ok: 1,
        message: "Authorized user",
        user
      });
    } catch(err) {
      throw err;
    }
  }
  async updateUserInfo(updateDTO:updateUserDto) {
    try {
    
      // const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{10,}$/;
      // if (!passwordPattern.test(updateDTO.password)) {
      //   return ({
      //     ok: 0,
      //     message: "Password pattern unfulfilled"
      //   });
      // }
      // const salt = bcrypt.genSaltSync(10);
      // const hash = bcrypt.hashSync(updateDTO.password, salt);
      // await userRepository.updateUser(updateDTO,hash);
      await userRepository.updateUser(updateDTO);
      return ({
        ok: 1,
        message: "Update User Success"
      })
    } catch(err) {
      throw err;
    }
  }
  async checkUserInfo (checkUserDto: checkUserDto) {
    try {
      if (checkUserDto.password) {
        const currentData = await userRepository.findUserByUserId(checkUserDto.userId);
        const currentHash = normalizeHash(currentData?.password);
        // currentData가 null(undefined) & currentData.password도 null(undefined)일때 "" 반환
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{10,}$/;
        if (!passwordPattern.test(checkUserDto.password)) {
          return ({
            ok: 0,
            message: "Password pattern unfulfilled"
          });
        }
        const checkPassword = bcrypt.compareSync(checkUserDto.password, currentHash);
        if (checkPassword) {
          return {
            ok: 1,
            message: "본인인증 완료",
            data:currentData
          };
        } else {
          return {
            ok: 0,
            message: "잘못된 비밀번호가 입력되었습니다."
          };
        }
      }
      throw new Error("Password is required");
    } catch (err) {
      throw err;
    }
  }
  async checkUserWithoutPassword (checkUserDto: checkUserDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(checkUserDto.userId);
      if (!user) {
        return {
          ok: 0,
          message: "User does not exist",
        };
      }
      const { name, gender, phone, group, birth } = checkUserDto;
      if (
        user.name !== name ||
        user.gender !== gender ||
        user.phone !== phone ||
        user.group !== group ||
        user.birth!.toISOString().split("T")[0] !== birth
      ) {
        return {
          ok: 0,
          message: "User information does not match",
        };
      }
      return {
        ok: 1,
        message: "User verified successfully",
        user,
      };
    } catch (err) {
      throw err;
    }
  }
  async getUserByUserId (userId: string) {
    try {
      const user: user | null = await userRepository.findUserByUserId(userId);
      if (!user) {
        return ({
          ok: 0,
          message: "User not exist"
        });
      }
      return ({
        ok: 1,
        message: "getUserByUserId success",
        user
      });
    } catch (err) {
      throw err;
    }
  }
  async getAllUser () {
    try {
      const user: user[] | null = await userRepository.findUser();
      if (!user) {
        return ({
          ok: 0,
          message: "User not exist"
        });
      }
      return ({
        ok: 1,
        message: "getAllUser success",
        // user
      });
    } catch (err) {
      throw err;
    }
  }

  async resetPassword (userDTO: resetPasswordDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(userDTO.userId);
      const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{10,}$/;
      if (!passwordPattern.test(userDTO.password)) {
        return ({
          ok: 0,
          message: "Password pattern unfulfilled"
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(userDTO.password, salt);
      await userRepository.updatePassword(userDTO.userId, hash);
      return ({
        ok: 1,
        message: "Reset password success"
      });
    } catch (err) {
      throw err;
    }
  }

  async updateUserGroup (groupDTO: updateGroupDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(groupDTO.userId);
      if (!user) {
        return {
          ok: 0,
          message: "User not exist"
        };
      }

      await userRepository.updateUserGroup(groupDTO);

      return {
        ok: 1,
        message: "Update group success"
      };
    } catch (err) {
      throw err;
    }
  }

  async updateUserName (nameDTO: updateNameDto) {
    try {
      const user: user | null = await userRepository.findUserById(nameDTO.id);

      if (!user) {
        return {
          ok: 0,
          message: "User not exist"
        };
      }

      await userRepository.updateUserName(nameDTO);

      return {
        ok: 1,
        message: "Update name success",
      };
    } catch (err) {
      throw err;
    }
  }

    async updateUserPhone (phoneDTO: updatePhoneDto) {
    try {
      const user: user | null = await userRepository.findUserById(phoneDTO.id);
      
      if (!user) {
        return {
          ok: 0,
          message: "User not exist"
        };
      }

      await userRepository.updateUserPhone(phoneDTO);

      return {
        ok: 1,
        message: "Update phone success"
      };
    } catch (err) {
      throw err;
    }
  }

  async updateUserBirth (birthDTO: updateBirthDto) {
    try {
      const user: user | null = await userRepository.findUserByUserId(birthDTO.userId);
      if (!user) {
        return {
          ok: 0,
          message: "User not exist"
        };
      }

      await userRepository.updateUserBirth(birthDTO);

      return {
        ok: 1,
        message: "Update birth success"
        };
    } catch (err) {
      throw err;
    }
  }
  async deleteUser (userDTO: deleteUserDto) {
    try {
      await userRepository.deleteUser(userDTO);

      return {
        ok: 1,
        message: "Delete user success",

      };
    } catch (err) {
      throw err;
    }
  }
}

export default UserService;