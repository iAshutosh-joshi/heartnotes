"use strict";

import Q from 'bluebird';
import _ from 'lodash';
import Logger from '../../utils/logger';

import Detect from '../../utils/detect';
import { instance as Crypto } from '../crypto/index';
import { instance as Dispatcher } from '../dispatcher';
import Diary from '../diary/index';
import { Actions } from '../actions';



export class Auth {

  constructor() {
    this.logger = Logger.create(`auth`);
  }


  /** 
   * @return {Promise}
   */
  createPassword(password) {
    Dispatcher.createPassword('start');

    return Crypto.deriveNewKey(password) 
      .then((derivedKeyData) => {
        let masterKey = derivedKeyData.key1;

        // hash the password
        return Crypto.hash(password, Math.random() * 100000)
          .then((hash) => {
            // now genereate encryption key
            return Crypto.deriveNewKey(hash);
          })
          .then((encryptionKeyData) => {
            let encryptionKey = encryptionKeyData.key1;

            // now encrypt the encryption key with master key
            return this._generateEncKeyBundle(masterKey, encryptionKey)
              .then((encKeyBundle) => {
                Dispatcher.createPassword('result');

                this._password = password;
                this._masterKey = masterKey;
                this._encryptionKey = encryptionKey;

                this._meta = this._buildMeta(encKeyBundle, derivedKeyData);
              });
          });
      })
      .catch((err) => {
        this.logger.error(err);

        Dispatcher.createPassword('error', err);

        throw err;
      });
  }



  /** 
   * @return {Promise}
   */
  enterPassword(password, meta) {
    Dispatcher.enterPassword('start');

    return Crypto.deriveKey(password, {
      salt: meta.salt,
      iterations: meta.iterations,
    })
      .then((derivedKeyData) => {
        let masterKey = derivedKeyData.key1;

        let encKeyBundle = (meta.version) ? meta.bundle : meta.keyTest;

        return Crypto.decrypt(masterKey, encKeyBundle)
          .then((plainData) => {
            if (!meta.version) {
              if (plainData !== masterKey) {
                throw new Error('Password incorrect');
              }              

              this._encryptionKey = masterKey;

              // upgrade to newer format
              return this._generateEncKeyBundle(masterKey, masterKey)
                .then((encKeyBundle) => {
                  delete meta.keyTest;
                  meta.bundle = encKeyBundle;
                  meta.version = Detect.version();
                });
            } else {
              if (plainData.check !== 'ok') {
                throw new Error('Password incorrect');
              }

              this._encryptionKey = plainData.key;
            }
          })
          .then(() => {
            this._password = password;
            this._masterKey = masterKey;
            this._meta = meta;
          })
          .then(() => {
            Dispatcher.enterPassword('result');            
          })
          .catch((err) => {
            this.logger.error(err);

            Dispatcher.enterPassword('error', err);

            throw err;
          });
      });
  }


  changePassword (oldPassword, newPassword) {
    Dispatcher.changePassword('start');

    return Q.resolve()
      .then(() => {
        if (this._password !== oldPassword) {
          throw new Error('Your current password is wrong');
        }
      })
      .then(() => {
        return Crypto.deriveNewKey(newPassword);
      })
      .then((derivedKeyData) => {
        let masterKey = derivedKeyData.key1;

        return this._generateEncKeyBundle(masterKey, this._encryptionKey)
          .then((encKeyBundle) => {
            this._masterKey = masterKey;
            this._password = newPassword;
            
            this._meta = this._buildMeta(encKeyBundle, derivedKeyData);

            Dispatcher.changePassword('result');
          });
      })
      .catch((err) => {
        this.logger.error(err);

        Dispatcher.changePassword('error', err);

        throw err;
      });
  }


  get meta () {
    return this._meta;
  }

  get password () {
    return this._password;
  }

  get masterKey () {
    return this._masterKey;
  }

  get encryptionKey () {
    return this._encryptionKey;
  }


  _generateEncKeyBundle (masterKey, encryptionKey) {
    return Crypto.encrypt(masterKey, {
      key: encryptionKey,
      check: 'ok',  /* for checking password when we decrypt later on */
    });
  }

  _buildMeta (encKeyBundle, derivedKeyData) {
    return {
      bundle: encKeyBundle,
      salt: derivedKeyData.salt,
      iterations: derivedKeyData.iterations,              
      version: Detect.version(),
    };
  }
}



exports.instance = new Auth();
