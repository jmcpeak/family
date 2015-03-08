'use strict';
/* jslint -W117 */

angular.module('jmDB', [])

    .config(function () {
        AWS.config.region = 'us-west-2';
        AWS.config.update({
            accessKeyId: 'AKIAIVDNGMPTDA7FTXQA',
            secretAccessKey: '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'
        });
    })

    .service('jmDB', function ($q, jmDBUtils) {
        var tableName = 'test';
        var dynamoDB = new AWS.DynamoDB({region: 'us-west-2'});

        this.queryAll = function () {
            var deferred = $q.defer();

            dynamoDB.scan({TableName: tableName}, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
                }
            });

            return deferred.promise;
        };

        this.getUser = function (id) {
            var deferred = $q.defer();

            var params = {
                TableName: tableName,
                Key: {
                    id: {
                        S: id.toString()
                    }
                }
            };

            dynamoDB.getItem(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                }
            });

            return deferred.promise;
        };
    })

    .service('jmDBUtils', function () {

        this.arrayConverter = function (data) {
            var data_out = [];

            if (!data) {
                return data_out;
            }

            for (var i = 0; i < data.length; i++) {
                data_out.push(this.objectConverter(data[i]));
            }

            return data_out;
        };

        this.objectConverter = function (data) {
            var data_out = {};

            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach(function (key) {
                var val = data[key];

                if (!!val.S) {
                    data_out[key] = val.S;
                } else if (!!val.N) {
                    data_out[key] = parseInt(val.N);
                } else if (!!val.B) {
                    data_out[key] = (val.B.toLowerCase() === 'true');
                } else if (!!val.SS) {
                    data_out[key] = val.SS;
                } else if (!!val.NS) {
                    var val_arr = [];
                    for (var j = 0; j < val.NS.length; j++) {
                        val_arr.push(parseInt(val.NS[j]));
                    }
                    data_out[key] = val_arr;
                } else if (!!val.BS) {
                    var val_arr2 = [];
                    for (var jj = 0; jj < val.BS.length; jj++) {
                        val_arr2.push((val.BS[jj].toLowerCase() === 'true'));
                    }
                    data_out[key] = val_arr2;
                }
            });

            return data_out;
        };

        this.convertFromJson = function (data) {
            var data_out = {};
            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach(function (key) {
                var subObj = {};
                var val = data[key];
                // if
                if (!(typeof val === 'undefined' || (!val && typeof val !== 'boolean'))) {
                    subObj = null;
                }

                if (typeof val === 'boolean') {
                    subObj = {"B": val.toString()};
                }
                else if (typeof val === 'string') {
                    subObj = {"S": val.toString()};
                }
                else if (typeof val === 'number') {
                    subObj = {"N": val.toString()};
                }
                else if (typeof val === 'object') {
                    if (Array.isArray(val) && val.length >= 1) {
                        var subObjKey = null;
                        if (typeof val[0] === 'boolean') {
                            subObjKey = "BS";
                        }
                        else if (typeof val[0] === 'string') {
                            subObjKey = "SS";
                        }
                        else if (typeof val[0] === 'number') {
                            subObjKey = "NS";
                        }

                        if (!!subObjKey) {
                            var subObjArr = [];
                            for (var i = 0; i < val.length; i++) {
                                subObjArr.push(val.toString());
                            }
                            subObj[subObjKey] = subObjArr;
                        }
                    }
                } else {
                    subObj = null;
                }

                if (!!subObj) {
                    data_out[key] = subObj;
                }
            });

            return data_out;
        };
    });
