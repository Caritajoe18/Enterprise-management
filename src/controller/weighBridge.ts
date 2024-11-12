import {Request, Response} from 'express';
import AuthToWeigh from '../models/AuthToWeigh';
import CustomerOrder from '../models/customerOrder';

export const getAuthToWeighDetails = async (req: Request, res: Response) => {
    const { ticketId } = req.params;
  
    try {
      // Fetch the AuthToWeigh ticket, including its linked CustomerOrder
      const ticket = await AuthToWeigh.findOne({
        where: { id: ticketId },
        include: [
          {
            model: CustomerOrder,
            as: "transaction",
            attributes: ["quantity"], // Only fetch the quantity to auto-fill the form
          },
        ],
      });
  
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
  
      // Prepare the response to include ticket and order quantity
      return res.status(200).json({
        message: "Ticket details retrieved successfully",
        ticket,
        // quantity: ticket.transaction ? ticket.transaction.quantity : null,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  };
  