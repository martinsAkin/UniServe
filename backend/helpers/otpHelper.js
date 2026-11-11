
const crypto = require("crypto");

const generateOtp = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  return {
    otp,
    expiry,
  };
};

module.exports = generateOtp;
