var assert = require('assert');
var AWS = require('aws-sdk');
var util = require('util');

exports.handler = function(event, context) {
        var s3 = new AWS.S3(options = {region: "us-west-2", signatureVersion: 'v4'});
        var codepipeline = new AWS.CodePipeline();
        //console.log(event);
        var userParameters = JSON.parse(event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters);
        var jobId = event["CodePipeline.job"].id;
        var targetBucket = userParameters.bucket;
        var targetKey = userParameters.key;
        var sourceBucket = event["CodePipeline.job"].data.inputArtifacts[0].location.s3Location.bucketName;
        var sourceKey = event["CodePipeline.job"].data.inputArtifacts[0].location.s3Location.objectKey;

        var params = {
                Bucket: targetBucket,
                CopySource: sourceBucket + '/' + sourceKey,
                Key: targetKey,
                ACL: 'bucket-owner-full-control',
                //ServerSideEncryption: 'aws:kms',
                //SSEKMSKeyId: '<Key ID>'
                ServerSideEncryption: 'AES256'
        };

        var putJobSuccess = function(message) {
           var paramsc = {
             jobId : jobId
           };
           //console.log(paramsc);
           codepipeline.putJobSuccessResult(paramsc, function(err, data) {
             if(err) {
               context.fail(err); 
             } else {
             context.succeed(message); 
             }
           });
         };
 
        s3.copyObject(params, function(err, data) {
                if (err) console.log(err, err.stack);  // an error occurred
                else {
                        console.log ( 'Copied');
                        putJobSuccess("Tests passed.");
                        //context.done();
                    }// successful response
        });
};