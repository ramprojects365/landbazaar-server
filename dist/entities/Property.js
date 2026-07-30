var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';
let Property = class Property {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Property.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Property.prototype, "title", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        name: 'listing_type'
    }),
    __metadata("design:type", String)
], Property.prototype, "listingType", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 50,
        name: 'property_type'
    }),
    __metadata("design:type", String)
], Property.prototype, "propertyType", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "tenure", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'property_name'
    }),
    __metadata("design:type", String)
], Property.prototype, "propertyName", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'street_name'
    }),
    __metadata("design:type", String)
], Property.prototype, "streetName", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'city_name'
    }),
    __metadata("design:type", String)
], Property.prototype, "cityName", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "state", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "county", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "pincode", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 255,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "landmark", void 0);
__decorate([
    Column({
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "location", void 0);
__decorate([
    Column({
        type: 'double precision',
        nullable: true
    }),
    __metadata("design:type", Number)
], Property.prototype, "latitude", void 0);
__decorate([
    Column({
        type: 'double precision',
        nullable: true
    }),
    __metadata("design:type", Number)
], Property.prototype, "longitude", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 15,
        scale: 2
    }),
    __metadata("design:type", Number)
], Property.prototype, "price", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'buildup_area'
    }),
    __metadata("design:type", Number)
], Property.prototype, "buildupArea", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'land_size'
    }),
    __metadata("design:type", Number)
], Property.prototype, "landSize", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "furnishing", void 0);
__decorate([
    Column({
        type: 'integer',
        nullable: true
    }),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    Column({
        type: 'integer',
        nullable: true
    }),
    __metadata("design:type", Number)
], Property.prototype, "bathrooms", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], Property.prototype, "availability", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        name: 'floor_level'
    }),
    __metadata("design:type", String)
], Property.prototype, "floorLevel", void 0);
__decorate([
    Column({
        type: 'integer',
        nullable: true,
        name: 'year_of_build'
    }),
    __metadata("design:type", Number)
], Property.prototype, "yearOfBuild", void 0);
__decorate([
    Column({
        type: 'integer',
        nullable: true,
        name: 'year_of_completion'
    }),
    __metadata("design:type", Number)
], Property.prototype, "yearOfCompletion", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'car_park_allocation'
    }),
    __metadata("design:type", String)
], Property.prototype, "carParkAllocation", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'facing_direction'
    }),
    __metadata("design:type", String)
], Property.prototype, "facingDirection", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'renovation_status'
    }),
    __metadata("design:type", String)
], Property.prototype, "renovationStatus", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 15,
        scale: 2,
        nullable: true,
        name: 'deposit_amount'
    }),
    __metadata("design:type", Number)
], Property.prototype, "depositAmount", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'minimum_rental_period'
    }),
    __metadata("design:type", String)
], Property.prototype, "minimumRentalPeriod", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'pet_policy'
    }),
    __metadata("design:type", String)
], Property.prototype, "petPolicy", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'preferred_tenant_type'
    }),
    __metadata("design:type", String)
], Property.prototype, "preferredTenantType", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 15,
        scale: 2,
        nullable: true,
        name: 'maintenance_fee'
    }),
    __metadata("design:type", Number)
], Property.prototype, "maintenanceFee", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 15,
        scale: 2,
        nullable: true,
        name: 'sinking_fund'
    }),
    __metadata("design:type", Number)
], Property.prototype, "sinkingFund", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        name: 'bumi_lot_status'
    }),
    __metadata("design:type", String)
], Property.prototype, "bumiLotStatus", void 0);
__decorate([
    Column({
        type: 'boolean',
        default: false
    }),
    __metadata("design:type", Boolean)
], Property.prototype, "negotiable", void 0);
__decorate([
    Column({
        type: 'jsonb',
        default: { lifestyle: [], facilities: [], security: [] }
    }),
    __metadata("design:type", Object)
], Property.prototype, "amenities", void 0);
__decorate([
    Column({
        type: 'jsonb',
        nullable: true
    }),
    __metadata("design:type", Array)
], Property.prototype, "images", void 0);
__decorate([
    Column({
        type: 'text',
        nullable: true,
        name: 'floor_plan'
    }),
    __metadata("design:type", String)
], Property.prototype, "floorPlan", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 50,
        default: 'active'
    }),
    __metadata("design:type", String)
], Property.prototype, "status", void 0);
__decorate([
    Column({
        type: 'uuid',
        name: 'user_id'
    }),
    __metadata("design:type", String)
], Property.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User)
], Property.prototype, "user", void 0);
__decorate([
    CreateDateColumn({
        type: 'timestamp with time zone',
        name: 'created_at'
    }),
    __metadata("design:type", Date)
], Property.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({
        type: 'timestamp with time zone',
        name: 'updated_at'
    }),
    __metadata("design:type", Date)
], Property.prototype, "updatedAt", void 0);
Property = __decorate([
    Entity('properties')
], Property);
export { Property };
//# sourceMappingURL=Property.js.map