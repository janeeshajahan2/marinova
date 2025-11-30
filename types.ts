export type Sender = 'user' | 'bot';

export interface ChatMessage {
  sender: Sender;
  text: string;
  file?: {
    name: string;
    type: string; // MIME type
    data: string; // data URL
  };
}

export enum VisualizationType {
  MAP = 'MAP',
  CHART = 'CHART',
  LAYERS = 'LAYERS',
  THREE_D_MODEL = 'THREE_D_MODEL',
  NONE = 'NONE'
}

// More specific data types for visualizations
export interface MapDataPoint {
  lat: number;
  lon: number;
  label: string;
  value: string;
}

export interface MapVisualization {
  center: { lat: number; lon: number; };
  zoom: number;
  dataType: string;
  points: MapDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value1: number;
  value2?: number;
}

export interface ChartVisualization {
  yAxisLabel: string;
  series1Name: string;
  series2Name?: string;
  data: ChartDataPoint[];
}

export interface LayersVisualization {
  surface: string;
  mid: string;
  deep: string;
}

export interface ThreeDModelVisualization {
  modelName: string;
  description: string;
  imageSeed: string;
}


export interface VisualizationData {
  type: VisualizationType;
  title: string;
  data: any; // Kept as any for flexibility, but components will expect specific types
}

export type AppState = 'welcome' | 'app';
export type Page = 'dashboard';
export type Language = 'en' | 'hi' | 'ar' | 'ml';
export type UserRole = 'admin' | 'user' | null;

export interface VectorDBEntry {
  text: string;
  embedding: number[];
}

// --- Report Types ---
export interface ReportSection {
  heading: string;
  content: string;
}

export interface ReportImage {
  prompt: string; // Used as a seed for a placeholder image
  caption: string;
}

export interface DetailedReport {
  title: string;
  introduction: string;
  sections: ReportSection[];
  images: ReportImage[];
  visualization: VisualizationData | null;
}


// AI Response structure
export interface LiveDetection {
    type: 'Species' | 'Object' | 'Phenomenon';
    name: string;
    details: string;
}

export interface EnvironmentalAnomaly {
    parameter: string;
    status: string;
    severity: 'Low' | 'Medium' | 'High';
}

export interface PredictiveForecast {
    topic: string;
    trend: string;
    timeframe: string;
}

export interface OceanIntelligenceReport {
    situationalBriefing: string;
    liveDetections: LiveDetection[];
    environmentalAnomalies: EnvironmentalAnomaly[];
    predictiveForecast: PredictiveForecast;
}

export interface GeminiResponse {
    narrative: string;
    visualizationType: VisualizationType;
    visualizationTitle?: string;
    visualizationData: any;
    intelligenceReport?: OceanIntelligenceReport | null;
    suggestions: string[];
}