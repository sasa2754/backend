import mongoose, { Schema, Document } from 'mongoose';
import { ICompany } from '../interface/companyInterface.ts';


const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
}, {
  timestamps: true
});

export default mongoose.model<ICompany>('Company', CompanySchema);