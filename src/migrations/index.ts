import * as migration_20261023_160055_initial from './20261023_160055_initial';
import * as migration_20261023_164011_blob_storage_fields from './20261023_164011_blob_storage_fields';
import * as migration_20261023_180406_feasts_calendar from './20261023_180406_feasts_calendar';
import * as migration_20261023_182725_homilies_and_auto_updates from './20261023_182725_homilies_and_auto_updates';
import * as migration_20261024_221910_spam_protection from './20261024_221910_spam_protection';

export const migrations = [
  {
    up: migration_20261023_160055_initial.up,
    down: migration_20261023_160055_initial.down,
    name: '20261023_160055_initial',
  },
  {
    up: migration_20261023_164011_blob_storage_fields.up,
    down: migration_20261023_164011_blob_storage_fields.down,
    name: '20261023_164011_blob_storage_fields',
  },
  {
    up: migration_20261023_180406_feasts_calendar.up,
    down: migration_20261023_180406_feasts_calendar.down,
    name: '20261023_180406_feasts_calendar',
  },
  {
    up: migration_20261023_182725_homilies_and_auto_updates.up,
    down: migration_20261023_182725_homilies_and_auto_updates.down,
    name: '20261023_182725_homilies_and_auto_updates',
  },
  {
    up: migration_20261024_221910_spam_protection.up,
    down: migration_20261024_221910_spam_protection.down,
    name: '20261024_221910_spam_protection'
  },
];
