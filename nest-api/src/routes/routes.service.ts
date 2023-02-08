import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Route, RouteDocument } from './entities/route.entity';
import { Model } from 'mongoose';

@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(Route.name) private readonly routeModel: Model<RouteDocument>,
  ) {}

  findAll() {
    return this.routeModel.find().exec();
  }
}
