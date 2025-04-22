-- Drop all existing tables safely
DROP TABLE IF EXISTS AlbumSong;
DROP TABLE IF EXISTS ArtistAlbum;
DROP TABLE IF EXISTS Songs;
DROP TABLE IF EXISTS Albums;
DROP TABLE IF EXISTS Artists;

-- Create Database if it does not exist
CREATE DATABASE IF NOT EXISTS Music_API;
USE Music_API;

-- Table: Artists
CREATE TABLE Artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table: Albums
CREATE TABLE Albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

-- Table: Songs
CREATE TABLE Songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE
);

-- Junction Table: Artist <-> Album
CREATE TABLE ArtistAlbum (
    artist_id INT,
    album_id INT,
    PRIMARY KEY (artist_id, album_id),
    FOREIGN KEY (artist_id) REFERENCES Artists(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES Albums(id) ON DELETE CASCADE
);

-- Junction Table: Album <-> Song
CREATE TABLE AlbumSong (
    album_id INT,
    song_id INT,
    PRIMARY KEY (album_id, song_id),
    FOREIGN KEY (album_id) REFERENCES Albums(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE
);
