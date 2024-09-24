import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swager';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are found
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));
  setupSwagger(app)


  const port = process.env.PORT || 3016;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
