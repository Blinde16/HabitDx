/**
 * Minimal react-native stub for Node.js test scripts.
 * The logger imports Platform to decide between winston and console logging.
 * Setting OS='web' causes it to use the plain console logger, which works in Node.
 */
export const Platform = { OS: 'web' as const };
export default { Platform };
