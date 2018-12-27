module.exports = {
  auth: {
    url: 'https://devauth.endeavourhealth.net/auth/realms/endeavour/protocol/openid-connect/token',
    credentials: {
      username: 'xxxxxxx',
      password: 'yyyyyyyyyyyyyyy',
      client_id: 'eds-data-checker',
      grant_type: 'password',
    }
  },
  patientByNHSNumber : {
    url: 'https://deveds.endeavourhealth.net/data-assurance/api/fhir/patients',
  },
  getPatientResources: {
    url : 'https://deveds.endeavourhealth.net/data-assurance/api/fhir/resources'
  }
};
