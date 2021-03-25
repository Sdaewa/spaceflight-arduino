var express = require('express');
const five = require('johnny-five');
const app = express();
const axios = require('axios');
const scroll = require('lcd-scrolling');
const _ = require('underscore');

const server = require('http').Server(app);
const port = 3000;

const URL = 'http://jsonplaceholder.typicode.com/';

const board = new five.Board();

board.on("ready", function () {
    console.log('Ready')

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
    // });

    scroll.setup({
        lcd: lcd,
        /* Required */

        // Optional parameters defaults
        // debug: false, - true will enable console.log()
        // char_length: 16, - Number of characters per line on your LCD
        // row: 2, - Number of rows on your LCD
        // firstCharPauseDuration: 4000, - Duration of the pause before your text start scrolling. Value in ms
        // lastCharPauseDuration: 1000, - Duration to wait before restarting the animation
        // scrollingDuration: 300, - Time per step (speed of the animation).
        // full: true - Extend text with white space to be animated out of the screen completely
    });


    scroll.line(0, "Text of the first line");
    scroll.line(1, "something");

    this.repl.inject({
        lcd: lcd
    });

    // app.get('/', function (req, resp) {
    // request({
    //     url: 'http://jsonplaceholder.typicode.com/',
    //     json: true
    // }, function (error, response, body) {


    //     // resp.json(response);

    //     // console.log(response);

    //     lcd.clear().print(response);
    // });

    app.get('/', (req, res) => {
        axios.get(URL)
            .then(response => {
                // handle success
                scroll.line(0, response);
                scroll.line(1, "something");
            })
    })

    // });
    app.listen(port);

});