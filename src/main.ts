import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BlogConfigService } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService: BlogConfigService = app.get(BlogConfigService);

  const docs = new DocumentBuilder()
    .setTitle('NestJS Blog API')
    .setDescription('The blog API with RBAC and Redis caching')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = () => SwaggerModule.createDocument(app, docs);
  SwaggerModule.setup('api/docs', app, document);

  const port: number = configService.getPort();
  await app.listen(port);
}
void bootstrap();
