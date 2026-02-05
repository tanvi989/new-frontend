/**
 * Parse glasses dimensions string from products table.
 * Format: "lens_width-nose_bridge-frame_width-temple_length" or
 *         "lens_width-lens_height-nose_bridge-frame_width-temple_length" (5 parts)
 * Example: "51-18-142-41" -> lens 51mm, bridge 18mm, frame width 142mm, temple 41mm
 */
export interface ParsedDimensions {
  lensWidth: number;
  /** Lens height in mm; optional 5th part or derived as ~0.6*lensWidth if missing */
  lensHeight: number;
  noseBridge: number;
  templeLength: number;
  /** Total frame width in mm; derived as 2*lensWidth + noseBridge if only 3 parts */
  width: number;
}

const DEFAULT_DIMENSIONS: ParsedDimensions = {
  lensWidth: 50,
  lensHeight: 30,
  noseBridge: 18,
  templeLength: 135,
  width: 130,
};

export function parseDimensionsString(dimensions: string | undefined | null): ParsedDimensions {
  if (!dimensions || typeof dimensions !== 'string') return { ...DEFAULT_DIMENSIONS };
  const parts = dimensions.trim().split(/[-–—]/).map((p) => parseInt(p.trim(), 10)).filter((n) => !Number.isNaN(n));
  if (parts.length < 3) return { ...DEFAULT_DIMENSIONS };
  const lensWidth = parts[0];
  // 5 parts: lens_width-lens_height-nose_bridge-frame_width-temple_length
  // 4 parts: lens_width-nose_bridge-frame_width-temple_length
  const hasLensHeight = parts.length >= 5;
  const lensHeight = hasLensHeight ? parts[1] : Math.round(lensWidth * 0.6);
  const noseBridge = hasLensHeight ? parts[2] : parts[1];
  const width = hasLensHeight ? (parts[3] ?? 2 * lensWidth + noseBridge) : (parts.length >= 4 ? parts[2] : 2 * lensWidth + noseBridge);
  const templeLength = hasLensHeight ? (parts[4] ?? 135) : (parts.length >= 4 ? parts[3] : parts[2]);
  return { lensWidth, lensHeight, noseBridge, templeLength, width };
}
