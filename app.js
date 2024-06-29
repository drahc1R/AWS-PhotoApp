//
// Express js (and node.js) web service that interacts with
// AWS S3 and RDS to provide clients data for building a
// simple photo application for photo storage and viewing.
//
// Project 02 for CS 310.
//
// Authors:
//  Richard Bann
//  Prof. Joe Hummel (initial template)
//  Northwestern University
//  CS 310
//
// References:
// Node.js:
//   https://nodejs.org/
// Express:
//   https://expressjs.com/
// MySQL:
//   https://expressjs.com/en/guide/database-integration.html#mysql
//   https://github.com/mysqljs/mysql
// AWS SDK with JS:
//   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
//   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html
//   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
//   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
//

const config = require("./config.js");
const express = require("express");
const app = express();
const dbConnection = require("./database.js");
const {
  HeadBucketCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const { s3, s3_bucket_name, s3_region_name } = require("./aws.js");

// support larger image uploads/downloads:
app.use(express.json({ strict: false, limit: "50mb" }));

var startTime;

app.listen(config.service_port, () => {
  startTime = Date.now();
  console.log("web service running...");
  //
  // Configure AWS to use our config file:
  //
  process.env.AWS_SHARED_CREDENTIALS_FILE = config.photoapp_config;
});

app.get("/", (req, res) => {
  try {
    console.log("call to /...");

    var uptime = Math.round((Date.now() - startTime) / 1000);

    res.json({
      status: "running",
      "uptime-in-secs": uptime,
      dbConnection: dbConnection.state,
    });
  } catch (err) {
    console.log("**Error in call to /");
    console.log(err.message);

    res.status(400).json(err.message);
  }
});

//
// service functions:
//
var stats = require("./api_stats.js");
var users = require("./api_users.js");
var assets = require("./api_assets.js");
var bucket = require("./api_bucket.js");
var download = require("./api_image_get.js");
var user = require("./api_user.js");
var upload = require("./api_image_post.js");

app.get("/stats", stats.get_stats);
app.get("/users", users.get_users);
app.get("/assets", assets.get_assets);
app.get("/bucket", bucket.get_bucket);
app.get("/image/:assetid", download.get_image);

app.put("/user", user.put_user);

app.post("/image/:userid", upload.post_image);
