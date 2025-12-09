export enum AppMode {
  NAVIGATION = 'NAVIGATION',
  READING = 'READING'
}

export interface GuidanceResponse {
  text: string;
}

export interface CameraHandle {
  captureFrame: () => string | null;
}
