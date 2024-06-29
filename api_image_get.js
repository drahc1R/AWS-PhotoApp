//
// app.get('/image/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const dbConnection = require("./database.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3, s3_bucket_name, s3_region_name } = require("./aws.js");

exports.get_image = async (req, res) => {
  console.log("call to get /image/:assetid...");

  try {
    //
    // TODO
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //
    const assetId = req.params.assetid;
    const query = "SELECT * FROM assets WHERE assetid = ?";

    // Use a new Promise to handle the MySQL query
    const results = await new Promise((resolve, reject) => {
      dbConnection.query(query, [assetId], (error, results) => {
        if (error) {
          reject(error); // If there's a database error, reject the Promise
        } else if (results.length === 0) {
          reject(new Error("No such asset...")); // If no results, reject with "No such asset"
        } else {
          resolve(results); // Otherwise, resolve the Promise with the results
        }
      });
    });

    // Extract the bucket key from the query results
    console.log(results);
    const bucketKey = results[0].bucketkey;
    const assetName = results[0].assetname;
    const userId = results[0].userid;

    // Set parameters for the S3 GetObjectCommand
    const getObjectParams = {
      Bucket: s3_bucket_name,
      Key: bucketKey,
    };

    // Execute the GetObjectCommand
    const command = new GetObjectCommand(getObjectParams);
    const s3Response = await s3.send(command);

    // Convert the S3 stream to a base64 string
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () =>
          resolve(Buffer.concat(chunks).toString("base64")),
        );
      });

    const base64data = await streamToString(s3Response.Body);
    // Send the successful response
    res.status(200).json({
      message: "success",
      user_id: userId, // Assuming user ID is available in request
      asset_name: assetName,
      bucket_key: bucketKey,
      data: base64data,
    });
  } catch (err) {
    console.error("**Error in call to get /image/:assetid", err.message);
    res.status(400).json({
      message: err.message,
      user_id: -1,
      asset_name: "?",
      bucket_key: "?",
      data: [],
    });
  }
};
