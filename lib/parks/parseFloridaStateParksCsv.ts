import { parseCsv } from '@/lib/parks/parseCsv';
import { floridaStateParkFromSnakeFields } from '@/lib/parks/floridaStateParkFromSnakeFields';
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
  'top_plant_images',
  'top_animals',
  'top_animal_images',
  'public_access',
  'data_source',
  'updated_at',
] as const;

type CsvColumn = (typeof CSV_COLUMNS)[number];

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
  return floridaStateParkFromSnakeFields(record);
}

export function parseFloridaStateParksCsv(csvText: string): FloridaStatePark[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  const normalizedHeader = header.map((cell) => cell.trim().toLowerCase());
  const usesHeader =
    normalizedHeader.includes('park_id') && normalizedHeader.includes('park_name');

  const bodyRows = usesHeader ? dataRows : rows;
  return bodyRows
    .map((cells) => {
      if (usesHeader) {
        const record = {} as Record<CsvColumn, string>;
        for (const column of CSV_COLUMNS) {
          record[column] = '';
        }
        normalizedHeader.forEach((column, index) => {
          if ((CSV_COLUMNS as readonly string[]).includes(column)) {
            record[column as CsvColumn] = cells[index]?.trim() ?? '';
          }
        });
        return mapRow(record);
      }
      return mapRow(rowToRecord(cells));
    })
    .filter((park) => park.parkId.length > 0 && park.parkName.length > 0)
    .sort((a, b) => a.parkName.localeCompare(b.parkName, undefined, { sensitivity: 'base' }));
}
