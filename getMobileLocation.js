'use strict';

var fs = require('fs');
const request = require('request');
const co = require('co');
// const mobiles = require('./mobile.json').mobiles;
const mobiles = require('./tttt.json').mobiles;
const _ = require('lodash');
var iconv = require('iconv-lite');


let url = `http://www.ip138.com:8080/search.asp?action=mobile&mobile=`;

// _(mobiles).filter(

// );
function removeOutletChars(s) {
    return s.replace(/\s/g, '').replace(/<.*>/, '').replace('&nbsp;', '\t').replace('-->', '');
}
function mobileNumberInSZArea(mobile, callback) {
    request({
        method: 'GET',
        uri: `http://www.ip138.com:8080/search.asp`,
        qs: { action: 'mobile', mobile: mobile },
        encoding: null
    }
        , function (error, response, body) {
            if (error) {
                // console.error('send request failed:', error);
                return callback(error);
            }
            // console.log('Response code:', response.statusCode);
            if (response.statusCode != 200) {
                return callback(new Error('statusCode!=200'));
            }
            const content = iconv.decode(body, 'gb2312').toString('utf8');
            const s = `广东&nbsp;深圳市`;
            // return content.indexOf(s) >= 0;
            const beginTag = `卡号归属地</TD>`;
            const endTag = `</TD>`;
            const begin = content.indexOf(beginTag) + beginTag.length;
            const end = content.indexOf(endTag, begin);
            const res = removeOutletChars(content.substring(begin, end));

            // console.log(content);
            // console.log("------------------------------------");
            // console.log(res);
            // console.log("------------------------------------");
            // console.log(begin, end, beginTag.length);
            return callback(null, res);
        });
}

function mobileNumberInSZAreaAsync(mobile) {
    return new Promise(function (resolve, reject) {
        mobileNumberInSZArea(mobile, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    });
}

function setTimeoutAsync(interval) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            return resolve('');
        }, interval);
    });
}

// mobileNumberInSZArea('13140355645', (err, data) => {
//     if (err) {
//         console.error('Error: ' + err);
//     } else {
//         console.log(data);
//     }
// });

// setTimeoutAsync(500).then(() => {
//     return mobileNumberInSZAreaAsync('18620361782');
// }).then((data) => {
//     console.log(data);
// }).catch((err) => {
//     console.error('Error: ' + err);
// });

let res = 'mobile\tarea\n';

co(function* () {
    try {
        for (var mobile of mobiles) {
            const none = yield setTimeoutAsync(500);
            const area = yield mobileNumberInSZAreaAsync(mobile);
            console.log(`${mobile}\t${area}`);
            res += `${mobile}\t${area}\n`;
        }
    } catch (err) {
        console.log(err);
        return;
    }
    fs.writeFile('./active.txt', res, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('write file success');
        }
    });
});

