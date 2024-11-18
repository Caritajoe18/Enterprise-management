// import { Request, Response } from "express";
// import Ledger from "../models/ledger"; // Adjust based on your actual imports
// import { v4 as uuidv4 } from "uuid";
// import { AuthRequest } from "../middleware/adminAuth";
// import Admins from "../models/admin";
// import CustomerOrder from "../models/customerOrder";
// import AccountBook from "../models/accountBook";
// import Customer from "../models/customers";
// import Products from "../models/products";
// import AuthToWeigh from "../models/AuthToWeigh";
// import Weigh from "../models/weigh";
// import Invoice from "../models/invoice";

// export const generateInvoice = async (req: AuthRequest, res: Response) => {
//   try {
//     const admin = req.admin as Admins;
//     const { roleId: adminId } = admin.dataValues;
//     const { tranxId } = req.params;
//     const ledger = await Ledger.findOne({
//       where: { tranxId }
//     });
//     const order = await CustomerOrder.findByPk(tranxId,{
//         attributes: ["id","price", "quantity"], 
//       include: [
//         {
//           model: Customer,
//           as: "corder", 
//           attributes: ["id","firstname", "lastname"], 
//         },
//         {
//           model: Products,
//           as: "porder", 
//           attributes: ["id","name"], 
//         },
//         {
//           model: AuthToWeigh,
//           as: "authToWeighTickets", 
//           attributes: ["id", "vehicleNo"], 
//         },
//         // {
//         //   model:Weigh,
//         //   as: "weighBridges", 
//         //   attributes: ["name"], 
//         // },
//       ],
//     });

//     if (!ledger) {
//       throw new Error("Ledger entry not found.");
//     }

//     // Extract data
//     const {
//       credit,
//       debit,
//       balance,
//       customerOrder,
//       accountBook,
//     } = ledger.dataValues as any;


//     await Invoice.create({
//         ...req.body
//       tranxId: customerOrder.id,
//       customerId,
//       ledgerId: ledger.dataValues.id,
//       vehicleNo: 
//       productId,
//       acctbookId: accountBook.id,
//       quantityOrdered,
//       prevBalance,
//       credit,
//       balanceBeforeDebit,
//       debit,
//       currentBalance,
//       bankName,
//       preparedBy: adminId | "MD", // Replace with actual preparer
//       invoiceNumber,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     console.log("Invoice generated successfully!");
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     }
//     res.status(500).json({ error: "An error occurred" });
//   }
// };
