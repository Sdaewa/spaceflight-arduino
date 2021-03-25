var express = require('express');
const five = require('johnny-five');
const app = express();
const axios = require('axios');
const scroll = require('lcd-scrolling');
// const countdown = require('countdown');


const server = require('http').Server(app);
const port = 3000;

const URL = 'https://ll.thespacedevs.com/2.0.0/launch/upcoming';

const board = new five.Board();

board.on("ready", function () {
    console.log('Ready');

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

    scroll.setup({
        lcd: lcd,
        /* Required */

        // Optional parameters defaults
        // debug: true, - true will enable console.log()
        // char_length: 16, - Number of characters per line on your LCD
        // row: 2, - Number of rows on your LCD
        // firstCharPauseDuration: 4000, - Duration of the pause before your text start scrolling. Value in ms
        // lastCharPauseDuration: 1000, - Duration to wait before restarting the animation
        // scrollingDuration: 300, - Time per step (speed of the animation).
        // full: true - Extend text with white space to be animated out of the screen completely
    });

    this.repl.inject({
        lcd: lcd
    });

    app.get('', (req, res) => {
        axios.get(URL)
            .then(response => {
                // console.log(response.data.results[0].net)

                let launch_prov = response.data.results[3].launch_service_provider.name;
                let launch_time = response.data.results[3].net;

                let countDownDate = new Date(launch_time).getTime();

                let x = setInterval(() => {

                    let now = new Date().getTime();

                    let distance = countDownDate - now;

                    let d = Math.floor(distance / (1000 * 60 * 60 * 24));
                    let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    let s = Math.floor((distance % (1000 * 60)) / 1000);

                    scroll.line(1, d + "d " + h + "h " +
                        m + "m " + s + "s ");

                    if (distance < 0) {
                        clearInterval(x);
                        scroll.line(1, "EXPIRED");
                    }
                }, 1000);


                scroll.line(0, launch_prov === undefined || null ? 'no info' : launch_prov);


            }).catch(e => {
                console.log(e)
            });
    });


    app.listen(port);

    process.on("SIGINT", (_) => {
        lcd.off();
        process.exit();
    });
});