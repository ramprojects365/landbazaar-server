import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User.js';

export interface PropertyImage {
  url: string;
  fileName?: string;
  order?: number;
  category?: string;
  customPlaceName?: string;
  displayPlace?: string;
  caption?: string;
  isCover?: boolean;
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'listing_type'
  })
  listingType!: 'rent' | 'sale';

  @Column({
    type: 'varchar',
    length: 50,
    name: 'property_type'
  })
  propertyType!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  tenure?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'property_name'
  })
  propertyName?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'street_name'
  })
  streetName?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'city_name'
  })
  cityName?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  state?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  county?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  pincode?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  landmark?: string;

  @Column({
    type: 'text',
    nullable: true
  })
  location?: string;

  @Column({
    type: 'double precision',
    nullable: true
  })
  latitude?: number;

  @Column({
    type: 'double precision',
    nullable: true
  })
  longitude?: number;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2
  })
  price!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'buildup_area'
  })
  buildupArea?: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'land_size'
  })
  landSize?: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  furnishing?: 'Fully' | 'Partially' | 'Unfurnished';

  @Column({
    type: 'integer',
    nullable: true
  })
  bedrooms?: number;

  @Column({
    type: 'integer',
    nullable: true
  })
  bathrooms?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  availability?: 'Immediate' | 'Next month' | 'Under Construction';

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'floor_level'
  })
  floorLevel?: string;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'year_of_build'
  })
  yearOfBuild?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'year_of_completion'
  })
  yearOfCompletion?: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'car_park_allocation'
  })
  carParkAllocation?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'facing_direction'
  })
  facingDirection?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'renovation_status'
  })
  renovationStatus?: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'deposit_amount'
  })
  depositAmount?: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'minimum_rental_period'
  })
  minimumRentalPeriod?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'pet_policy'
  })
  petPolicy?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'preferred_tenant_type'
  })
  preferredTenantType?: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'maintenance_fee'
  })
  maintenanceFee?: number;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'sinking_fund'
  })
  sinkingFund?: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'bumi_lot_status'
  })
  bumiLotStatus?: string;

  @Column({
    type: 'boolean',
    default: false
  })
  negotiable!: boolean;

  @Column({
    type: 'jsonb',
    default: { lifestyle: [], facilities: [], security: [] }
  })
  amenities!: {
    lifestyle: string[];
    facilities: string[];
    security: string[];
  };

  @Column({
    type: 'jsonb',
    nullable: true
  })
  images?: Array<string | PropertyImage>;

  @Column({
    type: 'text',
    nullable: true,
    name: 'floor_plan'
  })
  floorPlan?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active'
  })
  status!: string;

  @Column({
    type: 'uuid',
    name: 'user_id'
  })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at'
  })
  updatedAt!: Date;
}
