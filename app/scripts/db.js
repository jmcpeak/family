'use strict';
/* jslint -W117 */

angular.module('jmDB', [])

    .service('db', function () {

        AWS.config.region = 'us-west-1';
        AWS.config.update({
            accessKeyId: 'AKIAIVDNGMPTDA7FTXQA',
            secretAccessKey: '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'
        });

        dynamoDB = new AWS.DynamoDB({region: 'us-west-2'});
    });
