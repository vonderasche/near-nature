/** Roll in degrees from device accelerometer (portrait hold: 0° = level). */
export function rollDegreesFromAccelerometer(x: number, y: number): number {
  return (Math.atan2(x, -y) * 180) / Math.PI;
}

export function isHorizonLevel(rollDeg: number, toleranceDeg = 2): boolean {
  return Math.abs(rollDeg) <= toleranceDeg;
}
