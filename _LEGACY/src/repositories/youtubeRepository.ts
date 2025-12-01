import { requestCreateYoutubeDto } from '@dtos/youtubeDto';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class YoutubeRepository {
  async findYoutube() {
    return await prisma.youtube.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async createYoutube(youtubeDto: requestCreateYoutubeDto) {
    return await prisma.youtube.create({
      data: {
        retreatId: youtubeDto.retreatId,
        title: youtubeDto.title,
        link: youtubeDto.link
      }
    });
  }
}

export default YoutubeRepository;