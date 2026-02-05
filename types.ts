

export interface Profile {
  id: string;
  name: string;
  role: string;
  company?: string;
  imageUrl: string;
  tags: string[];
  bio: string;
  available: boolean;
  socials?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Frame {
  id: number;
  name: string;
  price: string;
  image: string;
  colors: string[];
  color_names?: string[];
  skuid?: string;
  naming_system?: string;
}

export interface OfferDetails {
  offer_id: number;
  coupon_code: string;
  discount_type: 'percentage' | 'flat';
  amt_or_pct: number;
  expiry_time: string;
  description?: string;
  title?: string;
}

export interface OfferWrapper {
  id: number;
  is_valid: boolean;
  message: string;
  data: {
    offer: OfferDetails;
  };
}

export interface PrescriptionDetail {
  id?: number;
  patient_name?: string;
  created?: string;
  right_sphere?: string;
  right_cylinder?: string;
  right_axis?: string;
  right_od?: string;
  right_pd?: string;
  left_sphere?: string;
  left_cylinder?: string;
  left_axis?: string;
  left_od?: string;
  left_pd?: string;
  remarks?: string;
}

export interface Lens {
  id: number;
  name: string;
  main_category: string;
  sub_category: string;
  price: number;
  selling_price?: number;
  description?: string;
}

export interface CartItem {
  cart_id: number;
  product_id?: string;
  product: {
    products: {
      brand: string;
      naming_system?: string;
      framecolor: string;
      style: string;
      gender: string;
      size: string;
      list_price: number;
      price: number;
      name?: string;
      store_skuid?: string;
      skuid?: string;
      shape?: string;
      weight?: string;
      image?: string;
    }
  };
  lens?: {
    lens_id?: number;
    sub_category: string;
    price?: number;
    selling_price?: number;
    main_category?: string;
  };
  retailer_lens_discount?: number;
  offer?: OfferDetails;
  offer_applied_discount?: number;
  flag?: string;
  prescription_mode?: string;
  prescription?: PrescriptionDetail;
  quantity?: number;
  product_details?: {
    name: string;
    price: number;
    image: string;
    frame_color: string;
    lens_type: string;
  };
}

export interface QuizOption {
  option_id: number | string;
  text: string;
  question?: {
    question_id: number | string;
    text: string;
  };
}

export interface CustomerDetail {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  created: string;
}

export interface CustomerResponse {
  customer_detail: CustomerDetail[];
  prescription_details: PrescriptionDetail[];
}
