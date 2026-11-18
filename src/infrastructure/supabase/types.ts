
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "draws": {
                  Row: {
                    "created_at": string,"group_id": string,"id": string,"invalidated_at": string | null,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"group_id": string,"id"?: string,"invalidated_at"?: string | null,"version": number
                  }
                  Update: {
                    "created_at"?: string,"group_id"?: string,"id"?: string,"invalidated_at"?: string | null,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "draws_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"group_id": string | null,"id": string,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"group_id"?: string | null,"id"?: string,"type": string
                  }
                  Update: {
                    "created_at"?: string,"group_id"?: string | null,"id"?: string,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    }
                  ]
                },"groups": {
                  Row: {
                    "admin_token_hash": string,"create_request_id": string,"created_at": string,"draw_version": number,"exchange_date": string,"expires_at": string,"id": string,"invite_token": string,"location": string | null,"max_value_cents": number,"name": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_token_hash": string,"create_request_id": string,"created_at"?: string,"draw_version"?: number,"exchange_date": string,"expires_at": string,"id"?: string,"invite_token": string,"location"?: string | null,"max_value_cents": number,"name": string,"status"?: string
                  }
                  Update: {
                    "admin_token_hash"?: string,"create_request_id"?: string,"created_at"?: string,"draw_version"?: number,"exchange_date"?: string,"expires_at"?: string,"id"?: string,"invite_token"?: string,"location"?: string | null,"max_value_cents"?: number,"name"?: string,"status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"pairs": {
                  Row: {
                    "draw_id": string,"giver_id": string,"group_id": string,"receiver_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "draw_id": string,"giver_id": string,"group_id": string,"receiver_id": string
                  }
                  Update: {
                    "draw_id"?: string,"giver_id"?: string,"group_id"?: string,"receiver_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pairs_group_id_draw_id_fkey"
      columns: ["group_id","draw_id"]
isOneToOne: false
      referencedRelation: "draws"
      referencedColumns: ["group_id","id"]
    },{
      foreignKeyName: "pairs_group_id_giver_id_fkey"
      columns: ["group_id","giver_id"]
isOneToOne: false
      referencedRelation: "participants"
      referencedColumns: ["group_id","id"]
    },{
      foreignKeyName: "pairs_group_id_receiver_id_fkey"
      columns: ["group_id","receiver_id"]
isOneToOne: false
      referencedRelation: "participants"
      referencedColumns: ["group_id","id"]
    }
                  ]
                },"participants": {
                  Row: {
                    "access_token_hash": string,"display_name": string,"group_id": string,"id": string,"joined_at": string,"removed_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "access_token_hash": string,"display_name": string,"group_id": string,"id"?: string,"joined_at"?: string,"removed_at"?: string | null
                  }
                  Update: {
                    "access_token_hash"?: string,"display_name"?: string,"group_id"?: string,"id"?: string,"joined_at"?: string,"removed_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "participants_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    }
                  ]
                },"wish_items": {
                  Row: {
                    "affiliate_url": string | null,"created_at": string,"id": string,"note": string | null,"participant_id": string,"store": string | null,"title": string,"url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "affiliate_url"?: string | null,"created_at"?: string,"id"?: string,"note"?: string | null,"participant_id": string,"store"?: string | null,"title": string,"url"?: string | null
                  }
                  Update: {
                    "affiliate_url"?: string | null,"created_at"?: string,"id"?: string,"note"?: string | null,"participant_id"?: string,"store"?: string | null,"title"?: string,"url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "wish_items_participant_id_fkey"
      columns: ["participant_id"]
isOneToOne: false
      referencedRelation: "participants"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_group_once":
{ Args: { "p_admin_token_hash": string,"p_exchange_date": string,"p_expires_at": string,"p_invite_token": string,"p_location": string,"p_max_value_cents": number,"p_name": string,"p_request_id": string }; Returns: {
              "group_id": string,"invite_token": string,"was_replay": boolean
            }[]
                           },
"join_group":
{ Args: { "p_access_token_hash": string,"p_display_name": string,"p_invite_token": string }; Returns: {
              "display_name": string,"expires_at": string,"group_id": string,"participant_id": string
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
