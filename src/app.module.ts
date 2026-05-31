import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/domain/entities/user.entity';
import { Favorite } from './movies/domain/entities/favorite.entity';
import { WatchHistory } from './movies/domain/entities/history.entity';
import { Comment } from './movies/domain/entities/comment.entity';
import { MoviesModule } from './movies/movies.module';
import { TvChannel } from './tv/domain/entities/tv-channel.entity';
import { TvFavorite } from './tv/domain/entities/tv-favorite.entity';
import { TvHistory } from './tv/domain/entities/tv-history.entity';
import { TvModule } from './tv/tv.module';
import { MailModule } from './modules/mail/mail.module';
import { MusicModule } from './music/music.module';
import { CartoonModule } from './cartoon/cartoon.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaHeartbeatService } from './common/services/kafka-heartbeat.service';
import { AdminModule } from './admin/admin.module';
import { AuditLog } from './admin/entities/audit-log.entity';
import { CartoonHistory } from './cartoon/entities/cartoon-history.entity';
import { LiveModule } from './live/live.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Favorite, WatchHistory, Comment, TvChannel, TvFavorite, TvHistory, AuditLog, CartoonHistory],
        synchronize: true,
        migrationsRun: true,
        /** Giữ pool nhỏ để tiết kiệm RAM trên instance ~512MB (Render free/starter) và chừa connection cho external tools */
        extra: {
          connectionLimit: 3,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
    TvModule,
    MusicModule,
    CartoonModule,
    AdminModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    LiveModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, KafkaHeartbeatService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
