export interface ContentItem {
  id: string;
  title: string;
  description?: string; // Optional copy
  fileUrl: string; // Google Drive URL
  category: string;
  suggestedDate?: string; // ISO string date YYYY-MM-DD
  status: 'draft' | 'approved' | 'published';
  statusLabel?: string; // Optional translated status label
  comments?: string; // Optional internal comments
  createdAt?: any; // Firestore Timestamp or server timestamp placeholder
  updatedAt?: any; // Firestore Timestamp or server timestamp placeholder
}
