/**
 * The widths and qualities next/image may request. Shared by next.config.ts, the image loader and the
 * /uploads route (which refuses anything else, so the number of resized variants per image stays small).
 */
export const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
export const IMAGE_SIZES = [32, 48, 64, 96, 128, 256, 384];
export const IMAGE_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];
export const IMAGE_QUALITIES = [75];
