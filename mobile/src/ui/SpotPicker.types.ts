import type { GagAnchor } from '../types/db';

export type SpotPickerProps = {
  visible: boolean;
  anchors: GagAnchor[];
  personaId: string;
  loading?: boolean;
  onConfirm: (spot: GagAnchor) => void;
  onDismiss: () => void;
};
