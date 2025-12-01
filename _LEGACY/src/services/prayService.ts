import PrayRepository from "@repositories/prayRepository";
import { requestCreatePrayDto } from "@dtos/prayDto";

const prayRepository = new PrayRepository();

class PrayService {
  async getAllPrays() {
    try {
      const prays = await prayRepository.findAllPrays();
      if (!prays) {
        return {
          ok: 0,
          message: "No prays found",
          prays,
        };
      }
      return {
        ok: 1,
        message: "getAllPrays success",
        prays,
      };
    } catch (err) {
      throw err;
    }
  }

  async createPray(prayDto: requestCreatePrayDto) {
    try {
      const pray = await prayRepository.createPray(prayDto);
      if (!pray) {
        return {
          ok: 0,
          message: "Failed to create pray",
        };
      }
      return {
        ok: 1,
        message: "createPray success",
      };
    } catch (err) {
      throw err;
    }
  }

  async deletePray(id: number) {
    try {
      const deleteResult = await prayRepository.deletePray(id);
      if (!deleteResult) {
        return {
          ok: 0,
          message: "Failed to delete pray",
        };
      }
      return {
        ok: 1,
        message: "deletePray success",
      };
    } catch (err) {
      throw err;
    }
  }
}

export default PrayService;
