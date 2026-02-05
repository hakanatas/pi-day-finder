export type DateFormatType = 'DDMMYY';

export interface DateFormatOption {
  format: DateFormatType;
  label: string;
  example: string;
  converter: (date: Date) => string;
}

export interface SearchResult {
  position: number;
  searchString: string;
  format: DateFormatType;
  found: boolean;
  context: {
    before: string;
    match: string;
    after: string;
  };
}

export interface PiDigitsState {
  digits: string;
  loaded: number;
  total: number;
  isLoading: boolean;
  error: Error | null;
}

export interface CertificateData {
  date: Date;
  result: SearchResult;
  generatedAt: Date;
}

export type AppStage =
  | { stage: 'loading' }
  | { stage: 'input' }
  | { stage: 'searching'; date: Date }
  | { stage: 'result'; date: Date; result: SearchResult }
  | { stage: 'notFound'; date: Date };
