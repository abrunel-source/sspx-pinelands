import * as migration_20261023_160055_initial from './20261023_160055_initial';

export const migrations = [
  {
    up: migration_20261023_160055_initial.up,
    down: migration_20261023_160055_initial.down,
    name: '20261023_160055_initial'
  },
];
