export declare const sendOtpEmail: (to: string, username: string, otp: string) => Promise<void>;
type PropertyFitEmailItem = {
    title: string;
    price?: number | string;
    location?: string;
    url?: string;
    imageUrl?: string;
};
export declare const sendPropertyFitListEmail: (to: string, name: string, properties: PropertyFitEmailItem[]) => Promise<void>;
export declare const sendPasswordResetEmail: (params: {
    to: string;
    username: string;
    token: string;
}) => Promise<void>;
export declare const sendPropertyFitLeadPasswordEmail: (params: {
    to: string;
    name: string;
    password: string;
}) => Promise<void>;
export declare const sendPropertyFitWelcomeBackEmail: (params: {
    to: string;
    name: string;
}) => Promise<void>;
export declare const sendPropertyViewNotificationEmail: (params: {
    to: string;
    agentName?: string | null;
    leadName?: string;
    leadEmail?: string;
    leadPhone?: string;
    propertyTitle: string;
    propertyUrl?: string;
}) => Promise<void>;
export declare const sendContactMessageEmail: (params: {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    source?: string;
}) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map