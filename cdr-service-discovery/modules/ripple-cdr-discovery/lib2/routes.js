var getDemographics = require('./handlers/getDemographics');
var getHeadingSummary = require('./handlers/getHeadingSummary');
var getHeadingDetail = require('./handlers/getHeadingDetail');

module.exports = {
  '/api/patients/:patientId/:heading': {
    GET:  getHeadingSummary
  },
  '/api/discovery/:patientId/:heading': {
    GET:  getHeadingSummary
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    GET: getHeadingDetail
  },
  '/api/demographics/:patientId': {
    GET: getDemographics
  }
};
