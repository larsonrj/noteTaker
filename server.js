const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const notes = require("./db/db.json");
const util = require("util");

const readFromFile = util.promisify(fs.readFile);

const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for feedback`);

  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;

  const response = {
    title: title,
    text: text,
  };

  const newNote = [...notes, response];
  const dbNotes = JSON.stringify(newNote, null, 2);

  fs.writeFile(`./db/db.json`, dbNotes, (err) =>
    err
      ? console.error(err)
      : console.log(`New note has been written to JSON file`)
  );
  console.info(`${req.method} request received to add a new note`);
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
