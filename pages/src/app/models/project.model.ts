export interface ProjectRelatedLink {
  name: string;
  url: string;
  iconUrl?: string; // URL/path to an icon image
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  repoUrl?: string;
  imageUrl?: string;
  architectureDiagramUrl?: string;
  status: 'in-progress' | 'cancelled' | 'learning' | 'completed' | 'old'; // Added 'old' and 'completed'
  relatedLinks?: ProjectRelatedLink[];
}
