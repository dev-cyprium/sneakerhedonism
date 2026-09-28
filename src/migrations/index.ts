import * as orderInventory from './20260928_160000_order_inventory';
import * as migration_20260211_015545_rename_linkType_to_navType from './20260211_015545_rename_linkType_to_navType';
import * as migration_20260215_121709 from './20260215_121709';
import * as migration_20260310_112612_add_coupons from './20260310_112612_add_coupons';
import * as migration_20260327_113154 from './20260327_113154';
import * as migration_20260817_082228_hero_banners_social_strip from './20260817_082228_hero_banners_social_strip';
import * as migration_20260817_152010_banner_text_color from './20260817_152010_banner_text_color';
import * as migration_20260818_095142 from './20260818_095142';
import * as migration_20260818_095513 from './20260818_095513';
import * as migration_20260818_190618 from './20260818_190618';
import * as migration_20260826_093306_coupon_category_scope from './20260826_093306_coupon_category_scope';

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
  {
    up: migration_20260310_112612_add_coupons.up,
    down: migration_20260310_112612_add_coupons.down,
    name: '20260310_112612_add_coupons',
  },
  {
    up: migration_20260327_113154.up,
    down: migration_20260327_113154.down,
    name: '20260327_113154',
  },
  {
    up: migration_20260817_082228_hero_banners_social_strip.up,
    down: migration_20260817_082228_hero_banners_social_strip.down,
    name: '20260817_082228_hero_banners_social_strip',
  },
  {
    up: migration_20260817_152010_banner_text_color.up,
    down: migration_20260817_152010_banner_text_color.down,
    name: '20260817_152010_banner_text_color',
  },
  {
    up: migration_20260818_095142.up,
    down: migration_20260818_095142.down,
    name: '20260818_095142',
  },
  {
    up: migration_20260818_095513.up,
    down: migration_20260818_095513.down,
    name: '20260818_095513',
  },
  {
    up: migration_20260818_190618.up,
    down: migration_20260818_190618.down,
    name: '20260818_190618',
  },
  {
    up: migration_20260826_093306_coupon_category_scope.up,
    down: migration_20260826_093306_coupon_category_scope.down,
    name: '20260826_093306_coupon_category_scope'
  },
  { up: orderInventory.up, down: orderInventory.down, name: '20260928_160000_order_inventory' },
];
