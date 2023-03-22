const mongoose = require('mongoose');

const db = "mongodb+srv://mern_application:mern_application@cluster0.ibf0x.mongodb.net/ludo?retryWrites=true&w=majority";
//const db = "mongodb+srv://docode:" + encodeURIComponent("Docode@8427") + "@cluster0.ucix0zk.mongodb.net/aa_2?retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('MongoDB is Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;