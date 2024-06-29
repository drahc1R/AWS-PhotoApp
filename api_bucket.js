//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {

  console.log("call to get /bucket...");

  try {
    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //

    // build input object with request parameters:
    var input = {
      Bucket: s3_bucket_name,
      MaxKeys: 12
    };

      if (req.query.startafter) {
        input.StartAfter = req.query.startafter;
      }

      console.log("/bucket: calling S3...");

      var command = new ListObjectsV2Command(input);
      var s3_response = await s3.send(command);

      if (s3_response.KeyCount === 0) {
        res.json({
          "message": "No more assets in the bucket.",
          "data": []
        });
      } else {
        res.json({
          "message": "Assets retrieved successfully.",
          "data": s3_response.Contents
        });
      }

    } catch (err) {
      console.log("**Error in call to get /bucket");
      console.log(err.message);

      res.status(400).json({
        "message": err.message,
        "data": []
      });
    }//catch

  }//get