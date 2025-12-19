import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

// Define a global type for the WhatsApp client to prevent multiple instances during hot-reloads
const globalForWhatsApp = globalThis as unknown as {
    whatsappClient: Client | undefined;
    whatsappQr: string | undefined;
    whatsappStatus: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';
};

export class WhatsAppClientManager {
    private static instance: Client | undefined = globalForWhatsApp.whatsappClient;

    static getStatus() {
        return globalForWhatsApp.whatsappStatus || 'DISCONNECTED';
    }

    static getQr() {
        return globalForWhatsApp.whatsappQr;
    }

    static async initialize() {
        if (this.instance) {
            // If already connected or initializing, don't do anything
            if (globalForWhatsApp.whatsappStatus === 'CONNECTED' || 
                globalForWhatsApp.whatsappStatus === 'INITIALIZING' || 
                globalForWhatsApp.whatsappStatus === 'QR_READY') {
                console.log('[WhatsApp] Client already active');
                return;
            }
            
            // If instance exists but is disconnected/failed, cleanup and restart
            console.log('[WhatsApp] Cleanup zombie instance...');
            try { 
                await this.instance.destroy(); 
            } catch (e) {
                console.error('[WhatsApp] Cleanup error:', e);
            }
            this.instance = undefined;
            globalForWhatsApp.whatsappClient = undefined;
        }

        console.log('[WhatsApp] Initializing client...');
        globalForWhatsApp.whatsappStatus = 'INITIALIZING';

        // Initialize the client
        this.instance = new Client({
            authStrategy: new LocalAuth({
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            }
        });

        // Store in global to survive hot reloads
        globalForWhatsApp.whatsappClient = this.instance;

        this.instance.on('qr', async (qr) => {
            console.log('[WhatsApp] QR Code received');
            try {
                // Convert to data URL for frontend display
                const qrDataUrl = await QRCode.toDataURL(qr);
                globalForWhatsApp.whatsappQr = qrDataUrl;
                globalForWhatsApp.whatsappStatus = 'QR_READY';
            } catch (err) {
                console.error('[WhatsApp] Failed to generate QR code image', err);
            }
        });

        this.instance.on('ready', () => {
            console.log('[WhatsApp] Client is ready!');
            globalForWhatsApp.whatsappStatus = 'CONNECTED';
            globalForWhatsApp.whatsappQr = undefined; // Clear QR
        });

        this.instance.on('authenticated', () => {
            console.log('[WhatsApp] Authenticated');
        });

        this.instance.on('auth_failure', (msg) => {
            console.error('[WhatsApp] Auth failure', msg);
            globalForWhatsApp.whatsappStatus = 'DISCONNECTED';
        });

        this.instance.on('disconnected', (reason) => {
            console.log('[WhatsApp] Disconnected:', reason);
            globalForWhatsApp.whatsappStatus = 'DISCONNECTED';
            this.instance = undefined;
            globalForWhatsApp.whatsappClient = undefined;
        });

        try {
            await this.instance.initialize();
        } catch (error) {
            console.error('[WhatsApp] Initialization error:', error);
            globalForWhatsApp.whatsappStatus = 'DISCONNECTED';
            throw error;
        }
    }

    static async logout() {
        if (this.instance) {
            await this.instance.logout();
            this.instance = undefined;
            globalForWhatsApp.whatsappClient = undefined;
            globalForWhatsApp.whatsappStatus = 'DISCONNECTED';
            globalForWhatsApp.whatsappQr = undefined;
        }
    }

    static async sendMessage(to: string, message: string): Promise<boolean> {
        if (!this.instance || globalForWhatsApp.whatsappStatus !== 'CONNECTED') {
            console.error('[WhatsApp] Cannot send message: Client not connected');
            return false;
        }

        try {
            // Format number: remove non-digits, ensure suffix @c.us
            let chatId = to.replace(/\D/g, '');
            if (!chatId.endsWith('@c.us')) {
                chatId += '@c.us';
            }

            await this.instance.sendMessage(chatId, message);
            return true;
        } catch (error) {
            console.error('[WhatsApp] Send Message Error:', error);
            return false;
        }
    }
}
