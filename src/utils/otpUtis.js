const crypto = require("crypto");

function generateNewOTP() {
  function getRandomInt(min, max) {
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = randomBuffer.readUInt32BE(0);
    return Math.floor((randomNumber / 0xffffffff) * (max - min)) + min;
  }

  const otpCode = getRandomInt(100000, 999999).toString();
  const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);

  return { otpCode, otpExpiration };
}

module.exports = { generateNewOTP };
