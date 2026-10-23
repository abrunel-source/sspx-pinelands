import * as migration_20261023_160055_initial from './20261023_160055_initial';
import * as migration_20261023_164011_blob_storage_fields from './20261023_164011_blob_storage_fields';

export const migrations = [
  {
    up: migration_20261023_160055_initial.up,
    down: migration_20261023_160055_initial.down,
    name: '20261023_160055_initial',
  },
  {
    up: migration_20261023_164011_blob_storage_fields.up,
    down: migration_20261023_164011_blob_storage_fields.down,
    name: '20261023_164011_blob_storage_fields'
  },
];
