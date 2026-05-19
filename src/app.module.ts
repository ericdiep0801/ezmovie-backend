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
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
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
        entities: [User, Favorite, WatchHistory, Comment, TvChannel, TvFavorite, TvHistory],
        synchronize: true,
        migrationsRun: true,
      }),
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
    TvModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
