/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly FIREBASE_API_KEY: string;
    readonly FIREBASE_AUTH_DOMAIN: string;
    readonly FIREBASE_PROJECT_ID: string;
    readonly FIREBASE_MESSAGING_SENDER_ID: string;
    readonly FIREBASE_APP_ID: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
