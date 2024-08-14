import { Request, Response } from 'express';
import { loginSchema, option, signUpSchema } from '../validations/userValidation';
import AdminInstance from '../models/admin';
import { bcryptDecode, bcryptEncode, generateToken } from '../utilities/auths';
import RawMaterialInstance from '../models/rawMaterials';
import { v4 as uuidv4 } from "uuid"



 
  export const signupAdmin = async (req: Request, res: Response) => {
    try {
      const validationResult = signUpSchema.validate(req.body, option);
      if (validationResult.error) {
        return res
          .status(400)
          .json({ error: validationResult.error.details[0].message });
      }

      const { email, password } = req.body;
    
      const exist = await AdminInstance.findOne({ where: { email } }); 

      if (exist) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const passwordHashed = await bcryptEncode({ value: password });
    
      const admin = await AdminInstance.create({
        ...req.body,
        password: passwordHashed, 
        role: "admin",
        isAdmin: true,
      });

      console.log(admin);
      return res
        .status(201)
        .json({ message: "User created successfully", admin });
    } catch (error:any ) {
      res.status(500).json({ error: error.message }); 
    }
  }

  export const loginAdmin = async(req: Request, res: Response)=>{
    try {
      const {email, password} = req.body
      const valid= loginSchema.validate(req.body,option)
      if(valid.error){
        return res.status(400).json({error: valid.error.details[0].message});
      }
      let admin = await AdminInstance.findOne({where: {email}}) as AdminInstance;
if(!admin){
  return res.status(400).json({error: 'invalid credentials'})
}
console.log('adminnnnnn', admin)

const isValid = await bcryptDecode(password, admin.dataValues.password);
if (!isValid){
  return res.status(400).json({error:'invalid credentials'});
}
// if(!admin.dataValues.isVerified){
//   return res.status(400).json({
//     error:'please verify your email'
//   })
// }
const info = {
  id: admin.dataValues.id,
  role:  admin.dataValues.role
}
const token = await generateToken(info)

console.log(token);
return res.status(200).json({messages: 'login successfull', admin, token})
    } catch (error) {
    return res.status(500).json(error)  
    }

  }

  export const createRawMaterial = async( req: Request, res : Response )=>{
    try {
      const { name, price } = req.body;
      const id = uuidv4();

      const rawMaterial = await RawMaterialInstance.create({  id: id,
        name: name, price: price });
      res.status(201).json({ message: 'Raw material added successfully', rawMaterial });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  export const updateRawMaterial = async(req: Request, res: Response)=>{
    try {
      const {id} = req.params;
      const { price } = req.body;
      const rawMaterial = await RawMaterialInstance.findByPk(id);
      if (!rawMaterial) {
        return res.status(404).json({ error: 'Raw material not found' });
      }
      rawMaterial.dataValues.price = price;
      await rawMaterial.save();
      res.status(200).json({ message: 'Price updated successfully', rawMaterial });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }




