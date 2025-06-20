"use client";

import { useEffect, useState } from "react";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useConnect, useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useSendCalls } from "wagmi/experimental";
import { baseSepolia } from "wagmi/chains";
import Image from "next/image";

interface DataRequest {
  email: boolean;
  name: boolean;
  physicalAddress: boolean;
  phoneNumber: boolean;
}

interface ProfileResult {
  success: boolean;
  email?: string;
  name?: string;
  address?: string;
  phoneNumber?: string;
  error?: string;
  transactionHash?: string;
}

interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  price: string;
  image: string;
  description: string;
}

type PageSection = 'concerts' | 'giveaway' | 'profile' | 'privacy' | 'about' | 'contact';

export default function Page() {
  const { address, isConnected, chain } = useAccount();
  const [currentSection, setCurrentSection] = useState<PageSection>('concerts');
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [cart, setCart] = useState<{id: string, title: string, artist: string, image: string, quantity: number, price: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [addedToCartAnimation, setAddedToCartAnimation] = useState<string | null>(null);
  const [giveawayPool, setGiveawayPool] = useState(12.5); // Current pool amount
  const [giveawayParticipants, setGiveawayParticipants] = useState(125);
  const [userTickets, setUserTickets] = useState<{id: string, title: string, artist: string, date: string, venue: string, purchaseDate: string, qrCode: string}[]>([]);
  const [userGiveawayEntries, setUserGiveawayEntries] = useState(0);
  const [processedTransactions, setProcessedTransactions] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState({
    username: '',
    profileImage: '',
    bio: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showGiveawaySuccess, setShowGiveawaySuccess] = useState(false);

  // Load profile from localStorage on component mount
  useEffect(() => {
    if (address) {
      const savedProfile = localStorage.getItem(`clicket-profile-${address}`);
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    }
  }, [address]);
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    name: true,
    physicalAddress: true,
    phoneNumber: false
  });
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { sendCalls, data, error, isPending } = useSendCalls();
  
  // Debug isPending state
  useEffect(() => {
    console.log('isPending changed:', isPending);
  }, [isPending]);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Concert data with the provided images
  const concerts: Concert[] = [
    {
      id: "1",
      title: "Electric Nights",
      artist: "DJ Thunder",
      date: "2024-02-15",
      venue: "Madison Square Garden",
      price: "1 USDC",
      image: "/image.jpg",
      description: "An electrifying night of electronic music with stunning visuals"
    },
    {
      id: "2", 
      title: "Acoustic Sessions",
      artist: "Sarah Mitchell",
      date: "2024-02-22",
      venue: "Brooklyn Bowl",
      price: "1 USDC",
      image: "/image2.jpg",
      description: "Intimate acoustic performance in a cozy setting"
    },
    {
      id: "3",
      title: "Rock Revolution",
      artist: "The Storm",
      date: "2024-03-01",
      venue: "Red Rocks Amphitheatre",
      price: "1 USDC", 
      image: "/image3.jpg",
      description: "High-energy rock concert under the stars"
    },
    {
      id: "4",
      title: "Jazz & Blues Night",
      artist: "Marcus Johnson",
      date: "2024-03-08",
      venue: "Blue Note",
      price: "1 USDC",
      image: "/image4.jpg",
      description: "Smooth jazz and soulful blues in an intimate venue"
    },
    {
      id: "5",
      title: "Hip Hop Fusion",
      artist: "MC Vibe",
      date: "2024-03-15",
      venue: "Apollo Theater",
      price: "1 USDC",
      image: "/image5.jpg",
      description: "Dynamic hip hop performance with live band fusion"
    },
    {
      id: "6",
      title: "Pop Spectacular",
      artist: "Luna Star",
      date: "2024-03-22",
      venue: "Staples Center",
      price: "1 USDC",
      image: "/image6.jpg",
      description: "Glittering pop extravaganza with amazing stage production"
    },
    {
      id: "7",
      title: "Indie Collective",
      artist: "The Dreamers",
      date: "2024-03-29",
      venue: "The Fillmore",
      price: "1 USDC",
      image: "/image7.jpg",
      description: "Alternative indie rock with atmospheric soundscapes"
    },
    {
      id: "8",
      title: "R&B Groove",
      artist: "Soul Harmony",
      date: "2024-04-05",
      venue: "House of Blues",
      price: "1 USDC",
      image: "/image8.jpg",
      description: "Smooth R&B vibes with powerful vocal performances"
    }
  ];

  // Function to get callback URL
  function getCallbackURL() {
    return "https://877b-178-235-179-3.ngrok-free.app/api/data-validation";
  }

  // Handle response data when sendCalls completes
  useEffect(() => {
    if (data) {
      console.log('Transaction data received:', data);
      
      // Create a unique transaction ID
      const transactionId = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Check if we already processed this transaction
      if (processedTransactions.has(transactionId)) {
        console.log('Transaction already processed:', transactionId);
        return;
      }
      
      // Mark transaction as processed
      setProcessedTransactions(prev => new Set(prev).add(transactionId));
      
      // Check if this was a giveaway entry or ticket purchase
      const isGiveawayEntry = currentSection === 'giveaway';
      
      if (isGiveawayEntry) {
        console.log('Processing giveaway entry');
        
        // Show success animation
        setShowGiveawaySuccess(true);
        
        setResult({ 
          success: true,
          email: "🎉 Congratulations! You joined the VIP Giveaway!",
          address: "You've been entered into the weekly drawing"
        });
        setUserGiveawayEntries(prev => prev + 1);
        setGiveawayParticipants(prev => prev + 1);
        setGiveawayPool(prev => Math.round((prev + 0.10) * 100) / 100);

        // Hide success animation after 4 seconds
        setTimeout(() => {
          setShowGiveawaySuccess(false);
        }, 4000);
      } else {
        console.log('Processing ticket purchase');
        setResult({ 
          success: true,
          email: "Profile data collected successfully",
          address: "Tickets purchased successfully"
        });
        
        // Add purchased tickets to user profile - only if cart has items
        if (cart.length > 0) {
          const newTickets = cart.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            date: concerts.find(c => c.id === item.id)?.date || "2024-03-15",
            venue: concerts.find(c => c.id === item.id)?.venue || "TBA",
            purchaseDate: new Date().toLocaleDateString(),
            qrCode: `QR-${item.id}-${Date.now()}`
          }));
          
          setUserTickets(prev => [...prev, ...newTickets]);
          
          // Clear cart after successful purchase
          setCart([]);
          // Auto-close cart modal after success
          setTimeout(() => {
            setShowCart(false);
          }, 3000);
        }
      }
      
      setIsProcessing(false);
    }
  }, [data]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.log('Transaction error:', error);
      setResult({
        success: false,
        error: error.message || "Transaction failed"
      });
      setIsProcessing(false);
    }
  }, [error]);

  // Add timeout for processing state
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        console.log('Transaction timeout - stopping processing state');
        setIsProcessing(false);
        if (!result) {
          setResult({
            success: false,
            error: "Transaction timed out. Please try again."
          });
        }
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isProcessing, result]);

  // Handle ticket purchase
  async function handleTicketPurchase(concert: Concert) {
    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    if (!address) {
      setResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    try {
      setResult(null);
      setIsProcessing(true);

      // Check if we're on the right chain
      if (chain?.id !== baseSepolia.id) {
        try {
          await switchChain({ chainId: baseSepolia.id });
        } catch (switchError) {
          setResult({ 
            success: false, 
            error: "Please switch to Base Sepolia network to continue" 
          });
          setIsProcessing(false);
          return;
        }
      }

      // Build requests array for ticket purchase
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      // Send ticket purchase with 1 USDC transfer
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
                parseUnits("1", 6), // 1 USDC for ticket purchase
              ],
            }),
          },
        ],
        chainId: 84532, // Base Sepolia
        capabilities: {
          dataCallback: {
            requests: requests,
            callbackURL: getCallbackURL(),
          },
        },
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
      setIsProcessing(false);
    }
  }

  // Cart functions
  const addToCart = (concert: Concert) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === concert.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === concert.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: concert.id,
          title: concert.title,
          artist: concert.artist,
          image: concert.image,
          quantity: 1,
          price: 1 // 1 USDC per ticket
        }];
      }
    });
    
    // Show animation
    setAddedToCartAnimation(concert.id);
    setTimeout(() => {
      setAddedToCartAnimation(null);
    }, 2000);
  };

  const removeFromCart = (concertId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== concertId));
  };

  const updateQuantity = (concertId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(concertId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === concertId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle checkout for entire cart
  async function handleCheckout() {
    if (cart.length === 0) {
      setResult({ success: false, error: "Your cart is empty" });
      return;
    }

    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    if (!address) {
      setResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    try {
      setResult(null);
      setIsProcessing(true);

      // Check if we're on the right chain
      if (chain?.id !== baseSepolia.id) {
        try {
          await switchChain({ chainId: baseSepolia.id });
        } catch (switchError) {
          setResult({ 
            success: false, 
            error: "Please switch to Base Sepolia network to continue" 
          });
          setIsProcessing(false);
          return;
        }
      }

      // Build requests array for ticket purchase
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      const totalAmount = getTotalPrice();

      // Send ticket purchase with total USDC transfer
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
                parseUnits(totalAmount.toString(), 6), // Total USDC for all tickets
              ],
            }),
          },
        ],
        chainId: 84532, // Base Sepolia
        capabilities: {
          dataCallback: {
            requests: requests,
            callbackURL: getCallbackURL(),
          },
        },
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
      setIsProcessing(false);
    }
  }

  // Giveaway participation
  async function handleGiveawayEntry() {
    console.log('Starting giveaway entry process');
    
    if (!address) {
      setResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    if (!dataToRequest.email || !dataToRequest.name) {
      setResult({ success: false, error: "Email and Name are required for giveaway participation" });
      return;
    }

    try {
      setResult(null);
      setIsProcessing(true);
      console.log('Set processing to true');

      // Check if we're on the right chain
      if (chain?.id !== baseSepolia.id) {
        console.log('Wrong chain, switching to Base Sepolia');
        try {
          await switchChain({ chainId: baseSepolia.id });
        } catch (switchError) {
          console.log('Chain switch failed:', switchError);
          setResult({ 
            success: false, 
            error: "Please switch to Base Sepolia network to continue" 
          });
          setIsProcessing(false);
          return;
        }
      }

      console.log('Sending giveaway transaction');
      
      // Build requests array based on user selection
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      // Send 0.10 USDC to giveaway pool
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth (giveaway pool)
                parseUnits("0.10", 6), // 0.10 USDC for giveaway entry
              ],
            }),
          },
        ],
        chainId: 84532, // Base Sepolia
        capabilities: {
          dataCallback: {
            requests: requests,
            callbackURL: getCallbackURL(),
          },
        },
      });
      console.log('Transaction sent, waiting for response');
    } catch (err) {
      console.log('Giveaway entry error:', err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
      setIsProcessing(false);
    }
  }

  // Reset state when changing sections
  useEffect(() => {
    setResult(null);
    setIsProcessing(false);
  }, [currentSection]);

  // Profile management functions
  const handleProfileUpdate = () => {
    // Save profile to localStorage
    if (address) {
      localStorage.setItem(`clicket-profile-${address}`, JSON.stringify(userProfile));
    }
    
    setIsEditingProfile(false);
    setResult({
      success: true,
      email: "Profile updated successfully! 🎉",
      address: "Your Clicket profile has been saved"
    });
    
    // Clear result after 3 seconds
    setTimeout(() => {
      setResult(null);
    }, 3000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setUserProfile(prev => ({
      ...prev,
      profileImage: avatarUrl
    }));
  };

  const clearProfile = () => {
    if (address && confirm('Are you sure you want to clear your profile?')) {
      localStorage.removeItem(`clicket-profile-${address}`);
      setUserProfile({
        username: '',
        profileImage: '',
        bio: ''
      });
      setResult({
        success: true,
        email: "Profile cleared! 🗑️",
        address: "Your profile data has been removed"
      });
      
      setTimeout(() => {
        setResult(null);
      }, 3000);
    }
  };

  // Reset selected concert
  const resetSelection = () => {
    setSelectedConcert(null);
    setResult(null);
    setAgreedToPrivacy(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/imagebckgr.jpg)',
          filter: 'blur(8px)',
          transform: 'scale(1.1)', // Prevent white edges from blur
          zIndex: -2
        }}
      />
      {/* Overlay for better text readability */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-pink-800/80"
        style={{ zIndex: -1 }}
      />
      
      <div className="relative z-10">
      {/* Giveaway Success Animation */}
      {showGiveawaySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl transform animate-bounce">
            <div className="text-6xl mb-4 animate-pulse">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-purple-100 mb-4">
              You successfully joined the VIP Giveaway!
            </p>
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <p className="text-white font-semibold">
                💰 Prize Pool: {giveawayPool.toFixed(2)} USDC
              </p>
              <p className="text-purple-200 text-sm">
                👥 Participants: {giveawayParticipants}
              </p>
              <p className="text-purple-200 text-sm">
                🎯 Your Chances: {((userGiveawayEntries / giveawayParticipants) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="flex justify-center space-x-2 text-2xl animate-bounce">
              <span className="animate-pulse">🎊</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>🎉</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>🎊</span>
              <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>🎉</span>
              <span className="animate-pulse" style={{ animationDelay: '0.8s' }}>🎊</span>
            </div>
            <p className="text-purple-200 text-sm mt-4">
              Drawing every Sunday at 8:00 PM EST
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                🎵 Clicket
              </h1>
              <span className="text-purple-300 text-sm hidden md:block">Concert Tickets</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => setCurrentSection('concerts')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  currentSection === 'concerts' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                🎫 Concerts
              </button>
              <button
                onClick={() => setCurrentSection('giveaway')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  currentSection === 'giveaway' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                🎰 VIP Giveaway
              </button>
              {isConnected && (
                <button
                  onClick={() => setCurrentSection('profile')}
                  className={`px-3 py-2 rounded-lg transition-all text-sm ${
                    currentSection === 'profile' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                  }`}
                >
                  👤 Profile
                </button>
              )}
              <button
                onClick={() => setCurrentSection('about')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  currentSection === 'about' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                ℹ️ About
              </button>
              <button
                onClick={() => setCurrentSection('contact')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  currentSection === 'contact' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                📞 Contact
              </button>
            </nav>

            {/* Cart and Wallet Connection */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-purple-200 hover:text-white transition-colors"
              >
                <span className="text-2xl">🛒</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {isConnected ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile Info */}
                  <div className="flex items-center space-x-2">
                    {userProfile.profileImage && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400">
                        <img 
                          src={userProfile.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-right">
                      {userProfile.username && (
                        <div className="text-white font-semibold text-sm">
                          👋 {userProfile.username}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-green-500/20 px-2 py-1 rounded-full">
                        <span className="text-green-400 text-xs">🔗</span>
                        <span className="text-white font-mono text-xs">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-sm text-purple-300 hover:text-white transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Concerts Section */}
        {currentSection === 'concerts' && (
          <div>
            {!selectedConcert ? (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    🎵 Amazing Concerts
                  </h2>
                  <p className="text-xl text-purple-200 mb-6">
                    Choose your concert and buy tickets with crypto
                  </p>
                  {!isConnected && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-yellow-200 text-sm">
                        🔒 Connect your wallet to unlock ticket purchasing
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {concerts.map((concert) => {
                    const isInCart = cart.some(item => item.id === concert.id);
                    const cartItem = cart.find(item => item.id === concert.id);
                    
                    return (
                                         <div key={concert.id} className={`bg-white/15 backdrop-blur-xl rounded-xl overflow-hidden hover:bg-white/25 transition-all shadow-xl border border-white/20 ${isInCart ? 'ring-4 ring-green-400 ring-opacity-60 shadow-lg shadow-green-400/20 animate-pulse' : ''}`}>
                                              <div className="relative h-64 md:h-72 lg:h-80">
                                                  <Image
                            src={concert.image}
                            alt={concert.title}
                            fill
                            className="object-cover object-center"
                          />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {isInCart && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {cartItem?.quantity}
                          </div>
                        )}
                        {addedToCartAnimation === concert.id && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold animate-bounce">
                              ✅ Added to Cart!
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-lg font-bold">{concert.title}</h3>
                          <p className="text-sm opacity-90">{concert.artist}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-purple-200 text-sm">📅 {concert.date}</p>
                            <p className="text-purple-200 text-sm">📍 {concert.venue}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">{concert.price}</p>
                          </div>
                        </div>
                        <p className="text-purple-200 text-sm mb-4">{concert.description}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addToCart(concert)}
                            disabled={!isConnected}
                            className={`flex-1 ${isInCart ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-all disabled:cursor-not-allowed`}
                          >
                            {!isConnected ? 'Connect Wallet' : 
                             isInCart ? `🛒 Add More (${cartItem?.quantity})` : '🛒 Add to Cart'}
                          </button>
                          <button
                            onClick={() => setSelectedConcert(concert)}
                            disabled={!isConnected}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                          >
                            ℹ️
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Selected Concert Purchase Flow */
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={resetSelection}
                  className="mb-6 flex items-center space-x-2 text-purple-300 hover:text-white transition-all"
                >
                  <span>←</span>
                  <span>Back to Concerts</span>
                </button>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <Image
                        src={selectedConcert.image}
                        alt={selectedConcert.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{selectedConcert.title}</h3>
                    <p className="text-purple-200 text-lg">{selectedConcert.artist}</p>
                    <p className="text-purple-200">📅 {selectedConcert.date} • 📍 {selectedConcert.venue}</p>
                    <p className="text-4xl font-bold text-white mt-4">{selectedConcert.price}</p>
                  </div>

                  {/* Data Collection Options */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📋 Required Information:</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.email}
                          onChange={() => setDataToRequest(prev => ({ ...prev, email: !prev.email }))}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-white">📧 Email Address (for ticket delivery)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.name}
                          onChange={() => setDataToRequest(prev => ({ ...prev, name: !prev.name }))}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-white">👤 Full Name (for ticket registration)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.physicalAddress}
                          onChange={() => setDataToRequest(prev => ({ ...prev, physicalAddress: !prev.physicalAddress }))}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-white">🏠 Physical Address (for ticket mailing)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.phoneNumber}
                          onChange={() => setDataToRequest(prev => ({ ...prev, phoneNumber: !prev.phoneNumber }))}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-white">📱 Phone Number (optional)</span>
                      </label>
                    </div>
                  </div>

                  {/* Privacy Agreement */}
                  <div className="mb-6">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={agreedToPrivacy}
                        onChange={() => setAgreedToPrivacy(!agreedToPrivacy)}
                        className="w-4 h-4 text-purple-600 rounded mt-1"
                      />
                      <span className="text-sm text-purple-200">
                        I agree to the{' '}
                        <button
                          onClick={() => setCurrentSection('privacy')}
                          className="text-purple-300 hover:text-white underline"
                        >
                          Privacy Policy
                        </button>{' '}
                        and understand that my data will be used for ticket delivery and event communication.
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => handleTicketPurchase(selectedConcert)}
                    disabled={!agreedToPrivacy || isProcessing || isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 px-6 rounded-lg font-semibold disabled:cursor-not-allowed transition-all"
                  >
                    {isProcessing || isPending ? "🔄 Processing..." : `🎫 Buy Ticket (${selectedConcert.price})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy Policy Section */}
        {currentSection === 'privacy' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="mb-8">
                <button
                  onClick={() => setCurrentSection('concerts')}
                  className="text-purple-600 hover:text-purple-800 mb-4 inline-block font-semibold"
                >
                  ← Back to Concerts
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  🔒 Privacy Policy
                </h1>
                <p className="text-gray-600">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-8 text-gray-700">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    📋 Information We Collect
                  </h2>
                  <p className="mb-4">
                    When you purchase concert tickets through Clicket, we collect the following information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Email Address:</strong> To deliver tickets and send event updates</li>
                    <li><strong>Full Name:</strong> For ticket registration and venue entry</li>
                    <li><strong>Physical Address:</strong> For ticket mailing and verification</li>
                    <li><strong>Phone Number (Optional):</strong> For urgent event-related communications</li>
                    <li><strong>Wallet Address:</strong> For transaction verification and payment processing</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    🎯 How We Use Your Information
                  </h2>
                  <p className="mb-4">
                    Your information is used exclusively for ticket-related purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Processing and delivering your concert tickets</li>
                    <li>Verifying your identity at the venue</li>
                    <li>Sending important event updates and notifications</li>
                    <li>Providing customer support for ticket-related issues</li>
                    <li>Preventing fraudulent ticket purchases</li>
                    <li>Complying with legal requirements for event management</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    🛡️ Data Protection & Security
                  </h2>
                  <p className="mb-4">
                    We implement appropriate security measures to protect your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Data is encrypted in transit and at rest</li>
                    <li>Access is limited to authorized personnel only</li>
                    <li>We use secure servers and trusted infrastructure</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    🚫 What We Don't Do
                  </h2>
                  <div className="bg-green-500/20 rounded-lg p-4">
                    <ul className="list-disc pl-6 text-green-200 space-y-2">
                      <li><strong>We DO NOT sell</strong> your personal information to third parties</li>
                      <li><strong>We DO NOT share</strong> your data with marketing companies</li>
                      <li><strong>We DO NOT use</strong> your information for unrelated marketing</li>
                      <li><strong>We DO NOT store</strong> unnecessary data longer than required</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    📤 Data Sharing & Third Parties
                  </h2>
                  <p className="mb-4">
                    We may share your information only in these limited circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Shipping Partners:</strong> Your address with delivery services for ticket shipment</li>
                    <li><strong>Event Organizers:</strong> Attendee information for venue security and entry</li>
                    <li><strong>Legal Requirements:</strong> If required by law or legal process</li>
                    <li><strong>Service Providers:</strong> With trusted partners who help us operate the ticketing service</li>
                  </ul>
                  <p className="mt-4">
                    All third parties are bound by strict confidentiality agreements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    ⏰ Data Retention
                  </h2>
                  <p className="mb-4">We retain your information for the following periods:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Active Ticket Period:</strong> Until event completion and any refund period</li>
                    <li><strong>Ticket Holders:</strong> Up to 1 year for customer service and record keeping</li>
                    <li><strong>Transaction Records:</strong> As required by financial regulations</li>
                  </ul>
                  <p className="mt-4">
                    After these periods, all personal data is securely deleted from our systems.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    ⚖️ Your Rights
                  </h2>
                  <p className="mb-4">You have the following rights regarding your personal data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your stored data</li>
                    <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
                    <li><strong>Deletion:</strong> Request removal of your data (subject to legal requirements)</li>
                    <li><strong>Withdrawal:</strong> Cancel your ticket purchase within the refund period</li>
                    <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    🔗 Smart Wallet & Blockchain Data
                  </h2>
                  <p className="mb-4">
                    This ticketing platform uses Coinbase Smart Wallet and Base blockchain technology:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Transaction data is recorded on the Base blockchain (public)</li>
                    <li>Personal information is NOT stored on the blockchain</li>
                    <li>Wallet addresses are public by nature of blockchain technology</li>
                    <li>Smart contract interactions may be visible in blockchain explorers</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    🍪 Cookies & Tracking
                  </h2>
                  <p className="mb-4">
                    Our website uses minimal tracking:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Essential cookies for wallet connection and functionality</li>
                    <li>No advertising or marketing cookies</li>
                    <li>No cross-site tracking</li>
                    <li>Session storage for user experience improvements</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    📞 Contact Us
                  </h2>
                  <div className="bg-purple-500/20 rounded-lg p-6">
                    <p className="mb-4">
                      If you have any questions about this Privacy Policy or your data:
                    </p>
                    <div className="space-y-2">
                      <p><strong>Email:</strong> privacy@clicket.example.com</p>
                      <p><strong>Subject Line:</strong> "Privacy Policy Question - Tickets"</p>
                      <p><strong>Response Time:</strong> Within 48 hours</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    📋 Policy Updates
                  </h2>
                  <p className="mb-4">
                    We may update this Privacy Policy from time to time. Changes will be:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Posted on this page with an updated "Last modified" date</li>
                    <li>Communicated to ticket holders via email for significant changes</li>
                    <li>Effective immediately upon posting unless otherwise stated</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    🏆 Base Builder Quest 6
                  </h2>
                  <div className="bg-blue-500/20 rounded-lg p-6">
                    <p className="mb-4">
                      This application was built for Base Builder Quest 6 to demonstrate:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Smart Wallet Profiles integration for secure data collection</li>
                      <li>Transparent privacy practices in blockchain applications</li>
                      <li>User-controlled data sharing with explicit consent</li>
                      <li>Responsible handling of personal information in Web3</li>
                    </ul>
        </div>
      </section>
              </div>
            </div>
          </div>
        )}

        {/* VIP Giveaway Section */}
        {currentSection === 'giveaway' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  🎰 VIP Ticket Giveaway
                </h2>
                <p className="text-xl text-purple-200 mb-6">
                  Enter for a chance to win VIP tickets to any concert!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Current Pool */}
                <div className="bg-gradient-to-br from-gold-400/20 to-yellow-500/20 rounded-xl p-6 border border-yellow-400/30">
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">💰 Prize Pool</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-2">{giveawayPool} USDC</p>
                    <p className="text-yellow-200">Current pool value</p>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl p-6 border border-blue-400/30">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">👥 Participants</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-2">{giveawayParticipants}</p>
                    <p className="text-blue-200">Total entries</p>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">🎯 How it works</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <h4 className="font-semibold text-white mb-2">1. Pay Entry Fee</h4>
                    <p className="text-purple-200 text-sm">Pay 0.10 USDC to enter the weekly drawing</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎲</div>
                    <h4 className="font-semibold text-white mb-2">2. Weekly Drawing</h4>
                    <p className="text-purple-200 text-sm">Random winner selected every Sunday at 8PM EST</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <h4 className="font-semibold text-white mb-2">3. Win VIP Tickets</h4>
                    <p className="text-purple-200 text-sm">Winner gets VIP tickets + backstage access</p>
                  </div>
                </div>
              </div>

              {/* User's entries */}
              {isConnected && userGiveawayEntries > 0 && (
                <div className="bg-green-500/20 rounded-xl p-6 mb-6 border border-green-400/30">
                  <h3 className="text-xl font-bold text-green-300 mb-2">🎫 Your Entries</h3>
                  <p className="text-green-200">
                    You have <strong>{userGiveawayEntries}</strong> entries in this week's drawing
                  </p>
                  <p className="text-green-200 text-sm mt-1">
                    Your chances: {((userGiveawayEntries / giveawayParticipants) * 100).toFixed(2)}%
                  </p>
                </div>
              )}

              {/* Required Information for Giveaway */}
              {isConnected && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-4">📋 Required Information</h3>
                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <p className="text-purple-200 mb-4">
                      Select which information you're willing to share for giveaway participation:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.email}
                          onChange={(e) => setDataToRequest(prev => ({ ...prev, email: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-white">
                          <strong>📧 Email Address</strong> - Required for winner notification
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.name}
                          onChange={(e) => setDataToRequest(prev => ({ ...prev, name: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-white">
                          <strong>👤 Full Name</strong> - Required for prize verification
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.physicalAddress}
                          onChange={(e) => setDataToRequest(prev => ({ ...prev, physicalAddress: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-white">
                          <strong>🏠 Physical Address</strong> - For prize shipping
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <input
                          type="checkbox"
                          checked={dataToRequest.phoneNumber}
                          onChange={(e) => setDataToRequest(prev => ({ ...prev, phoneNumber: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-white">
                          <strong>📱 Phone Number</strong> - Optional, for urgent communications
                        </span>
                      </label>
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                      <p className="text-yellow-200 text-sm">
                        ⚠️ <span className="font-semibold text-yellow-100">Email and Name are required</span> to participate in the giveaway.
                        Physical address is recommended for prize delivery.
                      </p>
                    </div>
                  </div>

                  {/* Privacy Policy Agreement */}
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">🔒 Privacy & Terms</h4>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={agreedToPrivacy}
                        onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                        className="mt-1 text-purple-600"
                      />
                      <span className="text-sm text-purple-200">
                        I agree to the{' '}
                        <button
                          onClick={() => setCurrentSection('privacy')}
                          className="text-purple-300 hover:text-white underline font-semibold"
                        >
                          Privacy Policy
                        </button>{' '}
                        and consent to sharing my selected information for giveaway participation. 
                        I understand that my wallet address and transaction will be recorded on the blockchain.
                      </span>
                    </label>
                    
                    <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <h5 className="font-semibold text-blue-200 mb-2">🎯 Giveaway Rules:</h5>
                      <ul className="text-blue-200 text-sm space-y-1">
                        <li>• Entry fee: 0.10 USDC per entry</li>
                        <li>• Drawing: Every Sunday at 8:00 PM EST</li>
                        <li>• Prize: VIP tickets + backstage access</li>
                        <li>• Winner selection: Provably random</li>
                        <li>• Multiple entries allowed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Entry button */}
              <div className="text-center">
                <button
                  onClick={handleGiveawayEntry}
                  disabled={!isConnected || isProcessing || !agreedToPrivacy || (!dataToRequest.email || !dataToRequest.name)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {!isConnected ? 'Connect Wallet to Enter' : 
                   !agreedToPrivacy ? 'Accept Privacy Policy' :
                   (!dataToRequest.email || !dataToRequest.name) ? 'Select Email & Name' :
                   isProcessing ? 'Processing Entry...' : 
                   'Enter Giveaway (0.10 USDC)'}
                </button>
                
                {!isConnected && (
                  <p className="text-purple-300 text-sm mt-2">
                    Connect your wallet to participate in the VIP giveaway
                  </p>
                )}
                
                {isConnected && (!dataToRequest.email || !dataToRequest.name || !agreedToPrivacy) && (
                  <p className="text-yellow-300 text-sm mt-2">
                    📋 Please complete the required information and accept the privacy policy above
                  </p>
                )}
              </div>

              {/* Next drawing countdown */}
              <div className="mt-8 text-center">
                <h4 className="text-lg font-semibold text-white mb-2">⏰ Next Drawing</h4>
                <p className="text-purple-200">Sunday, March 10th at 8:00 PM EST</p>
                <p className="text-purple-300 text-sm">3 days, 14 hours remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {currentSection === 'profile' && isConnected && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
              {/* Profile Header with Avatar and Edit */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg">
                      {userProfile.profileImage ? (
                        <img 
                          src={userProfile.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                          {userProfile.username ? userProfile.username.slice(0, 2).toUpperCase() : address?.slice(2, 4).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditingProfile && (
                      <button
                        onClick={() => document.getElementById('imageUpload')?.click()}
                        className="absolute -bottom-2 -right-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 text-xs transition-colors shadow-lg"
                      >
                        📷
                      </button>
                    )}
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-purple-200 text-sm mb-2 font-semibold">🏷️ Clicket Username</label>
                          <input
                            type="text"
                            value={userProfile.username}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-purple-200 text-sm mb-2 font-semibold">📝 Bio</label>
                          <textarea
                            value={userProfile.bio}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          />
                        </div>
                                                 <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleProfileUpdate}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                          >
                            ✅ Save
                          </button>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            ❌ Cancel
                          </button>
                          <button
                            onClick={generateRandomAvatar}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            🎲 Random Avatar
                          </button>
                          <button
                            onClick={clearProfile}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            🗑️ Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">
                            {userProfile.username || 'Clicket User'}
                          </h2>
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                        {userProfile.bio && (
                          <p className="text-purple-200 mb-3 italic text-center md:text-left">"{userProfile.bio}"</p>
                        )}
                        <div className="text-center md:text-left">
                          <p className="text-purple-200 mb-1">💳 Wallet: {address?.slice(0, 12)}...{address?.slice(-8)}</p>
                          <p className="text-purple-200 mb-1">📅 Member Since: March 2024</p>
                          <p className="text-purple-200">💰 Total Spent: {cart.length + userTickets.length} USDC</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Profile Stats */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📊 Profile Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-300 text-sm">Tickets Purchased</p>
                      <p className="text-white font-bold text-2xl">{userTickets.length}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Items in Cart</p>
                      <p className="text-white font-bold text-2xl">{getTotalItems()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Profile Completion</p>
                      <p className="text-white font-bold text-2xl">
                        {Math.round(((userProfile.username ? 1 : 0) + (userProfile.profileImage ? 1 : 0) + (userProfile.bio ? 1 : 0)) / 3 * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Giveaway Stats */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🎰 Giveaway Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-300 text-sm">Current Entries</p>
                      <p className="text-white font-bold">{userGiveawayEntries}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Total Entries</p>
                      <p className="text-white">12</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Wins</p>
                      <p className="text-white">0</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">⚡ Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentSection('giveaway')}
                      className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 py-2 px-4 rounded-lg transition-all"
                    >
                      🎰 Enter Giveaway
                    </button>
                    <button
                      onClick={() => setCurrentSection('concerts')}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 px-4 rounded-lg transition-all"
                    >
                      🎫 Buy Tickets
                    </button>
                    <button
                      onClick={() => setShowCart(true)}
                      className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 px-4 rounded-lg transition-all"
                    >
                      🛒 View Cart ({getTotalItems()})
                    </button>
                  </div>
                </div>
              </div>

              {/* Purchased Tickets */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white mb-4">🎫 Your Tickets</h3>
                {userTickets.length === 0 ? (
                  <div className="bg-white/5 rounded-xl p-8 text-center">
                    <span className="text-6xl mb-4 block">🎫</span>
                    <h4 className="text-xl font-semibold text-white mb-2">No tickets yet</h4>
                    <p className="text-purple-300 mb-4">Purchase your first concert ticket to see it here</p>
                    <button
                      onClick={() => setCurrentSection('concerts')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                      Browse Concerts
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-white/10 rounded-xl p-6 border border-white/20">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-white">{ticket.title}</h4>
                            <p className="text-purple-300">{ticket.artist}</p>
                            <p className="text-sm text-purple-400">{ticket.venue}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-purple-300">Event Date</p>
                            <p className="text-white font-semibold">{ticket.date}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                          <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-lg">
                              <div className="w-24 h-24 bg-gray-800 flex items-center justify-center text-white font-mono text-xs">
                                QR CODE
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Purchased:</span>
                          <span className="text-white">{ticket.purchaseDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {currentSection === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">ℹ️ About Clicket</h2>
              
              <div className="space-y-6 text-purple-200">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">🎵 What is Clicket?</h3>
                  <p>
                    Clicket is a revolutionary concert ticketing platform built on blockchain technology. 
                    We make buying concert tickets secure, transparent, and easy using cryptocurrency.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">🔗 Why Blockchain?</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>🔒 Secure transactions with Smart Wallet technology</li>
                    <li>⚡ Fast payments on Base blockchain</li>
                    <li>🌍 Global accessibility without traditional banking</li>
                    <li>📱 No hidden fees or intermediaries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">🎫 How It Works</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Connect your Coinbase Smart Wallet</li>
                    <li>Browse our curated concert selection</li>
                    <li>Choose your preferred concert</li>
                    <li>Provide necessary information for ticket delivery</li>
                    <li>Pay with USDC cryptocurrency</li>
                    <li>Receive your tickets via email</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">🏆 Built for Base Builder Quest 6</h3>
                  <p>
                    This application showcases Smart Wallet Profiles integration and demonstrates 
                    the future of decentralized ticketing systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        {currentSection === 'contact' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">📞 Contact Us</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6 text-purple-200">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Get in Touch</h3>
                    <div className="space-y-2">
                      <p>📧 Email: support@clicket.example.com</p>
                      <p>📱 Phone: +1 (555) 123-4567</p>
                      <p>🌐 Website: clicket.example.com</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Business Hours</h3>
                    <div className="space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                      <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Support</h3>
                    <p>
                      For technical issues, ticket problems, or general inquiries, 
                      our support team is here to help. We typically respond within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Contact</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300"
                    />
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300"
                    ></textarea>
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-semibold transition-all">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && currentSection === 'concerts' && (
          <div className={`mt-8 p-6 rounded-xl ${result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            {result.success ? (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  🎫 Ticket Purchase Successful!
                </h3>
                <p className="text-green-200 mb-4">
                  Your ticket for {selectedConcert?.title} has been purchased! Check your email for details.
                </p>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <p className="text-green-300 text-sm">✅ Payment sent to vitalik.eth</p>
                  <p className="text-green-300 text-sm">✅ Profile data collected and validated</p>
                  <p className="text-green-300 text-sm">✅ Ticket reservation confirmed</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">❌ Error</h3>
                <p className="text-red-200">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">🎵 Clicket</h3>
              <p className="text-purple-200 text-sm">
                The future of concert ticketing powered by blockchain technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentSection('concerts')}
                  className="block text-purple-300 hover:text-white transition-all"
                >
                  🎫 Concerts
                </button>
                <button
                  onClick={() => setCurrentSection('giveaway')}
                  className="block text-purple-300 hover:text-white transition-all"
                >
                  🎰 VIP Giveaway
                </button>
                {isConnected && (
                  <button
                    onClick={() => setCurrentSection('profile')}
                    className="block text-purple-300 hover:text-white transition-all"
                  >
                    👤 Profile
                  </button>
                )}
                <button
                  onClick={() => setCurrentSection('about')}
                  className="block text-purple-300 hover:text-white transition-all"
                >
                  ℹ️ About
                </button>
                <button
                  onClick={() => setCurrentSection('contact')}
                  className="block text-purple-300 hover:text-white transition-all"
                >
                  📞 Contact
                </button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentSection('privacy')}
                  className="block text-purple-300 hover:text-white transition-all"
                >
                  🔒 Privacy Policy
                </button>
                <a href="#" className="block text-purple-300 hover:text-white transition-all">
                  📄 Terms of Service
                </a>
                <a href="#" className="block text-purple-300 hover:text-white transition-all">
                  🍪 Cookie Policy
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="space-y-2">
                <a href="#" className="block text-purple-300 hover:text-white transition-all">
                  🐦 Twitter
                </a>
                <a href="#" className="block text-purple-300 hover:text-white transition-all">
                  📘 Facebook
                </a>
                <a href="#" className="block text-purple-300 hover:text-white transition-all">
                  📷 Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-purple-300 text-sm">
              © 2024 Clicket. Built with ❤️ for Base Builder Quest 6. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">🛒 Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cart Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">🛒</span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600">Add some concert tickets to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.artist}</p>
                        <p className="text-sm font-medium text-purple-600">{item.price} USDC each</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{item.price * item.quantity} USDC</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                {/* Required Information Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Required Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dataToRequest.email}
                        onChange={(e) => setDataToRequest(prev => ({ ...prev, email: e.target.checked }))}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>📧 Email Address</strong> - Required for ticket delivery
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dataToRequest.name}
                        onChange={(e) => setDataToRequest(prev => ({ ...prev, name: e.target.checked }))}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>👤 Full Name</strong> - Required for venue entry
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dataToRequest.physicalAddress}
                        onChange={(e) => setDataToRequest(prev => ({ ...prev, physicalAddress: e.target.checked }))}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>🏠 Physical Address</strong> - For ticket mailing if needed
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dataToRequest.phoneNumber}
                        onChange={(e) => setDataToRequest(prev => ({ ...prev, phoneNumber: e.target.checked }))}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>📱 Phone Number</strong> - Optional, for urgent communications
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Select which information you're willing to share. 
                    <span className="text-red-600 font-semibold">Email and Name are required</span> for ticket delivery.
                  </p>
                </div>

                {/* Privacy Agreement */}
                <div className="mb-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button
                        onClick={() => {
                          setShowCart(false);
                          setCurrentSection('privacy');
                        }}
                        className="text-purple-600 hover:underline font-semibold"
                      >
                        Privacy Policy
                      </button>{' '}
                      and consent to sharing my selected information for ticket processing.
                    </span>
                  </label>
                </div>

                {/* Total and Checkout */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Total: {getTotalPrice()} USDC
                    </p>
                    <p className="text-sm text-gray-600">
                      {getTotalItems()} ticket{getTotalItems() !== 1 ? 's' : ''} for {cart.length} concert{cart.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!isConnected || !agreedToPrivacy || isProcessing || (!dataToRequest.email || !dataToRequest.name)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {!isConnected ? 'Connect Wallet' : 
                     (!dataToRequest.email || !dataToRequest.name) ? 'Select Email & Name' :
                     isProcessing ? 'Processing...' : 
                     `Checkout ${getTotalPrice()} USDC`}
                  </button>
                </div>

                {/* Processing/Result Display */}
                {result && (
                  <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                    {result.success ? (
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">🎫 Purchase Successful!</h4>
                        <p className="text-green-700 text-sm">
                          Your tickets have been purchased! Check your email for details.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
                        <p className="text-red-700 text-sm">{result.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
