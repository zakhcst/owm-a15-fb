export interface IPopupModel {
  message: string;
  class: string;
  delay?: number;
  manualDismiss?: IManualDismiss;
}
export interface IManualDismiss {
  delay?: number;
  callback?(n?: number): void;
}

export const enum PopupType { SNACKBAR, TOAST };
