import React, { useMemo, useRef, useState } from 'react';
import sriLankaRaw from '../assets/maps/sri_lanka.json';

type LonLat = [number, number];

interface GeoFeature {
  type: 'Feature';
  properties: { id: string; name: string; source?: string };
  geometry:
    | { type: 'Polygon'; coordinates: LonLat[][] }
    | { type: 'MultiPolygon'; coordinates: LonLat[][][] };
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

const sriLanka = sriLankaRaw as unknown as GeoFeatureCollection;

const DISTRICT_ID_TO_NAME: Record<string, string> = {
  LK11: 'Colombo',
  LK12: 'Gampaha',
  LK13: 'Kalutara',
  LK21: 'Kandy',
  LK22: 'Matale',
  LK23: 'Nuwara Eliya',
  LK31: 'Galle',
  LK32: 'Matara',
  LK33: 'Hambantota',
  LK41: 'Jaffna',
  LK42: 'Kilinochchi',
  LK43: 'Mannar',
  LK44: 'Vavuniya',
  LK45: 'Mullaitivu',
  LK51: 'Batticaloa',
  LK52: 'Ampara',
  LK53: 'Trincomalee',
  LK61: 'Kurunegala',
  LK62: 'Puttalam',
  LK71: 'Anuradhapura',
  LK72: 'Polonnaruwa',
  LK81: 'Badulla',
  LK82: 'Monaragala',
  LK91: 'Ratnapura',
  LK92: 'Kegalle',
};

export type MapMetric = 'coverage' | 'mothers' | 'phms' | 'caseload';

export interface DistrictSummary {
  phmCount: number;
  motherCount: number;
  totalMoh: number;
  understaffedMoh: number;
}

interface SriLankaMapProps {
  districtStats: Record<string, DistrictSummary>;
  metric?: MapMetric;
  onSelectDistrict?: (districtName: string) => void;
  selectedDistrict?: string | null;
}

function ringCentroidArea(ring: LonLat[]) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
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

function polygonCentroid(rings: LonLat[][]) {
  const { area, cx, cy } = ringCentroidArea(rings[0]);
  return { area: Math.abs(area), cx, cy };
}

function geometryCentroid(geometry: GeoFeature['geometry']): { lon: number; lat: number } {
  if (geometry.type === 'Polygon') {
    const { cx, cy } = polygonCentroid(geometry.coordinates);
    return { lon: cx, lat: cy };
  }

  let totalArea = 0;
  let sumCx = 0;
  let sumCy = 0;
  let fallback = { area: -1, cx: 0, cy: 0 };
  geometry.coordinates.forEach((polygon) => {
    const { area, cx, cy } = polygonCentroid(polygon);
    totalArea += area;
    sumCx += cx * area;
    sumCy += cy * area;
    if (area > fallback.area) fallback = { area, cx, cy };
  });

  if (totalArea > 0) return { lon: sumCx / totalArea, lat: sumCy / totalArea };
  return { lon: fallback.cx, lat: fallback.cy };
}

const WIDTH = 480;

function coveragePercent(stats?: DistrictSummary): number {
  if (!stats?.totalMoh) return 0;
  return Math.round(((stats.totalMoh - stats.understaffedMoh) / stats.totalMoh) * 100);
}

function averageCaseload(stats?: DistrictSummary): number {
  if (!stats) return 0;
  return stats.phmCount ? Math.round(stats.motherCount / stats.phmCount) : stats.motherCount;
}

function metricValue(stats: DistrictSummary | undefined, metric: MapMetric): number {
  if (!stats) return 0;
  if (metric === 'mothers') return stats.motherCount;
  if (metric === 'phms') return stats.phmCount;
  if (metric === 'caseload') return averageCaseload(stats);
  return coveragePercent(stats);
}

function hasData(stats?: DistrictSummary): boolean {
  return Boolean(stats && (stats.phmCount || stats.motherCount || stats.totalMoh));
}

function fillForMetric(
  stats: DistrictSummary | undefined,
  metric: MapMetric,
  maximum: number,
): string {
  if (!hasData(stats)) return '#dce6f0';

  if (metric === 'coverage') {
    const coverage = coveragePercent(stats);
    if (coverage >= 90) return '#42b98a';
    if (coverage >= 70) return '#70c8b0';
    if (coverage >= 50) return '#f1bf68';
    if (coverage > 0) return '#e58b62';
    return '#d86872';
  }

  if (metric === 'caseload') {
    const caseload = averageCaseload(stats);
    if (stats?.phmCount === 0 && stats.motherCount > 0) return '#d86872';
    if (caseload > 150) return '#d86872';
    if (caseload > 100) return '#e9a65b';
    if (caseload > 50) return '#63b6df';
    return '#78c7b2';
  }

  const ratio = maximum ? metricValue(stats, metric) / maximum : 0;
  if (metric === 'mothers') {
    if (ratio >= 0.75) return '#1f6fba';
    if (ratio >= 0.5) return '#478fc9';
    if (ratio >= 0.25) return '#75add8';
    return '#abcde7';
  }

  if (ratio >= 0.75) return '#216a9e';
  if (ratio >= 0.5) return '#4389b6';
  if (ratio >= 0.25) return '#75aecb';
  return '#acd1df';
}

function legendItems(metric: MapMetric): Array<{ color: string; label: string }> {
  if (metric === 'coverage') {
    return [
      { color: '#42b98a', label: '90–100% coverage' },
      { color: '#70c8b0', label: '70–89%' },
      { color: '#f1bf68', label: '50–69%' },
      { color: '#d86872', label: 'Below 50%' },
    ];
  }
  if (metric === 'caseload') {
    return [
      { color: '#78c7b2', label: '0–50 per PHM' },
      { color: '#63b6df', label: '51–100' },
      { color: '#e9a65b', label: '101–150' },
      { color: '#d86872', label: 'Over 150 / uncovered' },
    ];
  }
  return [
    { color: '#abcde7', label: 'Lower volume' },
    { color: '#75add8', label: 'Moderate' },
    { color: '#478fc9', label: 'High' },
    { color: '#1f6fba', label: 'Highest' },
  ];
}

const SriLankaMap: React.FC<SriLankaMapProps> = ({
  districtStats,
  metric = 'coverage',
  onSelectDistrict,
  selectedDistrict,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null);

  const { districts, dots, height, maximum } = useMemo(() => {
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const collectRing = (ring: LonLat[]) => {
      ring.forEach(([lon, lat]) => {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    };

    sriLanka.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(collectRing);
      } else {
        feature.geometry.coordinates.forEach((polygon) => polygon.forEach(collectRing));
      }
    });

    const meanLat = (minLat + maxLat) / 2;
    const lonScale = Math.cos((meanLat * Math.PI) / 180);
    const geoWidth = (maxLon - minLon) * lonScale;
    const geoHeight = maxLat - minLat;
    const mapHeight = WIDTH * (geoHeight / geoWidth);

    const project = (lon: number, lat: number): [number, number] => [
      ((lon - minLon) * lonScale * WIDTH) / geoWidth,
      mapHeight - ((lat - minLat) * mapHeight) / geoHeight,
    ];

    const ringToPath = (ring: LonLat[]) =>
      `M${ring.map(([lon, lat]) => project(lon, lat).join(',')).join('L')}Z`;

    const geometryToPath = (geometry: GeoFeature['geometry']) => {
      if (geometry.type === 'Polygon') return geometry.coordinates.map(ringToPath).join(' ');
      return geometry.coordinates.map((polygon) => polygon.map(ringToPath).join(' ')).join(' ');
    };

    const districtShapes = sriLanka.features.map((feature) => {
      const name = DISTRICT_ID_TO_NAME[feature.properties.id] ?? feature.properties.name;
      return {
        id: feature.properties.id,
        name,
        stats: districtStats[name],
        d: geometryToPath(feature.geometry),
      };
    });

    const maxValue = Math.max(1, ...districtShapes.map((district) => metricValue(district.stats, metric)));
    const maxMothers = Math.max(1, ...districtShapes.map((district) => district.stats?.motherCount || 0));

    const districtDots = sriLanka.features.map((feature) => {
      const name = DISTRICT_ID_TO_NAME[feature.properties.id] ?? feature.properties.name;
      const stats = districtStats[name];
      const { lon, lat } = geometryCentroid(feature.geometry);
      const [x, y] = project(lon, lat);
      return {
        id: feature.properties.id,
        name,
        stats,
        x,
        y,
        radius: stats ? 3.5 + 4.5 * Math.sqrt(stats.motherCount / maxMothers) : 3,
      };
    });

    return { districts: districtShapes, dots: districtDots, height: mapHeight, maximum: maxValue };
  }, [districtStats, metric]);

  const hoveredDistrict = hovered ? districts.find((district) => district.id === hovered.id) : null;

  const updateHover = (id: string, event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHovered({ id, x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const selectDistrict = (districtName: string) => onSelectDistrict?.(districtName);

  return (
    <div ref={containerRef} className="sl-map">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="sl-map-svg"
        role="img"
        aria-label={`Sri Lanka district map showing ${metric}`}
      >
        <defs>
          <filter id="districtShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#173b5c" floodOpacity="0.16" />
          </filter>
        </defs>

        <g filter="url(#districtShadow)">
          {districts.map((district) => (
            <path
              key={district.id}
              d={district.d}
              className={`sl-district ${selectedDistrict === district.name ? 'selected' : ''}`}
              fill={fillForMetric(district.stats, metric, maximum)}
              onMouseEnter={(event) => updateHover(district.id, event)}
              onMouseMove={(event) => updateHover(district.id, event)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => selectDistrict(district.name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') selectDistrict(district.name);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${district.name}: ${metricValue(district.stats, metric)}`}
            />
          ))}
        </g>

        <g className="sl-map-dots" pointerEvents="none">
          {dots.map((dot) => (
            <circle
              key={dot.id}
              cx={dot.x}
              cy={dot.y}
              r={dot.radius}
              className={`sl-district-dot ${selectedDistrict === dot.name ? 'selected' : ''}`}
            />
          ))}
        </g>
      </svg>

      {hoveredDistrict && (
        <div
          className="sl-map-tooltip"
          style={{
            left: Math.min(hovered!.x + 14, (containerRef.current?.clientWidth ?? 320) - 220),
            top: hovered!.y + 14,
          }}
        >
          <strong>{hoveredDistrict.name}</strong>
          {hoveredDistrict.stats ? (
            <div className="sl-tooltip-grid">
              <span>PHMs <b>{hoveredDistrict.stats.phmCount}</b></span>
              <span>Mothers <b>{hoveredDistrict.stats.motherCount}</b></span>
              <span>Coverage <b>{coveragePercent(hoveredDistrict.stats)}%</b></span>
              <span>Avg. caseload <b>{averageCaseload(hoveredDistrict.stats)}</b></span>
            </div>
          ) : (
            <span className="sl-tooltip-empty">No tracking data yet</span>
          )}
        </div>
      )}

      <div className="sl-map-legend" aria-label="Map legend">
        {legendItems(metric).map((item) => (
          <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>
        ))}
        <span><i className="no-data" />No data</span>
      </div>
    </div>
  );
};

export default SriLankaMap;