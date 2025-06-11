"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  Info,
  Plus,
  X,
  Copy,
  Eye,
  Save,
  Share2,
  MapPin,
  Trash2,
  Route,
  Navigation,
  Coffee,
  Utensils,
  Camera,
  Bus,
  ChevronRight,
  ChevronDown,
  Edit2,
  ShoppingCart,
  MoreHorizontal,
  Activity
} from "lucide-react";
import Link from "next/link";
import { generatePublicUrl, getPublicLinkUrl, getInternalQuoteUrl } from "@/utils/publicLink";

interface TourProduct {
  id: string;
  name: string;
  golf_course: string | null;
  hotel: string | null;
  courses: string[] | null;
  included_items?: string | null;
  excluded_items?: string | null;
}

interface Attraction {
  id: string;
  name: string;
  type: string;
  category: string;
  created_at?: string;
  duration?: number;
}

interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  address?: string;
  description?: string;
  image_url?: string;
  features?: string[];
  is_active: boolean;
  boarding_info?: string;
}

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  attraction_id?: string;
  attraction?: Attraction | TouristAttraction;
  spot_id?: string;
  spot?: TouristAttraction;
  duration?: string;
  note?: string;
}

interface DaySchedule {
  day: number;
  date: string;
  title: string;
  items: ScheduleItem[];
}

// 카테고리 설정
const categoryConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string;
}> = {
  'boarding': { label: '탑승지', icon: Bus, color: 'blue' },
  'tourist_spot': { label: '관광명소', icon: Camera, color: 'blue' },
  'rest_area': { label: '휴게소', icon: Coffee, color: 'gray' },
  'restaurant': { label: '맛집', icon: Utensils, color: 'orange' },
  'shopping': { label: '쇼핑', icon: ShoppingCart, color: 'purple' },
  'activity': { label: '액티비티', icon: Activity, color: 'green' },
  'mart': { label: '마트', icon: ShoppingCart, color: 'indigo' },
  'golf_round': { label: '골프 라운드', icon: Activity, color: 'emerald' },
  'club_meal': { label: '클럽식', icon: Utensils, color: 'rose' },
  'others': { label: '기타', icon: MoreHorizontal, color: 'slate' }
};