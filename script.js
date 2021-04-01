const five = require('johnny-five');
const axios = require('axios');
const scroll = require('lcd-scrolling');

const URL = 'https://ll.thespacedevs.com/2.0.0/launch/upcomings';


const board = new five.Board();

board.on("ready", function () {
    console.log('Ready');

    lcd = new five.LCD({
        pins: [12, 11, 5, 4, 3, 2],
        backlight: 6,
        rows: 2,
        cols: 16,
        // Options:
        // bitMode: 4 or 8, defaults to 4
        // lines: number of lines, defaults to 2
        // dots: matrix dimensions, defaults to "5x8"
    });

    piezo = new five.Piezo({
        pin: 6
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

    axios.get(URL)
        .then(response => {

            let launch_prov = response.data.results[4].launch_service_provider.name;
            let launch_mission = response.data.results[4].mission.name;
            let launch_time = response.data.results[4].net;

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

                if (distance <= 0) {
                    scroll.line(1, "LIFT OFF!");
                    piezo.play({
                        tempo: 150,
                        song: [
                            ["c4", 1],
                            ["e4", 2],
                            ["g4", 3],
                            ["c4", 1],
                            ["e4", 2],
                            ["g4", 3]
                        ]
                    });
                    clearInterval(x);
                }
            }, 1000);


            scroll.line(0, launch_prov === undefined || null ? 'no info' : launch_prov + ' - ' + launch_mission);

        }).catch(e => {
            console.log(e)
        });
});