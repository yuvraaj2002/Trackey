export type SpendCategory = {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Spend = {
  id: number;
  label: string;
  amount: string;
  category_id: number;
  created_at: string;
  updated_at: string;
};

export type SpendListResponse = {
  items: Spend[];
  next_cursor: number | null;
  has_more: boolean;
};

export type SpendCreate = {
  label: string;
  amount: string;
  category_id: number;
};

export type SpendUpdate = {
  label?: string;
  amount?: string;
};

export type AnalyticsResponse = {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_spend: string;
    transaction_count: number;
    average_spend: string;
  };
  by_category: Array<{
    category_id: number;
    category_name: string;
    total_amount: string;
    transaction_count: number;
    average_amount: string;
    percentage_of_total: string;
  }>;
  top_spends: Array<{
    id: number;
    label: string;
    amount: string;
    category_id: number;
    category_name: string;
    created_at: string;
  }>;
  highest_per_category: Array<{
    category_id: number;
    category_name: string;
    spend_id: number;
    label: string;
    amount: string;
    created_at: string;
  }>;
};

export type HealthResponse = {
  status: string;
  service?: string;
};

export type HealthDbResponse = {
  status: string;
  database: string;
  detail?: string;
};
