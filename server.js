const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const notes = require("./db/db.json");
const util = require("util");

const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const readFromFile = util.promisify(fs.readFile);

const uuid = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndDelete = (deleteID, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const currentDB = JSON.parse(data);

      index = currentDB.findIndex((element) => {
        return element.id === deleteID;
      });
      currentDB.splice(index, 1);
      updatedDB = currentDB;
      writeToFile(file, updatedDB);
    }
  });
};

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
  console.info(`${req.method} request to post a new note`);
  const { title, text } = req.body;

  const response = {
    title: title,
    text: text,
    id: uuid(),
  };

  readAndAppend(response, "./db/db.json");
  res.redirect("/notes");
});

app.delete("/api/notes/:id", (req, res) => {
  console.info(`${req.method} request to remove a note`);
  id = req.params.id;
  readAndDelete(id, "./db/db.json");
  res.redirect("/notes");
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
