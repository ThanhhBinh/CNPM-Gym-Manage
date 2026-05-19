export interface User {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    role: 'admin' | 'receptionist';
    shift: string | null;
    status: 'active' | 'locked';
}

export interface Package {
    id: number;
    name: string;
    type: 'monthly' | 'quarterly' | 'yearly' | 'pt';
    duration_days: number;
    price: number;
    max_pt_sessions: number | null;
    benefits: string | null;
    description: string | null;
    status: 'active' | 'inactive';
}

export interface Member {
    id: number;
    member_code: string;
    full_name: string;
    phone: string;
    email: string | null;
    id_card: string | null;
    date_of_birth: string | null;
    address: string | null;
    avatar: string | null;
    qr_token: string | null;
    body_metrics: any | null;
    status: 'active' | 'locked' | 'suspended';
    lock_reason: string | null;
    branch: string | null;
    registered_by: number | null;
    created_at: string;
}

export interface CheckIn {
    id: number;
    member_id: number;
    member_package_id: number | null;
    checked_in_at: string;
    method: 'qr_scan' | 'manual';
    branch: string | null;
    verified_by: number | null;
    notes: string | null;
}

export interface Payment {
    id: number;
    invoice_code: string;
    member_id: number;
    member_package_id: number;
    amount: number;
    discount: number;
    final_amount: number;
    payment_method: 'cash' | 'transfer' | 'card';
    status: 'paid' | 'refunded';
    refund_reason: string | null;
    refunded_by: number | null;
    collected_by: number | null;
    paid_at: string;
}
