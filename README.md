# Random Music API

A RESTful API that delivers random songs, albums, and artists — all protected by user authentication. Built with Node.js, Express, MySQL, and documented with Swagger.

---

## Features

- Get a random song, album, or artist from the database
- Token-based authentication (users must log in)
- Fully documented with Swagger UI
- Data sourced from a CSV using a custom ETL script
- Protected routes — only accessible with a valid token

---

## Tech Stack

- Node.js + Express
- MySQL
- Swagger (swagger-jsdoc + swagger-ui-express)
- Morgan (logging)
- UUID (for token generation)

---

## Setup Instructions

1. **Clone this repo**:
- git clone https://github.com/dacods/API_From_Scratch.git
- cd API_From_Scratch

2. **Install dependencies**:
- npm install

3. **Configure your MySQL DB**:
- Run db.sql to create and seed your tables
- Run node scripts/ETL.js to populate sample data

4. **Start the server**:
- node server.js

5. **Visit Swagger UI**:
-  http://localhost:3000/api-docs

---
## Sample Test (using curl)
Login (get a token):

- curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"test@music.com", "password":"letmein"}'

Use your token:
- curl http://localhost:3000/songs/random -H "X-Token: your_token"

- curl http://localhost:3000/albums/random -H "X-Token: your_token"

- curl http://localhost:3000/artists/random -H "X-Token: your_token"

## Author

Dacoda Takagi 
