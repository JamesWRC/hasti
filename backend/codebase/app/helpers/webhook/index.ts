import crypto from 'crypto';
const GITHUB_APP_WEBHOOK_SECRET = process.env.NODE_ENV === 'production' ?
 process.env.GITHUB_APP_WEBHOOK_SECRET as string : 'devsecret';

export default function verifySignature(signature: string, body: any): boolean {
    
    const hmac = crypto.createHmac('sha1', GITHUB_APP_WEBHOOK_SECRET);
    const calculatedSignature = `sha1=${hmac.update(JSON.stringify(body)).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));

}