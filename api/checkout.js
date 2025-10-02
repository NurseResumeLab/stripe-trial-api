// CommonJS version for maximum compatibility on Vercel
const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // GET /api/checkout?price=price_xxx&code=NURSE3FREE
    const { price, code = '' } = req.query || {};

    if (!price) {
      return res.status(400).json({ error: 'Missing price ID' });
    }

    const isTrial = String(code).trim().toUpperCase() === 'NURSE3FREE';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      ...(isTrial ? { subscription_data: { trial_period_days: 3 } } : {}),
      success_url: process.env.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL
    });

    res.writeHead(302, { Location: session.url });
    return res.end();
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
};
