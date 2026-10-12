import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CssBaseline,
  Drawer,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Add,
  AnalyticsRounded,
  AssessmentRounded,
  BuildRounded,
  DashboardRounded,
  DownloadRounded,
  HistoryRounded,
  MapRounded,
  NotificationsNoneRounded,
  PrintRounded,
  SettingsRounded,
  UploadFileRounded,
} from '@mui/icons-material';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import FriendLayout from './public-site/components/Layout';
import FriendAbout from './public-site/pages/About';
import FriendContact from './public-site/pages/Contact';
import FriendForgotPassword from './public-site/pages/ForgotPassword';
import FriendHome from './public-site/pages/Home';
import FriendLogin from './public-site/pages/Login';
import FriendResetPassword from './public-site/pages/ResetPassword';
import FriendSignup from './public-site/pages/Signup';
import { ThemeProvider as FriendThemeProvider } from './public-site/context/ThemeContext';
import { defaultUserPreferences, initialCleanupTasks, initialObservations } from './data/mockData';
import { getCategoryDistribution, getCountByDate, getSeverityBreakdown, getTaskCompletionStats } from './services/analyticsService';
import { loadCleanupTasks, resetCleanupTasks, saveCleanupTasks } from './services/cleanupService';
import { clearDemoSession, createDemoSession, readDemoSession } from './services/demoAuth';
import { loadObservations, resetObservations, saveObservations } from './services/observationsService';
import type { CleanupPriority, CleanupStatus, CleanupTask, DebrisCategory, Observation, ReviewStatus, RiskSeverity, TimeRange, UserPreferences } from './types';
import { calculateIllustrativeRisk, clampRange, conditionToScore, RISK_METHODOLOGY } from './utils/risk';
import { escapeCsvValue, exportCsvFile } from './utils/csv';
import './App.css';
import './public-site/public-site.css';
import 'leaflet/dist/leaflet.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const severityColors: Record<RiskSeverity, string> = {
  Low: '#39856F',
  Moderate: '#D5A43B',
  High: '#D97745',
  Critical: '#C84646',
};

const navItems = [
  { label: 'Overview', path: '/overview', icon: <DashboardRounded /> },
  { label: 'AI Detection', path: '/detection', icon: <UploadFileRounded /> },
  { label: 'Marine Hotspots', path: '/hotspots', icon: <MapRounded /> },
  { label: 'Risk Assessment', path: '/risk-assessment', icon: <AssessmentRounded /> },
  { label: 'Detection History', path: '/history', icon: <HistoryRounded /> },
  { label: 'Cleanup Planning', path: '/cleanup', icon: <BuildRounded /> },
  { label: 'Analytics & Reports', path: '/analytics', icon: <AnalyticsRounded /> },
  { label: 'Settings', path: '/settings', icon: <SettingsRounded /> },
];

const dashboardPaths = new Set(['/overview', '/detection', '/hotspots', '/risk-assessment', '/history', '/cleanup', '/analytics', '/settings']);
const publicPaths = new Set(['/', '/about', '/contact', '/login', '/signup', '/forgot-password', '/reset-password']);

const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const debrisOptions: DebrisCategory[] = [
  'Plastic bottles',
  'Fishing nets',
  'Plastic bags',
  'Containers',
  'Foam',
  'Other visible debris',
];

const reviewOptions: ReviewStatus[] = ['Pending review', 'In review', 'Approved', 'Flagged'];
const severityOptions: RiskSeverity[] = ['Low', 'Moderate', 'High', 'Critical'];

function formatDateTime(value: string): string {
  return format(new Date(value), 'dd MMM yyyy, HH:mm');
}

function formatDate(value: string): string {
  return format(new Date(value), 'dd MMM yyyy');
}

function clampToRange(value: number, min = 0, max = 100): number {
  return clampRange(value, min, max);
}

function rangeToDays(range: TimeRange): number {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 3650;
  }
}

function filterByRange(observations: Observation[], range: TimeRange): Observation[] {
  if (range === 'all') {
    return observations;
  }

  const days = rangeToDays(range);
  const cutoff = subDays(new Date(), days);
  return observations.filter((observation) => new Date(observation.timestamp) >= cutoff);
}

function getObservationById(observations: Observation[], id: string | null): Observation | undefined {
  return observations.find((observation) => observation.id === id) ?? observations[0];
}

function isGeolocated(observation: Observation): observation is Observation & { latitude: number; longitude: number } {
  return (
    typeof observation.latitude === 'number' &&
    Number.isFinite(observation.latitude) &&
    observation.latitude >= -90 &&
    observation.latitude <= 90 &&
    typeof observation.longitude === 'number' &&
    Number.isFinite(observation.longitude) &&
    observation.longitude >= -180 &&
    observation.longitude <= 180
  );
}

function MapSizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const invalidate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false, animate: false }));
    };
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);
    invalidate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function getRiskBadgeColor(severity: RiskSeverity): string {
  return severityColors[severity];
}

function createTaskId(): string {
  return `TASK-${Date.now().toString().slice(-5)}`;
}

function getSettingsFromStorage(): UserPreferences {
  try {
    const stored = localStorage.getItem('marine-ai-demo-settings');
    if (!stored) {
      return defaultUserPreferences;
    }
    const parsed = JSON.parse(stored) as Partial<UserPreferences>;
    const isFormerSeededProfile =
      parsed.displayName === 'Aarav Nair' &&
      parsed.email === 'aarav.nair@marineai.demo';
    if (isFormerSeededProfile) {
      return {
        ...defaultUserPreferences,
        theme: parsed.theme === 'dark' ? 'dark' : defaultUserPreferences.theme,
      };
    }
    return {
      ...defaultUserPreferences,
      ...parsed,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : defaultUserPreferences.displayName,
      email: typeof parsed.email === 'string' ? parsed.email : defaultUserPreferences.email,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      defaultRange: timeRangeOptions.some((option) => option.value === parsed.defaultRange) ? parsed.defaultRange as TimeRange : defaultUserPreferences.defaultRange,
      mapStyle: parsed.mapStyle === 'terrain' ? 'terrain' : 'streets',
      demoMode: false,
      notifications: {
        ...defaultUserPreferences.notifications,
        dailyDigest: typeof parsed.notifications?.dailyDigest === 'boolean' ? parsed.notifications.dailyDigest : defaultUserPreferences.notifications.dailyDigest,
        riskAlerts: typeof parsed.notifications?.riskAlerts === 'boolean' ? parsed.notifications.riskAlerts : defaultUserPreferences.notifications.riskAlerts,
        reviewDue: typeof parsed.notifications?.reviewDue === 'boolean' ? parsed.notifications.reviewDue : defaultUserPreferences.notifications.reviewDue,
      },
    };
  } catch {
    return defaultUserPreferences;
  }
}

function PublicScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function FriendPublicLayout() {
  return (
    <FriendThemeProvider>
      <div className="public-site">
        <PublicScrollToTop />
        <FriendLayout />
      </div>
    </FriendThemeProvider>
  );
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardView = dashboardPaths.has(location.pathname);
  const isPublicView = publicPaths.has(location.pathname);
  const [demoSession, setDemoSession] = useState<{ email: string } | null>(() => readDemoSession());
  const [localObservations, setLocalObservations] = useState<Observation[]>(() => loadObservations());
  const [localTasks, setLocalTasks] = useState<CleanupTask[]>(() => loadCleanupTasks());
  const [demoObservations, setDemoObservations] = useState<Observation[]>(() => initialObservations.map((item) => ({ ...item })));
  const [demoTasks, setDemoTasks] = useState<CleanupTask[]>(() => initialCleanupTasks.map((item) => ({ ...item })));
  const [dataMode, setDataMode] = useState<'local' | 'demo'>('local');
  const observations = dataMode === 'demo' ? demoObservations : localObservations;
  const tasks = dataMode === 'demo' ? demoTasks : localTasks;
  const [settings, setSettings] = useState<UserPreferences>(() => getSettingsFromStorage());
  const [selectedRange, setSelectedRange] = useState<TimeRange>(() => getSettingsFromStorage().defaultRange);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: settings.theme,
          primary: { main: settings.theme === 'dark' ? '#43C7F2' : '#087F8C' },
          secondary: { main: settings.theme === 'dark' ? '#00C7B7' : '#183D4D' },
          background: {
            default: settings.theme === 'dark' ? '#070B1B' : '#F6F8F7',
            paper: settings.theme === 'dark' ? '#111A2F' : '#FFFFFF',
          },
          text: {
            primary: settings.theme === 'dark' ? '#F7FAFF' : '#1B2D36',
            secondary: settings.theme === 'dark' ? '#9BB3D0' : '#586E7C',
          },
          divider: settings.theme === 'dark' ? '#202C43' : '#DCE5E4',
        },
        shape: { borderRadius: 10 },
        typography: { fontFamily: 'Inter, "Segoe UI", sans-serif' },
      }),
    [settings.theme],
  );

  useEffect(() => {
    saveObservations(localObservations);
  }, [localObservations]);

  useEffect(() => {
    saveCleanupTasks(localTasks);
  }, [localTasks]);

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const theme = (event as CustomEvent<unknown>).detail;
      if (theme === 'light' || theme === 'dark') {
        setSettings((current) => current.theme === theme ? current : { ...current, theme });
      }
    };

    window.addEventListener('marine-ai-theme-change', syncTheme);
    return () => window.removeEventListener('marine-ai-theme-change', syncTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('marine-ai-demo-settings', JSON.stringify(settings));
  }, [settings]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.body.dataset.theme = settings.theme;
  }, [settings.theme, location.pathname]);

  useEffect(() => {
    if (!snackbar) {
      return undefined;
    }
    const timer = window.setTimeout(() => setSnackbar(null), 2400);
    return () => window.clearTimeout(timer);
  }, [snackbar]);

  const pageTitle = navItems.find((item) => item.path === location.pathname)?.label ?? (isPublicView ? 'Marine AI' : 'Overview');
  const pageSubtitle =
    location.pathname === '/overview'
      ? 'Monitoring summary from records stored in this browser.'
      : location.pathname === '/detection'
          ? 'Media intake and review workspace. Model inference is not connected.'
        : location.pathname === '/hotspots'
            ? 'Geolocated observations stored in this browser.'
          : location.pathname === '/risk-assessment'
              ? 'Illustrative cleanup prioritization from a local heuristic.'
            : location.pathname === '/history'
              ? 'Searchable and filterable observation log for review.'
              : location.pathname === '/cleanup'
                ? 'Human-supervised cleanup task orchestration.'
                : location.pathname === '/analytics'
                  ? 'Summaries calculated from locally available records.'
                  : isPublicView
                    ? 'Public landing site'
                    : 'Local preferences and data controls.';

  const currentRangeObservations = useMemo(() => filterByRange(observations, selectedRange), [observations, selectedRange]);
  const chartTextColor = settings.theme === 'dark' ? '#9BB3D0' : '#586E7C';
  const chartGridColor = settings.theme === 'dark' ? 'rgba(155, 179, 208, 0.14)' : 'rgba(88, 110, 124, 0.16)';
  const chartAccentColor = settings.theme === 'dark' ? '#43C7F2' : '#087F8C';
  const hasFixtureData = dataMode === 'demo';

  const handleResetDemoData = () => {
    const confirmed = window.confirm('Clear browser-stored observations and cleanup tasks, exit demonstration mode, and reset preferences?');
    if (!confirmed) {
      return;
    }

    setLocalObservations(resetObservations());
    setLocalTasks(resetCleanupTasks());
    setDemoObservations([]);
    setDemoTasks([]);
    setDataMode('local');
    setSettings({ ...defaultUserPreferences, theme: settings.theme });
    setSnackbar('Local data cleared.');
    navigate('/overview');
  };

  const handleLoadDemoData = () => {
    setDemoObservations(initialObservations.map((observation) => ({ ...observation })));
    setDemoTasks(initialCleanupTasks.map((task) => ({ ...task })));
    setDataMode('demo');
    setSnackbar('Demonstration records loaded. They are not real observations.');
  };

  const handleExitDemo = () => {
    setDataMode('local');
    setSettings((current) => ({ ...current, demoMode: false }));
    setSnackbar('Returned to browser-stored local data.');
  };

  const isAuthenticated = Boolean(demoSession);

  const handleLogin = (email: string, password: string) => {
    const nextSession = createDemoSession(email, password);
    if (!nextSession) {
      return false;
    }
    setDemoSession(nextSession);
    navigate('/overview', { replace: true });
    return true;
  };

  const handleLogout = () => {
    clearDemoSession();
    setDemoSession(null);
    navigate('/login', { replace: true });
  };

  const routeContent = (
    <Routes>
      <Route element={<FriendPublicLayout />}>
        <Route path="/" element={<FriendHome />} />
        <Route path="/about" element={<FriendAbout />} />
        <Route path="/contact" element={<FriendContact />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/overview" replace /> : <FriendLogin onLogin={handleLogin} />} />
        <Route path="/signup" element={<FriendSignup />} />
        <Route path="/forgot-password" element={<FriendForgotPassword />} />
        <Route path="/reset-password" element={<FriendResetPassword />} />
      </Route>
      <Route
        path="/overview"
        element={
          isAuthenticated ? (
            <OverviewPage
              observations={currentRangeObservations}
              tasks={tasks}
              mapStyle={settings.mapStyle}
              chartTextColor={chartTextColor}
              chartGridColor={chartGridColor}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              onOpenObservation={(id) => navigate(`/risk-assessment?id=${id}`)}
              onStartAnalysis={() => navigate('/detection')}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/detection" element={isAuthenticated ? <DetectionPage /> : <Navigate to="/login" replace />} />
      <Route
        path="/hotspots"
        element={isAuthenticated ? <HotspotsPage observations={observations} mapStyle={settings.mapStyle} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/risk-assessment"
        element={isAuthenticated ? <RiskAssessmentPage observations={observations} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/history"
        element={
          isAuthenticated ? (
            <HistoryPage
              observations={observations}
              isDemoData={hasFixtureData}
              onDeleteObservation={(id) => {
                if (dataMode === 'demo') setDemoObservations((current) => current.filter((item) => item.id !== id));
                else setLocalObservations((current) => current.filter((item) => item.id !== id));
              }}
              onOpenObservation={(id) => navigate(`/risk-assessment?id=${id}`)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/cleanup"
        element={
          isAuthenticated ? (
            <CleanupPlanningPage
              tasks={tasks}
              observations={observations}
              onTaskUpdate={(nextTasks) => dataMode === 'demo' ? setDemoTasks(nextTasks) : setLocalTasks(nextTasks)}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/analytics"
        element={isAuthenticated ? <AnalyticsPage observations={observations} tasks={tasks} isDemoData={hasFixtureData} selectedRange={selectedRange} onRangeChange={setSelectedRange} chartTextColor={chartTextColor} chartGridColor={chartGridColor} chartAccentColor={chartAccentColor} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <SettingsPage settings={settings} onSave={setSettings} onThemeChange={(theme) => setSettings((current) => ({ ...current, theme }))} onResetData={handleResetDemoData} onLoadDemoData={handleLoadDemoData} onExitDemo={handleExitDemo} hasFixtureData={hasFixtureData} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );

  if (isPublicView) {
    return routeContent;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box className="app-shell">
        {isDashboardView && isAuthenticated ? (
          <>
            <Drawer variant="permanent" className="sidebar">
              <Box className="brand-box">
                <Box className="brand-mark">M</Box>
                <Box>
                  <Typography variant="h6" className="brand-title">
                    Marine AI
                  </Typography>
                  <Typography variant="caption" className="brand-subtitle">
                    Pollution intelligence
                  </Typography>
                </Box>
              </Box>
              <List className="nav-list">
                {navItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    className="nav-item"
                    end={item.path === '/overview'}
                    selected={location.pathname === item.path}
                  >
                    <ListItemIcon className="nav-icon">{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
              <Box className="sidebar-footer">
                <Typography variant="caption">Backend status</Typography>
                <Typography variant="body2" className="mono-text">Not connected</Typography>
              </Box>
            </Drawer>

            <Box className="main-panel">
              <AppBar position="static" color="transparent" elevation={0} className="topbar">
                <Box className="topbar-inner">
                  <Box className="page-heading">
                    <Typography variant="h4" component="h1" className="page-title">
                      {pageTitle}
                    </Typography>
                    <Typography variant="body2" className="page-subtitle">
                      {pageSubtitle}
                    </Typography>
                  </Box>
                  <Box className="topbar-actions">
                    {location.pathname !== '/overview' ? (
                      <>
                        <Box className="inline-select">
                          <Typography variant="caption">Monitoring period</Typography>
                          <Select
                            size="small"
                            value={selectedRange}
                            onChange={(event) => setSelectedRange(event.target.value as TimeRange)}
                            className="range-select"
                          >
                            {timeRangeOptions.map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                        <Button
                          variant="contained"
                          className="primary-action"
                          startIcon={<Add />}
                          onClick={() => navigate('/detection')}
                        >
                          New Analysis
                        </Button>
                      </>
                    ) : null}
                    <Button className="icon-button" aria-label="Notifications" onClick={() => setSnackbar('Notifications are not connected in this frontend demo.')}>
                      <NotificationsNoneRounded />
                    </Button>
                    <Button className="profile-pill" onClick={() => navigate('/settings')}>
                      <Box className="profile-badge">{settings.displayName.slice(0, 2).toUpperCase()}</Box>
                      <Box className="profile-text">
                        <Typography variant="body2">{settings.displayName}</Typography>
                      </Box>
                    </Button>
                    <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>Logout</Button>
                  </Box>
                </Box>
              </AppBar>

              <Box className="content-wrapper">
                {hasFixtureData ? (
                  <Alert severity="warning" className="demo-banner">
                    DEMONSTRATION DATA — NOT REAL OBSERVATIONS. Clear it from Settings when finished.
                  </Alert>
                ) : null}
                {routeContent}
              </Box>
            </Box>
          </>
        ) : (
          routeContent
        )}

        {snackbar ? (
          <Box className="toast" role="status" aria-live="polite">
            {snackbar}
          </Box>
        ) : null}
      </Box>
    </ThemeProvider>
  );
}

function OverviewPage({
  observations,
  tasks,
  mapStyle,
  selectedRange,
  onRangeChange,
  onOpenObservation,
  onStartAnalysis,
  chartTextColor,
  chartGridColor,
}: {
  observations: Observation[];
  tasks: CleanupTask[];
  mapStyle: UserPreferences['mapStyle'];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onOpenObservation: (id: string) => void;
  onStartAnalysis: () => void;
  chartTextColor: string;
  chartGridColor: string;
}) {
  const [mapTilesFailed, setMapTilesFailed] = useState(false);
  const trendData = useMemo(() => {
    const counts = new Map<string, number>();
    observations.forEach((observation) => {
      const dateLabel = format(new Date(observation.timestamp), 'MMM d');
      counts.set(dateLabel, (counts.get(dateLabel) ?? 0) + 1);
    });
    return {
      labels: [...counts.keys()],
      values: [...counts.values()],
    };
  }, [observations]);

  const riskDistribution = useMemo(
    () => ({
      labels: ['Low', 'Moderate', 'High', 'Critical'],
      datasets: [
        {
          data: [
            observations.filter((observation) => observation.severity === 'Low').length,
            observations.filter((observation) => observation.severity === 'Moderate').length,
            observations.filter((observation) => observation.severity === 'High').length,
            observations.filter((observation) => observation.severity === 'Critical').length,
          ],
          backgroundColor: ['#39856F', '#D5A43B', '#D97745', '#C84646'],
          borderWidth: 0,
        },
      ],
    }),
    [observations],
  );

  const metricCards = [
    {
      label: 'Total observations recorded',
      value: observations.length,
      delta: 'Stored records in selected period',
      color: 'var(--accent)',
    },
    {
      label: 'Elevated-risk observations',
      value: observations.filter((observation) => observation.riskScore >= 50).length,
      delta: 'Illustrative score of 50 or higher',
      color: 'var(--accent-strong)',
    },
    {
      label: 'High-priority cleanup locations',
      value: new Set(
        observations
          .filter((observation) => observation.severity === 'High' || observation.severity === 'Critical')
          .map((observation) => observation.locationName),
      ).size,
      delta: 'High or critical records',
      color: 'var(--moderate)',
    },
    {
      label: 'Open cleanup tasks',
      value: tasks.filter((task) => task.status !== 'Completed').length,
      delta: 'Not marked completed',
      color: 'var(--high)',
    },
  ];

  return (
    <Box className="page-stack">
      <Box className="toolbar-row">
        <Box className="toolbar-group">
          <Typography variant="body2" className="toolbar-label">
            Monitoring period
          </Typography>
          <ToggleButtonGroup
            value={selectedRange}
            exclusive
            onChange={(_, value) => {
              if (value) {
                onRangeChange(value as TimeRange);
              }
            }}
            size="small"
          >
            {timeRangeOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Button variant="contained" className="primary-action" onClick={onStartAnalysis}>
          New Analysis
        </Button>
      </Box>

      <Box className="overview-metrics" aria-label="Monitoring summary">
        {metricCards.map((card, index) => (
          <Box key={card.label} className={`overview-metric${index === 0 ? ' is-primary' : ''}`}>
            <Box className="metric-header">
              <Typography variant="caption" className="metric-label">
                {card.label}
              </Typography>
              <Box className="metric-bullet" style={{ background: card.color }} />
            </Box>
            <Typography variant="h3" className="metric-value">
              {card.value}
            </Typography>
            <Typography variant="body2" className="metric-trend">
              {card.delta}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box className="dashboard-layout">
        <Card className="layout-panel wide-panel">
          <CardHeader title="Marine monitoring overview" subheader="Latest shoreline observations" />
          <CardContent>
            <Box className="mini-map-box">
              <MapContainer center={[18.5, 73.1]} zoom={7} scrollWheelZoom className="mini-map">
                <TileLayer
                  attribution={mapStyle === 'terrain' ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                  url={mapStyle === 'terrain' ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                  eventHandlers={{ tileerror: () => setMapTilesFailed(true), load: () => setMapTilesFailed(false) }}
                />
                <MapSizeInvalidator />
                {observations.filter(isGeolocated).map((observation) => (
                  <CircleMarker
                    key={observation.id}
                    center={[observation.latitude, observation.longitude]}
                    radius={9}
                    pathOptions={{ color: getRiskBadgeColor(observation.severity), fillColor: getRiskBadgeColor(observation.severity), fillOpacity: 0.8 }}
                    eventHandlers={{ click: () => onOpenObservation(observation.id) }}
                  >
                    <Popup>
                      <strong>{observation.locationName}</strong>
                      <br />
                      {observation.debrisCategory}
                      <br />
                      Risk score: {observation.riskScore}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
              {observations.filter(isGeolocated).length === 0 ? (
                <Box className="map-empty-overlay">No geolocated observations are available.</Box>
              ) : null}
              {mapTilesFailed ? <Box className="map-empty-overlay" role="alert">Map tiles could not be loaded. Check the network connection and try again.</Box> : null}
            </Box>
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Recent observations" subheader="Last reviewed entries" />
          <CardContent>
            {observations.length === 0 ? (
              <Box className="empty-state compact-empty">
                <Typography variant="body2">Your monitoring overview will appear here once observations are available.</Typography>
              </Box>
            ) : <Stack className="observation-stack">
              {observations.slice(0, 5).map((observation) => (
                <Box
                  key={observation.id}
                  className="observation-list-row"
                  onClick={() => onOpenObservation(observation.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenObservation(observation.id);
                    }
                  }}
                >
                  <Box className="observation-meta">
                    <Typography variant="caption" className="code-text">
                      {observation.id}
                    </Typography>
                    <Typography variant="subtitle2">{observation.locationName}</Typography>
                  </Box>
                  <Box className="observation-right">
                    <Typography variant="caption">{formatDateTime(observation.timestamp)}</Typography>
                    <Chip label={observation.severity} size="small" sx={{ borderColor: getRiskBadgeColor(observation.severity), color: getRiskBadgeColor(observation.severity) }} variant="outlined" />
                  </Box>
                </Box>
              ))}
            </Stack>}
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Cleanup priority summary" subheader="Next deployment urgency" />
          <CardContent>
            <Stack spacing={2}>
              {tasks.length === 0 ? <Box className="empty-state compact-empty"><Typography variant="body2">No cleanup tasks have been created yet.</Typography></Box> : tasks.slice(0, 4).map((task) => (
                <Box key={task.id} className="priority-item">
                  <Box>
                    <Typography variant="subtitle2">{task.locationName}</Typography>
                    <Typography variant="caption">{task.assignedTeam}</Typography>
                  </Box>
                  <Chip label={task.priority} size="small" className={`priority-chip ${task.priority.toLowerCase()}`} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Risk distribution" subheader="Current severity mix" />
          <CardContent className="chart-holder">
            {observations.length === 0 ? <Box className="chart-empty-state">No severity data to chart.</Box> : <Doughnut data={riskDistribution} options={{ plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } }, responsive: true, maintainAspectRatio: false }} />}
          </CardContent>
        </Card>

        <Card className="layout-panel wide-panel">
          <CardHeader title="Observation trend" subheader="Recorded detections across the selected period" />
          <CardContent className="chart-holder tall-chart">
            {observations.length === 0 ? <Box className="chart-empty-state">No observation trend is available yet.</Box> :
            <Line
              data={{
                labels: trendData.labels,
                datasets: [
                  {
                    label: 'Observations',
                    data: trendData.values,
                    borderColor: '#087F8C',
                    backgroundColor: 'rgba(8, 127, 140, 0.15)',
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } }, y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor }, beginAtZero: true } } }}
            />
            }
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('Awaiting media input.');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!file) {
      return 'No file selected.';
    }
    if (!acceptedTypes.includes(file.type) && !['jpeg', 'jpg', 'png', 'webp', 'mp4', 'webm'].includes(extension ?? '')) {
      return 'Unsupported file type. Use JPEG, JPG, PNG, WebP, MP4, or WebM.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File exceeds the 12 MB demo limit.';
    }
    return null;
  };

  const handleSelectedFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setErrorMessage('');
      setStatusMessage('Awaiting media input.');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatusMessage('File rejected.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    setSelectedFile(file);
    setErrorMessage('');
    setStatusMessage('File selected. Real model inference is not connected.');
  };

  const explainInferenceUnavailable = () => {
    if (!selectedFile) {
      setErrorMessage('Choose an image or video first.');
      return;
    }
    setStatusMessage('The file is ready for review, but no backend or AI model is connected. No result was generated.');
  };

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardHeader title="AI detection workspace" subheader="Local media preview. No backend inference is currently available." />
        <CardContent>
          <Box className="upload-layout">
            <Box
              className={`drop-zone ${selectedFile ? 'has-file' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0] ?? null;
                handleSelectedFile(file);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={(event: ChangeEvent<HTMLInputElement>) => handleSelectedFile(event.target.files?.[0] ?? null)}
                hidden
              />
              <UploadFileRounded className="upload-icon" />
              <Typography variant="h6">Drag and drop media</Typography>
              <Typography variant="body2" className="muted-text">
                JPG, PNG, WebP, MP4 and WebM accepted. Max file size 12 MB.
              </Typography>
              <Button variant="contained" className="primary-action" onClick={() => fileInputRef.current?.click()}>
                Browse files
              </Button>
              <Typography variant="caption" className="status-line" role="status">
                {statusMessage}
              </Typography>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            </Box>

            <Box className="upload-side">
              {selectedFile ? (
                <Box className="selected-file-card">
                  <Typography variant="caption" className="muted-text">Selected file</Typography>
                  <Typography variant="subtitle1">{selectedFile.name}</Typography>
                  <Typography variant="body2">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
                  <Button variant="outlined" color="error" onClick={() => handleSelectedFile(null)}>
                    Remove file
                  </Button>
                </Box>
              ) : (
                <Box className="empty-state small-state">
                  <Typography variant="body2">No file selected for analysis.</Typography>
                </Box>
              )}

              {previewUrl ? (
                <Box className="preview-box">
                  {selectedFile && (selectedFile.type.startsWith('video/') || /\.(mp4|webm)$/i.test(selectedFile.name)) ? (
                    <video
                      controls
                      src={previewUrl}
                      className="media-preview"
                      onError={() => {
                        setErrorMessage('The selected video could not be decoded by this browser.');
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setStatusMessage('Video preview unavailable.');
                      }}
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Selected media preview"
                      className="media-preview"
                      onError={() => {
                        setErrorMessage('The selected image could not be decoded.');
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setStatusMessage('Image preview unavailable.');
                      }}
                    />
                  )}
                </Box>
              ) : null}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card className="analysis-card">
        <CardHeader title="Planned analysis pipeline" subheader="Integration is not connected; these steps are not currently running." />
        <CardContent>
          <Box className="pipeline-row">
            {[
              'Input media',
              'YOLO11 debris detection',
              'MobileNetV3-Large condition classification',
              'Risk assessment',
              'Human review and cleanup prioritization',
            ].map((item, index) => (
              <Box key={item} className="pipeline-step">
                <Box className="step-number">{index + 1}</Box>
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card className="analysis-card">
        <CardHeader title="Analysis availability" subheader="Selected media is not sent to an AI model in this frontend." />
        <CardContent>
          <Box className="demo-actions">
            <Chip label="Inference unavailable" color="warning" variant="outlined" />
            <Button variant="contained" className="primary-action" onClick={explainInferenceUnavailable}>
              Check analysis availability
            </Button>
          </Box>
          <Box className="empty-state analysis-unavailable" role="status">
            <Typography variant="subtitle1">{selectedFile ? 'Media selected; no analysis has been run.' : 'Upload an image or video to begin an analysis.'}</Typography>
            <Typography variant="body2">FastAPI endpoints and YOLO11 / MobileNetV3-Large inference are not connected. No detections, confidence values, coordinates, or risk scores are being fabricated.</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function HotspotsPage({ observations, mapStyle }: { observations: Observation[]; mapStyle: UserPreferences['mapStyle'] }) {
  const [severityFilter, setSeverityFilter] = useState<'All' | RiskSeverity>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | DebrisCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ReviewStatus>('All');
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(observations[0]?.id ?? null);
  const [mapTilesFailed, setMapTilesFailed] = useState(false);

  const filteredLocations = useMemo(() => {
    return observations.filter((observation) => {
      const matchesSeverity = severityFilter === 'All' || observation.severity === severityFilter;
      const matchesCategory = categoryFilter === 'All' || observation.debrisCategory === categoryFilter;
      const matchesStatus = statusFilter === 'All' || observation.reviewStatus === statusFilter;
      const matchesSearch = searchText.trim().length === 0 || observation.locationName.toLowerCase().includes(searchText.toLowerCase());
      return matchesSeverity && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [categoryFilter, observations, searchText, severityFilter, statusFilter]);

  const geolocatedObservations = filteredLocations.filter(isGeolocated);
  const selectedObservation = filteredLocations.find((item) => item.id === selectedId) ?? filteredLocations[0];

  useEffect(() => {
    if (!selectedObservation && filteredLocations[0]) {
      setSelectedId(filteredLocations[0].id);
    }
  }, [filteredLocations, selectedObservation]);

  return (
    <Box className="page-stack">
      <Card className="filter-card">
        <CardContent className="filter-row">
          <TextField
            label="Search location"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            size="small"
          />
          <Select value={severityFilter} size="small" onChange={(event) => setSeverityFilter(event.target.value as 'All' | RiskSeverity)}>
            <MenuItem value="All">All severities</MenuItem>
            {severityOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select value={categoryFilter} size="small" onChange={(event) => setCategoryFilter(event.target.value as 'All' | DebrisCategory)}>
            <MenuItem value="All">All categories</MenuItem>
            {debrisOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select value={statusFilter} size="small" onChange={(event) => setStatusFilter(event.target.value as 'All' | ReviewStatus)}>
            <MenuItem value="All">All statuses</MenuItem>
            {reviewOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Box className="hotspot-layout">
        <Card className="layout-panel map-panel">
          <CardHeader title="Coastal monitoring map" subheader="Markers correspond only to geolocated records in the active data source." />
          <CardContent>
            {geolocatedObservations.length > 0 ? <MapContainer center={[18.3, 73.2]} zoom={7} scrollWheelZoom className="map-root">
              <TileLayer
                attribution={mapStyle === 'terrain' ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
                url={mapStyle === 'terrain' ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                eventHandlers={{ tileerror: () => setMapTilesFailed(true), load: () => setMapTilesFailed(false) }}
              />
              <MapSizeInvalidator />
              {geolocatedObservations.map((observation) => (
                <CircleMarker
                  key={observation.id}
                  center={[observation.latitude, observation.longitude]}
                  radius={8}
                  pathOptions={{ color: getRiskBadgeColor(observation.severity), fillColor: getRiskBadgeColor(observation.severity), fillOpacity: 0.8 }}
                  eventHandlers={{ click: () => setSelectedId(observation.id) }}
                >
                  <Popup>
                    <Typography variant="subtitle2">{observation.locationName}</Typography>
                    <Typography variant="body2">{observation.debrisCategory}</Typography>
                    <Typography variant="body2">Score: {observation.riskScore}</Typography>
                    <Typography variant="body2">Status: {observation.reviewStatus}</Typography>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer> : <Box className="map-empty-state">No geolocated observations are available to display.</Box>}
            {mapTilesFailed ? <Box className="map-empty-overlay" role="alert">Map tiles could not be loaded. Check the network connection and try again.</Box> : null}
          </CardContent>
        </Card>

        <Card className="layout-panel detail-panel">
          <CardHeader title="Observation details" subheader="Selected hotspot" />
          <CardContent>
            {selectedObservation ? (
              <Stack spacing={2}>
                <Typography variant="h6">{selectedObservation.locationName}</Typography>
                <Chip label={selectedObservation.severity} sx={{ background: getRiskBadgeColor(selectedObservation.severity), color: '#fff', width: 'fit-content' }} />
                <Typography variant="body2">{selectedObservation.debrisCategory}</Typography>
                <Typography variant="body2">Risk score: {selectedObservation.riskScore}</Typography>
                <Typography variant="body2">Review status: {selectedObservation.reviewStatus}</Typography>
                {isGeolocated(selectedObservation) ? <Typography variant="body2">Coordinates: {selectedObservation.latitude.toFixed(4)}, {selectedObservation.longitude.toFixed(4)}</Typography> : <Typography variant="body2">Coordinates are not available for this observation.</Typography>}
                <Typography variant="body2">{selectedObservation.notes}</Typography>
              </Stack>
            ) : (
              <Box className="empty-state">
                <Typography variant="body1">No observations match the current filter set.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function RiskAssessmentPage({ observations }: { observations: Observation[] }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const observationId = query.get('id') ?? observations[0]?.id ?? '';
  const selectedObservation = getObservationById(observations, observationId) ?? observations[0];

  const initialInputs = useMemo(() => {
    if (!selectedObservation) {
      return {
        debrisQuantity: 50,
        condition: 50,
        habitat: 50,
        shoreline: 50,
        persistence: 50,
      };
    }

    return {
      debrisQuantity: clampToRange(selectedObservation.riskScore),
      condition: conditionToScore(selectedObservation.condition),
      habitat: selectedObservation.severity === 'Critical' ? 86 : selectedObservation.severity === 'High' ? 75 : 50,
      shoreline: selectedObservation.severity === 'Low' ? 32 : 68,
      persistence: selectedObservation.reviewStatus === 'Approved' ? 42 : 64,
    };
  }, [selectedObservation]);

  const [inputs, setInputs] = useState(initialInputs);

  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  const analysis = useMemo(() => calculateIllustrativeRisk(inputs), [inputs]);

  const updateInput = (key: keyof typeof inputs, value: number) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  if (!selectedObservation) {
    return (
      <Box className="empty-state">
        <Typography variant="body1">No observations available for risk assessment.</Typography>
      </Box>
    );
  }

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardHeader title="Risk assessment" subheader="Illustrative prioritization heuristic for demo use" />
        <CardContent>
          <Box className="risk-header-box">
            <Box>
              <Typography variant="caption" className="muted-text">Overall risk score</Typography>
              <Typography variant="h2">{analysis.score}</Typography>
            </Box>
            <Chip label={analysis.severity} sx={{ background: getRiskBadgeColor(analysis.severity), color: '#fff', fontWeight: 700 }} />
          </Box>

          <Box className="detail-grid">
            <Box>
              <Typography variant="caption" className="muted-text">Location</Typography>
              <Typography>{selectedObservation.locationName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Observation date</Typography>
              <Typography>{formatDateTime(selectedObservation.timestamp)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Debris category</Typography>
              <Typography>{selectedObservation.debrisCategory}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Condition class</Typography>
              <Typography>{selectedObservation.condition}</Typography>
            </Box>
          </Box>

          <Alert severity="info" className="methodology-alert">
            {RISK_METHODOLOGY}
          </Alert>

          <Box className="risk-form-grid">
            {Object.entries(inputs).map(([key, value]) => (
              <Box key={key} className="slider-panel">
                <Typography variant="subtitle2">
                  {key === 'debrisQuantity' ? 'Debris quantity' : key === 'condition' ? 'Condition severity' : key === 'habitat' ? 'Habitat sensitivity' : key === 'shoreline' ? 'Shoreline exposure' : 'Persistence'} <span className="slider-value">{value} / 100</span>
                </Typography>
                <Slider
                  aria-label={key}
                  value={value}
                  onChange={(_, nextValue) => updateInput(key as keyof typeof inputs, Number(nextValue))}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
            ))}
          </Box>

          <Box className="factor-list">
            {analysis.factors.map((factor) => (
              <Box key={factor.name} className="factor-item">
                <Box className="factor-title-row">
                  <Typography variant="subtitle2">{factor.name}</Typography>
                  <Typography variant="body2">{factor.normalized}</Typography>
                </Box>
                <Typography variant="body2">{factor.description}</Typography>
              </Box>
            ))}
          </Box>

          <Box className="explanation-box">
            <Typography variant="subtitle2">Updated explanation</Typography>
            <Typography variant="body2">{analysis.explanation}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function HistoryPage({
  observations,
  isDemoData,
  onDeleteObservation,
  onOpenObservation,
}: {
  observations: Observation[];
  isDemoData: boolean;
  onDeleteObservation: (id: string) => void;
  onOpenObservation: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | DebrisCategory>('All');
  const [severity, setSeverity] = useState<'All' | RiskSeverity>('All');
  const [status, setStatus] = useState<'All' | ReviewStatus>('All');
  const [sortField, setSortField] = useState<'timestamp' | 'riskScore' | 'locationName'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const normalized = observations.filter((observation) => {
      const matchesSearch =
        search.trim().length === 0 ||
        observation.locationName.toLowerCase().includes(search.toLowerCase()) ||
        observation.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || observation.debrisCategory === category;
      const matchesSeverity = severity === 'All' || observation.severity === severity;
      const matchesStatus = status === 'All' || observation.reviewStatus === status;
      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
    });

    return [...normalized].sort((a, b) => {
      const left = sortField === 'timestamp' ? new Date(a.timestamp).getTime() : sortField === 'riskScore' ? a.riskScore : a.locationName.localeCompare(b.locationName);
      const right = sortField === 'timestamp' ? new Date(b.timestamp).getTime() : sortField === 'riskScore' ? b.riskScore : b.locationName.localeCompare(a.locationName);
      return sortDirection === 'asc' ? left - right : right - left;
    });
  }, [category, observations, search, severity, sortDirection, sortField, status]);

  useEffect(() => setPage(1), [search, category, severity, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: 'timestamp' | 'riskScore' | 'locationName') => {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection(field === 'locationName' ? 'asc' : 'desc');
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSeverity('All');
    setStatus('All');
  };

  const exportCsv = () => {
    const rows = filtered.map((observation) => [
      observation.id,
      observation.locationName,
      observation.timestamp,
      observation.debrisCategory,
      observation.condition,
      observation.riskScore,
      observation.severity,
      observation.reviewStatus,
      isDemoData ? 'DEMONSTRATION DATA — NOT REAL' : 'Browser-local record',
    ]);
    const csv = [
      ['Observation ID', 'Location', 'Timestamp', 'Debris type', 'Condition', 'Risk score', 'Severity', 'Review status', 'Data source'],
      ...rows,
    ]
      .map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(','))
      .join('\n');

    exportCsvFile(csv, 'marine-observations.csv');
  };

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardContent>
          <Box className="filter-row history-filter-row">
            <TextField label="Search by ID or location" value={search} onChange={(event) => setSearch(event.target.value)} size="small" />
            <Select value={category} size="small" onChange={(event) => setCategory(event.target.value as 'All' | DebrisCategory)}>
              <MenuItem value="All">All categories</MenuItem>
              {debrisOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            <Select value={severity} size="small" onChange={(event) => setSeverity(event.target.value as 'All' | RiskSeverity)}>
              <MenuItem value="All">All severities</MenuItem>
              {severityOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            <Select value={status} size="small" onChange={(event) => setStatus(event.target.value as 'All' | ReviewStatus)}>
              <MenuItem value="All">All statuses</MenuItem>
              {reviewOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            <Button variant="outlined" onClick={clearFilters}>Clear filters</Button>
            <Button variant="contained" startIcon={<DownloadRounded />} onClick={exportCsv}>Export CSV</Button>
          </Box>
        </CardContent>
      </Card>

      <Card className="analysis-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => handleSort('locationName')} className="sortable-cell">Location</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Debris</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell onClick={() => handleSort('riskScore')} className="sortable-cell">Risk score</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box className="empty-state">
                      <Typography variant="body1">{observations.length === 0 ? 'No observations have been recorded yet.' : 'No observations match the active filters.'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageItems.map((observation) => (
                  <TableRow key={observation.id} hover>
                    <TableCell>{observation.locationName}</TableCell>
                    <TableCell>{formatDateTime(observation.timestamp)}</TableCell>
                    <TableCell>{observation.debrisCategory}</TableCell>
                    <TableCell>{observation.condition}</TableCell>
                    <TableCell>{observation.riskScore}</TableCell>
                    <TableCell>
                      <Chip label={observation.severity} size="small" sx={{ background: getRiskBadgeColor(observation.severity), color: '#fff' }} />
                    </TableCell>
                    <TableCell>{observation.reviewStatus}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => onOpenObservation(observation.id)}>View</Button>
                        <Button size="small" color="warning" onClick={() => {
                          const confirmed = window.confirm(`Delete ${observation.id}?`);
                          if (confirmed) {
                            onDeleteObservation(observation.id);
                          }
                        }}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box className="pagination-row">
          <Button size="small" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
          <Typography variant="body2">Page {page} of {totalPages}</Typography>
          <Button size="small" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </Box>
      </Card>
    </Box>
  );
}

function CleanupPlanningPage({ tasks, observations, onTaskUpdate }: { tasks: CleanupTask[]; observations: Observation[]; onTaskUpdate: (tasks: CleanupTask[]) => void }) {
  const [taskForm, setTaskForm] = useState({
    title: '',
    locationName: '',
    observationId: observations[0]?.id ?? '',
    priority: 'Moderate' as CleanupPriority,
    recommendedAction: '',
    assignedTeam: '',
    dueDate: '',
    status: 'Pending' as CleanupStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CleanupStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | CleanupPriority>('All');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesTeam = teamFilter === 'All' || task.assignedTeam === teamFilter;
      return matchesStatus && matchesPriority && matchesTeam;
    });
  }, [priorityFilter, statusFilter, tasks, teamFilter]);

  const handleChange = (field: string, value: string) => {
    setTaskForm((current) => ({ ...current, [field]: value }));
  };

  const submitTask = (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!taskForm.title.trim()) errors.title = 'Title is required.';
    if (!taskForm.locationName.trim()) errors.locationName = 'Location is required.';
    if (!taskForm.assignedTeam.trim()) errors.assignedTeam = 'Team is required.';
    if (!taskForm.dueDate) errors.dueDate = 'Target date is required.';
    if (!taskForm.recommendedAction.trim()) errors.recommendedAction = 'Recommended action is required.';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const nextTask: CleanupTask = {
      id: createTaskId(),
      title: taskForm.title,
      locationName: taskForm.locationName,
      observationId: taskForm.observationId || undefined,
      priority: taskForm.priority,
      recommendedAction: taskForm.recommendedAction,
      assignedTeam: taskForm.assignedTeam,
      dueDate: taskForm.dueDate,
      status: taskForm.status,
    };

    onTaskUpdate([nextTask, ...tasks]);
    setTaskForm({
      title: '',
      locationName: '',
      observationId: observations[0]?.id ?? '',
      priority: 'Moderate',
      recommendedAction: '',
      assignedTeam: '',
      dueDate: '',
      status: 'Pending',
    });
    setFormErrors({});
  };

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardHeader title="Create cleanup task" subheader="Human supervised action planning" />
        <CardContent>
          <Box component="form" className="task-form" onSubmit={submitTask}>
            <TextField label="Task title" value={taskForm.title} onChange={(event) => handleChange('title', event.target.value)} error={Boolean(formErrors.title)} helperText={formErrors.title} />
            <TextField label="Location" value={taskForm.locationName} onChange={(event) => handleChange('locationName', event.target.value)} error={Boolean(formErrors.locationName)} helperText={formErrors.locationName} />
            <Select value={taskForm.observationId} onChange={(event) => handleChange('observationId', String(event.target.value))} displayEmpty>
              <MenuItem value="">No linked observation</MenuItem>
              {observations.map((observation) => (
                <MenuItem key={observation.id} value={observation.id}>{observation.id}</MenuItem>
              ))}
            </Select>
            <Select value={taskForm.priority} onChange={(event) => handleChange('priority', String(event.target.value))}>
              {['Low', 'Moderate', 'High', 'Critical'].map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </Select>
            <TextField label="Recommended action" value={taskForm.recommendedAction} onChange={(event) => handleChange('recommendedAction', event.target.value)} fullWidth multiline minRows={3} error={Boolean(formErrors.recommendedAction)} helperText={formErrors.recommendedAction} />
            <TextField label="Assigned team" value={taskForm.assignedTeam} onChange={(event) => handleChange('assignedTeam', event.target.value)} error={Boolean(formErrors.assignedTeam)} helperText={formErrors.assignedTeam} />
            <TextField
              label="Target date"
              type="date"
              value={taskForm.dueDate}
              onChange={(event) => handleChange('dueDate', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(formErrors.dueDate)}
              helperText={formErrors.dueDate}
            />
            <Select value={taskForm.status} onChange={(event) => handleChange('status', String(event.target.value))}>
              {['Pending', 'In progress', 'Completed'].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
            <Button type="submit" variant="contained" className="primary-action">Create task</Button>
          </Box>
        </CardContent>
      </Card>

      <Card className="analysis-card">
        <CardContent>
          <Box className="filter-row">
            <Select value={statusFilter} size="small" onChange={(event) => setStatusFilter(event.target.value as 'All' | CleanupStatus)}>
              <MenuItem value="All">All statuses</MenuItem>
              {['Pending', 'In progress', 'Completed'].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
            <Select value={priorityFilter} size="small" onChange={(event) => setPriorityFilter(event.target.value as 'All' | CleanupPriority)}>
              <MenuItem value="All">All priorities</MenuItem>
              {['Low', 'Moderate', 'High', 'Critical'].map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </Select>
            <Select value={teamFilter} size="small" onChange={(event) => setTeamFilter(event.target.value)}>
              <MenuItem value="All">All teams</MenuItem>
              {[...new Set(tasks.map((task) => task.assignedTeam))].map((team) => (
                <MenuItem key={team} value={team}>{team}</MenuItem>
              ))}
            </Select>
          </Box>
        </CardContent>
      </Card>

      <Box className="task-list-grid">
        {filteredTasks.length === 0 ? <Box className="empty-state"><Typography variant="body1">{tasks.length === 0 ? 'No cleanup tasks have been created yet.' : 'No tasks match the selected filters.'}</Typography></Box> : filteredTasks.map((task) => (
          <Card key={task.id} className="task-card">
            <CardContent>
              <Box className="task-header-row">
                <Typography variant="h6">{task.title}</Typography>
                <Chip label={task.priority} className={`priority-chip ${task.priority.toLowerCase()}`} />
              </Box>
              <Typography variant="body2">Location: {task.locationName}</Typography>
              <Typography variant="body2">Observation: {task.observationId ?? 'No linked record'}</Typography>
              <Typography variant="body2">Action: {task.recommendedAction}</Typography>
              <Typography variant="body2">Assigned team: {task.assignedTeam}</Typography>
              <Typography variant="body2">Due: {formatDate(task.dueDate)}</Typography>
              <Box className="task-actions">
                <Select
                  value={task.status}
                  size="small"
                  onChange={(event) => onTaskUpdate(tasks.map((item) => (item.id === task.id ? { ...item, status: String(event.target.value) as CleanupStatus } : item)))}
                >
                  {['Pending', 'In progress', 'Completed'].map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
                <Button color="warning" variant="outlined" onClick={() => {
                  const confirmed = window.confirm(`Mark ${task.id} as completed?`);
                  if (confirmed) {
                    onTaskUpdate(tasks.map((item) => (item.id === task.id ? { ...item, status: 'Completed' } : item)));
                  }
                }}>Complete</Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

function AnalyticsPage({ observations, tasks, isDemoData, selectedRange, onRangeChange, chartTextColor, chartGridColor, chartAccentColor }: { observations: Observation[]; tasks: CleanupTask[]; isDemoData: boolean; selectedRange: TimeRange; onRangeChange: (range: TimeRange) => void; chartTextColor: string; chartGridColor: string; chartAccentColor: string }) {
  const filteredObservations = useMemo(() => filterByRange(observations, selectedRange), [observations, selectedRange]);
  const severityBreakdown = useMemo(() => getSeverityBreakdown(filteredObservations), [filteredObservations]);
  const categoryData = useMemo(() => getCategoryDistribution(filteredObservations), [filteredObservations]);
  const taskStats = useMemo(() => getTaskCompletionStats(tasks), [tasks]);
  const dateTrend = useMemo(() => getCountByDate(filteredObservations), [filteredObservations]);

  const exportObservationCsv = () => {
    const rows = filteredObservations.map((observation) => [
      observation.id,
      observation.locationName,
      observation.timestamp,
      observation.debrisCategory,
      observation.riskScore,
      observation.severity,
      observation.reviewStatus,
      isDemoData ? 'DEMONSTRATION DATA — NOT REAL' : 'Browser-local record',
    ]);
    exportCsvFile([
      ['Observation ID', 'Location', 'Timestamp', 'Debris type', 'Risk score', 'Severity', 'Review status', 'Data source'],
      ...rows,
    ].map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(',')).join('\n'), 'marine-analytics-observations.csv');
  };

  const exportTaskCsv = () => {
    const rows = tasks.map((task) => [task.id, task.locationName, task.priority, task.status, task.assignedTeam, isDemoData ? 'DEMONSTRATION DATA — NOT REAL' : 'Browser-local record']);
    exportCsvFile([
      ['Task ID', 'Location', 'Priority', 'Status', 'Assigned team', 'Data source'],
      ...rows,
    ].map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(',')).join('\n'), 'marine-cleanup-tasks.csv');
  };

  const reportSummary = {
    totalObservations: filteredObservations.length,
    totalTasks: tasks.length,
    severityBreakdown,
  };
  const axisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartTextColor } },
      tooltip: { titleColor: '#fff', bodyColor: '#fff' },
    },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
      y: { beginAtZero: true, ticks: { color: chartTextColor, precision: 0 }, grid: { color: chartGridColor } },
    },
  };

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardContent>
          <Box className="toolbar-row">
            <ToggleButtonGroup value={selectedRange} exclusive onChange={(_, value) => { if (value) onRangeChange(value as TimeRange); }} size="small">
              {timeRangeOptions.map((option) => (
                <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Box className="report-actions">
              <Button variant="outlined" startIcon={<DownloadRounded />} onClick={exportObservationCsv}>Export observations</Button>
              <Button variant="outlined" startIcon={<DownloadRounded />} onClick={exportTaskCsv}>Export tasks</Button>
              <Button variant="contained" startIcon={<PrintRounded />} onClick={() => window.print()}>Print report</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box className="analytics-grid">
        <Card className="layout-panel">
          <CardHeader title="Observation trends" subheader="Detection counts over time" />
          <CardContent className="chart-holder">
            {filteredObservations.length === 0 ? <Box className="chart-empty-state">No observation data is available for this period.</Box> : <Line
              data={{
                labels: dateTrend.map((entry) => entry.label),
                datasets: [{
                  label: 'Observations',
                  data: dateTrend.map((entry) => entry.value),
                  borderColor: chartAccentColor,
                  backgroundColor: chartAccentColor === '#43C7F2' ? 'rgba(67,199,242,0.12)' : 'rgba(8,127,140,0.08)',
                  fill: true,
                  tension: 0.25,
                }],
              }}
              options={axisOptions}
            />}
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Debris category distribution" subheader="Current segmentation" />
          <CardContent className="chart-holder">
            {filteredObservations.length === 0 ? <Box className="chart-empty-state">No debris categories are available to chart.</Box> : <Bar
              data={{
                labels: categoryData.map((entry) => entry.label),
                datasets: [{
                  label: 'Count',
                  data: categoryData.map((entry) => entry.value),
                  backgroundColor: ['#087F8C', '#39856F', '#65BCE8', '#D5A43B', '#D97745', '#6D7C90'],
                }],
              }}
              options={axisOptions}
            />}
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Risk severity mix" subheader="Selected reporting window" />
          <CardContent className="chart-holder">
            {filteredObservations.length === 0 ? <Box className="chart-empty-state">No severity data is available to chart.</Box> : <Doughnut
              data={{
                labels: ['Low', 'Moderate', 'High', 'Critical'],
                datasets: [{
                  data: [severityBreakdown.Low, severityBreakdown.Moderate, severityBreakdown.High, severityBreakdown.Critical],
                  backgroundColor: ['#39856F', '#D5A43B', '#D97745', '#C84646'],
                }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } } }}
            />}
          </CardContent>
        </Card>

        <Card className="layout-panel">
          <CardHeader title="Cleanup task completion" subheader="Operational workload" />
          <CardContent className="chart-holder">
            {tasks.length === 0 ? <Box className="chart-empty-state">No cleanup task data is available to chart.</Box> : <Bar
              data={{
                labels: taskStats.map((entry) => entry.label),
                datasets: [{
                  label: 'Tasks',
                  data: taskStats.map((entry) => entry.value),
                  backgroundColor: ['#65BCE8', '#D5A43B', '#39856F'],
                }],
              }}
              options={axisOptions}
            />}
          </CardContent>
        </Card>
      </Box>

      <Card className="analysis-card">
        <CardHeader title="Report summary" subheader="Selected methodology and totals" />
        <CardContent>
          <Box className="report-summary-grid">
            <Box>
              <Typography variant="caption" className="muted-text">Range</Typography>
              <Typography variant="body1">{timeRangeOptions.find((option) => option.value === selectedRange)?.label}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Total observations</Typography>
              <Typography variant="body1">{reportSummary.totalObservations}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Cleanup tasks</Typography>
              <Typography variant="body1">{reportSummary.totalTasks}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" className="muted-text">Severity distribution</Typography>
              <Typography variant="body1">
                {severityOptions.map((name) => `${name}: ${reportSummary.severityBreakdown[name]}`).join(' · ')}
              </Typography>
            </Box>
          </Box>
          <Alert severity="info">This is a frontend summary of the records currently available in the selected data source. It is not a validated scientific report or live backend output.</Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

function SettingsPage({ settings, onSave, onThemeChange, onResetData, onLoadDemoData, onExitDemo, hasFixtureData }: { settings: UserPreferences; onSave: (value: UserPreferences) => void; onThemeChange: (theme: UserPreferences['theme']) => void; onResetData: () => void; onLoadDemoData: () => void; onExitDemo: () => void; hasFixtureData: boolean }) {
  const [formValues, setFormValues] = useState<UserPreferences>(settings);

  useEffect(() => {
    setFormValues(settings);
  }, [settings]);

  const handleField = <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleNotificationChange = (field: keyof UserPreferences['notifications'], value: boolean) => {
    setFormValues((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: value,
      },
    }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(formValues);
  };

  return (
    <Box className="page-stack">
      <Card className="analysis-card">
        <CardHeader title="Settings" subheader="Browser-local preferences, data-source controls, and review configuration" />
        <CardContent>
          <Box component="form" className="settings-form" onSubmit={onSubmit}>
            <Box className="settings-section">
              <Typography variant="h6">Profile</Typography>
              <TextField label="Display name" value={formValues.displayName} onChange={(event) => handleField('displayName', event.target.value)} />
              <TextField label="Email" value={formValues.email} onChange={(event) => handleField('email', event.target.value)} />
            </Box>
            <Box className="settings-section">
              <Typography variant="h6">Display preferences</Typography>
              <RadioGroup value={formValues.theme} onChange={(event) => {
                const theme = event.target.value as UserPreferences['theme'];
                handleField('theme', theme);
                onThemeChange(theme);
              }}>
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              </RadioGroup>
              <Select value={formValues.defaultRange} onChange={(event) => handleField('defaultRange', event.target.value as TimeRange)}>
                {timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              <Select value={formValues.mapStyle} onChange={(event) => handleField('mapStyle', event.target.value as 'streets' | 'terrain')}>
                <MenuItem value="streets">Streets</MenuItem>
                <MenuItem value="terrain">Terrain</MenuItem>
              </Select>
            </Box>
            <Box className="settings-section">
              <Typography variant="h6">Notifications</Typography>
              <FormControlLabel control={<Switch checked={formValues.notifications.dailyDigest} onChange={(_, checked) => handleNotificationChange('dailyDigest', checked)} />} label="Daily digest" />
              <FormControlLabel control={<Switch checked={formValues.notifications.riskAlerts} onChange={(_, checked) => handleNotificationChange('riskAlerts', checked)} />} label="Risk alerts" />
              <FormControlLabel control={<Switch checked={formValues.notifications.reviewDue} onChange={(_, checked) => handleNotificationChange('reviewDue', checked)} />} label="Review due" />
            </Box>
            <Box className="settings-section">
              <Typography variant="h6">Application information</Typography>
              <Typography variant="body2">Risk-score methodology disclaimer: {RISK_METHODOLOGY}</Typography>
              <Typography variant="body2">Data source: {hasFixtureData ? 'Explicitly loaded demonstration fixtures (not real records)' : 'Browser-local records; no backend connected'}</Typography>
            </Box>
            <Box className="settings-actions">
              <Button type="submit" variant="contained">Save preferences</Button>
              {hasFixtureData ? <Button variant="outlined" onClick={onExitDemo}>Exit demonstration mode</Button> : <Button variant="outlined" onClick={onLoadDemoData}>Load demonstration data</Button>}
              <Button variant="outlined" color="error" onClick={onResetData}>Clear local data and reset preferences</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
