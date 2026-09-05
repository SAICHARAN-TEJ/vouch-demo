import type { GeoPoint } from "@/types";

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two points in metres (haversine).
 * Used by the Context Engine to decide whether a known road hazard is
 * "nearby" the rider's manoeuvre.
 */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Offset a point by a north/east distance in metres. Handy for placing
 * a simulated hazard a fixed distance "ahead" of the rider.
 */
export function offsetMeters(
  origin: GeoPoint,
  northM: number,
  eastM: number,
): GeoPoint {
  const dLat = northM / EARTH_RADIUS_M;
  const dLon = eastM / (EARTH_RADIUS_M * Math.cos(toRad(origin.latitude)));
  return {
    latitude: origin.latitude + (dLat * 180) / Math.PI,
    longitude: origin.longitude + (dLon * 180) / Math.PI,
  };
}
