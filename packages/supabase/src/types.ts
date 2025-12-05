// Database types matching Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      coupons: {
        Row: {
          id: string;
          user_id: string;
          merchant: string;
          title: string;
          code: string;
          discount_type: 'percent' | 'amount' | 'bogo' | 'other';
          discount_value: number;
          valid_from: string;
          valid_until: string;
          conditions: string;
          source: 'text' | 'image';
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant: string;
          title: string;
          code: string;
          discount_type: 'percent' | 'amount' | 'bogo' | 'other';
          discount_value: number;
          valid_from: string;
          valid_until: string;
          conditions: string;
          source: 'text' | 'image';
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant?: string;
          title?: string;
          code?: string;
          discount_type?: 'percent' | 'amount' | 'bogo' | 'other';
          discount_value?: number;
          valid_from?: string;
          valid_until?: string;
          conditions?: string;
          source?: 'text' | 'image';
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminder_preferences: {
        Row: {
          id: string;
          user_id: string;
          remind_7_days: boolean;
          remind_3_days: boolean;
          remind_1_day: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          remind_7_days?: boolean;
          remind_3_days?: boolean;
          remind_1_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          remind_7_days?: boolean;
          remind_3_days?: boolean;
          remind_1_day?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
      };
      notification_logs: {
        Row: {
          id: string;
          user_id: string;
          coupon_id: string;
          notification_type: '7_day' | '3_day' | '1_day';
          sent_at: string;
          status: 'sent' | 'failed' | 'clicked';
        };
        Insert: {
          id?: string;
          user_id: string;
          coupon_id: string;
          notification_type: '7_day' | '3_day' | '1_day';
          sent_at?: string;
          status: 'sent' | 'failed' | 'clicked';
        };
        Update: {
          id?: string;
          user_id?: string;
          coupon_id?: string;
          notification_type?: '7_day' | '3_day' | '1_day';
          sent_at?: string;
          status?: 'sent' | 'failed' | 'clicked';
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
