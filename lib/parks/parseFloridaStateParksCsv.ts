import { parseCsv } from '@/lib/parks/parseCsv';
import type { FloridaStatePark } from '@/types/florida-state-park';

const CSV_COLUMNS = [
  'park_id',
  'unit_id',
  'park_name',
  'web_alias',
  'county',
  'district',
  'acreage',
  'address',
  'city',
  'state',
  'latitude',
  'longitude',
  'gps_source',
  'has_gps',
  'park_page_url',
  'image_url',
  'image_source',
  'image_license',
  'image_attribution',
  'description',
  'top_plants',
  'top_animals',
  'public_access',
  'data_source',
  'updated_at',
] as const;

type CsvColumn = (typeof CSV_COLUMNS)[number];

function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseBoolean(raw: string): boolean {
  return raw.trim().toLowerCase() === 'true';
}

export function splitPipeList(raw: string): string[] {
  return raw
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function rowToRecord(cells: string[]): Record<CsvColumn, string> {
  const record = {} as Record<CsvColumn, string>;
  CSV_COLUMNS.forEach((column, index) => {
    record[column] = cells[index]?.trim() ?? '';
  });
  return record;
}

function mapRow(record: Record<CsvColumn, string>): FloridaStatePark {
  return {
    parkId: record.park_id,
    unitId: record.unit_id,
    parkName: record.park_name,
    webAlias: record.web_alias,
    county: record.county,
    district: parseOptionalNumber(record.district),
    acreage: parseOptionalNumber(record.acreage),
    address: record.address,
    city: record.city,
    state: record.state,
    latitude: parseOptionalNumber(record.latitude),
    longitude: parseOptionalNumber(record.longitude),
    gpsSource: record.gps_source,
    hasGps: parseBoolean(record.has_gps),
    parkPageUrl: record.park_page_url,
    imageUrl: record.image_url,
    description: record.description,
    topPlants: splitPipeList(record.top_plants),
    topAnimals: splitPipeList(record.top_animals),
    publicAccess: record.public_access,
    dataSource: record.data_source,
    updatedAt: record.updated_at,
  };
}

export function parseFloridaStateParksCsv(csvText: string): FloridaStatePark[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  const normalizedHeader = header.map((cell) => cell.trim().toLowerCase());
  const usesHeader =
    normalizedHeader.length >= CSV_COLUMNS.length &&
    CSV_COLUMNS.every((column, index) => normalizedHeader[index] === column);

  const bodyRows = usesHeader ? dataRows : rows;
  return bodyRows
    .map((cells) => mapRow(rowToRecord(cells)))
    .filter((park) => park.parkId.length > 0 && park.parkName.length > 0)
    .sort((a, b) => a.parkName.localeCompare(b.parkName, undefined, { sensitivity: 'base' }));
}
