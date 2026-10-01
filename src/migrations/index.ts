import * as migration_20260930_235704_foundation from './20260930_235704_foundation';
import * as migration_20261001_080057_phase2_machines from './20261001_080057_phase2_machines';

export const migrations = [
  {
    up: migration_20260930_235704_foundation.up,
    down: migration_20260930_235704_foundation.down,
    name: '20260930_235704_foundation',
  },
  {
    up: migration_20261001_080057_phase2_machines.up,
    down: migration_20261001_080057_phase2_machines.down,
    name: '20261001_080057_phase2_machines'
  },
];
