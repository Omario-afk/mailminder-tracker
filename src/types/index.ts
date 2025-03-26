export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organizationId: string;
  permissions: Permission[];
  language?: string;
};

export enum UserRole {
  DIRECTOR = "director",
  MEMBER = "member"
}

export enum Permission {
  READ = "read",
  EDIT = "edit",
  DELETE = "delete"
}

export type Organization = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
};

export enum DocumentScope {
  REGIONAL = "regionale",
  PRINCIPAL = "principal",
  COMMUNAL = "communal"
}

export enum DocumentType {
  REUNION = "reunion",
  MISSION = "mission",
  VISITE = "visite",
  FEP = "fep",
  CPC = "cpc"
}

export type Document = {
  id: string;
  title: string;
  scope: DocumentScope;
  sender: string;
  issueDate: Date;
  receiptDate: Date;
  receiptNumber: string;
  subject: string;
  type: DocumentType;
  meetingDate?: Date;
  location?: string;
  time?: string;
  status: DocumentStatus;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export enum DocumentStatus {
  DRAFT = "draft",
  SENT = "sent",
  RECEIVED = "received",
  ARCHIVED = "archived"
}
