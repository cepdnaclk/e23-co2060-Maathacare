import React, { useMemo, useRef, useState } from "react";
import sriLankaRaw from "../assets/maps/sri_lanka.json";

/* ------------------------------------------------------------------ */
/*  Minimal local GeoJSON typing (avoids needing @types/geojson)       */
/* ------------------------------------------------------------------ */
type LonLat = [number, number];

interface GeoFeature {
  type: "Feature";
  properties: { id: string; name: string; source?: string };
  geometry:
    | { type: "Polygon"; coordinates: LonLat[][] }
    | { type: "MultiPolygon"; coordinates: LonLat[][][] };
}

interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

const sriLanka = sriLankaRaw as unknown as GeoFeatureCollection;

/* ------------------------------------------------------------------ */
/*  Map from the geojson district id -> the plain-English district    */
/*  name used elsewhere in the dashboard (PROVINCE_MAP.districtName)  */
/* ------------------------------------------------------------------ */
const DISTRICT_ID_TO_NAME: Record<string, string> = {
  LK11: "Colombo",
  LK12: "Gampaha",
  LK13: "Kalutara",
  LK21: "Kandy",
  LK22: "Matale",
  LK23: "Nuwara Eliya",
  LK31: "Galle",
  LK32: "Matara",
  LK33: "Hambantota",
  LK41: "Jaffna",
  LK42: "Kilinochchi",
  LK43: "Mannar",
  LK44: "Vavuniya",
  LK45: "Mullaitivu",
  LK51: "Batticaloa",
  LK52: "Ampara",
  LK53: "Trincomalee",
  LK61: "Kurunegala",
  LK62: "Puttalam",
  LK71: "Anuradhapura",
  LK72: "Polonnaruwa",
  LK81: "Badulla",
  LK82: "Monaragala",
  LK91: "Ratnapura",
  LK92: "Kegalle",
};

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */
export interface DistrictSummary {
  phmCount: number;
  motherCount: number;
  totalMoh: number;
  understaffedMoh: number;
}

interface SriLankaMapProps {
  /** Keyed by plain district name, e.g. "Colombo", "Kandy" ... */
  districtStats: Record<string, DistrictSummary>;
  /** Optional callback fired when a district dot is clicked */
  onSelectDistrict?: (districtName: string) => void;
  /** Optional currently-selected district (adds a highlight ring) */
  selectedDistrict?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Geometry helpers (pure functions, no external deps)                */
/* ------------------------------------------------------------------ */

// Signed area + area-weighted centroid of a single ring (shoelace formula)
function ringCentroidArea(ring: LonLat[]) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  if (area === 0) return { area: 0, cx: ring[0][0], cy: ring[0][1] };
  return { area, cx: cx / (6 * area), cy: cy / (6 * area) };
}

// Centroid of a Polygon (uses only the exterior ring — good enough for dot placement)
function polygonCentroid(rings: LonLat[][]) {
  const { area, cx, cy } = ringCentroidArea(rings[0]);
  return { area: Math.abs(area), cx, cy };
}

// Centroid of a Polygon or MultiPolygon, weighted by sub-polygon area
function geometryCentroid(geometry: GeoFeature["geometry"]): { lon: number; lat: number } {
  if (geometry.type === "Polygon") {
    const { cx, cy } = polygonCentroid(geometry.coordinates);
    return { lon: cx, lat: cy };
  }
  let totalArea = 0;
  let sumCx = 0;
  let sumCy = 0;
  let fallback = { area: -1, cx: 0, cy: 0 };
  geometry.coordinates.forEach((poly) => {
    const { area, cx, cy } = polygonCentroid(poly);
    totalArea += area;
    sumCx += cx * area;
    sumCy += cy * area;
    if (area > fallback.area) fallback = { area, cx, cy };
  });
  if (totalArea > 0) return { lon: sumCx / totalArea, lat: sumCy / totalArea };
  return { lon: fallback.cx, lat: fallback.cy };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const WIDTH = 480; // svg viewBox width, height is derived to match Sri Lanka's aspect ratio

const SriLankaMap: React.FC<SriLankaMapProps> = ({
  districtStats,
  onSelectDistrict,
  selectedDistrict,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const { paths, dots, height } = useMemo(() => {
    // 1. Work out the bounding box of the whole country in lon/lat space
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const collectRing = (ring: LonLat[]) => {
      ring.forEach(([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    };

    sriLanka.features.forEach((f) => {
      if (f.geometry.type === "Polygon") {
        f.geometry.coordinates.forEach(collectRing);
      } else {
        f.geometry.coordinates.forEach((poly) => poly.forEach(collectRing));
      }
    });

    const meanLat = (minLat + maxLat) / 2;
    const lonScale = Math.cos((meanLat * Math.PI) / 180); // correct for longitude compression
    const geoWidth = (maxLon - minLon) * lonScale;
    const geoHeight = maxLat - minLat;
    const H = WIDTH * (geoHeight / geoWidth);

    const project = (lon: number, lat: number): [number, number] => {
      const x = ((lon - minLon) * lonScale * WIDTH) / geoWidth;
      const y = H - ((lat - minLat) * H) / geoHeight;
      return [x, y];
    };

    const ringToPath = (ring: LonLat[]) =>
      "M" + ring.map(([lon, lat]) => project(lon, lat).join(",")).join("L") + "Z";

    const geometryToPath = (geometry: GeoFeature["geometry"]) => {
      if (geometry.type === "Polygon") {
        return geometry.coordinates.map(ringToPath).join(" ");
      }
      return geometry.coordinates.map((poly) => poly.map(ringToPath).join(" ")).join(" ");
    };

    const pathsList = sriLanka.features.map((f) => ({
      id: f.properties.id,
      name: DISTRICT_ID_TO_NAME[f.properties.id] ?? f.properties.name,
      d: geometryToPath(f.geometry),
    }));

    const maxMothers = Math.max(
      1,
      ...Object.values(districtStats).map((s) => s.motherCount)
    );

    const dotsList = sriLanka.features.map((f) => {
      const districtName = DISTRICT_ID_TO_NAME[f.properties.id] ?? f.properties.name;
      const { lon, lat } = geometryCentroid(f.geometry);
      const [x, y] = project(lon, lat);
      const stats = districtStats[districtName];

      let color = "#94a3b8"; // gray = no data
      if (stats && stats.totalMoh > 0) {
        color = stats.understaffedMoh > 0 ? "#ef4444" : "#10b981";
      }

      const radius = stats
        ? 5 + 7 * Math.sqrt(stats.motherCount / maxMothers)
        : 4;

      return { id: f.properties.id, name: districtName, x, y, color, radius, stats };
    });

    return { paths: pathsList, dots: dotsList, height: H };
  }, [districtStats]);

  const hoveredDot = hovered ? dots.find((d) => d.id === hovered.id) : null;

  const handleEnter = (id: string, evt: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({ id, x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  };

  const handleMove = (id: string, evt: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({ id, x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <g>
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="#f1f5f9"
              stroke={selectedDistrict === p.name ? "#3b82f6" : "#cbd5e1"}
              strokeWidth={selectedDistrict === p.name ? 1.6 : 0.75}
            />
          ))}
        </g>
        <g>
          {dots.map((d) => (
            <g
              key={d.id}
              onMouseEnter={(e) => handleEnter(d.id, e)}
              onMouseMove={(e) => handleMove(d.id, e)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectDistrict?.(d.name)}
              style={{ cursor: onSelectDistrict ? "pointer" : "default" }}
            >
              {selectedDistrict === d.name && (
                <circle cx={d.x} cy={d.y} r={d.radius + 4} fill="none" stroke="#3b82f6" strokeWidth={2} />
              )}
              <circle
                cx={d.x}
                cy={d.y}
                r={d.radius}
                fill={d.color}
                stroke="#fff"
                strokeWidth={1.5}
                opacity={0.9}
              />
            </g>
          ))}
        </g>
      </svg>

      {hoveredDot && (
        <div
          style={{
            position: "absolute",
            left: Math.min(hovered!.x + 12, (containerRef.current?.clientWidth ?? 300) - 190),
            top: hovered!.y + 12,
            backgroundColor: "#0f172a",
            color: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: "160px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{hoveredDot.name}</div>
          {hoveredDot.stats ? (
            <>
              <div>PHMs: {hoveredDot.stats.phmCount}</div>
              <div>Mothers: {hoveredDot.stats.motherCount}</div>
              <div>
                MOH Areas: {hoveredDot.stats.totalMoh - hoveredDot.stats.understaffedMoh}/
                {hoveredDot.stats.totalMoh} adequate
              </div>
            </>
          ) : (
            <div style={{ color: "#94a3b8" }}>No tracking data yet</div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "#475569",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
          Adequate
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
          Under-staffed
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#94a3b8", display: "inline-block" }} />
          No data
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid #475569", display: "inline-block" }} />
          Dot size = mother count
        </span>
      </div>
    </div>
  );
};

export default SriLankaMap;