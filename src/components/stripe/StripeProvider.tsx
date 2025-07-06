import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialisez Stripe avec votre clé publique
// ATTENTION: Nous utilisons une clé live ici
const stripePromise = loadStripe('pk_live_51RNNSs07Bycrd0iJX7QvWm2SscBwZmxHtrc2zkuX2ETYHULPJm8xLbumW95SpFttBfFBrkj92pqvOfaKXpmaffhe00ir7lOGfm');

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
