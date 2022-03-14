const assert = require('assert');
const sheduler = require('./sheduler.js');

describe('iterator', function() {
    it('should return 0 if gets 24', function(){
        assert.equal(0, sheduler.iterateHours(23));
    });
    it('should return 4 if gets 3', function(){
        assert.equal(4, sheduler.iterateHours(3));
    });
});

describe('setHours', function() {
    it('should return array', function () {
        assert(Array.isArray(sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower)));
    });
    it('should return night on 3 am', function() {
        assert.equal('night', sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower)[3].mode);
    });
    it('should return 1.79 on 3 am', function() {
        assert.equal(1.79, sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower)[3].price);
    });
});

describe('setPeriod', function() {
    it('should return array', function() {
        assert(Array.isArray(sheduler.setPeriod(sheduler.rawData.devices[0], sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower))));
    });
    it('first sum value should be less than last', function() {
        let periods = sheduler.setPeriod(sheduler.rawData.devices[0], sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower));
        assert(periods[0].sum < periods[periods.length - 1].sum);
    });
});

describe('getStartHour', function () {
    it('should return 10 am for most expencive daytime device', function () {
        let device = sheduler.rawData.devices[0];
        let periods = sheduler.setPeriod(sheduler.rawData.devices[0], sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower));
        let hours = sheduler.setHours(sheduler.rawData.rates, sheduler.rawData.maxPower);
        assert.equal(10, sheduler.getStartHour(device, periods, hours));
    })
});