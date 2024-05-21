var mysql = require("mysql");

const dbCon = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "secretWebsite",                  
  database: "website"           
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");
    
  con.query("DELETE from tbl_events", function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Table cleared");
    con.end();
  });
});
