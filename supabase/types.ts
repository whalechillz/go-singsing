export interface Database {
  public: {
    Tables: {
      boarding_guide_contacts: {
        Row: {
          id: number
          tour_id: string
          name: string
          phone: string
          role: string | null
        }
        Insert: {
          id?: number
          tour_id: string
          name: string
          phone: string
          role?: string | null
        }
        Update: {
          id?: number
          tour_id?: string
          name?: string
          phone?: string
          role?: string | null
        }
      }
      boarding_guide_notices: {
        Row: {
          id: number
          tour_id: string
          notice: string
          order: number
        }
        Insert: {
          id?: number
          tour_id: string
          notice: string
          order?: number
        }
        Update: {
          id?: number
          tour_id?: string
          notice?: string
          order?: number
        }
      }
      boarding_guide_routes: {
        Row: {
          id: number
          tour_id: string
          time: string
          place: string
          order: number
        }
        Insert: {
          id?: number
          tour_id: string
          time: string
          place: string
          order?: number
        }
        Update: {
          id?: number
          tour_id?: string
          time?: string
          place?: string
          order?: number
        }
      }
      documents: {
        Row: {
          id: string
          tour_id: string | null
          type: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tour_id?: string | null
          type: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tour_id?: string | null
          type?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      singsing_boarding_places: {
        Row: {
          id: string
          name: string
          address: string | null
          description: string | null
          map_url: string | null
          created_at: string
          boarding_main: string | null
          boarding_sub: string | null
          parking_main: string | null
          parking_map_url: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          description?: string | null
          map_url?: string | null
          created_at?: string
          boarding_main?: string | null
          boarding_sub?: string | null
          parking_main?: string | null
          parking_map_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          description?: string | null
          map_url?: string | null
          created_at?: string
          boarding_main?: string | null
          boarding_sub?: string | null
          parking_main?: string | null
          parking_map_url?: string | null
        }
      }
      singsing_boarding_schedules: {
        Row: {
          id: string
          tour_id: string | null
          place_id: string | null
          date: string
          depart_time: string | null
          arrive_time: string | null
          parking_info: string | null
          memo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tour_id?: string | null
          place_id?: string | null
          date: string
          depart_time?: string | null
          arrive_time?: string | null
          parking_info?: string | null
          memo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string | null
          place_id?: string | null
          date?: string
          depart_time?: string | null
          arrive_time?: string | null
          parking_info?: string | null
          memo?: string | null
          created_at?: string
        }
      }
      singsing_participants: {
        Row: {
          id: string
          tour_id: string | null
          name: string
          phone: string
          team_name: string | null
          note: string | null
          created_at: string
          updated_at: string
          status: string
          pickup_location: string | null
          emergency_contact: string | null
          join_count: number
          is_confirmed: boolean
          email: string | null
          role: string | null
          room_id: string | null
          gender: string | null
          group_size: number
          is_paying_for_group: boolean
          companions: string[]
        }
        Insert: {
          id?: string
          tour_id?: string | null
          name: string
          phone: string
          team_name?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          pickup_location?: string | null
          emergency_contact?: string | null
          join_count?: number
          is_confirmed?: boolean
          email?: string | null
          role?: string | null
          room_id?: string | null
          gender?: string | null
          group_size?: number
          is_paying_for_group?: boolean
          companions?: string[]
        }
        Update: {
          id?: string
          tour_id?: string | null
          name?: string
          phone?: string
          team_name?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          pickup_location?: string | null
          emergency_contact?: string | null
          join_count?: number
          is_confirmed?: boolean
          email?: string | null
          role?: string | null
          room_id?: string | null
          gender?: string | null
          group_size?: number
          is_paying_for_group?: boolean
          companions?: string[]
        }
      }
      singsing_payments: {
        Row: {
          id: string
          tour_id: string | null
          participant_id: string | null
          payer_id: string | null
          payment_method: string | null
          amount: number
          is_group_payment: boolean
          receipt_type: string | null
          receipt_requested: boolean
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tour_id?: string | null
          participant_id?: string | null
          payer_id?: string | null
          payment_method?: string | null
          amount: number
          is_group_payment?: boolean
          receipt_type?: string | null
          receipt_requested?: boolean
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string | null
          participant_id?: string | null
          payer_id?: string | null
          payment_method?: string | null
          amount?: number
          is_group_payment?: boolean
          receipt_type?: string | null
          receipt_requested?: boolean
          note?: string | null
          created_at?: string
        }
      }
      singsing_pickup_points: {
        Row: {
          id: string
          tour_id: string | null
          participant_id: string | null
          pickup_location: string
          pickup_time: string | null
          seat_no: string | null
          memo: string | null
          created_at: string
          place_id: string | null
        }
        Insert: {
          id?: string
          tour_id?: string | null
          participant_id?: string | null
          pickup_location: string
          pickup_time?: string | null
          seat_no?: string | null
          memo?: string | null
          created_at?: string
          place_id?: string | null
        }
        Update: {
          id?: string
          tour_id?: string | null
          participant_id?: string | null
          pickup_location?: string
          pickup_time?: string | null
          seat_no?: string | null
          memo?: string | null
          created_at?: string
          place_id?: string | null
        }
      }
      singsing_rooms: {
        Row: {
          id: string
          tour_id: string | null
          room_type: string
          capacity: number
          created_at: string
          room_seq: number | null
          room_number: string | null
        }
        Insert: {
          id?: string
          tour_id?: string | null
          room_type: string
          capacity: number
          created_at?: string
          room_seq?: number | null
          room_number?: string | null
        }
        Update: {
          id?: string
          tour_id?: string | null
          room_type?: string
          capacity?: number
          created_at?: string
          room_seq?: number | null
          room_number?: string | null
        }
      }
      singsing_schedules: {
        Row: {
          id: string
          tour_id: string | null
          title: string
          description: string | null
          meal_breakfast: boolean
          meal_lunch: boolean
          meal_dinner: boolean
          created_at: string
          date: string | null
          menu_breakfast: string | null
          menu_lunch: string | null
          menu_dinner: string | null
        }
        Insert: {
          id?: string
          tour_id?: string | null
          title: string
          description?: string | null
          meal_breakfast?: boolean
          meal_lunch?: boolean
          meal_dinner?: boolean
          created_at?: string
          date?: string | null
          menu_breakfast?: string | null
          menu_lunch?: string | null
          menu_dinner?: string | null
        }
        Update: {
          id?: string
          tour_id?: string | null
          title?: string
          description?: string | null
          meal_breakfast?: boolean
          meal_lunch?: boolean
          meal_dinner?: boolean
          created_at?: string
          date?: string | null
          menu_breakfast?: string | null
          menu_lunch?: string | null
          menu_dinner?: string | null
        }
      }
      singsing_tee_time_players: {
        Row: {
          id: string
          tee_time_id: string | null
          participant_id: string | null
          order_no: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tee_time_id?: string | null
          participant_id?: string | null
          order_no?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tee_time_id?: string | null
          participant_id?: string | null
          order_no?: number | null
          created_at?: string
        }
      }
      singsing_tee_times: {
        Row: {
          id: string
          tour_id: string | null
          date: string
          course: string
          team_no: number
          tee_time: string
          players: any
          created_at: string
        }
        Insert: {
          id?: string
          tour_id?: string | null
          date: string
          course: string
          team_no: number
          tee_time: string
          players: any
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string | null
          date?: string
          course?: string
          team_no?: number
          tee_time?: string
          players?: any
          created_at?: string
        }
      }
      singsing_tours: {
        Row: {
          id: string
          title: string
          start_date: string
          end_date: string
          golf_course: string
          accommodation: string
          price: number
          max_participants: number
          includes: string | null
          excludes: string | null
          created_at: string
          updated_at: string
          driver_name: string | null
          reservation_notice: string | null
          schedule_notice: string | null
          tour_product_id: string | null
        }
        Insert: {
          id?: string
          title: string
          start_date: string
          end_date: string
          golf_course: string
          accommodation: string
          price: number
          max_participants: number
          includes?: string | null
          excludes?: string | null
          created_at?: string
          updated_at?: string
          driver_name?: string | null
          reservation_notice?: string | null
          schedule_notice?: string | null
          tour_product_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          start_date?: string
          end_date?: string
          golf_course?: string
          accommodation?: string
          price?: number
          max_participants?: number
          includes?: string | null
          excludes?: string | null
          created_at?: string
          updated_at?: string
          driver_name?: string | null
          reservation_notice?: string | null
          schedule_notice?: string | null
          tour_product_id?: string | null
        }
      }
      tour_products: {
        Row: {
          id: string
          name: string
          golf_course: string | null
          hotel: string | null
          reservation_notice: string | null
          schedule: any | null
          note: string | null
          usage_guide: any | null
          created_at: string
          updated_at: string
          usage_bus: string | null
          usage_round: string | null
          usage_hotel: string | null
          usage_meal: string | null
          usage_locker: string | null
          usage_tour: string | null
          courses: string[] | null
        }
        Insert: {
          id?: string
          name: string
          golf_course?: string | null
          hotel?: string | null
          reservation_notice?: string | null
          schedule?: any | null
          note?: string | null
          usage_guide?: any | null
          created_at?: string
          updated_at?: string
          usage_bus?: string | null
          usage_round?: string | null
          usage_hotel?: string | null
          usage_meal?: string | null
          usage_locker?: string | null
          usage_tour?: string | null
          courses?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          golf_course?: string | null
          hotel?: string | null
          reservation_notice?: string | null
          schedule?: any | null
          note?: string | null
          usage_guide?: any | null
          created_at?: string
          updated_at?: string
          usage_bus?: string | null
          usage_round?: string | null
          usage_hotel?: string | null
          usage_meal?: string | null
          usage_locker?: string | null
          usage_tour?: string | null
          courses?: string[] | null
        }
      }
      users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          team: string | null
          role: string
          emergency_phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          team?: string | null
          role?: string
          emergency_phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          team?: string | null
          role?: string
          emergency_phone?: string | null
          created_at?: string
        }
      }
    }
  }
}
