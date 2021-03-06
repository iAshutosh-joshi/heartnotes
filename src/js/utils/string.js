import uuid from 'node-uuid';
import moment from 'moment';
import _ from 'lodash';


const POSSIBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


exports.DEFAULT_PASSWORD = 'password';


exports.random = function(len) {

  var text = "";

  for( var i=0; i < len; i++ )
      text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));

  return text;
};



exports.formatDiaryName = function(name) {
  return name.replace(/^.*[\\\/]/, '');
};




exports.generateEntryId = function() {
  return uuid.v4();
};




exports.extractDiaryType = function(diaryId) {
  return (0 === diaryId.indexOf('__LOCAL__')) ? 'local' : 'cloud';
};



exports.generateLocalDiaryId = function() {
  return '__LOCAL__' + exports.random(8);
};






