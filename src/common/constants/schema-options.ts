import { SchemaOptions } from 'mongoose'

export const schemaOptions: SchemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }
}
