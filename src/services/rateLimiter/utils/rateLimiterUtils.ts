/**
 * @desc Converts an IP address to IP range
 * @param ip 
 * @returns 
 */
export const fetchIPRange = (ip: string): string => {
  const octets = ip.split('.');
  return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`; // Use /24 range for IPv4
};