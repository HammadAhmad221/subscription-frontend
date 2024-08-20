import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderForm from './OrderForm';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function StripeWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [subscriptionProducts,setSubscriptionProducts]=useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = 'http://localhost:3005/checkout?cartId=10d8b734-f30e-4062-98e7-b4b026faf6c8&items=%5B%7B%22productId%22%3A%22112%22%2C%22subscription%22%3Atrue%7D%2C%7B%22productId%22%3A%22113%22%2C%22subscription%22%3Afalse%7D%5D';
        // const url = 'http://localhost:3005/checkout?cartId=10d8b734-f30e-4062-98e7-b4b026faf6c8&items=%5B%7B%22productId%22%3A%22112%22%2C%22subscription%22%3Atrue%7D%5D';
      // const url = window.location.href;
        // Create a URL object
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        const cartId = params.get('cartId');
        const items = params.get('items');
        const parsedItems = JSON.parse(decodeURIComponent(items));
  
        if (!Array.isArray(parsedItems)) {
          console.error('Parsed items is not an array:', parsedItems);
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cart/${cartId}`);
        const data = response.data;
  
        const customerId = data.customer_id;
        const products = data.line_items.physical_items;  
        const combinedData = parsedItems.map(item => {
          const product = products.find(product => product.product_id === parseInt(item.productId));
  
          if (product) {
            return {
              productId: parseInt(item.productId),
              subscription: item.subscription,
              quantity: product.quantity,
              amount: product.sale_price,
              email:data.email,
            };
          }
  
          return null;
        }).filter(Boolean);
  
        setCustomerId(customerId);
        setSubscriptionProducts(combinedData);
  
        setIsMounted(true);
      } catch (error) {
        console.error('Error fetching cart data:', error.response ? error.response.data : error.message);
      }
    };
  
    fetchData();
  }, []);

  return (
    <Elements stripe={stripePromise}>
   {
    isMounted && <OrderForm
    initialCustomerId={customerId}
    subscriptionProducts={subscriptionProducts}
  />
   }
    </Elements>
  );
}

export default StripeWrapper;
