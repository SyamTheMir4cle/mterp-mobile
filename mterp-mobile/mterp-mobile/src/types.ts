export interface GlobalDates {
  start: string; // ISO Date yyyy-mm-dd
  end: string;   // ISO Date
}

export interface Resource {
  name: string;
  type: 'Material' | 'Manpower' | 'Tool';
  cost: number;  // Cost in Rupiah
  unit?: string; // e.g. 'sak', 'org', 'unit'
  qty?: number;
}

export interface WorkItem {
  id: number;
  name: string;
  qty: number;
  volume: string; // e.g., "M3", "M2"
  cost: number;   // Total Cost (Rv) for this item
  weight: number; // Calculated Percentage (Cost / TotalProjectBudget * 100)
  
  // Schedule
  dates: {
    plannedStart: string;
    plannedEnd: string;
    actualStart?: string;
    actualEnd?: string;
  };

  // Logic
  logic: 'Flexible' | 'Semi-flexible' | 'Inflexible';

  // Allocated Resources (Plan)
  resources: Resource[];
  
  // Actuals (Execution)
  actuals: {
    progressPercent: number; // Daily update sum
    costUsed: number;        // Sum of actual resource costs
    resourcesUsed: Resource[]; 
  };
}

export interface ProjectSupply {
  id: string;
  item: string;
  cost: number; // Estimated Cost
  staffAssigned: string;
  deadline: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  actualPurchaseDate?: string;
  actualCost?: number;
}

export interface ProjectData {
  id?: string;
  name: string;
  location: string;
  description: string;
  totalBudget: number; // Total Project Cost (Rv)
  
  globalDates: {
    planned: GlobalDates;
    actual: GlobalDates;
  };
  
  documents: {
    shopDrawing: any;
    hse: any;
    manPowerList: any;
    workItemsList: any;
    materialList: any;
    toolsList: any;
  };
  
  supplies: ProjectSupply[];
  workItems: WorkItem[];
}
