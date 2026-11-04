-- Site data in D1. Uploaded image files themselves live in the R2 bucket bound as MEDIA.

-- The editable content: a single JSON document (see src/content/schema.ts).
-- `version` increases on every save, so two saves at the same time can't overwrite each other.
CREATE TABLE IF NOT EXISTS content (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  json       TEXT    NOT NULL,
  version    INTEGER NOT NULL,
  updated_at TEXT    NOT NULL -- ISO 8601
);

-- The previous versions of the content (the newest 30 are kept).
CREATE TABLE IF NOT EXISTS content_backups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  json       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Index of uploaded images (files in R2 under uploads/<name>), so the image library never has to
-- download files to measure them.
CREATE TABLE IF NOT EXISTS media (
  name        TEXT    PRIMARY KEY,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  bytes       INTEGER NOT NULL,
  uploaded_at TEXT    NOT NULL
);

-- Admin sign-in throttle, shared by every worker instance.
CREATE TABLE IF NOT EXISTS login_attempts (
  client       TEXT    PRIMARY KEY,
  failures     INTEGER NOT NULL,
  window_start INTEGER NOT NULL, -- ms since epoch
  locked_until INTEGER NOT NULL  -- ms since epoch
);
