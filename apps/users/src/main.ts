import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // the application will use Express as its HTTP server
  const app = await NestFactory.create<NestExpressApplication>(UsersModule);

  // Configures the app to serve static assets from the public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // Sets the base directory for view templates to servers/email-templates
  app.setBaseViewsDir(join(__dirname, '..', 'servers/email-templates'));
  // Configures the app to use EJS as the template engine for rendering views
  app.setViewEngine('ejs');

  await app.listen(4001);
}
bootstrap();
