import { Sequelize } from "sequelize";
//import fs from "fs";
//import path from "path";

// const file = path.join(__dirname, "../..", "certificate.pem");
// const file2 = path.join(__dirname, "../../", "private-key.pem");

const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD as string, {
	dialect: "mysql",
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT as string),
	// //ssl: true,
	// dialectOptions: {
	// 	ssl: {
	// 		key: fs.readFileSync(file2),
	// 		cert: fs.readFileSync(file),
	// 	},
	// },
});

export default sequelize;
