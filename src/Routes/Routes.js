const express = require("express");
const app = express();

const User = require("./FrontEndRouter/User");
const Payment = require("./FrontEndRouter/admin");

app.use("/user", User);
app.use("/",Payment)
  

const stripe = require('stripe')('sk_test_51NnjIMSGtLxA9Z55hs7Qx0IvIimuQpealXjs603DxH1pbnLLKVZbRo1BxpyjVUYL9Q4R0DgZoWGGsNGhtCVkd1bp00PQSQLNhB')

app.post('/stripe/create-checkout-session', async (req, res) => {
        const plans = ["Basic" , "Pro" , "Premium"];
        const total_payment = 12
        const session = await stripe.checkout.sessions.create({
        line_items: [
            {
            price_data: {
                currency: 'INR',
                product_data: {
                name: plans[0],
                },
                unit_amount: 30000 * total_payment,
            },
            quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        });
    
        res.redirect(303, session.url);
});

module.exports = app;
