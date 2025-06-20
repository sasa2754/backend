import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  link?: string; // Link opcional para onde o usuário será redirecionado ao clicar
}

const NotificationSchema: Schema = new Schema({
  // Para qual usuário é esta notificação. Indexado para buscas rápidas.
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

export default mongoose.model<INotification>('Notification', NotificationSchema);