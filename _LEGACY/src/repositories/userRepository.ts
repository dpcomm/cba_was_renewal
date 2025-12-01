import { requestRegisterUserDto, updateUserDto, updateGroupDto, updateNameDto, updatePhoneDto,deleteUserDto,updateBirthDto } from '@dtos/authDto';
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

class UserRepository {
  async createUser(userDTO: requestRegisterUserDto, hash: string) {
    const groupValue = userDTO.group === "기타" ? userDTO.etcGroup || userDTO.group : userDTO.group;
    return await prisma.user.create({
      data: {
        userId: userDTO.userId,
        password: hash,
        name: userDTO.name,
        group: groupValue,
        phone: userDTO.phone,
        birth: new Date(userDTO.birth),
        gender: userDTO.gender,
        // rank: "M"
      }
    });
  }
  async findUserById(id: number) {
    return await prisma.user.findUnique({
      where: {
        id: id
      }
    });
  }
  async findUserByUserId(userId: string) {
    return await prisma.user.findUnique({
      where: {
        userId: userId
      }
    });
  }
  async findUser() {
    return await prisma.user.findMany();
  }
  async updateUser(updateDTO: updateUserDto) {
    return await prisma.user.update({
      where: {userId: updateDTO.userId},
      data: {
        name: updateDTO.name,
        // password: hash,
        group: updateDTO.group,
        phone: updateDTO.phone,
        birth: new Date(updateDTO.birth),
        gender: updateDTO.gender
      },
    });
  }
  async updatePassword(userId: string, hash: string) {
    return await prisma.user.update({
      where: {userId: userId},
      data: {
        password: hash
      }
    });
  }

  async updateUserGroup(groupDTO: updateGroupDto) {
    return await prisma.user.update({
      where: {userId: groupDTO.userId},
      data: {
        group: groupDTO.group
      },
    });
  }

  async updateUserName(nameDTO: updateNameDto) {
    return await prisma.user.update({
      where: {id: nameDTO.id},
      data: {
        name: nameDTO.name
      },
    });
  }

  async updateUserPhone(phoneDTO: updatePhoneDto) {
    return await prisma.user.update({
      where: {id: phoneDTO.id},
      data: {
        phone: phoneDTO.phone
      },
    });
  }

  async updateUserBirth(birthDTO: updateBirthDto) {
    return await prisma.user.update({
      where: {userId: birthDTO.userId},
      data: {
        birth: new Date(birthDTO.birth),
      },
    });
  }

  async deleteUser(userDTO: deleteUserDto) {
    return await prisma.user.update({
      where: {id: userDTO.id},
      data: {
        isDeleted: true
      },
    });
  }
}


export default UserRepository;