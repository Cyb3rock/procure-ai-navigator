
export interface MetricsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ItemWithClassName {
  className?: string;
}

export interface ExtractedRequirement {
  id: string;
  text: string;
  category: string;
  criticality: string;
}
