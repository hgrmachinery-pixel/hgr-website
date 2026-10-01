import * as migration_20260930_235704_foundation from './20260930_235704_foundation';

export const migrations = [
  {
    up: migration_20260930_235704_foundation.up,
    down: migration_20260930_235704_foundation.down,
    name: '20260930_235704_foundation'
  },
];
