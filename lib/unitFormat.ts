const FEET_PER_METER = 3.28084;
const SQUARE_FEET_PER_SQUARE_METER = 10.7639;

function round(value: number, decimals = 0) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number, decimals = 0) {
  return round(value, decimals).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function metersToFeet(meters: number) {
  return meters * FEET_PER_METER;
}

export function feetToMeters(feet: number) {
  return feet / FEET_PER_METER;
}

export function squareMetersToSquareFeet(squareMeters: number) {
  return squareMeters * SQUARE_FEET_PER_SQUARE_METER;
}

export function squareFeetToSquareMeters(squareFeet: number) {
  return squareFeet / SQUARE_FEET_PER_SQUARE_METER;
}

export function formatAreaDual(squareMeters: number, compact = false) {
  const squareFeet = squareMetersToSquareFeet(squareMeters);
  const metric = `${formatNumber(squareMeters)} m2`;
  const imperial = `${formatNumber(squareFeet)} sq ft`;
  return compact ? `${metric} / ${imperial}` : `${metric} (${imperial})`;
}

export function formatLengthDual(meters: number, compact = false) {
  const feet = metersToFeet(meters);
  const metric = `${formatNumber(meters, meters % 1 ? 1 : 0)} m`;
  const imperial = `${formatNumber(feet, feet >= 10 ? 0 : 1)} ft`;
  return compact ? `${metric} / ${imperial}` : `${metric} (${imperial})`;
}

export function formatPlotDual(widthMeters: number, lengthMeters: number, compact = false) {
  const metric = `${formatNumber(widthMeters, widthMeters % 1 ? 1 : 0)} x ${formatNumber(lengthMeters, lengthMeters % 1 ? 1 : 0)} m`;
  const imperial = `${formatNumber(metersToFeet(widthMeters))} x ${formatNumber(metersToFeet(lengthMeters))} ft`;
  return compact ? `${metric} / ${imperial}` : `${metric} (${imperial})`;
}
