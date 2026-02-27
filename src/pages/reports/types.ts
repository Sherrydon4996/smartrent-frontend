interface ReportFilters {
  buildingName?: string;
  month?: string;
  year?: number;
  [key: string]: any;
}

export interface ReportState {
  filters: ReportFilters;
}
