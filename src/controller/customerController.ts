import { Request, Response} from 'express';
import {CustomerInstance} from '../models/customers';

export const createCustomer = async( req: Request, res: Response)=>{
try {
    
} catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  };
export const getCustomer = async( req: Request, res: Response)=>{
try {
    
} catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  };
export const getAllCustomers = async( req: Request, res: Response)=>{
try {
    
} catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  };
export const updateCustomer = async( req: Request, res: Response)=>{
try {
    
} catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  };
