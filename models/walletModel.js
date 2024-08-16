const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, required: true },
    currentAmount:{type:Number, default:0},
    netAmount:{type:Number, default:0}
})

module.exports = mongoose.model('Wallet', walletSchema)