export const COLORS = {
  // Brand
  primary: '#1A1A2E',
  primaryLight: '#2D2D4E',
  accent: '#E84545',

  // Surfaces
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEFF3',

  // Text
  textPrimary: '#111118',
  textSecondary: '#5C5C72',
  textMuted: '#9999AA',
  textOnDark: '#FFFFFF',

  // Borders
  border: '#E2E2EA',
  borderStrong: '#C8C8D8',

  // Semantic
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  // Order status
  statusPending: '#D97706',
  statusProcessing: '#2563EB',
  statusReady: '#16A34A',
  statusDelivered: '#5C5C72',
  statusCancelled: '#DC2626',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
} as const;

// Status label + color map
export const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending:          { label: 'Pending',          color: COLORS.statusPending,    bg: '#FEF3C7' },
  processing:       { label: 'Processing',       color: COLORS.statusProcessing, bg: '#DBEAFE' },
  ready:            { label: 'Ready',            color: COLORS.statusReady,      bg: '#DCFCE7' },
  out_for_delivery: { label: 'Out for Delivery', color: COLORS.info,             bg: '#DBEAFE' },
  delivered:        { label: 'Delivered',        color: COLORS.statusDelivered,  bg: '#F3F4F6' },
  cancelled:        { label: 'Cancelled',        color: COLORS.statusCancelled,  bg: '#FEE2E2' },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

