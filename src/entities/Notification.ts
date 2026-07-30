import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User.js';
import { Property } from './Property.js';

export type NotificationType = 'property_view' | 'property_fit_match';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'recipient_id' })
  recipientId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User;

  @Column({ type: 'uuid', nullable: true, name: 'property_id' })
  propertyId!: string | null;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property!: Property | null;

  @Column({ type: 'varchar', length: 50 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'actor_name' })
  actorName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'actor_email' })
  actorEmail!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'actor_phone' })
  actorPhone!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;
}
