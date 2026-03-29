const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "shuttle.proxy.rlwy.net:35663",
  user: "root",
  password: "dVhyMHZiuIrZpLuWFcrdiBuAFFIHXaqM",
  database: "railway"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

module.exports = db;
