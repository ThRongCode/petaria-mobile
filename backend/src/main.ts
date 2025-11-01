import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile app
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Request Logger Middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    const { method, originalUrl, body, headers } = req;

    console.log('\n🔵 ════════════════════════════════════════════');
    console.log(`📥 ${method} ${originalUrl}`);
    console.log(`🕐 Time: ${new Date().toLocaleTimeString()}`);
    
    if (headers.authorization) {
      console.log(`🔑 Auth: ${headers.authorization.substring(0, 20)}...`);
    }
    
    if (Object.keys(body || {}).length > 0) {
      console.log('📦 Body:', JSON.stringify(body, null, 2));
    }

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
      const duration = Date.now() - startTime;
      console.log(`📤 Response [${res.statusCode}] - ${duration}ms`);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('📊 Data:', JSON.stringify(jsonData, null, 2).substring(0, 500));
      } catch (e) {
        console.log('📊 Data:', data?.substring(0, 200));
      }
      
      console.log('🔵 ════════════════════════════════════════════\n');
      return originalSend.call(this, data);
    };

    next();
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 VnPeteria API running on http://localhost:${port}/api`);
  console.log(`📋 Logger: Request/Response logging enabled`);
}
bootstrap();
