/**
 * Registry centralisé de toutes les icônes utilisées dans l'app
 * Facilite la maintenance et la cohérence visuelle
 */

// ===== NAVIGATION (Colorés) =====
export const NavigationIcons = {
  dashboard: "fluent-emoji:house",
  calendar: "fluent-emoji:calendar",
  messages: "fluent-emoji:speech-balloon",
  fmpa: "fluent-emoji:fire",
  personnel: "fluent-emoji:busts-in-silhouette",
  formations: "fluent-emoji:graduation-cap",
  settings: "fluent-emoji:gear",
  notifications: "fluent-emoji:bell",
  documents: "fluent-emoji:file-folder",
  tta: "fluent-emoji:money-bag",
} as const;

// ===== TYPES FMPA (Colorés) =====
export const FMPAIcons = {
  formation: "fluent-emoji:graduation-cap",
  manoeuvre: "fluent-emoji:fire",
  presence: "fluent-emoji:fire-engine",
  all: "solar:folder-bold-duotone",
} as const;

// ===== STATUTS PARTICIPATION (Colorés) =====
export const StatusIcons = {
  registered: "fluent-emoji:check-mark-button",
  present: "fluent-emoji:white-heavy-check-mark",
  absent: "fluent-emoji:cross-mark",
  excused: "fluent-emoji:calendar",
  waiting: "fluent-emoji:hourglass-not-done",
} as const;

// ===== ACTIONS (Colorés) =====
export const ActionIcons = {
  add: "fluent-emoji:plus",
  edit: "fluent-emoji:memo",
  delete: "fluent-emoji:wastebasket",
  save: "fluent-emoji:floppy-disk",
  cancel: "fluent-emoji:cross-mark",
  search: "fluent-emoji:magnifying-glass-tilted-left",
  filter: "fluent-emoji:funnel",
  download: "fluent-emoji:down-arrow",
  upload: "fluent-emoji:up-arrow",
  print: "fluent-emoji:printer",
  share: "fluent-emoji:link",
  copy: "fluent-emoji:clipboard",
  refresh: "fluent-emoji:counterclockwise-arrows-button",
  more: "fluent-emoji:three-dots",
} as const;

// ===== INFORMATIONS (Colorés) =====
export const InfoIcons = {
  date: "fluent-emoji:calendar",
  time: "fluent-emoji:alarm-clock",
  location: "fluent-emoji:round-pushpin",
  users: "fluent-emoji:busts-in-silhouette",
  user: "fluent-emoji:bust-in-silhouette",
  phone: "fluent-emoji:telephone",
  email: "fluent-emoji:e-mail",
  info: "fluent-emoji:information",
  warning: "fluent-emoji:warning",
  success: "fluent-emoji:check-mark-button",
  error: "fluent-emoji:cross-mark",
} as const;

// ===== POMPIERS SPÉCIFIQUES =====
export const PompierIcons = {
  // Véhicules
  camion: "fluent-emoji:fire-engine",
  ambulance: "fluent-emoji:ambulance",

  // Équipements
  casque: "noto:rescue-worker-helmet",
  extincteur: "noto:fire-extinguisher",

  // Situations
  feu: "fluent-emoji:fire",
  eau: "fluent-emoji:droplet",
  secours: "fluent-emoji:sos-button",
  alerte: "fluent-emoji:alarm-clock",
  urgence: "fluent-emoji:warning",

  // Lieux
  caserne: "noto:fire-station",

  // Métiers
  pompier: "noto:firefighter",
  medecin: "fluent-emoji:health-worker",
} as const;

// ===== MODULES (Colorés) =====
export const ModuleIcons = {
  fmpa: "fluent-emoji:fire",
  messages: "fluent-emoji:speech-balloon",
  agenda: "fluent-emoji:calendar",
  personnel: "fluent-emoji:busts-in-silhouette",
  formations: "fluent-emoji:graduation-cap",
  materiel: "fluent-emoji:package",
  documents: "fluent-emoji:file-folder",
  statistiques: "fluent-emoji:bar-chart",
} as const;

// ===== UI ELEMENTS (Colorés) =====
export const UIIcons = {
  chevronDown: "fluent-emoji:down-arrow",
  chevronUp: "fluent-emoji:up-arrow",
  chevronLeft: "fluent-emoji:left-arrow",
  chevronRight: "fluent-emoji:right-arrow",
  arrowLeft: "fluent-emoji:left-arrow",
  arrowRight: "fluent-emoji:right-arrow",
  eye: "fluent-emoji:eye",
  eyeOff: "fluent-emoji:see-no-evil-monkey",
  logout: "fluent-emoji:door",
  menu: "fluent-emoji:hamburger",
  close: "fluent-emoji:cross-mark",
  expand: "fluent-emoji:magnifying-glass-tilted-right",
  collapse: "fluent-emoji:magnifying-glass-tilted-left",
} as const;

// ===== EXPORT GROUPÉ =====
export const Icons = {
  nav: NavigationIcons,
  fmpa: FMPAIcons,
  status: StatusIcons,
  action: ActionIcons,
  info: InfoIcons,
  pompier: PompierIcons,
  module: ModuleIcons,
  ui: UIIcons,
} as const;

// Type helper pour autocomplétion
export type IconName =
  | (typeof NavigationIcons)[keyof typeof NavigationIcons]
  | (typeof FMPAIcons)[keyof typeof FMPAIcons]
  | (typeof StatusIcons)[keyof typeof StatusIcons]
  | (typeof ActionIcons)[keyof typeof ActionIcons]
  | (typeof InfoIcons)[keyof typeof InfoIcons]
  | (typeof PompierIcons)[keyof typeof PompierIcons]
  | (typeof ModuleIcons)[keyof typeof ModuleIcons]
  | (typeof UIIcons)[keyof typeof UIIcons];
