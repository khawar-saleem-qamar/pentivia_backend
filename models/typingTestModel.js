const mongoose = require("mongoose");

const typingTestSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId
  },
  graphData: { 
    type: [{
      correctLetters: Number,
      incorrectLetters: Number,
      extrasLetters: Number,
      correctWords: Number,
      totalTypedWords: Number,
      incorrectWords: Number,
      wpm: Number,
      raw: Number
    }], 
    default: []
  },
  colorString: {
    type: [{
      stringTyped: String,
      extraString: String,
      originalWord: String,
      type: {type: String}
    }],
    default: []
  },
  bar_type: String,
  time_type: Number,
  content_type: String,
  source_type: String,
  wpm: Number,
  raw: Number,
  accuracy: Number
});

module.exports = mongoose.model("TypingTest", typingTestSchema);
