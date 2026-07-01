import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Initialize Supabase admin inside your backend
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cartItems, customerName } = req.body;

        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        // Calculate total price
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Save order directly to Supabase right before sending to Stripe
        // Add a customer_email property to the insertion payload
        const { error } = await supabase.from('orders').insert([
            {
                customer_name: customerName || 'Anonymous Guest',
                customer_email: req.body.customerEmail, // Pass down from frontend request frame
                items: cartItems,
                total_amount: total,
                status: 'In Warehouse Pipeline'
            }
        ]);

        if (error) throw new Error("Supabase Order Logging Failed: " + error.message);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: [ 'card' ],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:5173/?success=true',
            cancel_url: 'http://localhost:5173/?canceled=true',
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4000, () => console.log('Payment & Order engine running on port 4000'));