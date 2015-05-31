var _ = require('lodash'),
  faker = require('faker'),
  moment = require('moment');


import { Store } from 'flummox';


var data = {};

var range = {
  2014: [1,2,3,4,5,6,7,8,9,10,11,12],
  2015: [1,2,3,4,5]
};

_.forEach(range, function(months, year) {
  _.forEach(months, function(monthIndex) {
    var numEntriesToBuild = faker.random.number({
      min: 1,
      max: 28,
    });

    for (var i=1; i<=numEntriesToBuild; ++i) {
      var d = moment([year, monthIndex-1, i]).startOf('day');

      var id = d.format('YYYY-MM-DD-') + faker.random.number({
        min: 10000,
        max: 100000
      });

      data[id] = {
        id: id,
        ts: d.unix(),
        body: faker.lorem.paragraphs(5),
      };    
    }
  });
});



class EntryStore extends Store {

  constructor(flux) {
    super();

    this.state = {
      entries: data,
    };

    const entryActionIds = flux.getActionIds('entry');
    this.register(entryActionIds.update, this.updateEntry);
  }


  search () {
    return this.state.entries;
  }


  get (entryId) {
    return this.state.entries[entryId];
  }


  getByDate (date) {
    var ts = moment(date).startOf('day').unix();

    return _.find(this.state.entries, function(e) {
      return e.ts === ts;
    });
  }


  getToday () {
    return this.getByDate(moment());
  }


  updateEntry(params) {
    var {id, content} = params;

    var entry;

    if (!id) {
      id = faker.random.uuid();

      var entry = {
        id: id,
        ts: moment().startOf('day').unix(),
        body: content
      };

      this.state.entries[id] = entry;
    } else {
      var entry = _.find(this.state.entries, function(e) {
        return e.id === id;
      });

      if (entry) {
        entry.body = content;
      }
    }

    this.forceUpdate();
  }

}





module.exports = {
  entries: EntryStore
};





