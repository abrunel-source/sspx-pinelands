import * as migration_20261023_160055_initial from './20261023_160055_initial';
import * as migration_20261023_164011_blob_storage_fields from './20261023_164011_blob_storage_fields';
import * as migration_20261023_180406_feasts_calendar from './20261023_180406_feasts_calendar';
import * as migration_20261023_182725_homilies_and_auto_updates from './20261023_182725_homilies_and_auto_updates';
import * as migration_20261024_221910_spam_protection from './20261024_221910_spam_protection';
import * as migration_20261025_190000_christ_the_king_procession from './20261025_190000_christ_the_king_procession';
import * as migration_20261025_210000_christ_the_king_photos from './20261025_210000_christ_the_king_photos';
import * as migration_20261104_084815_notice_until from './20261104_084815_notice_until';
import * as migration_20261104_090000_november_notices_all_saints from './20261104_090000_november_notices_all_saints';
import * as migration_20261105_191143_announcement_banner from './20261105_191143_announcement_banner';
import * as migration_20261105_192000_christmas_market_banner from './20261105_192000_christmas_market_banner';

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
    name: '20261024_221910_spam_protection',
  },
  {
    up: migration_20261025_190000_christ_the_king_procession.up,
    down: migration_20261025_190000_christ_the_king_procession.down,
    name: '20261025_190000_christ_the_king_procession',
  },
  {
    up: migration_20261025_210000_christ_the_king_photos.up,
    down: migration_20261025_210000_christ_the_king_photos.down,
    name: '20261025_210000_christ_the_king_photos',
  },
  {
    up: migration_20261104_084815_notice_until.up,
    down: migration_20261104_084815_notice_until.down,
    name: '20261104_084815_notice_until',
  },
  {
    up: migration_20261104_090000_november_notices_all_saints.up,
    down: migration_20261104_090000_november_notices_all_saints.down,
    name: '20261104_090000_november_notices_all_saints',
  },
  {
    up: migration_20261105_191143_announcement_banner.up,
    down: migration_20261105_191143_announcement_banner.down,
    name: '20261105_191143_announcement_banner',
  },
  {
    up: migration_20261105_192000_christmas_market_banner.up,
    down: migration_20261105_192000_christmas_market_banner.down,
    name: '20261105_192000_christmas_market_banner'
  },
];
