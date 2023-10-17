const getKucoinClient =  (key,secret,passphrase)=>{
    const user = require('kucoin-node-sdk');
    user.init({
        baseUrl: 'https://openapi-v2.kucoin.com',
        apiAuth: {
          key: key,
          secret: secret, 
          passphrase: passphrase, 
        },
        authVersion: 2, 
    })

   
    return user
}


const getKucoinTradingHistory = async(API)=>{
    const data = await API.rest.Trade.Orders.getOrdersList();
    console.log(data)
    return data
}

const parseKucoinHistory = (data)=>{
    
    const my_trades = {};
    data.forEach((e)=>{
        if(e.tradeType == 'TRADE'){
            if(my_trades.hasOwnProperty(e.symbol)){
               const copy = my_trades[e.symbol];
               if(e.side == 'buy'){
                  copy.buy.push(Number(e.dealFunds)) //USDT
                  copy.fee.push(Number(e.fee))
               }
               if(e.side == 'sell'){
                console.log('e.dealFunds',e.dealFunds)
                copy.sell.push(Number(e.dealFunds))
                copy.fee.push(Number(e.fee))
               }
            }else{
               my_trades[e.symbol] = {
                  buy:[],
                  sell:[],
                  fee:[]
               }
               const copy = my_trades[e.symbol]
               if(e.side == 'buy'){
                copy.buy.push(Number(e.dealFunds)) //USDT
                copy.fee.push(Number(e.fee))
             }
             if(e.side == 'sell'){
              console.log('e.dealFunds',e.dealFunds)
              copy.sell.push(Number(e.dealFunds))
              copy.fee.push(Number(e.fee))
             }
            }
        }
            
    })  
    const keys = Object.keys(my_trades);
    keys.forEach((k)=>{
        const ele = my_trades[k];
        if(ele.buy.length == ele.sell.length){
            const total_buy = ele.buy.reduce((p,c)=>p+c,0)
            const total_sell = ele.sell.reduce((p,c)=>p+c,0)
            const fee = ele.fee.reduce((p,c)=>p+c,0)
            const profit = (total_sell - total_buy) - fee
            ele['total_buy'] = total_buy;
            ele['total_sell'] = total_sell;
            ele['pnl'] = profit;
            ele['roi'] = (100 * ((total_sell/total_buy) - 1)).toFixed(2)+'%';
            ele['verdict'] = profit <= 0 ? 'LOSS' : 'PROFIT'
        }
        if(ele.buy.length < ele.sell.length){
            const sell =  ele.sell.reverse();
            const s_array = sell.slice(0,ele.buy.length);
            const total_buy = ele.buy.reduce((p,c)=>p+c,0)
            const total_sell = s_array.reduce((p,c)=>p+c,0)
            const fee = ele.fee.reduce((p,c)=>p+c,0)
            const profit = (total_sell - total_buy) - fee
            ele['total_buy'] = total_buy;
            ele['total_sell'] = total_sell;
            ele['pnl'] = profit;
            ele['roi'] = (100 * ((total_sell/total_buy) - 1)).toFixed(2)+'%';
            ele['verdict'] = profit <= 0 ? 'LOSS' : 'PROFIT'
        }
        if(ele.buy.length > ele.sell.length){
            var buy =  ele.buy.reverse();
            buy = buy.slice(0,ele.sell.length);
            const total_buy = buy.reduce((p,c)=>p+c,0)
            const total_sell = ele.sell.reduce((p,c)=>p+c,0)
            const fee = ele.fee.reduce((p,c)=>p+c,0)
            const profit = (total_sell - total_buy) - fee
            ele['total_buy'] = total_buy;
            ele['total_sell'] = total_sell;
            ele['pnl'] = profit;
            ele['roi'] = (100 * ((total_sell/total_buy) - 1)).toFixed(2)+'%';
            ele['verdict'] = profit <= 0 ? 'LOSS' : 'PROFIT'
        }
    })
    console.log('my_trades',my_trades)
}

module.exports = {
    getKucoinClient,
    getKucoinTradingHistory
}
