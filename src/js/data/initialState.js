import { version } from '../../../package.json';


exports.app = function() {
  return {
    type: window.appType || 'unknown',
    build: window.buildType,
    version: version,
    backgroundTasks: {},
    fetchingPricing: {},
    paying: {},
    checkingForUpdate: {},
    sendingFeedback: {},
    newVersionAvailable: false,
    loadingScript: {},
    scripts: {},
    accountData: {},
  }
};


exports.alert = function() {
  return {
    msg: null,
    type: null,
  };
};


exports.diary = function() {
  return {
    name: null,
    backupsEnabled: false,
    exportsEnabled: false,
    derivedKeys: null,
    entries: null,
    creating: {},
    enablingCloudSync: {},
    loggingIn: {},
    signingUp: {},
    opening: {},
    choosing: {},
    exporting: {},
    decryptEntries: {},
    derivingKeys: {},
    changingPassword: {},
    loadingEntries: {},
    updatingEntry: {},
    deletingEntry: {},
    searchIndexing: {},
    searching: {},
    makingBackup: {},
    restoringBackup: {},
    restoringFromOldDiary: {},
  };
};


