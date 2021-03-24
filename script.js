var express = require('express');
const five = require('johnny-five');
const app = express();
const axios = require('axios');
const _ = require('underscore');

const server = require('http').Server(app);
const port = 5000;

const board = new five.Board();

board.on("ready", function () {

    lcd = new five.LCD({
        pins: [12, 11, 5, 4, 3, 2],
        backlight: 6,
        rows: 2,
        cols: 16
        // Options:
        // bitMode: 4 or 8, defaults to 4
        // lines: number of lines, defaults to 2
        // dots: matrix dimensions, defaults to "5x8"
    });
    // this.wait(3000, function () {
    //     lcd.clear().cursor(0, 0)
    //     lcd.autoscroll().print("Bloop").print("Bleep");

    // });

    this.repl.inject({
        lcd: lcd
    });

    app.get('/posts', function (req, resp) {
        request({
            url: 'http://jsonplaceholder.typicode.com/',
            json: true
        }, function (error, response, body) {


            resp.json(response);

            console.log(response);

            lcd.clear().print(response);
        });
    });

});