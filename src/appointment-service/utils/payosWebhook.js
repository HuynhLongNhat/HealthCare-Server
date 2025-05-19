const crypto = require('crypto');

function verifyPayOSWebhook(req) {
  const webhookSignature = req.headers['x-payos-signature'];
  if (!webhookSignature) return false;

  const dataStr = JSON.stringify(req.body);
  const signature = crypto
    .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
    .update(dataStr)
    .digest('hex');

  return signature === webhookSignature;
}

module.exports = { verifyPayOSWebhook };