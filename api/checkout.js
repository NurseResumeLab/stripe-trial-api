import Stripe from 'stripe';

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Read code from query string (?code=FREETRIAL3)
    const { code = '' } = req.query;
    const isTrial = code.trim().toUpperCase() === 'FREETRIAL3';

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.PRICE_ID, quantity: 1 }, // Your monthly/annual plan
      ],
      subscription_data: isTrial ? { trial_period_days: 3 } : {},
      success_url: process.env.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL,
    });

    // Redirect user to Stripe Checkout
    res.writeHead(302, { Location: session.url });
    res.end();

  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
