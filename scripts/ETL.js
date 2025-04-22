const fs = require('fs');
const mysql = require('mysql2/promise');
const csv = require('csv-parser');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '677620Dl',
  database: 'Music_API'
};

(async () => {
  const connection = await mysql.createConnection(dbConfig);

  const seenArtists = new Map();
  const seenAlbums = new Map();
  const seenSongs = new Map();

  const insertArtist = async (name) => {
    if (seenArtists.has(name)) return seenArtists.get(name);
    const [rows] = await connection.execute('SELECT id FROM Artists WHERE name = ?', [name]);
    if (rows.length > 0) {
      seenArtists.set(name, rows[0].id);
      return rows[0].id;
    }
    const [result] = await connection.execute('INSERT INTO Artists (name) VALUES (?)', [name]);
    seenArtists.set(name, result.insertId);
    return result.insertId;
  };

  const insertAlbum = async (title) => {
    if (seenAlbums.has(title)) return seenAlbums.get(title);
    const [rows] = await connection.execute('SELECT id FROM Albums WHERE title = ?', [title]);
    if (rows.length > 0) {
      seenAlbums.set(title, rows[0].id);
      return rows[0].id;
    }
    const [result] = await connection.execute('INSERT INTO Albums (title) VALUES (?)', [title]);
    seenAlbums.set(title, result.insertId);
    return result.insertId;
  };

  const insertSong = async (title) => {
    if (seenSongs.has(title)) return seenSongs.get(title);
    const [rows] = await connection.execute('SELECT id FROM Songs WHERE title = ?', [title]);
    if (rows.length > 0) {
      seenSongs.set(title, rows[0].id);
      return rows[0].id;
    }
    const [result] = await connection.execute('INSERT INTO Songs (title) VALUES (?)', [title]);
    seenSongs.set(title, result.insertId);
    return result.insertId;
  };

  const csvPath = '../datasets/Music.csv';

  const rows = [];

    fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
        for (const row of rows) {
        try {
            const artist = row.Artist.trim();
            const album = row.Album.trim();
            const songs = row.Songs.split('|').map(s => s.trim());

            const artistId = await insertArtist(artist);
            const albumId = await insertAlbum(album);

            await connection.execute(
            'INSERT IGNORE INTO ArtistAlbum (artist_id, album_id) VALUES (?, ?)',
            [artistId, albumId]
            );

            for (const song of songs) {
            const songId = await insertSong(song);
            await connection.execute(
                'INSERT IGNORE INTO AlbumSong (album_id, song_id) VALUES (?, ?)',
                [albumId, songId]
            );
            }
        } catch (err) {
            console.error('Error processing row:', row, err);
        }
        }

        console.log('ETL complete.');
        await connection.end();
    });

})();
