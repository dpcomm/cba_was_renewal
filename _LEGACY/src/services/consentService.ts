import ConsentRepository from "@repositories/consentRepository";
import { requestCreateConsentDto } from "@dtos/consentDto";

const consentRepository = new ConsentRepository();

class ConsentService {
  async getAllConsents() {
    try {
      const consents = await consentRepository.findAllConsents();
      if (!consents) {
        return { ok: 0, message: "No consents found", consents };
      }
      return { ok: 1, message: "getAllConsents success", consents };
    } catch (err) {
      throw err;
    }
  }

  async getConsent(userId: number, consentType: string) {
    try {
      const consent = await consentRepository.findConsentByUserIdAndType(userId, consentType);
      console.log(consent);
      if (!consent) {
        return { ok: 1, message: "Consent not found" };
      }
      return { ok: 1, message: "getConsent success", consent };
    } catch (err) {
      throw err;
    }
  }

  async createConsent(dto: requestCreateConsentDto) {
    try {
      const consent = await consentRepository.createConsent(dto);
      if (!consent) {
        return { ok: 0, message: "Failed to create consent" };
      }
      return { ok: 1, message: "createConsent success" };
    } catch (err) {
      throw err;
    }
  }

    async updateConsent(userId: number, consentType: string, value: boolean) {
    try {
      const existing = await consentRepository.findConsentByUserIdAndType(userId, consentType);
      if (!existing) {
        return { ok: 0, message: "Consent not found" };
      }
      const updated = await consentRepository.updateConsent(userId, consentType, value);
      return { ok: 1, message: "updateConsent success", consent: updated };
    } catch (err) {
      throw err;
    }
  }


  async deleteConsent(userId: number, consentType: string) {
    try {
      const result = await consentRepository.deleteConsent(userId, consentType);
      if (!result) {
        return { ok: 0, message: "Failed to delete consent" };
      }
      return { ok: 1, message: "deleteConsent success" };
    } catch (err) {
      throw err;
    }
  }
}

export default ConsentService;