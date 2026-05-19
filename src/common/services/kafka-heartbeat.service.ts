import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaHeartbeatService implements OnModuleInit {
  private readonly logger = new Logger(KafkaHeartbeatService.name);
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private isEnabled = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const broker = this.configService.get<string>('KAFKA_BROKER');
    const username = this.configService.get<string>('KAFKA_USERNAME') || 'avnadmin';
    const password = this.configService.get<string>('KAFKA_PASSWORD');

    if (!broker || !password) {
      this.logger.warn(
        'Kafka Configuration is incomplete (KAFKA_BROKER or KAFKA_PASSWORD is missing). Kafka Heartbeat Service is disabled.',
      );
      return;
    }

    try {
      this.kafka = new Kafka({
        clientId: 'ezmovie-heartbeat',
        brokers: [broker],
        ssl: {
          rejectUnauthorized: false, // Prevents local SSL handshake failures, secure enough for Aiven connection
        },
        sasl: {
          mechanism: 'scram-sha-256',
          username: username,
          password: password,
        },
      });

      this.producer = this.kafka.producer();
      this.isEnabled = true;
      this.logger.log('Kafka Heartbeat Service initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka client:', error);
    }
  }

  // Runs every 12 hours (0 0,12 * * *) to prevent Aiven Kafka from going idle (24h limit)
  @Cron('0 */12 * * *')
  async handleKafkaHeartbeat() {
    if (!this.isEnabled || !this.producer) {
      return;
    }

    try {
      this.logger.log('Sending heartbeat to Aiven Kafka to keep it alive...');
      await this.producer.connect();

      await this.producer.send({
        topic: 'heartbeat',
        messages: [
          {
            key: 'heartbeat-key',
            value: JSON.stringify({
              timestamp: new Date().toISOString(),
              message: 'EZMOVIE Keep-Alive Ping',
            }),
          },
        ],
      });

      this.logger.log('Heartbeat successfully sent to Kafka.');
    } catch (error) {
      this.logger.error('Failed to send heartbeat to Kafka:', error);
    } finally {
      try {
        await this.producer.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }
}
