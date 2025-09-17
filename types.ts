export enum Office {
  Admin = 'ADMIN OFFICE',
  ODM = 'ODM',
  PropertyUnit = 'PROPERTY UNIT',
  PGRCUD = 'PGRCUD',
  NFPDD = 'NFPDD',
  Personnel = 'PERSONNEL',
  COA = 'COA',
  AccountingUnit = 'ACCOUNTING UNIT',
  DisbursingUnit = 'DISBURSING UNIT',
  FOU = 'FOU',
}

export enum Status {
  Draft = 'Draft',
  InReview = 'In Review',
  Approved = 'Approved',
  Archived = 'Archived',
}

export interface Attachment {
  fileName: string;
  mimeType: string;
  data: string; // base64 encoded string
}

export interface User {
  id: string;
  name: string;
  office: Office;
  // Note: Storing passwords in localStorage is insecure. This is for simulation purposes only.
  password?: string;
}

export interface DocumentTracking {
  fromOffice: Office;
  toOffice: Office | null;
  timestamp: string;
  action: 'Created' | 'Forwarded' | 'Received';
  user: {
    id: string;
    name: string;
  };
}

export interface Document {
  id: string;
  title: string;
  status: Status;
  summary: string;
  content: string; // For extracted text from files or manual entry
  attachment?: Attachment;
  lastUpdated: string;
  ownerId: string;
  ownerName: string;
  ownerOffice: Office;
  currentOffice: Office;
  trackingHistory: DocumentTracking[];
  isReceived: boolean;
}
