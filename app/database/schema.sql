CREATE TABLE IF NOT EXISTS songs (
    id              INT             NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255)    NOT NULL,
    song_key        VARCHAR(50),
    tempo           INT,
    lyrics          TEXT,
    copyright_info  TEXT,
    notes           TEXT,
    ccli_number     VARCHAR(50),
    featured        TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY songs_slug_unique (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tags (
    id   INT          NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY tags_name_unique (name),
    UNIQUE KEY tags_slug_unique (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS song_tags (
    song_id INT NOT NULL,
    tag_id  INT NOT NULL,
    PRIMARY KEY (song_id, tag_id),
    CONSTRAINT song_tags_song_fk FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    CONSTRAINT song_tags_tag_fk  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(255) NOT NULL,
    value TEXT,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (`key`, value) VALUES
    ('hero_image',    NULL),
    ('hero_text',     'Worship <strong>Songs</strong> &amp; <strong>Resources</strong> from musician <strong>Nathan Surgenor</strong>');

CREATE TABLE IF NOT EXISTS song_files (
    id         INT          NOT NULL AUTO_INCREMENT,
    song_id    INT          NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    label      VARCHAR(255) NOT NULL,
    filename   VARCHAR(255) NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT song_files_song_fk FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    CONSTRAINT song_files_type_check CHECK (type IN ('sheet_music', 'audio'))
) ENGINE=InnoDB;
