import $ from 'jquery';
import _ from 'lodash';
import Q from 'bluebird';
import qs from 'query-string';
import isReachable from 'is-reachable';
import urlParser from 'url-parse';

import Logger from '../../utils/logger';
import * as Detect from '../../utils/detect';


const DEV_SERVER = 'http://127.0.0.1:3000/api';
const LIVE_SERVER = 'https://heartnot.es:443/api';


export class UnreachableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message; 
    Error.captureStackTrace(this, this.constructor.name);
  }
}



export class Api {
  constructor (options) {
    this.logger = Logger.create(`api`);

    this.options = _.extend({
      baseUrl: Detect.inDevMode() ? DEV_SERVER : LIVE_SERVER,
      globalQueryParams: {},
      timeout: 5000,
    }, options);

    this._fixtures = {
      get: {},
      post: {},
    };
  }

  addFixture(httpMethod, remoteMethodName, handler) {
    this._fixtures[httpMethod][remoteMethodName] = handler;
    this._fixturesEnabled = true;
  }

  addFixtureGet(remoteMethodName, handler) {
    this.addFixture('get', remoteMethodName, handler);
  }

  addFixturePost(remoteMethodName, handler) {
    this.addFixture('post', remoteMethodName, handler);
  }

  areFixturesEnabled() {
    return !!this._fixturesEnabled;
  }

  isServerReachable () {
    return new Q((resolve, reject) => {
      let url = urlParser(this.options.baseUrl);

      try {
        isReachable(url, (err, online) => {
          if (err) {
            return reject(new UnreachableError('Server unreachable'));
          }

          if (!online) {
            return reject(new UnreachableError('Server unreachable'));
          }

          resolve(!!online);
        });
      } catch (err) {
        return reject(new UnreachableError('Server unreachable'));
      }
    });
  }

  get (remoteMethodName, queryParams = {}, options = {}) {
    return this._request('GET', remoteMethodName, queryParams, {}, options);
  }

  post (remoteMethodName, queryParams = {}, body = {}, options = {}) {
    return this._request('POST', remoteMethodName, queryParams, body, options);
  }

  _request (httpMethod, remoteMethodName, queryParams, body, options) {
    options = _.extend({}, this.options, options);

    this.logger.info(`${httpMethod}: ${remoteMethodName}`, queryParams, body, options);

    let query = qs.stringify(_.extend({}, queryParams, options.globalQueryParams));

    // dev mode?
    let initPromise = Q.resolve();
    if (Detect.inDevMode()) {
      let delayMs = parseInt(Math.random() * 2000);

      this.logger.debug(`Delaying call by ${delayMs} ms`);

      initPromise = Q.delay(delayMs);
    }

    return initPromise
      .then(() => {
        if (this.areFixturesEnabled()) {
          this.logger.debug('Fixture call');

          if (!Detect.inDevMode()) {
            this.logger.warn('Fixtures enabled in non-dev mode! Needs fixing');
          }

          let httpMethodLowercase = httpMethod.toLowerCase();

          let handler = _.get(this._fixtures[httpMethodLowercase], remoteMethodName);

          if (!handler) {
            throw new Error(`Fixture handler not found for ${httpMethod} ${remoteMethodName}`);
          }

          return this._fixtures[httpMethodLowercase][remoteMethodName].call(this, queryParams, body);
        } else {
          this.logger.debug('Server call');

          return Q.cast($.ajax({
            url: `${this.options.baseUrl}/${remoteMethodName}` + (query.length ? `?${query}` : ''),
            cache: false,
            sync: false,
            timeout: options.timeout,
            method: httpMethod,
            data: body,
          }));
        }
      })
      .then((data) => {
        this.logger.info(`Got response from ${remoteMethodName}`);
        this.logger.debug(data);

        return data;
      })
      .catch((response) => {
        this.logger.error(`Got error from ${remoteMethodName}`, response);

        var json = response.responseJSON, 
          err;

        if (_.get(json, 'type')) {
          err = new Error(json.msg);
          err.type = json.type;
          err.details = json.details;
        } else {
          let errMsg = response.responseText || response.statusText;

          if (!errMsg) {
            errMsg = 'Sorry, an unexpected error occurred.';

            if ('timeout' === response.statusText) {
              errMsg = 'Sorry, the request timed out.';
            }

            errMsg += ' Please restart the app and try again a bit later.';
          }

          err = new Error(errMsg);
        }

        throw err;
      });
  }


}



exports.instance = new Api();


