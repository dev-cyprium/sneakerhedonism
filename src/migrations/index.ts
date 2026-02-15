import * as migration_20260211_015545_rename_linkType_to_navType from './20260211_015545_rename_linkType_to_navType';
import * as migration_20260215_121709 from './20260215_121709';

export const migrations = [
  {
    up: migration_20260211_015545_rename_linkType_to_navType.up,
    down: migration_20260211_015545_rename_linkType_to_navType.down,
    name: '20260211_015545_rename_linkType_to_navType',
  },
  {
    up: migration_20260215_121709.up,
    down: migration_20260215_121709.down,
    name: '20260215_121709',
  },
];
