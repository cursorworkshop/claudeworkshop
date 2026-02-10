import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 500 }
      );
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    const { amount, currency = 'eur', description } = await request.json();

    // Calculate seats from amount (€500 per seat)
    const seats = Math.round(amount / 500);

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Claude Code Engineering Offsite - Reservation Fee',
              description: `November 2025 • Mani Peninsula, Greece • ${seats} seat${seats > 1 ? 's' : ''}`,
            },
            unit_amount: 50000, // €500 per seat in cents
          },
          quantity: seats,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/reserve/success?seats=${seats}&amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/reserve`,
      metadata: {
        workshop: 'claude-engineering-offsite-november-2025',
        type: 'reservation',
        seats: seats.toString(),
        amount_per_seat: '500',
        total_amount: amount.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
