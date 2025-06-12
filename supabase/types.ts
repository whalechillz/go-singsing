export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          team: string | null
          role: string | null
          password_hash: string | null
          is_active: boolean
          role_id: string | null
          department: string | null
          hire_date: string | null
          profile_image_url: string | null
          emergency_phone: string | null
          last_login: string | null
          login_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          team?: string | null
          role?: string | null
          password_hash?: string | null
          is_active?: boolean
          role_id?: string | null
          department?: string | null
          hire_date?: string | null
          profile_image_url?: string | null
          emergency_phone?: string | null
          last_login?: string | null
          login_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          team?: string | null
          role?: string | null
          password_hash?: string | null
          is_active?: boolean
          role_id?: string | null
          department?: string | null
          hire_date?: string | null
          profile_image_url?: string | null
          emergency_phone?: string | null
          last_login?: string | null
          login_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          birth_date: string | null
          gender: string | null
          marketing_agreed: boolean
          marketing_agreed_at: string | null
          kakao_friend: boolean
          kakao_friend_at: string | null
          status: string
          customer_type: string | null
          first_tour_date: string | null
          last_tour_date: string | null
          total_tour_count: number
          total_payment_amount: number
          source: string | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          birth_date?: string | null
          gender?: string | null
          marketing_agreed?: boolean
          marketing_agreed_at?: string | null
          kakao_friend?: boolean
          kakao_friend_at?: string | null
          status?: string
          customer_type?: string | null
          first_tour_date?: string | null
          last_tour_date?: string | null
          total_tour_count?: number
          total_payment_amount?: number
          source?: string | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          birth_date?: string | null
          gender?: string | null
          marketing_agreed?: boolean
          marketing_agreed_at?: string | null
          kakao_friend?: boolean
          kakao_friend_at?: string | null
          status?: string
          customer_type?: string | null
          first_tour_date?: string | null
          last_tour_date?: string | null
          total_tour_count?: number
          total_payment_amount?: number
          source?: string | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
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
      singsing_participant_tee_times: {
        Row: {
          id: string
          participant_id: string
          tee_time_id: string
          created_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          tee_time_id: string
          created_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          tee_time_id?: string
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
          payment_type: string | null
          payment_status: string | null
          payment_date: string | null
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
          payment_type?: string | null
          payment_status?: string | null
          payment_date?: string | null
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
          payment_type?: string | null
          payment_status?: string | null
          payment_date?: string | null
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
          schedule_date: string | null
          day_number: number | null
          schedule_items: any | null
          boarding_info: any | null
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
          schedule_date?: string | null
          day_number?: number | null
          schedule_items?: any | null
          boarding_info?: any | null
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
          schedule_date?: string | null
          day_number?: number | null
          schedule_items?: any | null
          boarding_info?: any | null
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
          price: number
          max_participants: number
          created_at: string
          updated_at: string
          tour_product_id: string | null
          footer_message: string | null
          company_phone: string | null
          company_mobile: string | null
          golf_reservation_phone: string | null
          golf_reservation_mobile: string | null
          show_staff_info: boolean | null
          show_footer_message: boolean | null
          show_company_phone: boolean | null
          show_golf_phones: boolean | null
          other_notices: string | null
          document_settings: any | null
          phone_display_settings: any | null
        }
        Insert: {
          id?: string
          title: string
          start_date: string
          end_date: string
          price: number
          max_participants: number
          created_at?: string
          updated_at?: string
          tour_product_id?: string | null
          footer_message?: string | null
          company_phone?: string | null
          company_mobile?: string | null
          golf_reservation_phone?: string | null
          golf_reservation_mobile?: string | null
          show_staff_info?: boolean | null
          show_footer_message?: boolean | null
          show_company_phone?: boolean | null
          show_golf_phones?: boolean | null
          other_notices?: string | null
          document_settings?: any | null
          phone_display_settings?: any | null
        }
        Update: {
          id?: string
          title?: string
          start_date?: string
          end_date?: string
          price?: number
          max_participants?: number
          created_at?: string
          updated_at?: string
          tour_product_id?: string | null
          footer_message?: string | null
          company_phone?: string | null
          company_mobile?: string | null
          golf_reservation_phone?: string | null
          golf_reservation_mobile?: string | null
          show_staff_info?: boolean | null
          show_footer_message?: boolean | null
          show_company_phone?: boolean | null
          show_golf_phones?: boolean | null
          other_notices?: string | null
          document_settings?: any | null
          phone_display_settings?: any | null
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
          golf_courses: { name: string; courses: string[] }[] | null
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
      tourist_attractions: {
        Row: {
          id: string
          name: string
          category: 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity' | null
          address: string | null
          description: string | null
          features: string[] | null
          image_urls: string[] | null
          main_image_url: string | null
          operating_hours: string | null
          contact_info: string | null
          recommended_duration: number
          tags: string[] | null
          region: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity' | null
          address?: string | null
          description?: string | null
          features?: string[] | null
          image_urls?: string[] | null
          main_image_url?: string | null
          operating_hours?: string | null
          contact_info?: string | null
          recommended_duration?: number
          tags?: string[] | null
          region?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity' | null
          address?: string | null
          description?: string | null
          features?: string[] | null
          image_urls?: string[] | null
          main_image_url?: string | null
          operating_hours?: string | null
          contact_info?: string | null
          recommended_duration?: number
          tags?: string[] | null
          region?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tour_schedule_tourist_options: {
        Row: {
          id: string
          tour_id: string
          schedule_id: string
          day_number: number
          time_slot: string | null
          attraction_ids: string[]
          is_required: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          schedule_id: string
          day_number: number
          time_slot?: string | null
          attraction_ids: string[]
          is_required?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          schedule_id?: string
          day_number?: number
          time_slot?: string | null
          attraction_ids?: string[]
          is_required?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      singsing_tour_boarding_times: {
        Row: {
          id: string
          tour_id: string
          boarding_place_id: string | null
          arrival_time: string | null
          departure_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
          order_no: number
          is_waypoint: boolean
          waypoint_name: string | null
          waypoint_duration: number | null
          waypoint_description: string | null
          visit_date: string | null
          waypoint_type: 'rest_area' | 'mart' | 'tourist_spot' | 'restaurant' | null
          image_url: string | null
        }
        Insert: {
          id?: string
          tour_id: string
          boarding_place_id?: string | null
          arrival_time?: string | null
          departure_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_no?: number
          is_waypoint?: boolean
          waypoint_name?: string | null
          waypoint_duration?: number | null
          waypoint_description?: string | null
          visit_date?: string | null
          waypoint_type?: 'rest_area' | 'mart' | 'tourist_spot' | 'restaurant' | null
          image_url?: string | null
        }
        Update: {
          id?: string
          tour_id?: string
          boarding_place_id?: string | null
          arrival_time?: string | null
          departure_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_no?: number
          is_waypoint?: boolean
          waypoint_name?: string | null
          waypoint_duration?: number | null
          waypoint_description?: string | null
          visit_date?: string | null
          waypoint_type?: 'rest_area' | 'mart' | 'tourist_spot' | 'restaurant' | null
          image_url?: string | null
        }
      }
      tour_journey_items: {
        Row: {
          id: string
          tour_id: string
          day_number: number
          order_index: number
          boarding_place_id: string | null
          spot_id: string | null
          arrival_time: string | null
          departure_time: string | null
          stay_duration: string | null
          distance_from_prev: string | null
          duration_from_prev: string | null
          passenger_count: number | null
          boarding_type: string | null
          meal_type: string | null
          meal_menu: string | null
          golf_info: any | null
          notes: string | null
          display_options: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          day_number: number
          order_index: number
          boarding_place_id?: string | null
          spot_id?: string | null
          arrival_time?: string | null
          departure_time?: string | null
          stay_duration?: string | null
          distance_from_prev?: string | null
          duration_from_prev?: string | null
          passenger_count?: number | null
          boarding_type?: string | null
          meal_type?: string | null
          meal_menu?: string | null
          golf_info?: any | null
          notes?: string | null
          display_options?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          day_number?: number
          order_index?: number
          boarding_place_id?: string | null
          spot_id?: string | null
          arrival_time?: string | null
          departure_time?: string | null
          stay_duration?: string | null
          distance_from_prev?: string | null
          duration_from_prev?: string | null
          passenger_count?: number | null
          boarding_type?: string | null
          meal_type?: string | null
          meal_menu?: string | null
          golf_info?: any | null
          notes?: string | null
          display_options?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      singsing_tour_staff: {
        Row: {
          id: string
          tour_id: string
          name: string
          phone: string
          role: string | null
          order: number
          user_id: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          name: string
          phone: string
          role?: string | null
          order?: number
          user_id?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          name?: string
          phone?: string
          role?: string | null
          order?: number
          user_id?: string | null
          display_order?: number
          created_at?: string
        }
      }
    }
    Views: {
      active_users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          team: string | null
          role: string | null
          password_hash: string | null
          is_active: boolean
          role_id: string | null
          department: string | null
          hire_date: string | null
          profile_image_url: string | null
          emergency_phone: string | null
          last_login: string | null
          login_count: number
          created_at: string
          updated_at: string
          role_name: string | null
          permissions: any | null
        }
      }
      tour_staff_details: {
        Row: {
          id: string
          tour_id: string
          name: string
          phone: string
          role: string | null
          order: number
          user_id: string | null
          display_order: number
          created_at: string
          tour_title: string | null
          start_date: string | null
          end_date: string | null
          user_email: string | null
          department: string | null
        }
      }
      tour_schedule_preview: {
        Row: {
          tour_id: string
          tour_name: string
          start_date: string
          end_date: string
          notices: any | null
          schedules: any | null
          staff: any | null
        }
      }
    }
  }
}
