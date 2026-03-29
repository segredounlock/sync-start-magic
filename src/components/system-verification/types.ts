export type CheckStatus = "ok" | "warning" | "error" | "info";

export type CheckItem = {
  name: string;
  status: CheckStatus;
  detail?: string;
  solutionKey?: string;
  fixPayload?: any;
};

export type CheckCategory = {
  id: string;
  label: string;
  icon: any;
  status: CheckStatus;
  items: CheckItem[];
  summary: string;
};

export type SolutionInfo = {
  fixable: boolean;
  instruction: string;
  sqlHint?: string;
  riskLevel?: "low" | "medium" | "high";
};
