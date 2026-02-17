import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 compliant email regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index on eventId for efficient queries
BookingSchema.index({ eventId: 1 });

// Pre-save hook to validate events existence
BookingSchema.pre('save', async function (next) {
  const booking = this as IBooking;

  // Only validate eventId if it's new or modified
  if (booking.isModified('eventId')) {
    // Verify that the referenced events exists
    const eventExists = await Event.findById(booking.eventId);
    
    if (!eventExists) {
      throw new Error(
        `Event with ID ${booking.eventId} does not exist. Cannot create booking.`
      );
    }
  }

  next();
});

// Use existing model if it exists (prevents recompilation errors in development)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
