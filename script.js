const five = require('johnny-five');
const axios = require('axios');
const scroll = require('lcd-scrolling');
const board = new five.Board();

const URL = 'https://ll.thespacedevs.com/2.0.0/launch/upcoming';


// init board
board.on("ready", function () {
    console.log('Ready');

    //set piezo hardware to Digital bus
    piezo = new five.Piezo({
        pin: 6
    });

    //set 2x16 LCD  hardware in Digital bus
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

    // LCD scroll patch - johnny five autoscroll not working
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

    // allows CLI commands
    this.repl.inject({
        lcd: lcd,
        piezo: piezo
    });


    axios.get(URL)
        .then(response => {

            let launch_prov = response.data.results[0].launch_service_provider.name;
            let launch_mission = response.data.results[0].mission.name;
            let launch_time = response.data.results[0].net;

            let countDownDate = new Date(launch_time).getTime();

            let interval = setInterval(() => {

                // let now = new Date().getTime();

                // let distance = countDownDate - now;
                let distance = 0;

                let d = Math.floor(distance / (1000 * 60 * 60 * 24));
                let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let s = Math.floor((distance % (1000 * 60)) / 1000);

                let countdown = d + 'd ' + h + 'h ' +
                    m + 'm ' + s + 's ';

                scroll.line(1, countdown === NaN || null ? 'no countdown found' : countdown);
            }, 1000);

            // when countdown finish alarm goes off and clears LCD
            if (distance <= 0) {
                clearInterval(interval);
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
                scroll.line(0, '--------');
                scroll.line(1, 'lift off!');
            }

            scroll.line(0, launch_prov === undefined || null ? 'no info' : launch_prov + ' - ' + launch_mission);

        }).catch(e => {
            console.log(e)
            scroll.line(0, 'Something went wrong');
        });
});