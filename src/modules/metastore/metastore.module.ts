import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetastoreController } from './metastore.controller';
import { MetastoreService } from './metastore.service';
import { Metastore, MetastoreSchema } from './schemas/metastore.schema';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Metastore.name, schema: MetastoreSchema },
    ]),
  ],
  controllers: [MetastoreController],
  providers: [MetastoreService],
})
export class MetastoreModule { }

