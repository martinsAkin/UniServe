
const RequestActivity = require("../models/RequestActivity");

const logRequestActivity = async ({
  requestId,
  actorId,
  action,
  fromStatus = null,
  toStatus = null,
  details = null,
  metadata = {},
}) => {
  return RequestActivity.create({
    request: requestId,
    actor: actorId,
    action,
    fromStatus,
    toStatus,
    details,
    metadata,
  });
};

module.exports = logRequestActivity;
