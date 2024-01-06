var express = require('express');
var router = express.Router();
var inspect = require('util').inspect;
var AWS = require('aws-sdk');
var Tile = require('../models/tile');
var helper = require('../helpers');
var request = require('request');

// CRUD
router.get('/tile/:sId', function(req, res) {
  var paramObj = {
    sId: req.params.sId
  };

  Tile.get(paramObj, function (err, result) {
    if (helper.handleApiResponseIssues(res, err, result, true)) {
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
});

router.post('/tile/save', function(req, res) {
  var paramObj = {};
  var currTs = +new Date();
  var paramObjGot = false; // flag that we got the param object from the post
  var imgUploadCompleted = false; // flag that img was saved
  var imgFileName = '';

  saveThatTile = function() {
    paramObj.newTile.iUl = imgFileName;
    paramObj.newTile.cOn = currTs;
    paramObj.newTile.uOn = currTs;
    paramObj.newTile.fbS = 0;
    paramObj.newTile.sId = currTs.toString();

    // construct a proper public url
    paramObj.newTile.pUl = '/t/'+paramObj.newTile.authorName+'/'+currTs+'/'+paramObj.newTile.pUl;

    // delete the authorName param as it was just used as a helper
    delete paramObj.newTile.authorName;

    // save the new tile to the model provider
    log.info('Controller for /tile/save > now save the new Tile to the Model provider');

    Tile.save(paramObj, function (err, result) {
        if (helper.handleApiResponseIssues(res, err, result, true)) {
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(result);
    });
  }

  imgUploadDone = function(filename) {
    log.info('Controller for /tile/save > imgUploadDone flagging');

    imgUploadCompleted = true;
    imgFileName = filename;

    if (paramObjGot) {
        saveThatTile();
    }
  }

  paramObjReceived = function(filename) {
    log.info('Controller for /tile/save > paramObjReceived flagging');

    paramObjGot = true;

    if (imgUploadCompleted) {
        saveThatTile();
    }
  }

  if (req.busboy) {
	console.log('*********************** ', config.thumbyRoot);

    if (config.thumbyRoot  !== '') {
        log.info('Controller for /tile/save > Using Thumby to save the images');

        req.pipe(request(config.thumbyRoot + '/thumbs/create')).on('data', function(data) {
          var thumbySaveResponse = JSON.parse(data.toString());

          log.info('Controller for /tile/save > Thumby responsed after being asked to save. response is :' + inspect(thumbySaveResponse));

          if (thumbySaveResponse.ok) {
            log.info('Controller for /tile/save > Thumby saving is a success');

            imgUploadDone(config.thumbyRoot + '/thumbs/img-size-here/' + thumbySaveResponse.filename);
          }
        }).on('end', function(data) {});
    }
    else {
      log.info('Controller for /tile/save > Using S3 to save the images');

      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        log.info('Controller for /tile/save > busboy file receiving for S3 piping');

        // construct unique file name for S3
        var uFileName = filename.substring(filename.lastIndexOf('.'), filename.length);
        uFileName = currTs.toString() + uFileName;

        var s3obj = new AWS.S3({params: {Bucket: config.aws.s3Bucket, Key: uFileName}});

            // upload to S3
            s3obj.upload({
                Body: file,
                ContentType: mimetype,
                CacheControl: 'public, max-age=31536000',
                ACL: 'public-read'
              }).
                on('httpUploadProgress', function(evt) {
                  log.info('Controller for /tile/save > S3 saving progress : ' + evt);
                }).
                  send(function(err, data) {
                    log.info('Controller for /tile/save > S3 saving done response received');

                    if (err) {
                      log.fatal('Controller for /tile/save > There was an error working with S3! = ' + err);

                      res.status(500).send('Controller Error, Server error saving image to S3 ' + err);
                    }
                    else {
                      log.info('Controller for /tile/save > S3 saving is a success');

                      imgUploadDone(data.Location);// S3 img URL
                    }
                  });
      });

    } // end thumby check

    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      log.info('Controller for /tile/save > busboy field received : ' + 'Field [' + fieldname + ']: value: ' + inspect(val));

      paramObj.newTile = JSON.parse(val);

      paramObjReceived();
    });

    req.busboy.on('finish', function() {
      log.info('Controller for /tile/save > busboy middleware processing done');
    });

    log.info('Controller for /tile/save > start process to save');

    req.pipe(req.busboy);
  }
  else {
      log.fatal('Controller for /tile/save > Save new tile could not be done as busboy not found in web request');
  }
});

router.put('/tile/save', function(req, res) {
  var paramObj = req.body;

  Tile.edit(paramObj, function (err, result) {
      if (helper.handleApiResponseIssues(res, err, result, true)) {
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(result);
  });
});


// LISTS
router.post('/related', function(req, res) {
  var paramObj = req.body;

  Tile.related(paramObj, function (err, result) {
      if (helper.handleApiResponseIssues(res, err, result, true)) {
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(result);
  });
});

router.post('/discovery', function(req, res) {
  var paramObj = req.body;

  Tile.discovery(paramObj, function (err, result) {
      if (helper.handleApiResponseIssues(res, err, result, true)) {
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(result);
  });
});

module.exports = router;