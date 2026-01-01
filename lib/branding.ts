/**
 * Centralized branding configuration for TripleTCafe
 *
 * All brand-related text, names, and content should be imported from this file
 * to ensure consistency across the application.
 */

export const branding = {
    /** The main application name */
    appName: "TripleTCafe",

    /** Logo configuration */
    logo: {
        /** Path to the main logo */
        src: "/logo.png",
        /** Alt text for the logo */
        alt: "TripleTCafe",
    },

    /** Admin panel name shown in the admin header */
    adminName: "TripleTCafe Admin",

    /** Short tagline for the app */
    tagline: "Breakfast & lunch, brewed with care",

    /** Program-related branding */
    program: {
        /** Name of the loyalty program */
        name: "TripleTCafe Rewards",

        /** Tagline shown on registration page */
        joinHeading: "Join TripleTCafe Rewards",

        /** Subtitle on registration page */
        joinSubtitle: "Earn rewards with every breakfast and lunch",

        /** Message shown when user is already registered */
        alreadyRegisteredMessage:
            "This phone number is already registered with TripleTCafe Rewards.",
    },

    /** QR code related branding */
    qr: {
        /** Heading on QR display page */
        heading: "Your TripleTCafe QR Code",

        /** Subtitle on QR display page */
        subtitle: "Show this QR code at checkout to earn rewards",

        /** Alt text for QR code images */
        altText: "TripleTCafe QR Code",

        /** Default filename when downloading QR code */
        downloadFilename: "tripletcafe-qr.png",

        /** Instruction text below QR code */
        saveInstruction: "Save this QR code to your phone for easy access",
    },

    /** Metadata descriptions for SEO */
    meta: {
        /** Root layout description */
        description: "TripleTCafe loyalty rewards program",

        /** Registration page title */
        registerTitle: "Join TripleTCafe Rewards",

        /** Registration page description */
        registerDescription:
            "Join TripleTCafe's rewards program and earn with every visit",

        /** QR page title (no ID) */
        qrTitle: "QR Code - TripleTCafe Rewards",

        /** QR page description (no ID) */
        qrDescription: "Your TripleTCafe rewards QR code",

        /** QR page title (with ID) */
        qrWithIdTitle: "Your QR Code - TripleTCafe Rewards",

        /** QR page description (with ID) */
        qrWithIdDescription: "Scan this QR code at TripleTCafe to earn rewards",

        /** QR OpenGraph image alt text */
        qrOgAlt: "TripleTCafe Rewards QR Code",
    },

    /** SMS message templates */
    sms: {
        /**
         * Welcome SMS sent after registration
         * @param firstName - Customer's first name
         * @param qrUrl - URL to the QR code page
         */
        welcome: (firstName: string, qrUrl: string) =>
            `Welcome to TripleTCafe Rewards, ${firstName}! Your QR code is ready: ${qrUrl}`,

        /**
         * SMS sent when resending QR link
         * @param qrUrl - URL to the QR code page
         */
        qrLink: (qrUrl: string) =>
            `Your TripleTCafe QR code is ready! View it here: ${qrUrl}`,
    },

    /** Error page branding */
    errors: {
        /** Generic error title */
        genericTitle: "Something went wrong",

        /** Generic error message */
        genericMessage: "A critical error occurred. Please try again.",

        /** Try again button text */
        tryAgain: "Try again",
    },

    /** Copyright and legal */
    legal: {
        /** Copyright text - use current year dynamically */
        copyright: (year: number) => `© ${year} TripleTCafe. All rights reserved.`,
    },
} as const;

/** Type for the branding configuration */
export type Branding = typeof branding;
