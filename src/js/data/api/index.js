import $ from 'jquery';
import _ from 'lodash';
import Q from 'bluebird';
import qs from 'query-string';

import Logger from '../../utils/logger';
import * as Detect from '../../utils/detect';




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
      baseUrl: null,
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

  // isServerReachable () {
  //   return new Q((resolve, reject) => {
  //     try {
  //       isReachable(this.options.baseUrl, (err, online) => {
  //         if (err) {
  //           return reject(new UnreachableError('Server unreachable'));
  //         }

  //         if (!online) {
  //           return reject(new UnreachableError('Server unreachable'));
  //         }

  //         resolve(!!online);
  //       });
  //     } catch (err) {
  //       return reject(new UnreachableError('Server unreachable'));
  //     }
  //   });
  // }

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
        let httpMethodLowercase = httpMethod.toLowerCase();

        let fixture = _.get(this._fixtures[httpMethodLowercase], remoteMethodName);

        if (Detect.inDevMode() && fixture) {
          this.logger.debug('Fixture call');

          return fixture.call(this, queryParams, body);
        } else {
          this.logger.debug('Server call');

          let headers = {};

          // add in auth token
          if (this._authToken) {
            headers['Authorization'] = `Bearer ${this._authToken}`;
          }

          return new Q((resolve, reject) => {
            $.ajax({
              url: `${this.options.baseUrl}/${remoteMethodName}` + (query.length ? `?${query}` : ''),
              cache: false,
              sync: false,
              timeout: options.timeout,
              method: httpMethod,
              data: body,
              headers: headers,
              success: (data, textStatus, xhr) => {
                // save auth token for next API call
                let token = xhr.getResponseHeader('X-Authorization');

                if (token && token.length && this._authToken !== token) {
                  this._authToken = token;

                  this.logger.debug(`New auth token: ${this._authToken}`);
                }

                resolve(data);
              },
              error: reject,
            });            
          });
        }
      })
      .then((data, a, b) => {
        this.logger.info(`Got response from ${remoteMethodName}`);
        this.logger.debug(data);

        return data;
      })
      .catch((xhr) => {
        this.logger.error(`Got error from ${remoteMethodName}`, xhr.status);

        var json = xhr.responseJSON, 
          err;

        if (_.get(json, 'type')) {
          err = new Error(json.msg);
          err.type = json.type;
          err.details = json.details;
        } else {
          let errMsg = xhr.responseText || xhr.statusText;

          if (0 === xhr.status) {
            errMsg = 'Could not connect to server';
          }

          if (!errMsg) {
            errMsg = 'Sorry, an unexpected error occurred.';

            if ('timeout' === xhr.statusText) {
              errMsg = 'Sorry, the request timed out.';
            }

            errMsg += ' Please restart the app and try again a bit later.';
          }

          err = new Error(errMsg);
        }

        err.statusCode = xhr.status;

        throw err;
      });
  }

}



exports.instance = new Api({
  baseUrl: Detect.serverHost() + '/api',
  globalQueryParams: {
    format: 'json',
  },
});




