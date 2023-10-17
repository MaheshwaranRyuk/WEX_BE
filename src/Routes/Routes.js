const express = require("express");
const app = express();

const User = require("./FrontEndRouter/User");
const Payment = require("./FrontEndRouter/admin");
const { authorize } = require("../utils/utils");
const Payments = require("../MVC/Collections/Payments");

const ExchangeKey = require("./FrontEndRouter/exchangeKey");
const Subscribe = require("./FrontEndRouter/subscription");
const Tier = require("./FrontEndRouter/tiers");
const MasterTrader = require("./FrontEndRouter/mastertrader");
const Badge = require("./FrontEndRouter/badges");

const profilePage = require('./FrontEndRouter/Profile')
app.use('/profile',profilePage)

app.use("/user", User);
app.use("/", Payment);
const { Client } = require("@coingate/coingate-sdk");
const UserCollection = require("../MVC/Collections/UserCollection");
const coingate = new Client("JNF9awCPLk88j5gvHnnz_bENE8yHL4WyJADp6hgn", true);
const stripe = require("stripe")(
  "sk_test_51NqVHpSHYXGLaXaYoSr409y8OyQRCAV5EKW9AVm1QpAMdGwCriEhcSM4CpljWU4GdNUwp8wold624EXPc5hxzJmQ00VPEKWKCv"
);
// async function a(){
//     const session = await stripe.checkout.sessions.retrieve(
//         'cs_test_a1v9MUsbiXNvQI0NbWKWruCT7WoXfvGaXu1k08QoHrRh3MPKFzTmEPSgtX'
//       );
//       console.log('session',session)
// }
// a()
app.post("/coingate/create-checkout-session", authorize, async (req, res) => {
  //console.log('req.body', req.user)
  const amount = Number(req.body.amount); //amount in dollar
  const user = await UserCollection.findOne({ _id: req.user._id });
  const payment = await Payments.create({
    user_id: req.user._id,
    currency_code: "USD",
    amount: amount,
    type: "COINGATE",
  });
  const data = {
    order_id: payment._id, // optional
    price_amount: amount,
    price_currency: "USD",
    receive_currency: "USD",
    title: "Wex Trade Recharge", // optional
    description: "recharge your wextrade wallet", // optional/ optional
    cancel_url: "http://localhost:5174/cancel", // optional
    success_url: `http://localhost:5174/UserProfilePage?coingate=${payment._id}`, // optional
    token: payment._id, // optional
    purchaser_email: user.email, // optional
  };
  const order = await coingate.order.createOrder(data);
  console.log("order", order);
  payment.order_id = order.id;
  payment.session_id = order.uuid;
  await payment.save();
  res.json({ url: order.payment_url });
});
app.post("/stripe/create-checkout-session", authorize, async (req, res) => {
  console.log("req.body", req.user);
  const amount = Number(req.body.amount); //amount in dollar
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "USD",
          product_data: {
            name: "wallet_top_up",
          },
          unit_amount: 100 * amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url:
      "http://localhost:5173/UserProfilePage?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "http://localhost:3000/cancel",
  });
  const { id } = session;
  await Payments.create({
    session_id: id,
    user_id: req.user._id,
    currency_code: "USD",
    amount: amount,
    type: "STRIPE",
  });

  res.json({ url: session.url });
});
// app.post("/coingate/create-checkout-session", authorize, async (req, res) => {
// 	//console.log('req.body', req.user)
// 	const amount = Number(req.body.amount); //amount in dollar
// 	const user = await UserCollection.findOne({ _id: req.user._id });
// 	const payment = await Payments.create({
// 		user_id: req.user._id,
// 		currency_code: "USD",
// 		amount: amount,
// 		type: "COINGATE",
// 	});
// 	const data = {
// 		order_id: payment._id, // optional
// 		price_amount: amount,
// 		price_currency: "USD",
// 		receive_currency: "USD",
// 		title: "Wex Trade Recharge", // optional
// 		description: "recharge your wextrade wallet", // optional/ optional
// 		cancel_url: "http://localhost:5174/cancel", // optional
// 		success_url: `http://localhost:5174/UserProfilePage?coingate=${payment._id}`, // optional
// 		token: payment._id, // optional
// 		purchaser_email: user.email, // optional
// 	};
// 	const order = await coingate.order.createOrder(data);
// 	console.log("order", order);
// 	payment.order_id = order.id;
// 	payment.session_id = order.uuid;
// 	await payment.save();
// 	res.json({ url: order.payment_url });
// });

// app.post("/stripe/create-checkout-session", authorize, async (req, res) => {
// 	console.log("req.body", req.user);
// 	const amount = Number(req.body.amount); //amount in dollar
// 	const session = await stripe.checkout.sessions.create({
// 		line_items: [
// 			{
// 				price_data: {
// 					currency: "USD",
// 					product_data: {
// 						name: "wallet_top_up",
// 					},
// 					unit_amount: 100 * amount,
// 				},
// 				quantity: 1,
// 			},
// 		],
// 		mode: "payment",
// 		success_url: "http://localhost:5173/UserProfilePage?session_id={CHECKOUT_SESSION_ID}",
// 		cancel_url: "http://localhost:3000/cancel",
// 	});
// 	const { id } = session;
// 	await Payments.create({
// 		session_id: id,
// 		user_id: req.user._id,
// 		currency_code: "USD",
// 		amount: amount,
// 		type: "STRIPE",
// 	});

// 	res.json({ url: session.url });
// });

app.post("/stripe/checkout", authorize, async (req, res) => {
  //const {_id} = req.user
  const { session_id } = req.body; //amount in dollar
  const stripe_session = await stripe.checkout.sessions.retrieve(session_id);
  console.log("stripe_session", stripe_session);
  if (stripe_session) {
    if (stripe_session.payment_status == "paid") {
      await Payments.updateOne({ session_id }, { $set: { is_success: true } });
      return res.json({ status: "success" });
    } else {
      return res.status(500).json({ status: "failed" });
    }
  }
  res.status(500).json({ status: "failed" });
});

app.post("/coingate/checkout", authorize, async (req, res) => {
  //const {_id} = req.user
  const { session_id } = req.body; //amount in dollar
  const payment = await Payments.findOne({ session_id });
  if (!payment) {
    res.status(500).json({ status: "failed" });
  }
  console.log(payment);
  const id = payment.order_id;
  const stripe_session = await coingate.order.getOrder(id);
  console.log("stripe_session", stripe_session);
  //return stripe_session
  //console.log('stripe_session',stripe_session)
  if (stripe_session) {
    if (stripe_session.payment_status == "paid") {
      await Payments.updateOne({ session_id }, { $set: { is_success: true } });
      return res.json({ status: "success" });
    } else {
      return res.status(500).json({ status: "failed" });
    }
  }
  res.status(500).json({ status: "failed" });
});

//exchange key routes
app.use("/exchange", ExchangeKey);

//subscription routes
app.use("/subscribe", Subscribe);

//tier Routes
app.use("/tier", Tier);

//master trader routes
app.use("/master-trader", MasterTrader);

// badge routes
app.use("/badge", Badge);

module.exports = app;
