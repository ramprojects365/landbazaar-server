var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';
import { Property } from './Property.js';
let Notification = class Notification {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    Column({ type: 'uuid', name: 'recipient_id' }),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'recipient_id' }),
    __metadata("design:type", User)
], Notification.prototype, "recipient", void 0);
__decorate([
    Column({ type: 'uuid', nullable: true, name: 'property_id' }),
    __metadata("design:type", Object)
], Notification.prototype, "propertyId", void 0);
__decorate([
    ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' }),
    JoinColumn({ name: 'property_id' }),
    __metadata("design:type", Object)
], Notification.prototype, "property", void 0);
__decorate([
    Column({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    Column({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    Column({ type: 'boolean', default: false, name: 'is_read' }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    Column({ type: 'varchar', length: 100, nullable: true, name: 'actor_name' }),
    __metadata("design:type", Object)
], Notification.prototype, "actorName", void 0);
__decorate([
    Column({ type: 'varchar', length: 255, nullable: true, name: 'actor_email' }),
    __metadata("design:type", Object)
], Notification.prototype, "actorEmail", void 0);
__decorate([
    Column({ type: 'varchar', length: 30, nullable: true, name: 'actor_phone' }),
    __metadata("design:type", Object)
], Notification.prototype, "actorPhone", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
Notification = __decorate([
    Entity('notifications')
], Notification);
export { Notification };
//# sourceMappingURL=Notification.js.map