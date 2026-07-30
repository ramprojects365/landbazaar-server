import { Property } from '../entities/Property.js';
type AdvisorAnswers = {
    intent?: 'rent' | 'buy' | '';
    location?: string;
    budgetRange?: string;
    budgetAmount?: string | number;
    bedrooms?: string;
};
type AdvisorContact = {
    name?: string;
    phone?: string;
    email?: string;
};
type PropertyFitRequest = {
    answers?: AdvisorAnswers;
    contact?: AdvisorContact;
};
type PropertyViewRequest = {
    propertyId?: string;
    contact?: AdvisorContact;
    propertyUrl?: string;
};
type EmailDeliveryStatus = {
    attempted: boolean;
    passwordEmailSent: boolean;
    resultsEmailSent: boolean;
    error?: string;
};
export declare const getPropertyFitMatches: (request: PropertyFitRequest) => Promise<{
    autoRegistered: boolean;
    autoLoggedIn: boolean;
    existingEmailIgnored: boolean;
    defaultPassword: string | undefined;
    fallbackUsed: boolean;
    exactMatchCount: number;
    auth: {
        token: string;
        user: {
            id: string;
            username: string;
            email: string;
            phoneNumber: string | null;
            userType: string | null;
            fullName: string;
            emailVerified: boolean;
        };
    } | null;
    leadUserId: string | undefined;
    emailDelivery: EmailDeliveryStatus;
    agentNotificationCount: number;
    count: number;
    data: Property[];
}>;
export declare const notifyPropertyViewed: (request: PropertyViewRequest, options?: {
    sendEmail?: boolean;
}) => Promise<{
    notified: boolean;
    notificationId: string | undefined;
    emailSent: boolean;
    message: string;
} | {
    notified: boolean;
    notificationId: string | undefined;
    emailSent: boolean;
    message?: undefined;
}>;
export declare const createOrLoginPropertyFitLead: (contact?: AdvisorContact) => Promise<{
    autoRegistered: boolean;
    autoLoggedIn: boolean;
    existingEmailIgnored: boolean;
    defaultPassword: string | undefined;
    auth: {
        token: string;
        user: {
            id: string;
            username: string;
            email: string;
            phoneNumber: string | null;
            userType: string | null;
            fullName: string;
            emailVerified: boolean;
        };
    } | null;
}>;
export {};
//# sourceMappingURL=propertyFitService.d.ts.map