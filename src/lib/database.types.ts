/**
 * Supabase schema types.
 *
 * SCOPE: this file covers the tables the front end actually touches -- the
 * service catalogue, orders, payments and profiles -- plus every enum. The
 * matter/document/audit tables exist in the database and are typed there; they
 * are omitted here only because no client component reads them yet.
 *
 * Regenerate the complete file (all 16 tables) with:
 *
 *   supabase gen types typescript --project-id yjdtefjlrkfpzofprphf > src/lib/database.types.ts
 *
 * Do not hand-edit after regenerating. If a column here disagrees with the
 * database, the database is right.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'client' | 'fee_earner' | 'partner' | 'compliance' | 'admin';

export type ContractTypeDb =
  | 'supply'
  | 'distribution'
  | 'charterparty'
  | 'bill_of_lading'
  | 'shareholders'
  | 'jv';

export type DisputeForumDb =
  | 'local_courts'
  | 'foreign_courts'
  | 'arbitration_lcia'
  | 'arbitration_icc'
  | 'arbitration_difc'
  | 'arbitration_adhoc'
  | 'silent';

export type SecurityInstrumentDb = 'lc' | 'bank_guarantee' | 'parent_guarantee' | 'none';

export type MatterStage =
  | 'instructed'
  | 'assembled'
  | 'scanned'
  | 'partner_review'
  | 'counterparty_review'
  | 'awaiting_signature'
  | 'executed'
  | 'closed';

export type SeverityDb = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RiskBandDb = 'safe' | 'watch' | 'risk' | 'critical';
export type StageStateDb = 'done' | 'active' | 'pending' | 'blocked';
export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired';

export type OrderStatus =
  | 'draft'
  | 'awaiting_payment'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'requires_payment'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type PaymentProvider = 'stripe' | 'tap' | 'myfatoorah' | 'manual';

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_ar: string;
          description_en: string;
          description_ar: string;
          /** Minor units (fils for KWD, cents otherwise). Integer, never float. */
          base_price: number;
          currency: string;
          turnaround_days: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          name_en: string;
          name_ar: string;
          base_price: number;
          description_en?: string;
          description_ar?: string;
          currency?: string;
          turnaround_days?: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      service_orders: {
        Row: {
          id: string;
          organisation_id: string | null;
          service_id: string;
          customer_id: string | null;
          matter_id: string | null;
          reference: string;
          status: OrderStatus;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          billing_country: string | null;
          brief: Json;
          locale: string;
          subtotal: number;
          tax: number;
          total: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          service_id: string;
          reference: string;
          contact_name: string;
          contact_email: string;
          customer_id?: string | null;
          organisation_id?: string | null;
          matter_id?: string | null;
          status?: OrderStatus;
          contact_phone?: string | null;
          billing_country?: string | null;
          brief?: Json;
          locale?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          currency?: string;
        };
        Update: Partial<Database['public']['Tables']['service_orders']['Insert']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: PaymentProvider;
          provider_payment_id: string | null;
          status: PaymentStatus;
          amount: number;
          currency: string;
          card_brand: string | null;
          /** Last four only. No PAN, CVV or expiry exists in this schema. */
          card_last4: string | null;
          failure_code: string | null;
          failure_message: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_id: string;
          amount: number;
          provider?: PaymentProvider;
          provider_payment_id?: string | null;
          status?: PaymentStatus;
          currency?: string;
          card_brand?: string | null;
          card_last4?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organisation_id: string;
          full_name: string;
          role: UserRole;
          locale: string;
          phone: string | null;
          last_seen_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organisation_id: string;
          full_name?: string;
          role?: UserRole;
          locale?: string;
          phone?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      organisations: {
        Row: {
          id: string;
          name: string;
          registration_no: string | null;
          jurisdiction: string;
          address: string | null;
          billing_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { name: string; jurisdiction?: string };
        Update: Partial<Database['public']['Tables']['organisations']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      /** Public QR verification. Callable by anon; discloses nothing identifying. */
      verify_document: {
        Args: { hash: string };
        Returns: {
          content_hash: string;
          is_executed: boolean;
          executed_at: string | null;
          signature_count: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      contract_type: ContractTypeDb;
      dispute_forum: DisputeForumDb;
      security_instrument: SecurityInstrumentDb;
      matter_stage: MatterStage;
      severity: SeverityDb;
      risk_band: RiskBandDb;
      stage_state: StageStateDb;
      signature_status: SignatureStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_provider: PaymentProvider;
    };
    CompositeTypes: Record<never, never>;
  };
}

export type ServiceRow = Database['public']['Tables']['services']['Row'];
export type ServiceOrderRow = Database['public']['Tables']['service_orders']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
