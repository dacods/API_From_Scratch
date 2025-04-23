const express = require('express');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// Enable logging
app.use(morgan('dev'));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Music API',
      version: '1.0.0',
      description: 'API for random songs, albums, and artists'
    },
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '677620Dl',
  database: 'Music_API'
};

/**
 * @swagger
 * /songs/random:
 *   get:
 *     summary: Get a random song
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: A random song with album and artist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 song:
 *                   type: string
 *                 album:
 *                   type: string
 *                 artist:
 *                   type: string
 */
app.get('/songs/random', async (req, res) => {
  const token = req.headers['x-token'];
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [valid] = await connection.execute(
      'SELECT * FROM Tokens WHERE token = ?',
      [token]
    );

    if (valid.length === 0) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    // Token is valid, continue...
    const [rows] = await connection.execute(`
      SELECT 
        s.title AS song,
        al.title AS album,
        ar.name AS artist
      FROM Songs s
      JOIN AlbumSong als ON s.id = als.song_id
      JOIN Albums al ON als.album_id = al.id
      JOIN ArtistAlbum aa ON al.id = aa.album_id
      JOIN Artists ar ON aa.artist_id = ar.id
      ORDER BY RAND() LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No songs found' });
    }

    res.status(200).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

/**
 * @swagger
 * /albums/random:
 *   get:
 *     summary: Get a random album
 *     tags: [Albums]
 *     responses:
 *       200:
 *         description: A random album with its artist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 album:
 *                   type: string
 *                 artist:
 *                   type: string
 */
app.get('/albums/random', async (req, res) => {
  const token = req.headers['x-token'];
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [valid] = await connection.execute(
      'SELECT * FROM Tokens WHERE token = ?',
      [token]
    );

    if (valid.length === 0) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    const [rows] = await connection.execute(`
      SELECT 
        al.title AS album,
        ar.name AS artist
      FROM Albums al
      JOIN ArtistAlbum aa ON al.id = aa.album_id
      JOIN Artists ar ON aa.artist_id = ar.id
      ORDER BY RAND() LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No albums found' });
    }

    res.status(200).json(rows[0]);

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) await connection.end();
  }
});

/**
 * @swagger
 * /artists/random:
 *   get:
 *     summary: Get a random artist
 *     tags: [Artists]
 *     responses:
 *       200:
 *         description: A random artist with one of their albums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artist:
 *                   type: string
 *                 album:
 *                   type: string
 */
app.get('/artists/random', async (req, res) => {
  const token = req.headers['x-token'];
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [valid] = await connection.execute(
      'SELECT * FROM Tokens WHERE token = ?',
      [token]
    );

    if (valid.length === 0) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    const [rows] = await connection.execute(`
      SELECT 
        ar.name AS artist,
        al.title AS album
      FROM Artists ar
      JOIN ArtistAlbum aa ON ar.id = aa.artist_id
      JOIN Albums al ON aa.album_id = al.id
      ORDER BY RAND() LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No artists found' });
    }

    res.status(200).json(rows[0]);

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) await connection.end();
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login with token
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(
      'SELECT * FROM Users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const token = uuidv4();

    await connection.execute(
      'INSERT INTO Tokens (user_id, token) VALUES (?, ?)',
      [user.id, token]
    );

    res.status(200).json({ token });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
