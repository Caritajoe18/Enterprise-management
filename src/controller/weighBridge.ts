import {Request, Response} from 'express';
import AuthToWeigh from '../models/AuthToWeigh';
import CustomerOrder from '../models/customerOrder';
import Customer from '../models/customers';
import { Transaction } from 'sequelize';
import Decimal from 'decimal.js';
import db from '../db';
import { AuthRequest } from '../middleware/adminAuth';
import Ledger from '../models/ledger';
import Weigh from '../models/weigh';


export const getAuthToWeighDetails = async (req: Request, res: Response) => {
    const { ticketId } = req.params;
  
    try {
      const ticket = await AuthToWeigh.findOne({
        where: { id: ticketId },
        include: [
          {
            model: CustomerOrder,
            as: "transaction",
            attributes: ["quantity"],
            include: [
                {
                  model: Customer, 
                  as: 'corder', 
                  attributes: [ "firstname", "lastname",]
                }
              ]
     
          },
        ],
      });
  
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      console.log("tick",ticket);
      // Prepare the response to include ticket and order quantity
      return res.status(200).json({
        message: "Ticket details retrieved successfully",
        ticket,
    
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  };


  export const createWeigh = async (req: Request, res: Response) => {
    try {
      
      const { authToWeighId } = req.body;
  
      const authToWeigh = await AuthToWeigh.findOne({
        where: { id: authToWeighId },
        include: [
          {
            //model: Transaction, // Include transaction if necessary
            as: 'transaction',
          },
        ],
      });
  
      if (!authToWeigh) {
        return res.status(404).json({ error: 'AuthToWeigh ticket not found' });
      }
  
      // Extract details from the retrieved AuthToWeigh ticket
      const {
        id,
        customerId,
        vehicleNo,
        tranxId,
        //transaction,
      } = authToWeigh.dataValues;
  
      // Calculate tar, gross, and net (this is just an example, adjust as needed)
      const tar = 1000; // Replace with the actual value, for example, fetched from the vehicle
      const gross = tar 
      //+ parseFloat(transaction.quantity); // gross = tar + product quantity
      const net = gross - tar; // net = gross - tar
  
      // Create the Weigh record with the auto-filled values
      const newWeigh = await Weigh.create({
        ...req.body,
        tranxId, // Reference to the transaction ID
        tar,     // Tar value
        gross,   // Gross weight
        net,     // Net weight
        customerId,  // Customer ID from the AuthToWeigh ticket
      // Driver name
        vehicleNo, // Vehicle number
      });
  
      return res.status(201).json({
        message: 'Weigh details created successfully',
        weigh: newWeigh,
      });
    } catch (error) {
      console.error('Error creating weigh details:', error);
      return res.status(500).json({ error: 'An error occurred while creating weigh details' });
    }
  };

  