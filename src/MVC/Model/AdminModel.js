const con = require("../../../database/connection");
const TableUser = require("../Collections/UserCollection");
let resultSet;
const mongoose = require("mongoose");
const stripe = require('stripe')("sk_test_51NnjIMSGtLxA9Z55hs7Qx0IvIimuQpealXjs603DxH1pbnLLKVZbRo1BxpyjVUYL9Q4R0DgZoWGGsNGhtCVkd1bp00PQSQLNhB")


async function payment (req , res) {
    const totalpamyent =3000 *  12
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'INR',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: totalpamyent,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  
    res.redirect(303, session.url);
}

module.exports = {
    payment
}