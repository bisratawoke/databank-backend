import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { ReportModule } from './modules/report/report.module';
import { DataModule } from './modules/data/data.module';
import { FieldTypeModule } from './modules/field-type/field-type.module';
import { FieldModule } from './modules/field/field.module';
import { DepartmentModule } from './modules/department/department.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { MinioModule } from './minio/minio.module';
import { PublicationModule } from './modules/publication/publication.module';
import { MetastoreModule } from './modules/metastore/metastore.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NotifireModule } from './modules/notifire/notifire.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
      auth: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
      },
    }),
    PrismaModule,
    ReportModule,
    DataModule,
    FieldTypeModule,
    FieldModule,
    DepartmentModule,
    CategoryModule,
    SubCategoryModule,
    MinioModule,
    PublicationModule,
    MetastoreModule,
    NotifireModule,
    AuthModule,
  ],
})
export class AppModule {}
