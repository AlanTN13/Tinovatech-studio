export interface ContentItem {
  id: string;
  title: string;
  description?: string; // Optional copy
  fileUrl: string; // Google Drive URL
  category: string;
  suggestedDate?: string; // ISO string date YYYY-MM-DD or undefined if not set
  status: 'draft' | 'approved' | 'published';
  statusLabel?: string; // Optional translated status label
  comments?: string; // Optional internal comments
  createdAt?: string | null; // ISO string date or null
  updatedAt?: string | null; // ISO string date or null
}
