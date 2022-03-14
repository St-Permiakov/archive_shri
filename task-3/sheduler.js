const sheduler = {};

/* СЛУЖЕБНЫЕ ФУНКЦИИ */

/* Простой итератор часов в 24-часовом формате с первым 0 */
sheduler.iterateHours = (i) => {
    if (i > 23) throw 'Time format error: should be less than 24 and more than 0, and is ' + i;
    return i < 23 ? ++i : 0;
};

/**
 * Возвращает массив часов с установленным временем суток, предельной мощностью, ценой за час и пустым массивом под приборы
 * @param {[{from, to, value}, {...}]} rates
 * @param {number} maxPower
 */
sheduler.setHours = (rates, maxPower) => {
    const hours = [];
    rates.forEach(rate => {
        const startHour = parseInt(rate.from);
        const endHour = parseInt(rate.to);
        const price = parseFloat(rate.value);

        let i = startHour;
        while (i !== endHour) {
            hours[i] = {
                price: price,
                powerLeft: maxPower,
                devices: [],
                mode: i > 7 && i <= 21 ? 'day' : 'night'
            };
            i = sheduler.iterateHours(i);
        }
    });

    return hours;
};

/**
 * Возвращает массив периодов определённой длины, отсортированный по суммарной стоимости
 * @param {id, mode, name, power} device
 * @param {[{price, powerLeft, devices, mode}, {...}]} hours
 */
sheduler.setPeriod = (device, hours) => {
    const period = [];

    for (let i = 0; i < hours.length - device.duration + 1; i++) {
        /* фиксируем суммарную стоимость тарифа в периоде */
        let sum = 0;
        /* фиксируем входящие в период режимы */
        let modes = [];

        for (let j = i; j < i + device.duration; j++) {
            const hour = hours[j];
            sum += hour.price;

            if ((j > 7 && j <= 21) && modes.indexOf('day') < 0) {
                modes.push('day');
            } else if ((j <= 7 || j > 21) && modes.indexOf('night') < 0) {
                modes.push('night');
            }
        }
        const result = {
            startHour: i,
            sum: sum,
            modes: modes
        };
        period.push(result);
    }

    period.sort((periodA, periodB) => {
        if (periodA.sum - periodB.sum !== 0) {
            return periodA.sum - periodB.sum;
        } else {
            return periodA.startHour - periodB.startHour;
        }
    });

    return period;
};

/**
 * Возвращает стартовый час, в который нужно включать прибор
 * @param {id, name, power, duration, mode} device
 * @param {[{startHour, price, modes}, {...}]} periods
 * @param {[{startHour, price, modes}, {...}]} hours
 * @returns {number || boolean} device starting hour || null (false)
 */
sheduler.getStartHour = (device, periods, hours) => {
    let deviceStartHour = null;

    for (let i = 0; i < periods.length; i++) {
        const period = periods[i];

        /* проверяем соответствие времени суток */

        /* если у прибора есть режим дня И (в периоде больше одного режима дня ИЛИ режим дня не тот) - идём в следующий период */
        if (device.mode && (period.modes.length > 1 || period.modes.indexOf(device.mode) === -1)) {
            continue;
        }

        /* проверяем, хватит ли в часах оставшегося капа энергии */
        let j = period.startHour;
        let periodFits = true;
        while (j !== period.startHour + device.duration) {
            if (hours[j].powerLeft >= device.power) {
                j = sheduler.iterateHours(j);
                continue;
            } else {
                periodFits = false;
                break;
            }
        }

        if (periodFits) {
            deviceStartHour = period.startHour;
            break;
        }
    }

    if (!deviceStartHour) {
        // throw device.name + ' требует слишком много энергии: ' + device.power;
    }

    return deviceStartHour;
};

/**
 * Возвращает расписание и потребляемую энергию
 * @param {price, powerLeft, devices, mode} hours
 * @returns {shedule: {}, consumedEnergy: {value: null, devices: {}}}
 */
sheduler.formShedule = hours => {
    const shedule = [];

    for (let i = 0; i < hours.length; i++) {
        const hour = hours[i];
        shedule[i] = [];

        hour.devices.forEach(device => {
            shedule[i].push(device);
        });
    }

    return shedule;
};

/**
 * Возвращает потребление для отдельно взятого прибора за сутки
 * @param {id, name, power, duration, mode} device
 * @param {[{price, powerLeft, devices, mode}, {...}]} hours
 * @returns {id, value}
 */
sheduler.countDeviceConsumption = (device, hours) => {
    const consumption = {
        id: device.id,
        value: 0
    };

    hours.forEach(hour => {
        if (hour.devices.indexOf(device.id) >= 0) {
            consumption.value += device.power / 1000 * hour.price;
        }
    });

    return consumption;
};

sheduler.countTotalConsumption = (devices, hours) => {
    const devicesConsumption = {};
    let totalConsumption = 0;

    devices.forEach(device => {
        const deviceConsumption = sheduler.countDeviceConsumption(device, hours);
        devicesConsumption[deviceConsumption.id] = deviceConsumption.value;
        totalConsumption += deviceConsumption.value;
    });

    return {
        value: totalConsumption,
        devices: devicesConsumption
    };
};

/* Исполняющая функция */

sheduler.execute = input => {
    const devices = input.devices;
    const rates = input.rates;

    /* формируем массив часов с параметрами стоимости, мода, приписанных приборов и остатка энергии */
    const hours = sheduler.setHours(rates, input.maxPower);

    /* записываем коллекцию периодов, которая будет пополняться в процессе работы */
    const periods = {};

    /* записываем в расписание приборы, имеющие в длительности 24 часа */
    devices.forEach(device => {
        if (device.duration === 24) {
            hours.forEach(hour => {
                hour.devices.push(device.id);
                hour.powerLeft -= device.power;
            });
        }
    });

    /* ранжируем остальные приборы по потреблению */
    devices.sort((deviceA, deviceB) => {
        return deviceB.power - deviceA.power;
    });

    /**
     * ЕСЛИ такого периода работы ещё не было
     * делим массив часов на периоды по периоду работы каждого прибора и располагаем в массиве периодов по стоимости
     * ИНАЧЕ
     * располагаем прибор в наиболее дешёвый свободный период
     */
    devices.forEach(device => {
        if (device.duration < 24) {
            if (!periods.hasOwnProperty(device.duration)) {
                periods[device.duration] = sheduler.setPeriod(device, hours);
            }

            const startHour = sheduler.getStartHour(device, periods[device.duration], hours);
            let i = startHour;
            while (i !== startHour + device.duration) {
                hours[i].devices.push(device.id);
                hours[i].powerLeft -= device.power;
                i = sheduler.iterateHours(i);
            }
        }
    });

    const shedule = sheduler.formShedule(hours);
    const consumedEnergy = sheduler.countTotalConsumption(devices, hours);

    const output = {
        schedule: shedule,
        consumedEnergy: consumedEnergy
    };

    return output;
};






sheduler.rawData = {
    "devices": [
        { "id": "F972B82BA56A70CC579945773B6866FB", "name": "Посудомоечная машина", "power": 950,   "duration": 3, "mode": "night" },
        { "id": "C515D887EDBBE669B2FDAC62F571E9E9", "name": "Духовка",              "power": 2000,  "duration": 2, "mode": "day" },
        { "id": "02DDD23A85DADDD71198305330CC386D", "name": "Холодильник",          "power": 50,    "duration": 24  },
        { "id": "1E6276CC231716FE8EE8BC908486D41E", "name": "Термостат",            "power": 50,    "duration": 24  },
        { "id": "7D9DC84AD110500D284B33C82FE6E85E", "name": "Кондиционер",          "power": 850,   "duration": 1   }
    ],
    "rates": [
        { "from": 7,  "to": 10, "value": 6.46 },
        { "from": 10, "to": 17, "value": 5.38 },
        { "from": 17, "to": 21, "value": 6.46 },
        { "from": 21, "to": 23, "value": 5.38 },
        { "from": 23, "to": 7,  "value": 1.79 }
    ],
    "maxPower": 2100
};

// пример работы
sheduler.execute(sheduler.rawData);

module.exports = sheduler;