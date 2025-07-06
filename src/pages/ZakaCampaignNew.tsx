import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StripeContainer from '../components/stripe/StripeContainer';
import CardPayment from '../components/stripe/CardPayment';

// Interface pour les dons
interface Donation {
  id: string;
  name: string;
  amount: number;
  isAnonymous: boolean;
  isRecurring: boolean;
  date: Date;
}

const ZakaCampaignNew = () => {
  const [totalCollected] = useState(149851);
  const [donationAmount, setDonationAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [equipmentItems, setEquipmentItems] = useState({
    benevole: { id: '', price: 0 },
    sac: { id: '', price: 0 },
    equipement: { id: '', price: 0 }
  });
  const [total, setTotal] = useState(0);
  const [paymentStep, setPaymentStep] = useState(1); // 1: sélection montant, 2: formulaire de paiement
  const [donorInfo, setDonorInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    taxReceipt: true
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [recentDonations] = useState<Donation[]>([
    { id: '1', name: 'Anonyme', amount: 26, isAnonymous: true, isRecurring: false, date: new Date(Date.now() - 3600000) },
    { id: '2', name: 'Lisa esther lafon', amount: 18, isAnonymous: false, isRecurring: true, date: new Date(Date.now() - 3600000 * 3) },
    { id: '3', name: 'Anonyme', amount: 52, isAnonymous: true, isRecurring: false, date: new Date(Date.now() - 3600000 * 7) },
    { id: '4', name: 'Dray Haim', amount: 52, isAnonymous: false, isRecurring: false, date: new Date(Date.now() - 3600000 * 7) },
    { id: '5', name: 'Croute JEROME MOANA', amount: 50, isAnonymous: false, isRecurring: false, date: new Date(Date.now() - 3600000 * 8) },
  ]);

  // Fonction pour formater le temps écoulé
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 3600;
    if (interval < 24) {
      return `il y a ${Math.floor(interval)}h`;
    }
    interval = seconds / 86400;
    return `il y a ${Math.floor(interval)}j`;
  };

  // Fonction pour gérer le changement de montant
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDonationAmount(value);
    
    // Mise à jour du total
    updateTotal(value ? parseInt(value) : 0);
  };

  // Fonction pour mettre à jour un équipement sélectionné
  const handleEquipmentChange = (type: 'benevole' | 'sac' | 'equipement', e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price') ? parseInt(selectedOption.getAttribute('data-price') || '0') : 0;
    
    setEquipmentItems(prev => ({
      ...prev,
      [type]: { id: e.target.value, price }
    }));
    
    // Recalcul du total
    const donationValue = donationAmount ? parseInt(donationAmount) : 0;
    const newItems = {...equipmentItems, [type]: { id: e.target.value, price }};
    const itemsTotal = newItems.benevole.price + newItems.sac.price + newItems.equipement.price;
    setTotal(donationValue + itemsTotal);
  };
  
  // Fonction pour mettre à jour le total
  const updateTotal = (donationValue: number) => {
    const itemsTotal = equipmentItems.benevole.price + equipmentItems.sac.price + equipmentItems.equipement.price;
    setTotal(donationValue + itemsTotal);
  };
  
  // Fonction pour passer à l'étape de paiement
  const goToPayment = () => {
    // Passer à l'étape du formulaire de paiement
    setPaymentStep(2);
    
    // Faire défiler jusqu'en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Fonction pour revenir à l'étape de sélection du montant
  const backToSelection = () => {
    setPaymentStep(1);
  };
  
  // Gestion des changements dans le formulaire donateur
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Traitement du paiement avec Stripe
  const handlePaymentSuccess = (paymentId: string) => {
    // Générer une référence de don
    const reference = `DON-ZK-${Math.floor(Math.random() * 1000000)}`;
    setPaymentReference(reference);
    console.log('Paiement réussi avec Stripe ID:', paymentId);
    setPaymentSuccess(true);
    
    // Ici, vous pourriez enregistrer le don dans votre base de données
  };
  
  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error);
    // Ici vous pourriez afficher un message d'erreur à l'utilisateur
  };

  // Afficher la partie appropriée en fonction de l'étape de paiement
  if (paymentSuccess) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-700 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/givplus-logo.png" 
                alt="GivPlus Logo"
                className="h-14"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/140x60?text=GivPlus';
                }}
              />
            </div>
            <div>
              <Link to="/" className="text-white hover:text-gray-200">Accueil</Link>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4">Merci pour votre don !</h2>
              <p className="text-xl mb-6">Votre contribution de <span className="font-bold">{total} €</span> aide ZAKA à sauver des vies.</p>
              <p className="mb-2">Référence de votre don: <span className="font-semibold">{paymentReference}</span></p>
              <p className="text-sm mb-6">Un reçu fiscal vous sera envoyé à l'adresse email fournie.</p>
              
              <div className="flex justify-center mt-8">
                <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (paymentStep === 2) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-700 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/givplus-logo.png" 
                alt="GivPlus Logo"
                className="h-14"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://via.placeholder.com/140x60?text=GivPlus';
                }}
              />
            </div>
            <div>
              <Link to="/" className="text-white hover:text-gray-200">Accueil</Link>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Formulaire de don pour ZAKA</h2>
            <button 
              onClick={backToSelection}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Retour
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Récapitulatif de votre don</h3>
                <span className="text-2xl font-bold text-indigo-600">{total} €</span>
              </div>
              {isRecurring && (
                <p className="text-sm text-gray-600 mb-2">Don mensuel</p>
              )}
              {equipmentItems.benevole.id && (
                <p className="text-sm text-gray-600 mb-1">- Formation bénévole: {equipmentItems.benevole.price}€</p>
              )}
              {equipmentItems.sac.id && (
                <p className="text-sm text-gray-600 mb-1">- Sac médical: {equipmentItems.sac.price}€</p>
              )}
              {equipmentItems.equipement.id && (
                <p className="text-sm text-gray-600 mb-1">- Équipement: {equipmentItems.equipement.price}€</p>
              )}
            </div>
            
            <form>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Vos coordonnées</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={donorInfo.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={donorInfo.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={donorInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Nécessaire pour recevoir votre reçu fiscal</p>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={donorInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={donorInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={donorInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <select
                    name="country"
                    value={donorInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                    <option value="Israël">Israël</option>
                    <option value="Autre">Autre pays</option>
                  </select>
                </div>
                
                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(!isAnonymous)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Je souhaite faire un don anonyme</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Informations de paiement</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Carte bancaire</span>
                    </label>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="p-4 border border-gray-300 rounded-md">
                      <p className="text-sm text-gray-500 mb-3">Saisissez les informations de votre carte bancaire en toute sécurité</p>
                      <StripeContainer>
                        <CardPayment
                          amount={total.toString()}
                          isRecurring={isRecurring}
                          donorInfo={{
                            firstName: donorInfo.firstName,
                            lastName: donorInfo.lastName,
                            email: donorInfo.email
                          }}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </StripeContainer>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Le bouton de paiement est géré par le composant CardPayment de Stripe */}
              {paymentMethod !== 'card' && (
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition duration-200"
                >
                  Payer {total} € maintenant
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      {/* Barre de navigation GivPlus avec le dégradé violet */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-700 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/givplus-logo-white.png" 
              alt="GivPlus" 
              className="h-14"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/140x50?text=GivPlus";
              }}
            />
          </div>
          <Link to="/" className="text-white hover:text-gray-200">Retour à l'accueil</Link>
        </div>
      </div>
      
      {/* Bannière "Je soutiens ZAKA" */}
      <div className="bg-yellow-400 py-3 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold">JE SOUTIENS ZAKA <span role="img" aria-label="pointing hand">👉</span></h2>
        </div>
      </div>

      {/* Section principale avec vidéo et informations */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne gauche - Vidéo et informations */}
          <div className="lg:w-2/3">
            {/* Intégration de la vidéo YouTube */}
            <div className="aspect-w-16 aspect-h-9 mb-8">
              <iframe 
                className="w-full h-[400px]"
                src="https://www.youtube.com/embed/XUhF_aCt-TM?si=_5JQEJLzwvBCFjbM" 
                title="ZAKA face aux traces du chaos à Rehovot" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Section URGENCE ISRAEL */}
            <div className="bg-white p-6 rounded-lg border mb-8">
              <h2 className="text-2xl font-bold mb-4">URGENCE ISRAEL</h2>
              <h3 className="text-xl font-bold mb-4">ISRAËL EN ALERTE MAXIMALE — ZAKA comme toujours, est en première ligne.</h3>
              
              <p className="mb-4">
                Face aux menaces directes de l'Iran, les services d'urgence israéliens ont été placés en état d'alerte.
              </p>
              <p className="mb-4">
                Les réservistes sont rappelés. Les abris se remplissent.
                Les consignes de sécurité s'enchaînent.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Equipez les benevoles de ZAKA !</h3>
              <p className="mb-4">
                Jour et nuit, nos bénévoles se tiennent prêts à intervenir lors d'attaques, d'attentats ou de catastrophes.
              </p>
              
              <p className="mb-4">
                Mais sans équipement adapté, ils ne peuvent rien faire.
              </p>
              
              <p className="mb-4">
                Aujourd'hui, ZAKA doit immédiatement :
              </p>
              
              <ul className="list-none mb-6">
                <li className="flex items-center mb-2">
                  <span className="bg-green-500 text-white rounded-full p-1 mr-2">✓</span>
                  Ravitailler ses véhicules d'intervention
                </li>
                <li className="flex items-center mb-2">
                  <span className="bg-green-500 text-white rounded-full p-1 mr-2">✓</span>
                  Déployer des unités mobiles et des générateurs dans les zones sensibles
                </li>
                <li className="flex items-center mb-2">
                  <span className="bg-green-500 text-white rounded-full p-1 mr-2">✓</span>
                  Équiper chaque bénévole de gilets de protection, radios de communication et kits de premiers secours
                </li>
              </ul>
              
              <p className="text-xl font-bold text-center mb-4">
                <span role="img" aria-label="target">🎯</span> Chaque minute compte. Chaque don sauve des vies.
              </p>
              
              <p className="mb-4">
                Nos équipes sont formées, courageuses, prêtes à risquer leur vie pour les autres.
                Mais elles ont besoin de VOUS, maintenant.
              </p>
              
              <p className="text-lg font-bold mb-4">
                <span role="img" aria-label="pointing hand">👉</span> Soutenez ZAKA — Aidez ceux qui interviennent quand personne d'autre n'ose.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <img 
                  src="/1.jpg" 
                  alt="Équipes ZAKA en action 1" 
                  className="w-full h-48 object-cover rounded-md shadow-md" 
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=ZAKA+en+action";
                  }}
                />
                <img 
                  src="/2.jpg" 
                  alt="Équipes ZAKA en action 2" 
                  className="w-full h-48 object-cover rounded-md shadow-md" 
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=ZAKA+en+action";
                  }}
                />
                <img 
                  src="/3.jpg" 
                  alt="Équipes ZAKA en action 3" 
                  className="w-full h-48 object-cover rounded-md shadow-md" 
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=ZAKA+en+action";
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Colonne droite - Informations de don et formulaire */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/Zaka_Logo.png" 
                  alt="ZAKA FRANCE" 
                  className="w-24 h-24"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/120x120?text=ZAKA";
                  }}
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">ZAKA FRANCE</h3>
              
              <div className="text-center mb-4">
                <p className="text-gray-600">Montant collecté</p>
                <p className="text-3xl font-bold text-green-600">{totalCollected.toLocaleString()}€</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Equipez les bénévoles de ZAKA</h4>
                <p className="text-sm mb-2">Don libre</p>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <input
                    type="text"
                    value={donationAmount}
                    onChange={handleAmountChange}
                    className="flex-grow p-2 focus:outline-none"
                    placeholder="Montant"
                  />
                  <span className="px-3 bg-gray-100">€</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">J'équipe un bénévole de ZAKA</h4>
                <select 
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => handleEquipmentChange('benevole', e)}
                  value={equipmentItems.benevole.id}
                >
                  <option value="">Au choix</option>
                  <option value="gilet" data-price="180">Gilet de protection - 180€</option>
                  <option value="kit" data-price="120">Kit de premiers secours - 120€</option>
                  <option value="radio" data-price="150">Radio de communication - 150€</option>
                </select>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Sac d'intervention d'urgence</h4>
                <select 
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => handleEquipmentChange('sac', e)}
                  value={equipmentItems.sac.id}
                >
                  <option value="">Au choix</option>
                  <option value="medical" data-price="350">Sac médical complet - 350€</option>
                  <option value="standard" data-price="250">Sac de secours standard - 250€</option>
                  <option value="avance" data-price="450">Kit d'urgence avancé - 450€</option>
                </select>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Équipement spécial</h4>
                <select 
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => handleEquipmentChange('equipement', e)}
                  value={equipmentItems.equipement.id}
                >
                  <option value="">Au choix</option>
                  <option value="lampe" data-price="80">Lampe frontale puissante - 80€</option>
                  <option value="casque" data-price="120">Casque de protection - 120€</option>
                  <option value="complet" data-price="500">Équipement complet - 500€</option>
                </select>
              </div>
              
              <div className="mb-4">
                <p className="text-right font-bold">Total: {total} €</p>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="donationType" 
                    checked={!isRecurring}
                    onChange={() => setIsRecurring(false)}
                    className="mr-2" 
                  />
                  <span>Je donne en une fois</span>
                </label>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="donationType" 
                    checked={isRecurring}
                    onChange={() => setIsRecurring(true)}
                    className="mr-2" 
                  />
                  <span>Je donne en plusieurs fois</span>
                </label>
              </div>
              
              <button 
                onClick={goToPayment}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md text-center mb-3"
              >
                Je fais un don de {total} € maintenant
              </button>
              
              <button 
                onClick={goToPayment}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md text-center"
              >
                Payer {total} ₪ (sans CERFA)
              </button>
            </div>
            
            {/* Derniers dons */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Derniers dons</h3>
              
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center border-t py-3 last:border-b">
                    <div className="flex-shrink-0 mr-3">
                      {donation.isAnonymous ? (
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                          A
                        </div>
                      ) : (
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                          {donation.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{donation.isAnonymous ? 'Anonyme' : donation.name}</p>
                      <p className="text-sm text-gray-500">{timeAgo(donation.date)}</p>
                    </div>
                    <div className="font-bold ml-auto">
                      {donation.amount}€{donation.isRecurring ? ' / mois' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakaCampaignNew;
