import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController implements OnModuleInit {
  private kafkaProducer: Producer;

  constructor(
    private readonly routesService: RoutesService,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaProducer = await this.kafkaClient.connect();
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':routeId/start')
  startRoute(@Param('routeId') routeId: string) {
    const topic = 'route.new-direction';
    this.kafkaProducer.send({
      topic,
      messages: [
        {
          key: topic,
          value: JSON.stringify({ routeId, clientId: '' }),
        },
      ],
    });
    return 'Message sended';
  }
}
