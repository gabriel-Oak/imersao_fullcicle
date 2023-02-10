import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { RoutesService } from './routes.service';
import { RoutesGateway } from './routes/routes.gateway';

@Controller('routes')
export class RoutesController implements OnModuleInit {
  private kafkaProducer: Producer;

  constructor(
    private readonly routesService: RoutesService,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
    private readonly routeGateway: RoutesGateway,
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

  @MessagePattern('route.new-position')
  consumeNewPosition(
    @Payload()
    message: {
      clientId: string;
      routeId: string;
      position: [number, number];
      finished: boolean;
    },
  ) {
    this.routeGateway.sendPosition(message);
  }
}
