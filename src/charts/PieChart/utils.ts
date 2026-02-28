import { Skia } from '@shopify/react-native-skia';
import * as d3 from 'd3-shape';
import type { PieChartItem } from './interfaces';

export type PieArcLayoutItem = {
  index: number;
  data: PieChartItem;
  path: ReturnType<typeof Skia.Path.Make> | null;
  // The midpoint angle is used for radial interactions (e.g. selected offset).
  midAngle: number;
};

type BuildPieLayoutProps = {
  data: PieChartItem[];
  innerRadius: number;
  outerRadius: number;
  sliceGapAngle: number;
  cornerRadius: number;
  startAngle: number;
  direction: 'clockwise' | 'counterclockwise';
  layoutSignature?: string;
};

const MAX_LAYOUT_CACHE_SIZE = 20;
const PIE_LAYOUT_CACHE = new Map<string, PieArcLayoutItem[]>();

const HASH_MOD = 4294967291; // Largest 32-bit prime

/**
 *  Small deterministic hash function to create compact signatures.
 *  This avoids building and comparing very large strings on every render.
 */
const hashString = (input: string, seed = 2166136261) => {
  let hash = seed % HASH_MOD;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(hash, 16777619) + input.charCodeAt(i)) % HASH_MOD;
  }
  return hash;
};

const hashNumber = (value: number, seed: number) => {
  // Quantize to keep stable keys across floating-point noise.
  return hashString(Math.round(value * 1000).toString(36), seed);
};

const hashPieData = (data: PieChartItem[]) => {
  // Hash only fields that influence visual layout.
  let hash = 2166136261 % HASH_MOD;
  for (let i = 0; i < data.length; i++) {
    const item = data[i]!;
    hash = hashString(item.label ?? '', hash);
    hash = hashString(item.color ?? '', hash);
    hash = hashNumber(item.value, hash);
    hash = hashNumber(item.renderValue ?? -1, hash);
    hash = hashNumber(item.isAggregated ? 1 : 0, hash);
  }
  return hash;
};

export const getPieLayoutSignature = ({
  data,
  innerRadius,
  outerRadius,
  sliceGapAngle,
  cornerRadius,
  startAngle,
  direction,
}: Omit<BuildPieLayoutProps, 'layoutSignature'>) => {
  // Merge data + geometry into a compact signature consumed by:
  // - local memoization
  // - shared LRU cache lookup
  let hash = hashPieData(data);
  hash = hashNumber(innerRadius, hash);
  hash = hashNumber(outerRadius, hash);
  hash = hashNumber(sliceGapAngle, hash);
  hash = hashNumber(cornerRadius, hash);
  hash = hashNumber(startAngle, hash);
  hash = hashString(direction, hash);
  return hash.toString(36);
};

export const buildPieLayout = ({
  data,
  innerRadius,
  outerRadius,
  sliceGapAngle,
  cornerRadius,
  startAngle,
  direction,
  layoutSignature,
}: BuildPieLayoutProps): PieArcLayoutItem[] => {
  if (!data.length) return [];

  // Callers may provide a precomputed signature when they already have one.
  // Otherwise, compute it here.
  const cacheKey =
    layoutSignature ??
    getPieLayoutSignature({
      data,
      innerRadius,
      outerRadius,
      sliceGapAngle,
      cornerRadius,
      startAngle,
      direction,
    });

  const cached = PIE_LAYOUT_CACHE.get(cacheKey);
  if (cached) {
    // LRU touch: a read refreshes recency.
    PIE_LAYOUT_CACHE.delete(cacheKey);
    PIE_LAYOUT_CACHE.set(cacheKey, cached);
    return cached;
  }

  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad =
    direction === 'clockwise'
      ? startAngleRad + Math.PI * 2
      : startAngleRad - Math.PI * 2;

  // d3 pie creates angular ranges and d3 arc converts each range into path data.
  const arcs = d3
    .pie<PieChartItem>()
    .sort(null)
    .startAngle(startAngleRad)
    .endAngle(endAngleRad)
    .value((slice) => slice.renderValue ?? slice.value)
    .padAngle((sliceGapAngle * Math.PI) / 180)(data);

  const arcGenerator = d3
    .arc<d3.PieArcDatum<PieChartItem>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius);

  const result = arcs.map((arc, index) => {
    const svgPath = arcGenerator(arc);

    // Skia draws and hit-tests using SkPath, so convert once and reuse.
    const path = svgPath ? Skia.Path.MakeFromSVGString(svgPath) : null;
    const midAngle = (arc.startAngle + arc.endAngle) / 2;
    return {
      index,
      data: arc.data,
      path,
      midAngle,
    };
  });

  // LRU set: new entries move to the end.
  PIE_LAYOUT_CACHE.set(cacheKey, result);

  // Keep cache bounded (LRU eviction).
  if (PIE_LAYOUT_CACHE.size > MAX_LAYOUT_CACHE_SIZE) {
    const oldestKey = PIE_LAYOUT_CACHE.keys().next().value;
    if (oldestKey) PIE_LAYOUT_CACHE.delete(oldestKey);
  }

  return result;
};
