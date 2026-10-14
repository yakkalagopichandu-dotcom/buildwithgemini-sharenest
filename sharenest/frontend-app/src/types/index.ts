export type UserRole = 'DONOR' | 'CARE_HOME' | 'VOLUNTEER' | 'ADMIN';

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  email?: string;
  mobile?: string;
  is_verified: boolean;
  gov_id_last4?: string;
}

export interface TimelineEvent {
  status: string;
  actor: string;
  timestamp: string;
  note: string;
}

export interface Donation {
  id: string;
  title: string;
  category: 'Food' | 'Clothes' | 'Toys' | 'Essentials';
  quantity: string;
  donor_id: string;
  donor_name: string;
  location: string;
  pickup_window: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  safe_until?: string;
  allergens?: string[];
  handover_method?: string;
  handover_code?: string;
  status: 'available' | 'claimed' | 'in_transit' | 'completed' | 'rejected';
  photos?: {
    before?: string[];
    after?: string[];
  };
  timeline?: TimelineEvent[];
  created_at: string;
}

export interface CareHome {
  id: string;
  name: string;
  shelter_type: string;
  beneficiary_count: number;
  address: string;
  contact_person: string;
  contact_phone: string;
  delivery_window: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'NEEDS_CHANGES' | 'REJECTED';
  storage_facilities: {
    fridge: boolean;
    freezer: boolean;
    dry_storage: boolean;
    kitchen: boolean;
    power_backup: boolean;
  };
  food_safety_license_no?: string;
  documents?: Record<string, string>;
  admin_notes?: string;
}

export interface DashboardMetrics {
  total_donations: number;
  meals_served: number;
  co2_saved_kg: number;
  verified_care_homes: number;
}
