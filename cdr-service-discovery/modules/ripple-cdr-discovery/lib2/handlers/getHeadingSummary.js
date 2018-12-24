const GetHeadingSummaryCommand = require('../commands/GetHeadingSummaryCommand');
const { getResponseError } = require('../errors');

/**
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function (args, finished) {
  try {
    const command = new GetHeadingSummaryCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.patientId, args.heading, args.sourceId);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);
    finished(responseError);
  }
};
