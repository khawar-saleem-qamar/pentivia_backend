const {is, sendRes} = require("../helpers/otherHelpers")
const TypingTest = require("../models/typingTestModel");

const saveTestInfo = async (req, res)=>{
    try{
        var {userid, measurments, words, bar, time, typingContent, typingSource, averageWpm, averageRaw, accuracy} = req.body

        console.log("data: ", {
            userid,
            graphData: measurments,
            colorString: words,
            bar_type: bar,
            time_type: time,
            content_type: typingContent,
            source_type: typingSource,
            wpm: averageWpm,
            raw: averageRaw,
            accuracy: accuracy
        })

        await TypingTest.create({
            userid,
            graphData: measurments,
            colorString: words,
            bar_type: bar,
            time_type: time,
            content_type: typingContent,
            source_type: typingSource,
            wpm: averageWpm,
            raw: averageRaw,
            accuracy: accuracy
        })

        sendRes(res, 200, true, "Updated test")

    }catch(error){
        console.log("error: ", error);
        sendRes(res, 400, false, error.message)
    }
}

module.exports = {
    saveTestInfo
}