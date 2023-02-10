import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

interface Position {
  lat: number;
  long: number;
}

export type RouteDocument = Route & MongooseDocument;

@Schema()
export class Route {
  @Prop()
  _id: string;

  @Prop()
  title: string;

  @Prop(
    raw({
      lat: { type: Number },
      long: { type: Number },
    }),
  )
  startPosition: Position;

  @Prop(
    raw({
      lat: { type: Number },
      long: { type: Number },
    }),
  )
  endPosition: Position;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
