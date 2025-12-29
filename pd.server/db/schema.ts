import {
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const photos = pgTable(
  'photos',
  {
    id: serial().primaryKey().notNull(),
    filePath: text().notNull(),
    createdAt: timestamp().notNull(),
  }
);

export const albums = pgTable(
  'albums',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({length: 255}).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  }
);

export const albumPhoto = pgTable(
  'albumPhoto',
  {
    photoId: integer(),
    albumId: integer(),
    createdAt: timestamp(),
  },
  table => ({
    photoIdForeignKey: foreignKey({
      columns: [table.photoId],
      foreignColumns: [photos.id],
      name: 'albumPhoto_photoId_foreignKey',
    }),
    albumIdForeignKey: foreignKey({
      columns: [table.albumId],
      foreignColumns: [albums.id],
      name: 'albumPhoto_albumId_foreignKey',
    }),
  })
);
