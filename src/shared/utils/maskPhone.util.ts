// common/utils/maskPhone.ts
import { maskString } from "./mask.util";

export function maskPhone(phone: string): string {
  if (!phone) return '';

  const parts = phone.split('-');
  if (parts.length !== 3) {
    return maskString(phone);
  }

  const [start, middle, end] = parts;
  return `${start}-${maskString(middle, 0, 0)}-${end}`;
}
