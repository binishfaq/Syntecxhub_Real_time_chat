const chalk = require("chalk");
const mongoose = require("mongoose");

const DBconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);

        console.log(
            chalk.green("✓ Database connected successfully")
        );
    } catch (error) {
        console.log(
            chalk.red("✗ Database connection failed:"),
            chalk.red(error.message)
        );

        process.exit(1);
    }
};

module.exports = DBconnect;