const PATHS = {
  wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><path d="M12 20h.01" /></>,
  waves: <><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  dumbbell: <><path d="M6.5 6.5v11" /><path d="M17.5 6.5v11" /><path d="M3.5 9v6" /><path d="M20.5 9v6" /><path d="M6.5 12h11" /></>,
  spa: <><path d="M12 21c-4-1.5-7-5-7-9 3 0 5.5 1.2 7 3.5 1.5-2.3 4-3.5 7-3.5 0 4-3 7.5-7 9Z" /><path d="M12 15c-3-1.800-4.500-5-4-9 2.500 1.500 4 4.500 4 9Zm0 0c3-1.800 4.500-5 4-9-2.500 1.500-4 4.500-4 9Z" /></>,
  presentation: <><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.500 1.500L13 8 4.800 6.200c-.5-.1-.9.100-1.100.5l-.3.5c-.2.5-.1 1 .3 1.300L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.500 5.300c.3.400.8.500 1.300.300l.5-.2c.4-.3.600-.7.500-1.200Z" />,
  car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.700-1.500-1.900C18.700 10.600 16 10 16 10s-1.300-1.400-2.200-2.300c-.5-.4-1.100-.7-1.800-.7H5c-.6 0-1.100.4-1.400.9l-1.400 2.900A3.700 3.700 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
  bed: <><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.870" /><path d="M16 3.130a4 4 0 0 1 0 7.750" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  size: <><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>,
  eye: <><path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  phone: <path d="M22 16.920v3a2 2 0 0 1-2.180 2 19.790 19.790 0 0 1-8.630-3.070 19.500 19.500 0 0 1-6-6 19.790 19.790 0 0 1-3.070-8.670A2 2 0 0 1 4.110 2h3a2 2 0 0 1 2 1.720c.130.960.360 1.900.700 2.810a2 2 0 0 1-.450 2.110L8.090 9.910a16 16 0 0 0 6 6l1.270-1.270a2 2 0 0 1 2.110-.450c.910.340 1.850.570 2.810.700A2 2 0 0 1 22 16.920Z" />,
  mail: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.970 5.700a1.940 1.940 0 0 1-2.060 0L2 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  star: <path d="m12 2 3.090 6.260L22 9.270l-5 4.870 1.180 6.880L12 17.770l-6.180 3.250L7 14.140 2 9.270l6.910-1.010L12 2z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  calendar: <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  grid: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.300-4.300" /></>,
  plus: <path d="M5 12h14M12 5v14" />,
  edit: <path d="M17 3a2.850 2.850 0 0 1 4 4L7.500 20.500 2 22l1.500-5.500Z" />,
  trash: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  print: <><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  key: <><circle cx="7.500" cy="15.500" r="5.500" /><path d="m21 2-9.600 9.600" /><path d="m15.500 7.500 3 3L22 7l-3-3" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.750 9.750 0 0 1 6.740 2.740L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.750 9.750 0 0 1-6.740-2.740L3 16" /><path d="M8 16H3v5" /></>,
  alert: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  wine: <><path d="M8 22h8" /><path d="M12 15v7" /><path d="M7 3h10c0 4-.5 6-2 8a5 5 0 0 1-6 0C7.500 9 7 7 7 3Z" /></>,
  instagram: <><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.500 6.500h.01" /></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  x: <path d="M4 4l16 16M20 4 4 20" />,
};

export default function Icon({ name, size = 20, className = '', filled = false, ...rest }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name] || null}
    </svg>
  );
}
