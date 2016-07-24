'use strict';

import 'aws-sdk/dist/aws-sdk';
const AWS = window.AWS;

export default angular.module('jmAWS', [])

    .config(() => {
        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            AccountId: '754934490052',
            IdentityPoolId: 'us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150',
            RoleArn: 'arn:aws:iam::754934490052:role/Cognito_mcpeakfamilyUnauth_DefaultRole',
            RoleSessionName: 'web'
        });
    })

    .service('jmDBUtils', function () {

        this.arrayConverter = (data) => {
            let data_out = [];

            if (!data)
                return data_out;

            for (let i = 0; i < data.length; i++) {
                data_out.push(this.objectConverter(data[i]));
            }

            return data_out;
        };

        this.objectConverter = (data) => {
            let data_out = {};

            if (!data)
                return data_out;

            Object.keys(data).forEach((key) => {
                let val = data[key];

                if (!!val.S)
                    data_out[key] = val.S;
                else if (!!val.N)
                    data_out[key] = parseInt(val.N);
                else if (!!val.BOOL)
                    data_out[key] = (val.BOOL);
                else if (!!val.SS)
                    data_out[key] = val.SS;
                else if (!!val.NS) {
                    let val_arr = [];
                    for (let j = 0; j < val.NS.length; j++) {
                        val_arr.push(parseInt(val.NS[j]));
                    }
                    data_out[key] = val_arr;
                } else if (!!val.BS) {
                    let val_arr2 = [];
                    for (let j = 0; j < val.BS.length; j++) {
                        val_arr2.push((val.BS[j].toLowerCase() === 'true'));
                    }
                    data_out[key] = val_arr2;
                }
            });

            return data_out;
        };

        this.convertFromJson = (data) => {
            /* jshint -W109 */
            let data_out = {};

            if (!data)
                return data_out;

            Object.keys(data).forEach((key) => {
                let subObj = {};
                let val = data[key];

                if (!(typeof val === 'undefined' || (!val && typeof val !== 'boolean')))
                    subObj = null;

                if (typeof val === 'boolean')
                    subObj = {'BOOL': val};
                else if (typeof val === 'string') {
                    let value = val.toString();
                    subObj = (value === '') ? {"NULL": true} : {"S": value};
                }
                else if (typeof val === 'number')
                    subObj = {"N": val.toString()};
                else if (typeof val === 'object') {
                    if (Array.isArray(val) && val.length >= 1) {
                        let subObjKey = null;
                        subObj = {};
                        if (typeof val[0] === 'boolean')
                            subObjKey = "BS";
                        else if (typeof val[0] === 'string')
                            subObjKey = "SS";
                        else if (typeof val[0] === 'number')
                            subObjKey = "NS";

                        if (!!subObjKey) {
                            let subObjArr = [];
                            for (let i = 0; i < val.length; i++) {
                                subObjArr.push(val[i].toString());
                            }
                            subObj[subObjKey] = subObjArr;
                        }
                    }
                } else
                    subObj = null;

                if (!!subObj)
                    data_out[key] = subObj;
            });

            return data_out;
        };
    })

    .service('jmDB', function ($q, $location, $log, jmDBUtils) {
        let minLengthId = 15,
            tableName = $location.$$path === '/test/' || $location.$$path === '/test' ? 'test' : 'mcpeak',
            dynamoDB = new AWS.DynamoDB({region: 'us-west-2'}),
            users = {};

        this.guid = () => {
            let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };

        this.queryAll = () => {
            let defer = $q.defer(),
                params = {
                    TableName: tableName,
                    FilterExpression: 'size(id) > :size',
                    ExpressionAttributeValues: {
                        ':size': {N: minLengthId.toString()}
                    }
                };

            dynamoDB.scan(params, (err, data) => {
                if (err)
                    defer.reject(err);
                else
                    defer.resolve(jmDBUtils.arrayConverter(data.Items));
            });

            return defer.promise;
        };

        this.queryParents = (gender) => {
            let deferred = $q.defer(),
                params = {
                    TableName: tableName,
                    FilterExpression: 'gender = :gender OR genderSpouse = :gender',
                    ExpressionAttributeValues: {
                        ':gender': {S: gender}
                    }
                };

            dynamoDB.scan(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
            });

            return deferred.promise;
        };

        this.getEmailAddresses = () => {
            let deferred = $q.defer(),
                params = {
                    TableName: tableName,
                    ProjectionExpression: 'email',
                    FilterExpression: 'attribute_exists(email) AND size(email) > :size',
                    ExpressionAttributeValues: {
                        ':size': {N: '4'}
                    }
                };

            dynamoDB.scan(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
            });

            return deferred.promise;
        };

        this.exportToCSV = () => {
            let deferred = $q.defer(),
                headers = [],
                query = {
                    TableName: tableName,
                    ProjectionExpression: 'firstName, lastName, email, phone, address, address2, city, theState, zipcode, country',
                    FilterExpression: 'size(id) > :size',
                    ExpressionAttributeValues: {
                        ':size': {N: minLengthId.toString()}
                    }
                },
                arrayToCSV = (array_input) => {
                    let string_output = '';

                    for (let i = 0; i < array_input.length; i++) {

                        try {
                            string_output += ('"' + array_input[i].replace('"', '\"') + '"');
                        } catch (e) {
                            $log.error(e);
                        }

                        if (i !== array_input.length - 1)
                            string_output += ',';
                    }

                    return string_output;
                },
                printout = (items) => {
                    let headersMap = {},
                        values = [],
                        header,
                        value;

                    if (headers.length === 0) {
                        if (items.length > 0) {
                            for (let j = 0; j < items.length; j++) {
                                for (let key in items[j]) {
                                    headersMap[key] = true;
                                }
                            }
                        }

                        for (let key2 in headersMap) {
                            headers.push(key2);
                        }
                    }

                    for (let index in items) {
                        let line = [];
                        for (let i = 0; i < headers.length; i++) {
                            value = '';
                            header = headers[i];

                            // Loop through the header rows, adding values if they exist
                            if (items[index].hasOwnProperty(header)) {
                                if (items[index][header].N)
                                    value = items[index][header].N;
                                else if (items[index][header].S)
                                    value = items[index][header].S;
                                else if (items[index][header].SS)
                                    value = items[index][header].SS.toString();
                            }
                            line.push(value);
                        }
                        values += arrayToCSV(line) + '\r\n';
                    }

                    return arrayToCSV(headers) + '\r\n' + values;
                },
                scanDynamoDB = () => {
                    dynamoDB.scan(query, (err, data) => {
                        if (!err) {
                            if (data.LastEvaluatedKey) {
                                query.ExclusiveStartKey = data.LastEvaluatedKey;
                                scanDynamoDB(query);
                            }
                            deferred.resolve(printout(data.Items));
                        } else {
                            deferred.reject(err);
                            $log.error(err.message);
                        }
                    });

                    return deferred.promise;
                };

            return scanDynamoDB();
        };

        this.putItem = (user) => {
            let deferred = $q.defer(),
                convertedItem = jmDBUtils.convertFromJson(user),
                params = {
                    TableName: tableName,
                    Item: convertedItem
                };

            if (user.$$hashKey)
                delete user.$$hashKey;

            dynamoDB.putItem(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                    this.setLastUpdateDate(convertedItem.id).then(undefined, () => $log.warn('error setting last update date'));
                }
            });

            return deferred.promise;
        };

        this.setLastUpdateDate = (id) => {
            let deferred = $q.defer(),
                params = {
                    TableName: tableName,
                    Key: {id: {S: 'lastUpdateDate'}},
                    UpdateExpression: 'set lastUpdated = :num, lastUpdatedID = :id',
                    ExpressionAttributeValues: {
                        ':num': {N: Date.now().toString()},
                        ':id': id
                    }
                };

            dynamoDB.updateItem(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve(jmDBUtils.objectConverter(data));
            });

            return deferred.promise;
        };

        this.deleteItem = (user) => {
            let deferred = $q.defer(),
                params = {
                    TableName: tableName,
                    Key: {
                        id: {
                            S: user.id.toString()
                        }
                    }
                };

            dynamoDB.deleteItem(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
            });

            return deferred.promise;
        };

        this.getItem = (id) => {
            let deferred = $q.defer(),
                params = {
                    TableName: tableName,
                    Key: {
                        id: {
                            S: id.toString()
                        }
                    }
                };

            dynamoDB.getItem(params, (err, data) => {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
            });

            return deferred.promise;
        };

        this.addCachedItem = (user) => users[user.id] = user;

        this.getCachedItem = (id) => users[id];
    }).name;