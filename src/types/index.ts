export * from "./database";

export interface WorkspaceOption {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  currency: string;
  accent_color: string;
}
