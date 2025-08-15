import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedFlights } from './seed';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Get TypeORM DataSource
  const dataSource = app.get(DataSource);

  // Run seed after DB is ready
  await seedFlights(dataSource);
  await app.listen(process.env.PORT ?? 9001);
}
void bootstrap();
