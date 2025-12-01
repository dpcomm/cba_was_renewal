import { requestCreateYoutubeDto } from "@dtos/youtubeDto";
import YoutubeRepository from "@repositories/youtubeRepository";

const youtubeRepository = new YoutubeRepository();

class YoutubeService {
  async getAllYoutube() {
    try {
      const youtube = await youtubeRepository.findYoutube();
      if (!youtube) {
        return ({
          ok: 0,
          message: "Youtube not exist",
          youtube: youtube,
        });
      }
      return ({
        ok: 1,
        message: "getAllYoutube success",
        youtube
      });
    } catch(err) {
      throw err;
    }
  }
  async createYoutube(youtubeDto: requestCreateYoutubeDto) {
    try {
      const youtube = await youtubeRepository.createYoutube(youtubeDto);
      if (!youtube) {
        return ({
          ok: 0,
          message: "Youtube not exist"
        });
      }
      return ({
        ok: 1,
        message: "createYoutube success",
      });
    } catch(err) {
      throw err;
    }
  }
}

export default YoutubeService;;