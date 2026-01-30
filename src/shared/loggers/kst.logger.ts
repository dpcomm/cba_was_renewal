import { ConsoleLogger } from '@nestjs/common';

export class KSTLogger extends ConsoleLogger {
  protected override getTimestamp(): string {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);

    return kstDate.toISOString().replace('T', ' ').substring(0, 19);
  }
}
