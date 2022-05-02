import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];

  switch (command) {
    case 'create-user':
      const userService = app.get(UserService);

      const username = process.argv[3];
      const password = process.argv[4];

      try {
        await userService.create({ username }, password);
      } catch (error) {
        Logger.error(error);
      }

      break;
    default:
      Logger.log('Command not found');
      process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
