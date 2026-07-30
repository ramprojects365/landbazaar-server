var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
let User = class User {
    toJSON() {
        const renStatus = this.renStatus?.trim().toLowerCase().replace(/\s+/g, '_') === 'verified' ? 'verified' : 'not_verified';
        const renVerified = renStatus === 'verified';
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            phoneNumber: this.phoneNumber,
            userType: this.userType,
            renNumber: this.renNumber,
            renStatus,
            renVerified,
            renStatusLabel: renVerified ? 'Verified' : 'Not verified',
            renStatusIcon: renVerified ? 'badge-check' : 'badge-alert',
            profileImage: this.profileImage,
            fullName: this.fullName,
            bio: this.bio,
            companyName: this.companyName,
            icPassport: this.icPassport,
            designation: this.designation,
            experienceYears: this.experienceYears,
            emailVerified: this.emailVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    toProfileJSON() {
        const renStatus = this.renStatus?.trim().toLowerCase().replace(/\s+/g, '_') === 'verified' ? 'verified' : 'not_verified';
        const renVerified = renStatus === 'verified';
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            phoneNumber: this.phoneNumber,
            userType: this.userType,
            renNumber: this.renNumber,
            renStatus,
            renVerified,
            renStatusLabel: renVerified ? 'Verified' : 'Not verified',
            renStatusIcon: renVerified ? 'badge-check' : 'badge-alert',
            profileImage: this.profileImage,
            fullName: this.fullName,
            bio: this.bio,
            companyName: this.companyName,
            icPassport: this.icPassport,
            designation: this.designation,
            experienceYears: this.experienceYears,
            emailVerified: this.emailVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    Column({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: 'varchar', length: 20, nullable: true, name: 'phone_number' }),
    __metadata("design:type", Object)
], User.prototype, "phoneNumber", void 0);
__decorate([
    Column({ type: 'varchar', length: 30, nullable: true, name: 'user_type' }),
    __metadata("design:type", Object)
], User.prototype, "userType", void 0);
__decorate([
    Column({ type: 'varchar', length: 50, nullable: true, name: 'ren_number' }),
    __metadata("design:type", Object)
], User.prototype, "renNumber", void 0);
__decorate([
    Column({ type: 'varchar', length: 30, nullable: true, name: 'ren_status' }),
    __metadata("design:type", Object)
], User.prototype, "renStatus", void 0);
__decorate([
    Column({ type: 'varchar', length: 500, nullable: true, name: 'profile_image' }),
    __metadata("design:type", Object)
], User.prototype, "profileImage", void 0);
__decorate([
    Column({ type: 'varchar', length: 100, nullable: true, name: 'full_name' }),
    __metadata("design:type", Object)
], User.prototype, "fullName", void 0);
__decorate([
    Column({ type: 'text', nullable: true, name: 'bio' }),
    __metadata("design:type", Object)
], User.prototype, "bio", void 0);
__decorate([
    Column({ type: 'varchar', length: 100, nullable: true, name: 'company_name' }),
    __metadata("design:type", Object)
], User.prototype, "companyName", void 0);
__decorate([
    Column({ type: 'varchar', length: 50, nullable: true, name: 'ic_passport' }),
    __metadata("design:type", Object)
], User.prototype, "icPassport", void 0);
__decorate([
    Column({ type: 'varchar', length: 100, nullable: true, name: 'designation' }),
    __metadata("design:type", Object)
], User.prototype, "designation", void 0);
__decorate([
    Column({ type: 'int', nullable: true, name: 'experience_years' }),
    __metadata("design:type", Object)
], User.prototype, "experienceYears", void 0);
__decorate([
    Column({ type: 'varchar', length: 255, name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({ type: 'boolean', default: false, name: 'email_verified' }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    Column({ type: 'varchar', length: 50, nullable: true, name: 'otp' }),
    __metadata("design:type", Object)
], User.prototype, "otp", void 0);
__decorate([
    Column({ type: 'varchar', length: 255, nullable: true, name: 'verification_token' }),
    __metadata("design:type", Object)
], User.prototype, "verificationToken", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true, name: 'verification_expiry' }),
    __metadata("design:type", Object)
], User.prototype, "verificationExpiry", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true, name: 'last_login' }),
    __metadata("design:type", Object)
], User.prototype, "lastLogin", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    Entity('users')
], User);
export { User };
//# sourceMappingURL=User.js.map