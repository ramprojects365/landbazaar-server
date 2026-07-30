export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (UserStatus = {}));
export class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.phoneNumber = data.phone_number;
        this.passwordHash = data.password_hash;
        this.emailVerified = data.email_verified;
        this.verificationToken = data.verification_token;
        this.verificationExpiry = data.verification_expiry;
        this.lastLogin = data.last_login;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            phoneNumber: this.phoneNumber,
            emailVerified: this.emailVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    toProfileJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            phoneNumber: this.phoneNumber,
            emailVerified: this.emailVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
//# sourceMappingURL=user.js.map