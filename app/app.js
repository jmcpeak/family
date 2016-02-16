'use strict';

import moment from "moment";
import user from "./user";
import md from "angular-material";
import messages from "angular-messages";
import input from "./input";
import list from "./list";
import "ngstorage";
import "angular-material/angular-material.min.css";

angular.module('app', [md, messages, input, list, user, 'ngStorage'])

    .constant('jmConstant', {
        userIdHash: '#user-',
        googleMapsBase: 'https://www.google.com/maps/place/',
        streetViewBase: 'https://maps.googleapis.com/maps/api/streetview?location=',
        streetViewSuffix: '&size=450x250',
        genders: [
            {name: '', key: ''},
            {name: 'Male', key: 'm'},
            {name: 'Female', key: 'f'}],
        states: [
            {name: '', abbreviation: ''},
            {name: 'ALABAMA', abbreviation: 'AL'},
            {name: 'ALASKA', abbreviation: 'AK'},
            {name: 'AMERICAN SAMOA', abbreviation: 'AS'},
            {name: 'ARIZONA', abbreviation: 'AZ'},
            {name: 'ARKANSAS', abbreviation: 'AR'},
            {name: 'CALIFORNIA', abbreviation: 'CA'},
            {name: 'COLORADO', abbreviation: 'CO'},
            {name: 'CONNECTICUT', abbreviation: 'CT'},
            {name: 'DELAWARE', abbreviation: 'DE'},
            {name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
            {name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
            {name: 'FLORIDA', abbreviation: 'FL'},
            {name: 'GEORGIA', abbreviation: 'GA'},
            {name: 'GUAM', abbreviation: 'GU'},
            {name: 'HAWAII', abbreviation: 'HI'},
            {name: 'IDAHO', abbreviation: 'ID'},
            {name: 'ILLINOIS', abbreviation: 'IL'},
            {name: 'INDIANA', abbreviation: 'IN'},
            {name: 'IOWA', abbreviation: 'IA'},
            {name: 'KANSAS', abbreviation: 'KS'},
            {name: 'KENTUCKY', abbreviation: 'KY'},
            {name: 'LOUISIANA', abbreviation: 'LA'},
            {name: 'MAINE', abbreviation: 'ME'},
            {name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
            {name: 'MARYLAND', abbreviation: 'MD'},
            {name: 'MASSACHUSETTS', abbreviation: 'MA'},
            {name: 'MICHIGAN', abbreviation: 'MI'},
            {name: 'MINNESOTA', abbreviation: 'MN'},
            {name: 'MISSISSIPPI', abbreviation: 'MS'},
            {name: 'MISSOURI', abbreviation: 'MO'},
            {name: 'MONTANA', abbreviation: 'MT'},
            {name: 'NEBRASKA', abbreviation: 'NE'},
            {name: 'NEVADA', abbreviation: 'NV'},
            {name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
            {name: 'NEW JERSEY', abbreviation: 'NJ'},
            {name: 'NEW MEXICO', abbreviation: 'NM'},
            {name: 'NEW YORK', abbreviation: 'NY'},
            {name: 'NORTH CAROLINA', abbreviation: 'NC'},
            {name: 'NORTH DAKOTA', abbreviation: 'ND'},
            {name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
            {name: 'OHIO', abbreviation: 'OH'},
            {name: 'OKLAHOMA', abbreviation: 'OK'},
            {name: 'OREGON', abbreviation: 'OR'},
            {name: 'PALAU', abbreviation: 'PW'},
            {name: 'PENNSYLVANIA', abbreviation: 'PA'},
            {name: 'PUERTO RICO', abbreviation: 'PR'},
            {name: 'RHODE ISLAND', abbreviation: 'RI'},
            {name: 'SOUTH CAROLINA', abbreviation: 'SC'},
            {name: 'SOUTH DAKOTA', abbreviation: 'SD'},
            {name: 'TENNESSEE', abbreviation: 'TN'},
            {name: 'TEXAS', abbreviation: 'TX'},
            {name: 'UTAH', abbreviation: 'UT'},
            {name: 'VERMONT', abbreviation: 'VT'},
            {name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
            {name: 'VIRGINIA', abbreviation: 'VA'},
            {name: 'WASHINGTON', abbreviation: 'WA'},
            {name: 'WEST VIRGINIA', abbreviation: 'WV'},
            {name: 'WISCONSIN', abbreviation: 'WI'},
            {name: 'WYOMING', abbreviation: 'WY'}
        ]
    })

    .config(($mdIconProvider, $mdDateLocaleProvider, $mdThemingProvider) => {
        $mdDateLocaleProvider.parseDate = (dateString) => moment(dateString).toDate();

        $mdIconProvider
            .iconSet('action', require('./assets/action-icons.svg'), 24)
            .iconSet('alert', require('./assets/alert-icons.svg'), 24)
            .iconSet('av', require('./assets/av-icons.svg'), 24)
            .iconSet('communication', require('./assets/communication-icons.svg'), 24)
            .iconSet('content', require('./assets/content-icons.svg'), 24)
            .iconSet('device', require('./assets/device-icons.svg'), 24)
            .iconSet('editor', require('./assets/editor-icons.svg'), 24)
            .iconSet('file', require('./assets/file-icons.svg'), 24)
            .iconSet('hardware', require('./assets/hardware-icons.svg'), 24)
            .iconSet('image', require('./assets/image-icons.svg'), 24)
            .iconSet('maps', require('./assets/maps-icons.svg'), 24)
            .iconSet('navigation', require('./assets/navigation-icons.svg'), 24)
            .iconSet('notification', require('./assets/notification-icons.svg'), 24)
            .iconSet('social', require('./assets/social-icons.svg'), 24)
            .iconSet('toggle', require('./assets/toggle-icons.svg'), 24);

        // Add to string prototype
        String.prototype.hashCode = function () {
            let hash = 0, i, chr, len;
            if (this.length === 0) {
                return hash;
            }
            for (i = 0, len = this.length; i < len; i++) {
                /* jshint -W016 */
                chr = this.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };

        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            AccountId: '754934490052',
            IdentityPoolId: 'us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150',
            RoleArn: 'arn:aws:iam::754934490052:role/Cognito_mcpeakfamilyUnauth_DefaultRole',
            RoleSessionName: 'web'
        });

        // Update the theme colors to use themes on font-icons
        // red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime,
        // yellow, amber, orange, deep-orange, brown, grey, blue-grey
        $mdThemingProvider.theme('default');

        $mdThemingProvider.theme('golf', 'default')
            .primaryPalette('teal')
            .accentPalette('indigo');

        $mdThemingProvider.theme('golf-dark', 'golf')
            .primaryPalette('green')
            .accentPalette('indigo')
            .dark();

        $mdThemingProvider.theme('dark', 'default')
            .dark();

        $mdThemingProvider.setDefaultTheme('golf');
    })

    .service('jmDB', function ($q, $location, jmDBUtils) {
        let minLengthId = 15,
            tableName = $location.$$path === '/test/' || $location.$$path === '/test' ? 'test' : 'mcpeak',
            dynamoDB = new AWS.DynamoDB({region: 'us-west-2'});

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
                },
                callback = (err, data) => {
                    if (err) {
                        defer.reject(err);
                    } else {
                        defer.resolve(jmDBUtils.arrayConverter(data.Items));
                    }
                };

            dynamoDB.scan(params, callback);

            return defer.promise;
        };

        this.queryParents = (gender) => {
            let deferred = $q.defer();

            let params = {
                TableName: tableName,
                FilterExpression: 'gender = :gender OR genderSpouse = :gender',
                ExpressionAttributeValues: {
                    ':gender': {S: gender}
                }
            };

            dynamoDB.scan(params, (err, data) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
                }
            });

            return deferred.promise;
        };

        this.getEmailAddresses = () => {
            let deferred = $q.defer();

            let params = {
                TableName: tableName,
                ProjectionExpression: 'email',
                FilterExpression: 'attribute_exists(email) AND size(email) > :size',
                ExpressionAttributeValues: {
                    ':size': {N: '4'}
                }
            };

            dynamoDB.scan(params, (err, data) => {
                if (err) {
                    deferred.reject(err);
                    console.log(err.message);
                } else {
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
                }
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
                };

            let arrayToCSV = (array_input) => {
                let string_output = '';

                for (let i = 0; i < array_input.length; i++) {

                    try {
                        string_output += ('"' + array_input[i].replace('"', '\"') + '"');
                    } catch (e) {
                        console.log(e);
                    }

                    if (i !== array_input.length - 1) {
                        string_output += ',';
                    }
                }

                return string_output;
            };

            let printout = (items) => {
                let headersMap = {};
                let values = [];
                let header;
                let value;

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
                            if (items[index][header].N) {
                                value = items[index][header].N;
                            } else if (items[index][header].S) {
                                value = items[index][header].S;
                            } else if (items[index][header].SS) {
                                value = items[index][header].SS.toString();
                            }
                        }
                        line.push(value);
                    }
                    values += arrayToCSV(line) + '\r\n';
                }

                return arrayToCSV(headers) + '\r\n' + values;
            };

            let scanDynamoDB = () => {
                dynamoDB.scan(query, (err, data) => {
                    if (!err) {
                        if (data.LastEvaluatedKey) {
                            query.ExclusiveStartKey = data.LastEvaluatedKey;
                            scanDynamoDB(query);
                        }
                        deferred.resolve(printout(data.Items));
                    } else {
                        deferred.reject(err);
                        console.log(err.message);
                    }
                });

                return deferred.promise;
            };

            return scanDynamoDB();
        };

        this.putItem = (user) => {
            let deferred = $q.defer();

            if (user.$$hashKey) {
                delete user.$$hashKey;
            }

            let convertedItem = jmDBUtils.convertFromJson(user);

            let params = {
                TableName: tableName,
                Item: convertedItem
            };

            dynamoDB.putItem(params, (err, data) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                    this.setLastUpdateDate(convertedItem.id).then(undefined, () => console.warn('error setting last update date'));
                }
            });

            return deferred.promise;
        };

        this.setLastUpdateDate = (id) => {
            let deferred = $q.defer();

            let params = {
                TableName: tableName,
                Key: {id: {S: 'lastUpdateDate'}},
                UpdateExpression: 'set lastUpdated = :num, lastUpdatedID = :id',
                ExpressionAttributeValues: {
                    ':num': {N: Date.now().toString()},
                    ':id': id
                }
            };

            dynamoDB.updateItem(params, (err, data) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data));
                }
            });

            return deferred.promise;
        };

        this.deleteItem = (user) => {
            let deferred = $q.defer();

            let params = {
                TableName: tableName,
                Key: {
                    id: {
                        S: user.id.toString()
                    }
                }
            };

            dynamoDB.deleteItem(params, (err, data) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                }
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
                },
                callback = (err, data) => {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(jmDBUtils.objectConverter(data.Item));
                    }
                };

            dynamoDB.getItem(params, callback);

            return deferred.promise;
        };
    })

    .service('jmDBUtils', function () {

        this.arrayConverter = (data) => {
            let data_out = [];

            if (!data) {
                return data_out;
            }

            for (let i = 0; i < data.length; i++) {
                data_out.push(this.objectConverter(data[i]));
            }

            return data_out;
        };

        this.objectConverter = (data) => {
            let data_out = {};

            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach((key) => {
                let val = data[key];

                if (!!val.S) {
                    data_out[key] = val.S;
                } else if (!!val.N) {
                    data_out[key] = parseInt(val.N);
                } else if (!!val.BOOL) {
                    data_out[key] = (val.BOOL);
                } else if (!!val.SS) {
                    data_out[key] = val.SS;
                } else if (!!val.NS) {
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
            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach((key) => {
                let subObj = {};
                let val = data[key];

                if (!(typeof val === 'undefined' || (!val && typeof val !== 'boolean'))) {
                    subObj = null;
                }

                if (typeof val === 'boolean') {
                    subObj = {'BOOL': val};
                }
                else if (typeof val === 'string') {
                    let value = val.toString();
                    subObj = (value === '') ? {"NULL": true} : {"S": value};
                }
                else if (typeof val === 'number') {
                    subObj = {"N": val.toString()};
                }
                else if (typeof val === 'object') {
                    if (Array.isArray(val) && val.length >= 1) {
                        let subObjKey = null;
                        subObj = {};
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
                            let subObjArr = [];
                            for (let i = 0; i < val.length; i++) {
                                subObjArr.push(val[i].toString());
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
