//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const { resolve } = require("dns");
const dbConnection = require("./database.js");
const { resourceLimits } = require("worker_threads");

exports.get_users = async (req, res) => {
  console.log("call to get /users...");

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
        console.log("/users: calling RDS...");

        var sql = `SELECT * FROM users ORDER BY userid ASC;`;

        dbConnection.query(sql, (err, results, _) => {
          try {
            if (err) {
              reject(err);
              return;
            }

            console.log("/users query done");
            resolve(results);
          } catch (code_err) {
            reject(code_err);
          }
        });
      } catch (code_err) {
        reject(code_err);
      }
    });

    Promise.all([rds_response])
      .then((results) => {
        try {
          // get results
          var rds_results = results[0];

          console.log("/users done, sending response...");
          res.json({
            message: "success",
            data: rds_results,
          });
        } catch (code_err) {
          res.status(400).json({
            message: code_err.message,
            data: [],
          });
        }
      })
      .catch((err) => {
        //
        // we get here if calls to S3 or RDS failed, or we
        // failed to process the results properly:
        //
        res.status(400).json({
          message: err.message,
          data: [],
        });
      });
  } catch (err) {
    //try
    console.log("**Error in call to get /users");
    console.log(err.message);

    res.status(400).json({
      message: err.message,
      data: [],
    });
  } //catch
}; //get
