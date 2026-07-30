import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'phone_number' })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'user_type' })
  userType: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ren_number' })
  renNumber: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'ren_status' })
  renStatus: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'profile_image' })
  profileImage: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'full_name' })
  fullName: string | null;

  @Column({ type: 'text', nullable: true, name: 'bio' })
  bio: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'company_name' })
  companyName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ic_passport' })
  icPassport: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'designation' })
  designation: string | null;

  @Column({ type: 'int', nullable: true, name: 'experience_years' })
  experienceYears: number | null;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

 @Column({ type: 'varchar', length: 50, nullable: true, name: 'otp' })
  otp: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'verification_token' })
  verificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'verification_expiry' })
  verificationExpiry: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login' })
  lastLogin: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

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
}
