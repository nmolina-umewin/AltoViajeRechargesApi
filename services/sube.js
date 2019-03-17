"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Base      = require('altoviajesube');
const Models    = require('../models');
const Utilities = require('../utilities');
const Log       = Utilities.Log;

const SERVICE_NAME = 'sube';

const NOT_RESPONSE_ID_TRANSACTION = 0;

const MAX_RECHARGE_RETRY_FOR_INVALID_EXTERNAL_TRANSACTION = 3;
const MAX_RECHARGE_RETRY_FOR_INVALID_CODE = 5;

const RETURN_CODE_OK   = 0;
const RETURN_CODE_FAIL = 1;

const RECHARGE_DETAILED_RETURN_CODE_INVALID_CARD                 = 1;
const RECHARGE_DETAILED_RETURN_CODE_SERVICE_NOT_SUPPORTED        = 2;
const RECHARGE_DETAILED_RETURN_CODE_INVALID_CODE                 = 3;
const RECHARGE_DETAILED_RETURN_CODE_BLACK_LIST                   = 4;
const RECHARGE_DETAILED_RETURN_CODE_INVALID_AMOUNT               = 5;
const RECHARGE_DETAILED_RETURN_CODE_INTERNAL_ERROR               = 6;
const RECHARGE_DETAILED_RETURN_CODE_INVALID_CHANNEL              = 7;
const RECHARGE_DETAILED_RETURN_CODE_PREVIOUS_REVERSE             = 8;
const RECHARGE_DETAILED_RETURN_CODE_CARD_NOT_REGISTER            = 9;
const RECHARGE_DETAILED_RETURN_CODE_INVALID_EXTERNAL_TRANSACTION = 10;
const RECHARGE_DETAILED_RETURN_CODE_INVALID_ENTITY               = 11;
const RECHARGE_DETAILED_RETURN_CODE_COM_LIMIT_REACHED_CONTINUES  = 12;
const RECHARGE_DETAILED_RETURN_CODE_COM_LIMIT_REACHED            = 13;

const REVERSE_DETAILED_RETURN_CODE_INVALID_TRANSACTION           = 1;
const REVERSE_DETAILED_RETURN_CODE_INVALID_CODE                  = 3;
const REVERSE_DETAILED_RETURN_CODE_SERVICE_NOT_SUPPORTED         = 5;
const REVERSE_DETAILED_RETURN_CODE_RECHARGE_OK                   = 7;
const REVERSE_DETAILED_RETURN_CODE_REVERSE_ALREADY_EXISTS        = 8;
const REVERSE_DETAILED_RETURN_CODE_INTERNAL_ERROR                = 10;

class SubeService extends Base
{
    getToken(idService) {
        let context = {
            idService
        };

        return P.bind(this)
            .then(() => {
                return this.getServiceToken(context);
            })
            .then(serviceToken => {
                if (!serviceToken) {
                    return this.requestServiceToken(context);
                }
                return serviceToken;
            });
    }

    getServiceToken(context) {
        return new P((resolve, reject) => {
            Utilities.Database.queryOne(Models.ServiceTokens.ByIdService(context.idService), (error, serviceToken) => {
                if (error) {
                    Log.Error(`Can't read service token from service sube. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                if (serviceToken) {
                    Log.Step('Read service sube token from cache.');
                }
                return resolve(serviceToken);
            });
        });
    }

    requestServiceToken(context) {
        return new P((resolve, reject) => {
            Log.Step('Generating sube token every 24 hours.');

            this.init((error, token) => {
                if (error || !token || !token.operationCode) {
                    Log.Error(`Can't generate service sube token. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                Log.Step(`Generated service sube token ${token.operationCode}`);
                return this.addServiceToken({
                    idService: context.idService,
                    token: token.operationCode,
                    description: JSON.stringify(token)
                })
                .then(resolve)
                .catch(reject);
            });
        });
    }

    addServiceToken(data) {
        return new P((resolve, reject) => {
            Utilities.Database.query(Models.ServiceTokens.Add(data), (error, result) => {
                if (error) {
                    Log.Error(`Can't add service sube token. ${error}`);
                    return reject(Utilities.Errors.CannotExecuteQuery);
                }

                Utilities.Database.queryOne(Models.ServiceTokens.ById(result.insertId), (error, serviceToken) => {
                    if (error) {
                        Log.Error(`Can't read from cache service sube token. ${error}`);
                        return reject(Utilities.Errors.Internal);
                    }

                    Log.Success(`Adding sube token ${data.token} to cache.`);
                    return resolve(serviceToken);
                });
            });
        });
    }

    recharge(params, repeat = 0) {
        return new P((resolve, reject) => {
            Log.Step(`Recharge sube ${JSON.stringify(params)}.`);

            super.recharge(params, (error, recharge) => {
                if (error) {
                    Log.Error(`Can't recharge sube. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                let data = {
                    idCompany: params.idCompany,
                    idUser: params.idUser,
                    idRechargeType: Models.Recharges.Types.RECHARGE,
                    idTransaction: NOT_RESPONSE_ID_TRANSACTION,
                    idTransactionExternal: params.idTransactionExternal,
                    amount: params.amount,
                    token: params.token,
                    description: {
                        service: SERVICE_NAME,
                        request: params 
                    }
                };

                if (!recharge) {
                    data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                    data.description.message = 'Reverse recharge';
                    Log.Step(`${data.description.message} sube because not response.result`);

                    return this.addRecharge(data).then(recharge => {
                        return this.reverseRecharge(params, recharge).then(resolve).catch(reject);
                    });
                }

                data.idTransaction = recharge.SUBEtransactionID;
                data.description.response = recharge;

                Log.Step(`Recharge sube with transaction number ${recharge.SUBEtransactionID}`);
                return this.processRecharge(data, recharge, repeat)
                    .then(data => {
                        return this.addRecharge(data);
                    })
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    processRecharge(data, recharge, repeat) {
        if (recharge.returnCode === RETURN_CODE_OK) {
            data.idRechargeStatus = Models.Recharges.Statuses.DONE;
            data.description.status = 'ok';
            data.description.message = 'Recharge effected correctly';
            Log.Success(data.description.message);
            return data;
        }

        switch (Number(recharge.detailedReturnCode)) {
            case RECHARGE_DETAILED_RETURN_CODE_INVALID_CARD:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'invalid_card';
                data.description.message = 'Invalid Card';
                break;

            case RECHARGE_DETAILED_RETURN_CODE_INVALID_CODE:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'fault_tokens';
                data.description.message = 'Recharge SUBE again by fault Tokens';
                // Retry
                if (retry < MAX_RECHARGE_RETRY_FOR_INVALID_CODE) {
                    return this.recharge(_.omit(data.description.request, 'token'), repeat + 1);
                }

            case RECHARGE_DETAILED_RETURN_CODE_BLACK_LIST:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'card_in_black_list';
                data.description.message = 'Your card was blocked please contact SUBE';
                break;

            case RECHARGE_DETAILED_RETURN_CODE_INVALID_AMOUNT:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'invalid_amount';
                data.description.message = 'Invalid amount';
                break;

            case RECHARGE_DETAILED_RETURN_CODE_INVALID_EXTERNAL_TRANSACTION:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'invalid_external_transaction';
                data.description.message = 'Recharge SUBE again by failure Id Transaction External';
                // Retry MAX_RECHARGE_RETRY times maximum
                if (retry < MAX_RECHARGE_RETRY_FOR_INVALID_EXTERNAL_TRANSACTION) {
                    return this.recharge(data.description.request, repeat + 1);
                }
                break;

            default:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'internal_error';
                data.description.message = 'An internal error has occurred, try later';
                break;
        }
        Log.Warning(data.description.message);
        return data;
    }

    addRecharge(data) {
        return new P((resolve, reject) => {
            Utilities.Database.query(Models.Recharges.Add(data), (error, result) => {
                if (error) {
                    Log.Error(`Can't add recharge. ${error}`);
                    return reject(Utilities.Errors.CannotExecuteQuery);
                }

                Utilities.Database.queryOne(Models.Recharges.ById(result.insertId), (error, recharge) => {
                    if (error) {
                        Log.Error(`Can't exists recharge. ${error}`);
                        return reject(Utilities.Errors.Internal);
                    }

                    Log.Success('Added recharge correctly.');
                    recharge.description = JSON.parse(recharge.description);
                    return resolve(recharge);
                });
            });
        });
    }

    updateRecharge(id, data) {
        return new P((resolve, reject) => {
            Utilities.Database.query(Models.Recharges.Update(id, data), (error, result) => {
                if (error) {
                    Log.Error(`Can't update recharge. ${error}`);
                    return reject(Utilities.Errors.CannotExecuteQuery);
                }

                Utilities.Database.queryOne(Models.Recharges.ById(id), (error, recharge) => {
                    if (error) {
                        Log.Error(`Can't exists recharge. ${error}`);
                        return reject(Utilities.Errors.Internal);
                    }

                    Log.Success('Updated recharge correctly.');
                    recharge.description = JSON.parse(recharge.description);
                    return resolve(recharge);
                });
            });
        });
    }

    reverseRecharge(params, recharge) {
        return new P((resolve, reject) => {
            Log.Step(`Reverse recharge sube ${JSON.stringify(params)}.`);

            super.reverse(params, (error, reverse) => {
                if (error) {
                    Log.Error(`Can't reverse recharge sube. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                let data = {
                    idCompany: params.idCompany,
                    idUser: params.idUser,
                    idRechargeType: Models.Recharges.Types.REVERSE,
                    idTransaction: params.idTransaction,
                    idTransactionExternal: params.idTransactionExternal,
                    amount: params.amount,
                    token: params.token,
                    description: {
                        service: SERVICE_NAME,
                        idRecharge: recharge.id,
                        request: params
                    }
                };

                if (!reverse) {
                    data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                    data.description.status = 'reverse_recharge';
                    data.description.message = 'Reverse recharge';
                    Log.Step(`${data.description.message} sube because not response.result`);

                    return this.addRecharge(data).then(resolve).catch(reject);
                }

                data.idTransaction = reverse.SUBEtransactionID || params.idTransaction;
                data.description.response = reverse;

                Log.Step(`Reverse recharge sube with transaction number ${reverse.SUBEtransactionID}`);
                return this.processReverse(data, reverse, recharge)
                    .then(data => {
                        return this.addRecharge(data);
                    })
                    .then(data => {
                        return this.updateRecharge(recharge.id, _.pick(recharge, ['idRechargeStatus', 'description'])).then(() => {
                            return data;
                        });
                    })
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    processReverse(data, reverse, recharge) {
        if (reverse.returnCode === RETURN_CODE_OK) {
            data.idRechargeStatus = Models.Recharges.Statuses.CANCELED;
            data.descriptioon.status = 'internal_error';
            data.descriptioon.message = 'An internal error has occurred and your recharge was canceled, contact our attention center';
            Log.Success(data.description.message);
            return data;
        }

        switch (Number(reverse.detailedReturnCode)) {
            case REVERSE_DETAILED_RETURN_CODE_INVALID_CODE:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'invalid_code';
                data.description.message = 'Invalid Code';
                recharge.description.pay = true;
                break;

            case REVERSE_DETAILED_RETURN_CODE_SERVICE_NOT_SUPPORTED:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'service_not_supported';
                data.description.message = 'Service not supported';
                recharge.description.pay = true;
                break;

            case REVERSE_DETAILED_RETURN_CODE_RECHARGE_OK:
                data.idRechargeStatus = Models.Recharges.Statuses.DONE;
                data.description.status = 'ok';
                data.description.message = 'Your recharge was made correctly and applied to your card';
                recharge.idRechargeStatus = Models.Recharges.Statuses.RECHARGE;
                recharge.description.pay = true;
                break;

            default:
                data.idRechargeStatus = Models.Recharges.Statuses.FAIL;
                data.description.status = 'internal_error';
                data.description.message = 'An internal error has occurred, try later';
                break;
        }
        Log.Warning(data.description.message);
        return data;
    }
}

module.exports = SubeService;
