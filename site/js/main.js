let root = document.getElementById('root');

//Получение данных
async function loadData() {
    const response = await fetch('/api.php');
    const data = await response.json();
    
    loadTable(data);
    sort();
    lastValue(data);
}

//Создание таблицы
function createTable() {
    let h2 = document.createElement('h2');
    let div = document.createElement('div');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let thTempHour = document.createElement('th');
    let thHuimHour = document.createElement('th');
    let thTempDay = document.createElement('th');
    let thHuimDay = document.createElement('th');

    div.id = 'averages';
    h2.textContent = 'Средние значения';
    table.id = 'table';
    table.classList.add('table');
    thTempHour.textContent = 'Температура ср/ч';
    thHuimHour.textContent = 'Влажность ср/ч';
    thTempDay.textContent = 'Температура ср/сут';
    thHuimDay.textContent = 'Влажность ср/сут';
    thTempHour.classList.add('thead');
    thHuimHour.classList.add('thead');
    thTempDay.classList.add('thead');
    thHuimDay.classList.add('thead');

    thead.append(thTempHour);
    thead.append(thHuimHour);
    thead.append(thTempDay);
    thead.append(thHuimDay);
    table.append(thead);
    div.append(h2);
    div.append(table);
    root.append(div);

    //Маска для даты
    /* let inputTels = document.querySelectorAll("input[type='text']");
    if (inputTels.length > 0) {
        let im = new Inputmask("99:99:99");
        for (let tel of inputTels) {
            im.mask(tel);
        }
    } */
}

//Наполнение таблицы
function loadTable(data) {
    let tr = document.createElement('tr');
    let tdTempHour = document.createElement('td');
    let tdHuimHour = document.createElement('td');
    let tdTempDay = document.createElement('td');
    let tdHuimDay = document.createElement('td');
    let tables = document.getElementById('table');


    tdTempHour.id = 'tempHour';
    tdHuimHour.id = 'huimHour';
    tdTempDay.id = 'tempDay';
    tdHuimDay.id = 'huimDay';

    let tempMiddleHour = data.tempMiddleHour;
    let huimMiddleHour = data.huimMiddleHour;
    let temp = data.temp;
    let huim = data.huim;
    let tempMiddleDay = data.tempMiddleDay;
    let huimMiddleDay = data.huimMiddleDay;
    let tempDay = data.tempDay;
    let huimDay = data.huimDay;

    //Считаем среднее за час температура
    /*if (data.length < 720) {
        tempMiddleHour = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 720; i--) {
            temp += +data[i].temp;
            tempMiddleHour = (temp / 720).toFixed(3);
        }
    }

    //Считаем среднее за час влажность
    if (data.length < 720) {
        huimMiddleHour = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 720; i--) {
            huim += +data[i].humid;
            huimMiddleHour = (huim / 720).toFixed(3);
        }
    }

    //Считаем среднее за сутки температура
    if (data.length < 17280) {
        tempMiddleDay = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 17280; i--) {
            tempDay += +data[i].tempDay;
            tempMiddleDay = (tempDay / 17280).toFixed(3);
        }
    }

    //Считаем среднее за час влажность
    if (data.length < 17280) {
        huimMiddleDay = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 17280; i--) {
            huimDay += +data[i].humid;
            huimMiddleDay = (huimDay / 17280).toFixed(3);
        }
    }*/

    if (typeof (tempMiddleHour) === Number) {
        tdTempHour.textContent = tempMiddleHour;
    } else {
        tdTempHour.textContent = tempMiddleHour;
    }

    if (typeof (huimMiddleHour) === Number) {
        tdHuimHour.textContent = huimMiddleHour;
    } else {
        tdHuimHour.textContent = huimMiddleHour;
    }

    if (typeof (tempMiddleDay) === Number) {
        tdTempDay.textContent = tempMiddleDay;
    } else {
        tdTempDay.textContent = tempMiddleDay;
    }

    if (typeof (huimMiddleDay) === Number) {
        tdHuimDay.textContent = huimMiddleDay;
    } else {
        tdHuimDay.textContent = huimMiddleDay;
    }

    tr.append(tdTempHour);
    tr.append(tdHuimHour);
    tr.append(tdTempDay);
    tr.append(tdHuimDay);
    tables.append(tr);
}

//синхронный запрос к бд
function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}
//Поиск по дате
async function sort() {

    let sort = document.getElementById('search');
    sort.addEventListener('input', async () => {

        if (sort.value == '') {
            let tableSort = document.getElementById('tableSort');
            if (tableSort) {
                tableSort.remove();
            }
        } else {
            var data = await makeRequest("GET", "/api.php?filter="+sort.value);
            
            data = JSON.parse(data);
            const newSearch = data.filter(item => item.data.includes(sort.value));
            if (newSearch.length > 0) {
                let tableSort = document.getElementById('tableSort');
                if (tableSort) {
                    tableSort.remove();
                }
                createSortTable(newSearch);
            } else {
                let tableSort = document.getElementById('tableSort');
                if (tableSort) {
                    tableSort.remove();
                }
            }
        }
    })
}

//Вывод отсортированных объектов
function createSortTable(newSearch) {

    let averages = document.getElementById('averages');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let thTemp = document.createElement('th');
    let thHuim = document.createElement('th');
    let thDate = document.createElement('th');
    let thInfo = document.createElement('th');

    table.classList.add('table');
    table.id = 'tableSort';
    thTemp.textContent = 'Температура';
    thHuim.textContent = 'Влажность';
    thDate.textContent = 'Дата';
    thInfo.textContent = 'Датчик';

    thead.append(thDate);
    thead.append(thTemp);
    thead.append(thHuim);
    thead.append(thInfo);
    table.append(thead);
    root.insertBefore(table, averages);


    for (let i = 0; i < newSearch.length; i++) {
        let tr = document.createElement('tr');
        let tdTemp = document.createElement('td');
        let tdHuim = document.createElement('td');
        let tdDate = document.createElement('td');
        let tdInfo = document.createElement('td');

        tdTemp.textContent = newSearch[i].temp + ' °С';
        tdHuim.textContent = newSearch[i].humid + ' г/м³';
        tdDate.textContent = newSearch[i].data;
        tdInfo.textContent = newSearch[i].info;

        tr.append(tdDate);
        tr.append(tdTemp);
        tr.append(tdHuim);
        tr.append(tdInfo);
        table.append(tr);
    }
}

function lastValue(data) {
    let h2 = document.createElement('h2');
    let div = document.createElement('div');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let thTemp = document.createElement('th');
    let thHuim = document.createElement('th');
    let thDate = document.createElement('th');
    let thInfo = document.createElement('th');

    h2.textContent = 'Последнее значение';
    div.classList.add('table__conteiner');
    table.classList.add('table');
    thTemp.textContent = 'Температура';
    thHuim.textContent = 'Влажность';
    thDate.textContent = 'Дата';
    thInfo.textContent = 'Датчик';

    thead.append(thDate);
    thead.append(thTemp);
    thead.append(thHuim);
    thead.append(thInfo);
    table.append(thead);
    div.append(h2);
    div.append(table);
    root.append(div);

    let tr = document.createElement('tr');
    let tdTemp = document.createElement('td');
    let tdHuim = document.createElement('td');
    let tdDate = document.createElement('td');
    let tdInfo = document.createElement('td');

    tdTemp.id = 'tdTemp';
    tdHuim.id = 'tdHuim';
    tdDate.id = 'tdDate';
    tdInfo.id = 'tdInfo';

    tdTemp.textContent = data.last.temp + ' °С';
    tdHuim.textContent = data.last.humid + ' г/м³';
    tdDate.textContent = data.last.data;
    tdInfo.textContent = data.last.info;

    tr.append(tdDate);
    tr.append(tdTemp);
    tr.append(tdHuim);
    tr.append(tdInfo);
    table.append(tr);

    setInterval(() => {
        loadLastData();
    }, 1000);
}

//Обновление таблицы последних данных 
function refreshLastValue(data) {
    let tdTemp = document.getElementById('tdTemp');
    let tdHuim = document.getElementById('tdHuim');
    let tdDate = document.getElementById('tdDate');
    let tdInfo = document.getElementById('tdInfo');

    tdTemp.textContent = data.last.temp + ' °С';
    tdHuim.textContent = data.last.humid + ' г/м³';
    tdDate.textContent = data.last.data;
    tdInfo.textContent = data.last.info;

    if (+data.last.temp < 10) {
        warningTempDecrease();
    } else if (+data.last.temp > 30) {
        warningTempExcess();
    } else {
        let warningTempDecrease = document.getElementById('warningTempDecrease');
        let warningTempExcess = document.getElementById('warningTempExcess');
        if (warningTempExcess) {
            warningTempExcess.classList.remove('is-active');
        }
        if (warningTempDecrease) {
            warningTempDecrease.classList.remove('is-active');
        }
    }
}

//Warning при уменьшении температуры
function warningTempDecrease() {
    let warningTempExcess = document.getElementById('warningTempExcess');
    if (warningTempExcess) {
        warningTempExcess.classList.remove('is-active');
    }
    let warning = document.getElementById('warningTempDecrease');
    warning.classList.add('is-active');
}

//Warning при повышении температуры
function warningTempExcess() {
    let warningTempDecrease = document.getElementById('warningTempDecrease');
    if (warningTempDecrease) {
        warningTempDecrease.classList.remove('is-active');
    }
    let warning = document.getElementById('warningTempExcess');
    warning.classList.add('is-active');
}

//Получение последних данных
async function loadLastData() {
    const response = await fetch('/api.php');
    const data = await response.json();

    refreshLastValue(data);
    
    /* refreshMiddleValue(data); */
}

//Обновление средних данных 
/* function refreshMiddleValue(data) {
    let tdTempHour = document.getElementById('tempHour');
    let tdHuimHour = document.getElementById('huimHour');
    let tdTempDay = document.getElementById('tempDay');
    let tdHuimDay = document.getElementById('huimDay');

    //Считаем среднее за час температура
    if (data.length < 180) {
        tempMiddleHour = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 180; i--) {
            temp += +data[i].temp;
            tempMiddleHour = (temp / 180).toFixed(3);
        }
    }

    //Считаем среднее за час влажность
    if (data.length < 180) {
        huimMiddleHour = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 180; i--) {
            huim += +data[i].humid;
            huimMiddleHour = (huim / 180).toFixed(3);
        }
    }

    //Считаем среднее за сутки температура
    if (data.length < 4320) {
        tempMiddleDay = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 4320; i--) {
            tempDay += +data[i].tempDay;
            tempMiddleDay = (tempDay / 4320).toFixed(3);
        }
    }

    //Считаем среднее за час влажность
    if (data.length < 4320) {
        huimMiddleDay = 'Недостаточно значений';
    } else {
        for (let i = data.length - 1; i > data.length - 4320; i--) {
            huimDay += +data[i].humid;
            huimMiddleDay = (huimDay / 4320).toFixed(3);
        }
    }

    if (typeof (tempMiddleHour) === Number) {
        tdTempHour.textContent = tempMiddleHour;
    } else {
        tdTempHour.textContent = tempMiddleHour;
    }

    if (typeof (huimMiddleHour) === Number) {
        tdHuimHour.textContent = huimMiddleHour;
    } else {
        tdHuimHour.textContent = huimMiddleHour;
    }

    if (typeof (tempMiddleDay) === Number) {
        tdTempDay.textContent = tempMiddleDay;
    } else {
        tdTempDay.textContent = tempMiddleDay;
    }

    if (typeof (huimMiddleDay) === Number) {
        tdHuimDay.textContent = huimMiddleDay;
    } else {
        tdHuimDay.textContent = huimMiddleDay;
    }
} */

document.addEventListener('DOMContentLoaded', function () {
    let led = document.getElementById('led-active');
    let ledBtn = document.getElementById('led');
    if(ledBtn.value === 'Led: On') {
        led.classList.add('on')
    } else {
        led.classList.remove('on')
    }
    loadData();
    createTable();

    
})
