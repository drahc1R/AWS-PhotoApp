//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const dbConnection = require("./database.js");

exports.get_assets = async (req, res) => {
  console.log("call to get /assets...");

  try {
    //
    // TODO: remember we did an example similar to this in class with
    // movielens database
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //
    var rds_response = new Promise((resolve, reject) => {
      try {
        console.log("/assets: calling RDS...");

        var sql = "SELECT * FROM assets ORDER BY assetid ASC;";

        dbConnection.query(sql, (err, results, _) => {
          try {
            if (err) {
              reject(err);
              return;
            }

            console.log("/assets query done");
            resolve(results);
          } catch (code_err) {
            reject(code_err);
          }
        });
      } catch (code_err) {
        reject(code_err);
      }
    });

    await Promise.all([rds_response])
      .then((results) => {
        // try {
        var rds_results = results[0];
        res.json({
          message: "success",
          data: rds_results,
        });
      })
      .catch((err) => {
        res.status(400).json({
          message: err.message,
          data: [],
        });
      });
  } catch (err) {
    //try
    console.log("**Error in call to get /assets");
    console.log(err.message);

    res.status(400).json({
      message: err.message,
      data: [],
    });
  } //catch
}; //get
