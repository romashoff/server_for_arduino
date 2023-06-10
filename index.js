
let start = new Date();
start.setUTCHours(0, 0, 0, 0);
let end = new Date();
end.setUTCHours(23, 59, 59, 999);
start = start.toISOString().replace("T", " ").replace(".000Z", "");
end = end.toISOString().replace("T", " ").replace(".999Z", "");
let currentDayStatics = [];
let currentDayAverages = {
    tempPerHour: 0,
    humidPerHour: 0,
    tempPerDay: 0,
    humidPerDay: 0,
};
let lastStatistic = {
    date: null,
    temp: "",
    humid: "",
    info: "",
}

let button = "off";
const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "rsroma3n.beget.tech",
    user: "rsroma3n_romrom",
    password: "JaYXbX&6",
    database: "rsroma3n_romrom"
});
function initList() {

    function a(err, result, fields) {
        if (err) throw err;
        if (result.length) {
            result.map(x => {
                currentDayStatics.push({...x})
            })
            lastInfo()
            dayAverages()
        }
    }

    getFiltered(start, end, a)

}



const {Server} = require("socket.io");
const app = express();
app.use(express.static(__dirname + '/site'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const http = require('http');
const server = http.createServer(app);
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/site/index.html');
});
app.post('/enc_write.php', (req, res) => {
    let body = req.body;//Тут мы получаем тело запроса
    insertStatic(parseInt(body.temp), parseInt(body.humid), body.info)
    res.send(`<${button}>`);
});

io.on('connection', (socket) => {
    socket.emit("statistic", {lastStatistic, currentDayAverages, button});
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on("led",()=>{
        button = button === "off" ? "on" : "off";
    })
    socket.on("search",(data,fn)=>{
        getSearch(data,(err, result, fields)=> {
            if (err) throw err;
            fn(result)
        })
    })
    console.log('a user connected');
});
setInterval(() => {
    io.emit("statistic", {lastStatistic, currentDayAverages, button});
}, 500)

server.listen(3000, () => {
    console.log('listening on *:3000');
});


const getSearch = (date, cb) => {
    date = date.replace("T"," ");
    con.connect(function (err) {
        con.query(`SELECT *
                   FROM history
                   WHERE time_create LIKE  '%${date}%'
                   ORDER BY time_create DESC`,
            cb);

    })
}
const getFiltered = (min_date, max_date, cb) => {
    con.connect(function (err) {

        con.query(`SELECT *
                   FROM history
                   WHERE (time_create BETWEEN '${min_date}' AND '${max_date}')
                   ORDER BY time_create DESC`,
            cb);

    })
}
const insertStatic = (temp, humid, info) => {
    let time_create = new Date();
    time_create = time_create.toISOString().replace("T", " ").replace("Z", "");

    currentDayStatics = prepend({
        temp, humid, info, time_create
    }, currentDayStatics)
    lastInfo()
    dayAverages()
    con.connect(function (err) {
        con.query(`INSERT INTO history (temp, humid, info, time_create)
                   VALUES (${temp}, ${humid}, "${info}", CURRENT_TIMESTAMP)`,
            function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);

            });
    })
}
const dayAverages = () => {
    if (!currentDayStatics.length) {
        currentDayAverages = {
            tempPerHour: "Н/Д",
            humidPerHour: "Н/Д",
            tempPerDay: "Н/Д",
            humidPerDay: "Н/Д",
        }
    } else {
        if (currentDayStatics.length < 720) {
            currentDayAverages.tempPerHour = "Н/Д";
            currentDayAverages.humidPerHour = "Н/Д";
        } else {
            const slicedArray = currentDayStatics.slice(0, 720);
            let avTemp = ((slicedArray.reduce((partialSum, a) => partialSum + a.temp, 0)) / 720).toFixed(2)
            let avHumid = ((slicedArray.reduce((partialSum, a) => partialSum + a.humid, 0)) / 720).toFixed(2)
            currentDayAverages.tempPerHour = avTemp;
            currentDayAverages.humidPerHour = avHumid;
        }
        let avTemp = ((currentDayStatics.reduce((partialSum, a) => partialSum + a.temp, 0)) / currentDayStatics.length).toFixed(2)
        let avHumid = ((currentDayStatics.reduce((partialSum, a) => partialSum + a.humid, 0)) / currentDayStatics.length).toFixed(2)
        currentDayAverages.tempPerDay = avTemp;
        currentDayAverages.humidPerDay = avHumid;
    }
}
const lastInfo = () => {
    if (!currentDayStatics.length) {
        lastStatistic = {
            date: "Н/Д",
            temp: "Н/Д",
            humid: "Н/Д",
            info: "Н/Д",
        }
    } else {
        lastStatistic = {
            date: currentDayStatics[0].time_create,
            temp: currentDayStatics[0].temp,
            humid: currentDayStatics[0].humid,
            info: currentDayStatics[0].info,
        }
    }
}

function prepend(value, array) {
    var newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}

initList();