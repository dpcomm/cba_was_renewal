import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqProducerService } from './rabbitmq.producer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitMqProducerService],
  exports: [RabbitMqProducerService],
})
export class RabbitMqModule {}
