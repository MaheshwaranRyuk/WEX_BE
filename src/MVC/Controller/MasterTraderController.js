const { validationResult } = require("express-validator");
const TableMasterTrader = require("../Collections/MasterTraderCollection");
const TableExchange = require("../Collections/ExchangeKeyCollection");
const TableUser = require("../Collections/UserCollection");
const MasterTraderHistoryCollection = require("../Collections/MasterTraderHistoryCollection");

const getHistory = async (req,res,next)=>{
	const {master_id} = req.body;
	console.log('master_id',master_id)
	try{
		const data = await MasterTraderHistoryCollection.find({master_id:master_id});
	    res.json({status:'success',msg:data})
	}catch(_){
		res.status(500).json({status:'failed',msg:data})
	}
}
const becomeMasterTrader = async (req, res, next) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({
			status: 400,
			message: result.array()[0].msg,
		});
	}
	try {
		let ins;
		const userData = req.user;
		if (!userData || !userData._id) {
			return res.status(400).json({ msg: "No direct Access Allowed" });
		}
		const user_id = userData._id;
		const { nickname, trade_style, email, bio, api_key } = req.body;
        console.log(userData)
		const apiDetails = await TableExchange.findOne({
			_id: api_key,
			user_id: user_id,
			is_enabled: true,
		});

		if (!apiDetails) {
			return res.status(400).json({ msg: "API KEY Details Not Found" });
		}

		ins = {
			user_id,
			nickname,
			trade_style,
			email,
			bio,
			api_key,
			exchange: apiDetails.exchange,
			trade_type: apiDetails.trade_type,
		};

		const checkIfRequestSubmitted = await TableMasterTrader.findOne({ user_id, api_key });

		if (checkIfRequestSubmitted) {
			return res
				.status(400)
				.json({ msg: "Request Already Submitted Please Wait for Admin to Confirm" });
		}
        
		let insert = new TableMasterTrader(ins);
		insert.save().then(
			(response) => {
				res.status(200).json({
					msg: "User Details Submitted  successfully",
				});
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const changeMasterTraderStatus = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const { status } = req.body; 

		const checkStatus = await TableExchange.findOne({ _id: req.params.id });
		if (checkStatus.status === "APPROVED" || checkStatus.status === "REJECTED") {
			return res.status(400).json({ msg: "Status Already Approved  or REJECTED" });
		}
		await TableMasterTrader.updateOne(
			{
				_id: req.params.id,
			},
			{
				$set: {
					status: status,
				},
			}
		).then(
			(response) => {
				res.status(200).json({ msg: "Trader Status has been Updated successfully ." });
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

module.exports = {
	becomeMasterTrader,
	changeMasterTraderStatus,
	getHistory
   };
