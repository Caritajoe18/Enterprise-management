import { model, Schema } from "mongoose";
export interface Iadmin {
    fullname:string,
    email:string,
    phoneNumber:string,
    department:string,
    role: string,
    password:string,
    active:boolean

     }

const adminModel = new Schema(
  {
    fullame: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    
    department: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Admin = model<Iadmin>("Admin", adminModel);
