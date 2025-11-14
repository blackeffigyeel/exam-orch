import { Request } from 'express';

/**
 * @desc Extract the client IP address from an Express request.
 * Resolve forwarded IPs safely and normalise IPv6-mapped IPv4 addresses.
 */
export const getClientIP = (req: Request): string => {
    // Determine environment
    const isProduction = process.env.NODE_ENV === 'production';

    // Resolve header values as strings
    const realIpHeader = Array.isArray(req.headers['x-real-ip'])
        ? req.headers['x-real-ip'][0]
        : req.headers['x-real-ip'];

    const forwardedForHeader = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for'];

    // Extract initial IP value based on environment
    let rawIp =
        (isProduction ? realIpHeader || forwardedForHeader : forwardedForHeader) ||
        req.socket.remoteAddress ||
        '';

    // Ensure rawIp is a string
    const ip = typeof rawIp === 'string' ? rawIp.trim() : '';

    // Convert IPv4-mapped IPv6 ::ffff: notation
    if (ip.startsWith('::ffff:')) {
        return ip.replace('::ffff:', '');
    }

    return ip;
};

export default getClientIP;
