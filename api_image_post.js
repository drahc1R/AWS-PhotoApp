//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const dbConnection = require('./database.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("call to post /image/:userid...");

  try {
const userId = req.params.userid;
  const { assetname, data } = req.body;

  // check if user exists
  dbConnection.query('SELECT bucketfolder FROM users WHERE userid = ?', [userId], (err, userResults) => {
    if (err) {
      return res.status(500).json({ message: "Database query error", assetid: -1 });
    }

    if (userResults.length === 0) {
      return res.status(400).json({ message: "no such user...", assetid: -1 });
    }

    // User exists so add
    const bucketfolder = userResults[0].bucketfolder;
    const uniqueName = uuid.v4() + '.jpg';
    const key = `${bucketfolder}/${uniqueName}`;

    const buffer = Buffer.from(data, 'base64');
    const putObjectParams = {
      Bucket: s3_bucket_name,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "public-read"
    };

    // send to s3
    s3.send(new PutObjectCommand(putObjectParams), async (err, s3Result) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading to S3", assetid: -1 });
      }

      // update db
      dbConnection.query('INSERT INTO assets (userid, assetname, bucketkey) VALUES (?, ?, ?)', [userId, assetname, key], (err, dbResult) => {
        if (err) {
          return res.status(500).json({ message: "Database insert error", assetid: -1 });
        }

        // send success reponse
        res.status(200).json({ message: "success", assetid: dbResult.insertId });
      });
    });
  });
  }
  catch (err) {
      console.log("**Error in call to post /image");
      console.log(err.message);

      res.status(400).json({
        "message": err.message,
        "assetid": -1
      });
    }//catch

  }//post
