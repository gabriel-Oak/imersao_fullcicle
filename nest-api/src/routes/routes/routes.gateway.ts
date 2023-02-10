import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Producer } from 'kafkajs';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class RoutesGateway implements OnModuleInit {
  private kafkaProducer: Producer;

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaProducer = await this.kafkaClient.connect();
  }

  @SubscribeMessage('new-direction')
  handleMessage(client: Socket, { routeId }: { routeId: string }): string {
    const topic = 'route.new-direction';
    this.kafkaProducer.send({
      topic,
      messages: [
        {
          key: topic,
          value: JSON.stringify({ routeId, clientId: client.id }),
        },
      ],
    });
    return 'sent';
  }

  sendPosition(data: {
    clientId: string;
    routeId: string;
    position: [number, number];
    finished: boolean;
  }) {
    const { clientId, ...rest } = data;
    const { sockets } = this.server.sockets;
    const client = sockets.get(clientId);

    if (!client) return;

    client.emit('new-position', rest);
  }
}
