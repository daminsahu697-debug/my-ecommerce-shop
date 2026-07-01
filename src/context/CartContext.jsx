import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [ cart, setCart ] = useState([]);
    const [ totalPrice, setTotalPrice ] = useState(0);

    // Automatically recalculate total price whenever the cart changes
    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalPrice(Number(total.toFixed(2)));
    }, [ cart ]);

    // Add item to cart or increment quantity if it exists
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [ ...prevCart, { ...product, quantity: 1 } ];
        });
    };

    // Remove an item completely from the cart
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Flush the cart upon checkout
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, totalPrice, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};