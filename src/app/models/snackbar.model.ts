export interface ISnackbarData {
  message: string;
  class: string;
  delay?: number;
  manualDismiss?: IManualDismiss;
}
export interface IManualDismiss {
  delay?: number;
  callback?(n?: number): void;
}
