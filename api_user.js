//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require("./database.js");

exports.put_user = async (req, res) => {
  console.log("call to put /user...");

  try {
    const email = req.body.email;
    const lastname = req.body.lastname;
    const firstname = req.body.firstname;
    const bucketfolder = req.body.bucketfolder;

    // check if user exists
    const query = "SELECT * FROM users WHERE email = ?";
    dbConnection.query(query, [email], async (err, results, _) => {
      if (err) {
        throw new Error(
          "Error occurred while checking if user exists",
          err.message,
        );
      }
      if (results.length === 1) {
        // update if there is
        const userid = results[0].userid
        const updateQuery =
          "UPDATE users SET lastname = ?, firstname = ?, bucketfolder = ? WHERE email = ?";
        dbConnection.query(
          updateQuery,
          [lastname, firstname, bucketfolder, email],
          async (err, newresults, _) => {
            if (err) {
              res.status(400).json({
                message: "Error occurred while updating user",
                userid: -1,
              })
            }
            res.json({
              message: "updated",
              userid: userid,
            });
            return;
          },
        );
        return;
      } else {
        // insert if there is not
        const insertQuery =
          "INSERT INTO users (email, lastname, firstname, bucketfolder) VALUES (?, ?, ?, ?)";
        dbConnection.query(
          insertQuery,
          [email, lastname, firstname, bucketfolder],
          async (err, results, _) => {
            if (err) {
              res.status(400).json({
                message: "Error occurred while inserting user",
                userid: -1,
              })
            }
            res.json({
              message: "inserted",
              userid: results.insertId,
            });
            return;
          },
        );
        return;
      }
    });
  } catch (err) {
    console.log("**Error in call to put /user", err.message);
    res.status(400).json({
      message: err.message,
      userid: -1,
    });
  }
};
