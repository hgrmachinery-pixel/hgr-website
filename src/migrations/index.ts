import * as migration_20260930_235704_foundation from './20260930_235704_foundation';
import * as migration_20261001_080057_phase2_machines from './20261001_080057_phase2_machines';
import * as migration_20261001_171946_phase3_media_documents from './20261001_171946_phase3_media_documents';
import * as migration_20261002_005506_phase4_youtube_video from './20261002_005506_phase4_youtube_video';

export const migrations = [
  {
    up: migration_20260930_235704_foundation.up,
    down: migration_20260930_235704_foundation.down,
    name: '20260930_235704_foundation',
  },
  {
    up: migration_20261001_080057_phase2_machines.up,
    down: migration_20261001_080057_phase2_machines.down,
    name: '20261001_080057_phase2_machines',
  },
  {
    up: migration_20261001_171946_phase3_media_documents.up,
    down: migration_20261001_171946_phase3_media_documents.down,
    name: '20261001_171946_phase3_media_documents',
  },
  {
    up: migration_20261002_005506_phase4_youtube_video.up,
    down: migration_20261002_005506_phase4_youtube_video.down,
    name: '20261002_005506_phase4_youtube_video',
  },
];
