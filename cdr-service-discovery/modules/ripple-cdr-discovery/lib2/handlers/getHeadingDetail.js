const GetHeadingDetailCommand = require('../commands/getHeadingDetailCommand');
const { getResponseError } = require('../errors');

/**
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function (args, finished) {
  try {
    const command = new GetHeadingDetailCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.patientId, args.heading, args.sourceId);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);
    finished(responseError);
  }
};
