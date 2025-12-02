export class ConsentDto {
  userId: number;
  consentType: string;
  consentedAt: Date;
  value: boolean;
}

export class ConsentListDto {
  consents: ConsentDto[];
}

export class ConsentWrapperDto {
  consent: ConsentDto | null;
}
