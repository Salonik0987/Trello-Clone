const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dVhyMHZiuIrZpLuWFcrdiBuAFFIHXaqM",
  database: "trello_clone"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

module.exports = db;
