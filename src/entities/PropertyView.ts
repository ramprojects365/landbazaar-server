import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Property } from './Property.js';
import { User } from './User.js';

@Entity('property_views')
@Index('idx_property_views_property_created_at', ['propertyId', 'createdAt'])
@Index('idx_property_views_property_viewer_day', ['propertyId', 'viewerId', 'viewDate'], {
  unique: true
})
@Index('idx_property_views_property_visitor_day', ['propertyId', 'visitorKey', 'viewDate'], {
  unique: true
})
export class PropertyView {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'property_id' })
  propertyId!: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({ type: 'uuid', nullable: true, name: 'viewer_id' })
  viewerId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'viewer_id' })
  viewer!: User | null;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'visitor_key' })
  visitorKey!: string | null;

  @Column({ type: 'date', name: 'view_date' })
  viewDate!: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;
}
