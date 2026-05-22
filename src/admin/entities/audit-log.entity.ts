import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  action: string; // INSERT, UPDATE, DELETE, BATCH_DELETE, BATCH_INSERT

  @Column({ type: 'varchar', length: 255 })
  tableName: string;

  @Column({ type: 'text', nullable: true })
  details: string; // JSON string of the changes or affected IDs

  @CreateDateColumn()
  createdAt: Date;
}
