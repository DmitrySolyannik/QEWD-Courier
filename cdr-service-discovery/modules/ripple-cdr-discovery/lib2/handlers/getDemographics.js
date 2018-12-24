const GetDemographicsCommand = require('../commands/getDemographicsCommand');
const { getResponseError } = require('../errors');

/**
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function (args, finished) {
  try {
    const command = new GetDemographicsCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.patientId, args.session);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);
    finished(responseError);
  }
};
