/**
 * Booking Store - Zustand store for managing booking flow state
 *
 * This store manages the entire booking flow including:
 * - Search criteria
 * - Selected flight
 * - Seat selections
 * - Passenger information
 * - Extras
 * - Price calculation
 * - Session management
 * - Navigation state
 *
 * Requirements: 1.1, 1.2, 16.1
 */

import { create } from "zustand";
import type {
  SearchCriteria,
  Flight,
  Seat,
  PassengerInfo,
  SelectedExtras,
  DetailedPriceBreakdown,
  BookingStep,
} from "../types";

/**
 * Booking Store State Interface
 */
interface BookingState {
  // Search state
  searchCriteria: SearchCriteria | null;

  // Selected flight
  selectedFlight: Flight | null;

  // Seat selection
  selectedSeats: Map<string, Seat>;

  // Passenger information
  passengers: PassengerInfo[];

  // Extras
  selectedExtras: SelectedExtras;

  // Price calculation
  totalPrice: number;
  priceBreakdown: DetailedPriceBreakdown;

  // Navigation
  currentStep: BookingStep;

  // Session management
  sessionId: string | null;
}

/**
 * Booking Store Actions Interface
 */
interface BookingActions {
  // Search actions
  setSearchCriteria: (criteria: SearchCriteria) => void;
  clearSearchCriteria: () => void;

  // Flight selection actions
  setSelectedFlight: (flight: Flight) => void;
  clearSelectedFlight: () => void;

  // Seat selection actions
  setSeat: (passengerId: string, seat: Seat) => void;
  removeSeat: (passengerId: string) => void;
  clearSeats: () => void;

  // Passenger actions
  setPassengers: (passengers: PassengerInfo[]) => void;
  updatePassenger: (passengerId: string, passenger: PassengerInfo) => void;
  clearPassengers: () => void;

  // Extras actions
  setExtras: (extras: SelectedExtras) => void;
  updateBaggage: (passengerId: string, baggage: any) => void;
  updateMeal: (passengerId: string, meal: any) => void;
  setInsurance: (insurance: any) => void;
  setLoungeAccess: (lounge: any) => void;
  clearExtras: () => void;

  // Price calculation
  calculatePrice: () => void;

  // Navigation actions
  goToStep: (step: BookingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: () => boolean;

  // Session management
  setSessionId: (sessionId: string) => void;
  clearSession: () => void;

  // Reset entire store
  reset: () => void;
}

/**
 * Combined Store Type
 */
type BookingStore = BookingState & BookingActions;

/**
 * Initial state for the booking store
 */
const initialState: BookingState = {
  searchCriteria: null,
  selectedFlight: null,
  selectedSeats: new Map(),
  passengers: [],
  selectedExtras: {
    baggage: new Map(),
    meals: new Map(),
    insurance: null,
    loungeAccess: null,
  },
  totalPrice: 0,
  priceBreakdown: {
    baseFare: 0,
    taxes: 0,
    fees: 0,
    seatFees: 0,
    extraBaggage: 0,
    meals: 0,
    insurance: 0,
    loungeAccess: 0,
    total: 0,
  },
  currentStep: "search",
  sessionId: null,
};

/**
 * Booking step order for navigation
 */
const stepOrder: BookingStep[] = [
  "search",
  "results",
  "details",
  "seats",
  "passengers",
  "extras",
  "payment",
  "confirmation",
];

/**
 * Calculate total price from all booking components
 *
 * Requirements: 1.1, 1.2
 *
 * @param state - Current booking state
 * @returns Detailed price breakdown with total
 */
function calculateTotalPrice(state: BookingState): DetailedPriceBreakdown {
  const breakdown: DetailedPriceBreakdown = {
    baseFare: 0,
    taxes: 0,
    fees: 0,
    seatFees: 0,
    extraBaggage: 0,
    meals: 0,
    insurance: 0,
    loungeAccess: 0,
    total: 0,
  };

  // Base fare from selected flight
  if (state.selectedFlight) {
    breakdown.baseFare = state.selectedFlight.price.breakdown.baseFare;
    breakdown.taxes = state.selectedFlight.price.breakdown.taxes;
    breakdown.fees = state.selectedFlight.price.breakdown.fees;
  }

  // Seat fees
  state.selectedSeats.forEach((seat) => {
    breakdown.seatFees += seat.price;
  });

  // Extra baggage fees
  state.selectedExtras.baggage.forEach((baggage) => {
    breakdown.extraBaggage += baggage.price;
  });

  // Meal fees
  state.selectedExtras.meals.forEach((meal) => {
    breakdown.meals += meal.price;
  });

  // Insurance fee
  if (state.selectedExtras.insurance) {
    breakdown.insurance = state.selectedExtras.insurance.price;
  }

  // Lounge access fee
  if (state.selectedExtras.loungeAccess) {
    breakdown.loungeAccess = state.selectedExtras.loungeAccess.price;
  }

  // Calculate total
  breakdown.total =
    breakdown.baseFare +
    breakdown.taxes +
    breakdown.fees +
    breakdown.seatFees +
    breakdown.extraBaggage +
    breakdown.meals +
    breakdown.insurance +
    breakdown.loungeAccess;

  return breakdown;
}

/**
 * Create the booking store with Zustand
 */
export const useBookingStore = create<BookingStore>()((set, get) => ({
  // Initial state
  ...initialState,

  // Search actions
  setSearchCriteria: (criteria) => {
    set({ searchCriteria: criteria });
  },

  clearSearchCriteria: () => {
    set({ searchCriteria: null });
  },

  // Flight selection actions
  setSelectedFlight: (flight) => {
    set({ selectedFlight: flight });
    // Recalculate price when flight changes
    get().calculatePrice();
  },

  clearSelectedFlight: () => {
    set({ selectedFlight: null });
    get().calculatePrice();
  },

  // Seat selection actions
  setSeat: (passengerId, seat) => {
    const selectedSeats = new Map(get().selectedSeats);
    selectedSeats.set(passengerId, seat);
    set({ selectedSeats });
    // Recalculate price when seats change
    get().calculatePrice();
  },

  removeSeat: (passengerId) => {
    const selectedSeats = new Map(get().selectedSeats);
    selectedSeats.delete(passengerId);
    set({ selectedSeats });
    get().calculatePrice();
  },

  clearSeats: () => {
    set({ selectedSeats: new Map() });
    get().calculatePrice();
  },

  // Passenger actions
  setPassengers: (passengers) => {
    set({ passengers });
  },

  updatePassenger: (passengerId, passenger) => {
    const passengers = get().passengers.map((p) =>
      p.id === passengerId ? passenger : p,
    );
    set({ passengers });
  },

  clearPassengers: () => {
    set({ passengers: [] });
  },

  // Extras actions
  setExtras: (extras) => {
    set({ selectedExtras: extras });
    get().calculatePrice();
  },

  updateBaggage: (passengerId, baggage) => {
    const selectedExtras = { ...get().selectedExtras };
    const baggageMap = new Map(selectedExtras.baggage);

    if (baggage) {
      baggageMap.set(passengerId, baggage);
    } else {
      baggageMap.delete(passengerId);
    }

    selectedExtras.baggage = baggageMap;
    set({ selectedExtras });
    get().calculatePrice();
  },

  updateMeal: (passengerId, meal) => {
    const selectedExtras = { ...get().selectedExtras };
    const mealsMap = new Map(selectedExtras.meals);

    if (meal) {
      mealsMap.set(passengerId, meal);
    } else {
      mealsMap.delete(passengerId);
    }

    selectedExtras.meals = mealsMap;
    set({ selectedExtras });
    get().calculatePrice();
  },

  setInsurance: (insurance) => {
    const selectedExtras = { ...get().selectedExtras };
    selectedExtras.insurance = insurance;
    set({ selectedExtras });
    get().calculatePrice();
  },

  setLoungeAccess: (lounge) => {
    const selectedExtras = { ...get().selectedExtras };
    selectedExtras.loungeAccess = lounge;
    set({ selectedExtras });
    get().calculatePrice();
  },

  clearExtras: () => {
    set({
      selectedExtras: {
        baggage: new Map(),
        meals: new Map(),
        insurance: null,
        loungeAccess: null,
      },
    });
    get().calculatePrice();
  },

  // Price calculation
  calculatePrice: () => {
    const state = get();
    const priceBreakdown = calculateTotalPrice(state);
    set({
      priceBreakdown,
      totalPrice: priceBreakdown.total,
    });
  },

  // Navigation actions
  goToStep: (step) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    const currentIndex = stepOrder.indexOf(get().currentStep);
    if (currentIndex < stepOrder.length - 1) {
      set({ currentStep: stepOrder[currentIndex + 1] });
    }
  },

  previousStep: () => {
    const currentIndex = stepOrder.indexOf(get().currentStep);
    if (currentIndex > 0) {
      set({ currentStep: stepOrder[currentIndex - 1] });
    }
  },

  canProceed: () => {
    const state = get();
    const { currentStep } = state;

    switch (currentStep) {
      case "search":
        return state.searchCriteria !== null;
      case "results":
        return state.selectedFlight !== null;
      case "details":
        return state.selectedFlight !== null;
      case "seats":
        // Seats are optional, can always proceed
        return true;
      case "passengers":
        return state.passengers.length > 0;
      case "extras":
        // Extras are optional, can always proceed
        return true;
      case "payment":
        return state.totalPrice > 0;
      case "confirmation":
        return false; // Cannot proceed from confirmation
      default:
        return false;
    }
  },

  // Session management
  setSessionId: (sessionId) => {
    set({ sessionId });
  },

  clearSession: () => {
    set({ sessionId: null });
  },

  // Reset entire store
  reset: () => {
    set(initialState);
  },
}));

/**
 * Selector hooks for common state access patterns
 */

// Get current booking summary
export const useBookingSummary = () => {
  return useBookingStore((state) => ({
    flight: state.selectedFlight,
    passengers: state.passengers,
    seats: state.selectedSeats,
    extras: state.selectedExtras,
    priceBreakdown: state.priceBreakdown,
  }));
};

// Get current step and navigation
export const useBookingNavigation = () => {
  return useBookingStore((state) => ({
    currentStep: state.currentStep,
    goToStep: state.goToStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    canProceed: state.canProceed,
  }));
};

// Get price information
export const useBookingPrice = () => {
  return useBookingStore((state) => ({
    totalPrice: state.totalPrice,
    priceBreakdown: state.priceBreakdown,
    calculatePrice: state.calculatePrice,
  }));
};

// Get search state
export const useSearchState = () => {
  return useBookingStore((state) => ({
    searchCriteria: state.searchCriteria,
    setSearchCriteria: state.setSearchCriteria,
    clearSearchCriteria: state.clearSearchCriteria,
  }));
};

// Get flight selection state
export const useFlightSelection = () => {
  return useBookingStore((state) => ({
    selectedFlight: state.selectedFlight,
    setSelectedFlight: state.setSelectedFlight,
    clearSelectedFlight: state.clearSelectedFlight,
  }));
};

// Get seat selection state
export const useSeatSelection = () => {
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const setSeat = useBookingStore((state) => state.setSeat);
  const removeSeat = useBookingStore((state) => state.removeSeat);
  const clearSeats = useBookingStore((state) => state.clearSeats);

  return { selectedSeats, setSeat, removeSeat, clearSeats };
};

// Get passenger information state
export const usePassengerInfo = () => {
  const passengers = useBookingStore((state) => state.passengers);
  const setPassengers = useBookingStore((state) => state.setPassengers);
  const updatePassenger = useBookingStore((state) => state.updatePassenger);
  const clearPassengers = useBookingStore((state) => state.clearPassengers);

  return { passengers, setPassengers, updatePassenger, clearPassengers };
};

// Get extras state
export const useExtras = () => {
  const selectedExtras = useBookingStore((state) => state.selectedExtras);
  const setExtras = useBookingStore((state) => state.setExtras);
  const updateBaggage = useBookingStore((state) => state.updateBaggage);
  const updateMeal = useBookingStore((state) => state.updateMeal);
  const setInsurance = useBookingStore((state) => state.setInsurance);
  const setLoungeAccess = useBookingStore((state) => state.setLoungeAccess);
  const clearExtras = useBookingStore((state) => state.clearExtras);

  return {
    selectedExtras,
    setExtras,
    updateBaggage,
    updateMeal,
    setInsurance,
    setLoungeAccess,
    clearExtras,
  };
};
