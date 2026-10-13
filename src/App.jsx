import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppBar, Box, Button, Card, CardContent, CardHeader, Chip, CssBaseline, Drawer, FormControlLabel, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Radio, RadioGroup, Select, Slider, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography, } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Add, AnalyticsRounded, AssessmentRounded, BuildRounded, DashboardRounded, DownloadRounded, HistoryRounded, MapRounded, NotificationsNoneRounded, PrintRounded, SettingsRounded, UploadFileRounded, } from '@mui/icons-material';
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
import { calculateIllustrativeRisk, clampRange, conditionToScore, RISK_METHODOLOGY } from './utils/risk';
import { escapeCsvValue, exportCsvFile } from './utils/csv';
import './App.css';
import './public-site/public-site.css';
import 'leaflet/dist/leaflet.css';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const severityColors = {
    Low: '#39856F',
    Moderate: '#D5A43B',
    High: '#D97745',
    Critical: '#C84646',
};
const navItems = [
    { label: 'Overview', path: '/overview', icon: _jsx(DashboardRounded, {}) },
    { label: 'AI Detection', path: '/detection', icon: _jsx(UploadFileRounded, {}) },
    { label: 'Marine Hotspots', path: '/hotspots', icon: _jsx(MapRounded, {}) },
    { label: 'Risk Assessment', path: '/risk-assessment', icon: _jsx(AssessmentRounded, {}) },
    { label: 'Detection History', path: '/history', icon: _jsx(HistoryRounded, {}) },
    { label: 'Cleanup Planning', path: '/cleanup', icon: _jsx(BuildRounded, {}) },
    { label: 'Analytics & Reports', path: '/analytics', icon: _jsx(AnalyticsRounded, {}) },
    { label: 'Settings', path: '/settings', icon: _jsx(SettingsRounded, {}) },
];
const dashboardPaths = new Set(['/overview', '/detection', '/hotspots', '/risk-assessment', '/history', '/cleanup', '/analytics', '/settings']);
const publicPaths = new Set(['/', '/about', '/contact', '/login', '/signup', '/forgot-password', '/reset-password']);
const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
];
const debrisOptions = [
    'Plastic bottles',
    'Fishing nets',
    'Plastic bags',
    'Containers',
    'Foam',
    'Other visible debris',
];
const reviewOptions = ['Pending review', 'In review', 'Approved', 'Flagged'];
const severityOptions = ['Low', 'Moderate', 'High', 'Critical'];
function formatDateTime(value) {
    return format(new Date(value), 'dd MMM yyyy, HH:mm');
}
function formatDate(value) {
    return format(new Date(value), 'dd MMM yyyy');
}
function clampToRange(value, min = 0, max = 100) {
    return clampRange(value, min, max);
}
function rangeToDays(range) {
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
function filterByRange(observations, range) {
    if (range === 'all') {
        return observations;
    }
    const days = rangeToDays(range);
    const cutoff = subDays(new Date(), days);
    return observations.filter((observation) => new Date(observation.timestamp) >= cutoff);
}
function getObservationById(observations, id) {
    return observations.find((observation) => observation.id === id) ?? observations[0];
}
function isGeolocated(observation) {
    return (typeof observation.latitude === 'number' &&
        Number.isFinite(observation.latitude) &&
        observation.latitude >= -90 &&
        observation.latitude <= 90 &&
        typeof observation.longitude === 'number' &&
        Number.isFinite(observation.longitude) &&
        observation.longitude >= -180 &&
        observation.longitude <= 180);
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
function getRiskBadgeColor(severity) {
    return severityColors[severity];
}
function createTaskId() {
    return `TASK-${Date.now().toString().slice(-5)}`;
}
function getSettingsFromStorage() {
    try {
        const stored = localStorage.getItem('marine-ai-demo-settings');
        if (!stored) {
            return defaultUserPreferences;
        }
        const parsed = JSON.parse(stored);
        const isFormerSeededProfile = parsed.displayName === 'Aarav Nair' &&
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
            defaultRange: timeRangeOptions.some((option) => option.value === parsed.defaultRange) ? parsed.defaultRange : defaultUserPreferences.defaultRange,
            mapStyle: parsed.mapStyle === 'terrain' ? 'terrain' : 'streets',
            demoMode: false,
            notifications: {
                ...defaultUserPreferences.notifications,
                dailyDigest: typeof parsed.notifications?.dailyDigest === 'boolean' ? parsed.notifications.dailyDigest : defaultUserPreferences.notifications.dailyDigest,
                riskAlerts: typeof parsed.notifications?.riskAlerts === 'boolean' ? parsed.notifications.riskAlerts : defaultUserPreferences.notifications.riskAlerts,
                reviewDue: typeof parsed.notifications?.reviewDue === 'boolean' ? parsed.notifications.reviewDue : defaultUserPreferences.notifications.reviewDue,
            },
        };
    }
    catch {
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
    return (_jsx(FriendThemeProvider, { children: _jsxs("div", { className: "public-site", children: [_jsx(PublicScrollToTop, {}), _jsx(FriendLayout, {})] }) }));
}
function AppInner() {
    const location = useLocation();
    const navigate = useNavigate();
    const isDashboardView = dashboardPaths.has(location.pathname);
    const isPublicView = publicPaths.has(location.pathname);
    const [demoSession, setDemoSession] = useState(() => readDemoSession());
    const [localObservations, setLocalObservations] = useState(() => loadObservations());
    const [localTasks, setLocalTasks] = useState(() => loadCleanupTasks());
    const [demoObservations, setDemoObservations] = useState(() => initialObservations.map((item) => ({ ...item })));
    const [demoTasks, setDemoTasks] = useState(() => initialCleanupTasks.map((item) => ({ ...item })));
    const [dataMode, setDataMode] = useState('local');
    const observations = dataMode === 'demo' ? demoObservations : localObservations;
    const tasks = dataMode === 'demo' ? demoTasks : localTasks;
    const [settings, setSettings] = useState(() => getSettingsFromStorage());
    const [selectedRange, setSelectedRange] = useState(() => getSettingsFromStorage().defaultRange);
    const [snackbar, setSnackbar] = useState(null);
    const muiTheme = useMemo(() => createTheme({
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
    }), [settings.theme]);
    useEffect(() => {
        saveObservations(localObservations);
    }, [localObservations]);
    useEffect(() => {
        saveCleanupTasks(localTasks);
    }, [localTasks]);
    useEffect(() => {
        const syncTheme = (event) => {
            const theme = event.detail;
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
    const pageSubtitle = location.pathname === '/overview'
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
    const handleLogin = (email, password) => {
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
    const routeContent = (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(FriendPublicLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(FriendHome, {}) }), _jsx(Route, { path: "/about", element: _jsx(FriendAbout, {}) }), _jsx(Route, { path: "/contact", element: _jsx(FriendContact, {}) }), _jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/overview", replace: true }) : _jsx(FriendLogin, { onLogin: handleLogin }) }), _jsx(Route, { path: "/signup", element: _jsx(FriendSignup, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(FriendForgotPassword, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(FriendResetPassword, {}) })] }), _jsx(Route, { path: "/overview", element: isAuthenticated ? (_jsx(OverviewPage, { observations: currentRangeObservations, tasks: tasks, mapStyle: settings.mapStyle, chartTextColor: chartTextColor, chartGridColor: chartGridColor, selectedRange: selectedRange, onRangeChange: setSelectedRange, onOpenObservation: (id) => navigate(`/risk-assessment?id=${id}`), onStartAnalysis: () => navigate('/detection') })) : (_jsx(Navigate, { to: "/login", replace: true })) }), _jsx(Route, { path: "/detection", element: isAuthenticated ? _jsx(DetectionPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/hotspots", element: isAuthenticated ? _jsx(HotspotsPage, { observations: observations, mapStyle: settings.mapStyle }) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/risk-assessment", element: isAuthenticated ? _jsx(RiskAssessmentPage, { observations: observations }) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/history", element: isAuthenticated ? (_jsx(HistoryPage, { observations: observations, isDemoData: hasFixtureData, onDeleteObservation: (id) => {
                        if (dataMode === 'demo')
                            setDemoObservations((current) => current.filter((item) => item.id !== id));
                        else
                            setLocalObservations((current) => current.filter((item) => item.id !== id));
                    }, onOpenObservation: (id) => navigate(`/risk-assessment?id=${id}`) })) : (_jsx(Navigate, { to: "/login", replace: true })) }), _jsx(Route, { path: "/cleanup", element: isAuthenticated ? (_jsx(CleanupPlanningPage, { tasks: tasks, observations: observations, onTaskUpdate: (nextTasks) => dataMode === 'demo' ? setDemoTasks(nextTasks) : setLocalTasks(nextTasks) })) : (_jsx(Navigate, { to: "/login", replace: true })) }), _jsx(Route, { path: "/analytics", element: isAuthenticated ? _jsx(AnalyticsPage, { observations: observations, tasks: tasks, isDemoData: hasFixtureData, selectedRange: selectedRange, onRangeChange: setSelectedRange, chartTextColor: chartTextColor, chartGridColor: chartGridColor, chartAccentColor: chartAccentColor }) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/settings", element: isAuthenticated ? _jsx(SettingsPage, { settings: settings, onSave: setSettings, onThemeChange: (theme) => setSettings((current) => ({ ...current, theme })), onResetData: handleResetDemoData, onLoadDemoData: handleLoadDemoData, onExitDemo: handleExitDemo, hasFixtureData: hasFixtureData }) : _jsx(Navigate, { to: "/login", replace: true }) })] }));
    if (isPublicView) {
        return routeContent;
    }
    return (_jsxs(ThemeProvider, { theme: muiTheme, children: [_jsx(CssBaseline, {}), _jsxs(Box, { className: "app-shell", children: [isDashboardView && isAuthenticated ? (_jsxs(_Fragment, { children: [_jsxs(Drawer, { variant: "permanent", className: "sidebar", children: [_jsxs(Box, { className: "brand-box", children: [_jsx(Box, { className: "brand-mark", children: _jsx(Box, { component: "img", src: "/images/svg.png", alt: "Marine AI logo" }) }), _jsxs(Box, { className: "brand-copy", children: [_jsxs(Typography, { variant: "h6", className: "brand-title", children: ["Marine", _jsx(Box, { component: "span", className: "brand-title-accent", children: "AI" })] }), _jsx(Typography, { variant: "caption", className: "brand-subtitle", children: "Ocean Intel" })] })] }), _jsx(List, { className: "nav-list", children: navItems.map((item) => (_jsxs(ListItemButton, { component: NavLink, to: item.path, className: "nav-item", end: item.path === '/overview', selected: location.pathname === item.path, children: [_jsx(ListItemIcon, { className: "nav-icon", children: item.icon }), _jsx(ListItemText, { primary: item.label })] }, item.path))) }), _jsxs(Box, { className: "sidebar-footer", children: [_jsx(Typography, { variant: "caption", children: "Backend status" }), _jsx(Typography, { variant: "body2", className: "mono-text", children: "Not connected" })] })] }), _jsxs(Box, { className: "main-panel", children: [_jsx(AppBar, { position: "static", color: "transparent", elevation: 0, className: "topbar", children: _jsxs(Box, { className: "topbar-inner", children: [_jsxs(Box, { className: "page-heading", children: [_jsx(Typography, { variant: "h4", component: "h1", className: "page-title", children: pageTitle }), _jsx(Typography, { variant: "body2", className: "page-subtitle", children: pageSubtitle })] }), _jsxs(Box, { className: "topbar-actions", children: [location.pathname !== '/overview' ? (_jsxs(_Fragment, { children: [_jsxs(Box, { className: "inline-select", children: [_jsx(Typography, { variant: "caption", children: "Monitoring period" }), _jsx(Select, { size: "small", value: selectedRange, onChange: (event) => setSelectedRange(event.target.value), className: "range-select", children: timeRangeOptions.map((item) => (_jsx(MenuItem, { value: item.value, children: item.label }, item.value))) })] }), _jsx(Button, { variant: "contained", className: "primary-action", startIcon: _jsx(Add, {}), onClick: () => navigate('/detection'), children: "New Analysis" })] })) : null, _jsx(Button, { className: "icon-button", "aria-label": "Notifications", onClick: () => setSnackbar('Notifications are not connected in this frontend demo.'), children: _jsx(NotificationsNoneRounded, {}) }), _jsxs(Button, { className: "profile-pill", onClick: () => navigate('/settings'), children: [_jsx(Box, { className: "profile-badge", children: settings.displayName.slice(0, 2).toUpperCase() }), _jsx(Box, { className: "profile-text", children: _jsx(Typography, { variant: "body2", children: settings.displayName }) })] }), _jsx(Button, { variant: "outlined", color: "inherit", size: "small", onClick: handleLogout, children: "Logout" })] })] }) }), _jsxs(Box, { className: "content-wrapper", children: [hasFixtureData ? (_jsx(Alert, { severity: "warning", className: "demo-banner", children: "DEMONSTRATION DATA \u2014 NOT REAL OBSERVATIONS. Clear it from Settings when finished." })) : null, routeContent] })] })] })) : (routeContent), snackbar ? (_jsx(Box, { className: "toast", role: "status", "aria-live": "polite", children: snackbar })) : null] })] }));
}
function OverviewPage({ observations, tasks, mapStyle, selectedRange, onRangeChange, onOpenObservation, onStartAnalysis, chartTextColor, chartGridColor, }) {
    const [mapTilesFailed, setMapTilesFailed] = useState(false);
    const trendData = useMemo(() => {
        const counts = new Map();
        observations.forEach((observation) => {
            const dateLabel = format(new Date(observation.timestamp), 'MMM d');
            counts.set(dateLabel, (counts.get(dateLabel) ?? 0) + 1);
        });
        return {
            labels: [...counts.keys()],
            values: [...counts.values()],
        };
    }, [observations]);
    const riskDistribution = useMemo(() => ({
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
    }), [observations]);
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
            value: new Set(observations
                .filter((observation) => observation.severity === 'High' || observation.severity === 'Critical')
                .map((observation) => observation.locationName)).size,
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsxs(Box, { className: "toolbar-row", children: [_jsxs(Box, { className: "toolbar-group", children: [_jsx(Typography, { variant: "body2", className: "toolbar-label", children: "Monitoring period" }), _jsx(ToggleButtonGroup, { value: selectedRange, exclusive: true, onChange: (_, value) => {
                                    if (value) {
                                        onRangeChange(value);
                                    }
                                }, size: "small", children: timeRangeOptions.map((option) => (_jsx(ToggleButton, { value: option.value, "aria-label": option.label, children: option.label }, option.value))) })] }), _jsx(Button, { variant: "contained", className: "primary-action", onClick: onStartAnalysis, children: "New Analysis" })] }), _jsx(Box, { className: "overview-metrics", "aria-label": "Monitoring summary", children: metricCards.map((card, index) => (_jsxs(Box, { className: `overview-metric${index === 0 ? ' is-primary' : ''}`, children: [_jsxs(Box, { className: "metric-header", children: [_jsx(Typography, { variant: "caption", className: "metric-label", children: card.label }), _jsx(Box, { className: "metric-bullet", style: { background: card.color } })] }), _jsx(Typography, { variant: "h3", className: "metric-value", children: card.value }), _jsx(Typography, { variant: "body2", className: "metric-trend", children: card.delta })] }, card.label))) }), _jsxs(Box, { className: "dashboard-layout", children: [_jsxs(Card, { className: "layout-panel wide-panel", children: [_jsx(CardHeader, { title: "Marine monitoring overview", subheader: "Latest shoreline observations" }), _jsx(CardContent, { children: _jsxs(Box, { className: "mini-map-box", children: [_jsxs(MapContainer, { center: [18.5, 73.1], zoom: 7, scrollWheelZoom: true, className: "mini-map", children: [_jsx(TileLayer, { attribution: mapStyle === 'terrain' ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: mapStyle === 'terrain' ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', eventHandlers: { tileerror: () => setMapTilesFailed(true), load: () => setMapTilesFailed(false) } }), _jsx(MapSizeInvalidator, {}), observations.filter(isGeolocated).map((observation) => (_jsx(CircleMarker, { center: [observation.latitude, observation.longitude], radius: 9, pathOptions: { color: getRiskBadgeColor(observation.severity), fillColor: getRiskBadgeColor(observation.severity), fillOpacity: 0.8 }, eventHandlers: { click: () => onOpenObservation(observation.id) }, children: _jsxs(Popup, { children: [_jsx("strong", { children: observation.locationName }), _jsx("br", {}), observation.debrisCategory, _jsx("br", {}), "Risk score: ", observation.riskScore] }) }, observation.id)))] }), observations.filter(isGeolocated).length === 0 ? (_jsx(Box, { className: "map-empty-overlay", children: "No geolocated observations are available." })) : null, mapTilesFailed ? _jsx(Box, { className: "map-empty-overlay", role: "alert", children: "Map tiles could not be loaded. Check the network connection and try again." }) : null] }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Recent observations", subheader: "Last reviewed entries" }), _jsx(CardContent, { children: observations.length === 0 ? (_jsx(Box, { className: "empty-state compact-empty", children: _jsx(Typography, { variant: "body2", children: "Your monitoring overview will appear here once observations are available." }) })) : _jsx(Stack, { className: "observation-stack", children: observations.slice(0, 5).map((observation) => (_jsxs(Box, { className: "observation-list-row", onClick: () => onOpenObservation(observation.id), tabIndex: 0, role: "button", onKeyDown: (event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onOpenObservation(observation.id);
                                            }
                                        }, children: [_jsxs(Box, { className: "observation-meta", children: [_jsx(Typography, { variant: "caption", className: "code-text", children: observation.id }), _jsx(Typography, { variant: "subtitle2", children: observation.locationName })] }), _jsxs(Box, { className: "observation-right", children: [_jsx(Typography, { variant: "caption", children: formatDateTime(observation.timestamp) }), _jsx(Chip, { label: observation.severity, size: "small", sx: { borderColor: getRiskBadgeColor(observation.severity), color: getRiskBadgeColor(observation.severity) }, variant: "outlined" })] })] }, observation.id))) }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Cleanup priority summary", subheader: "Next deployment urgency" }), _jsx(CardContent, { children: _jsx(Stack, { spacing: 2, children: tasks.length === 0 ? _jsx(Box, { className: "empty-state compact-empty", children: _jsx(Typography, { variant: "body2", children: "No cleanup tasks have been created yet." }) }) : tasks.slice(0, 4).map((task) => (_jsxs(Box, { className: "priority-item", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", children: task.locationName }), _jsx(Typography, { variant: "caption", children: task.assignedTeam })] }), _jsx(Chip, { label: task.priority, size: "small", className: `priority-chip ${task.priority.toLowerCase()}` })] }, task.id))) }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Risk distribution", subheader: "Current severity mix" }), _jsx(CardContent, { className: "chart-holder", children: observations.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No severity data to chart." }) : _jsx(Doughnut, { data: riskDistribution, options: { plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } }, responsive: true, maintainAspectRatio: false } }) })] }), _jsxs(Card, { className: "layout-panel wide-panel", children: [_jsx(CardHeader, { title: "Observation trend", subheader: "Recorded detections across the selected period" }), _jsx(CardContent, { className: "chart-holder tall-chart", children: observations.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No observation trend is available yet." }) :
                                    _jsx(Line, { data: {
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
                                        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } }, y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor }, beginAtZero: true } } } }) })] })] })] }));
}
function DetectionPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('Awaiting media input.');
    const fileInputRef = useRef(null);
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);
    const validateFile = (file) => {
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
    const handleSelectedFile = (file) => {
        if (!file) {
            setSelectedFile(null);
            setErrorMessage('');
            setStatusMessage('Awaiting media input.');
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            if (fileInputRef.current)
                fileInputRef.current.value = '';
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
            if (fileInputRef.current)
                fileInputRef.current.value = '';
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "AI detection workspace", subheader: "Local media preview. No backend inference is currently available." }), _jsx(CardContent, { children: _jsxs(Box, { className: "upload-layout", children: [_jsxs(Box, { className: `drop-zone ${selectedFile ? 'has-file' : ''}`, onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
                                        event.preventDefault();
                                        const file = event.dataTransfer.files?.[0] ?? null;
                                        handleSelectedFile(file);
                                    }, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".jpg,.jpeg,.png,.webp,.mp4,.webm,image/jpeg,image/png,image/webp,video/mp4,video/webm", onChange: (event) => handleSelectedFile(event.target.files?.[0] ?? null), hidden: true }), _jsx(UploadFileRounded, { className: "upload-icon" }), _jsx(Typography, { variant: "h6", children: "Drag and drop media" }), _jsx(Typography, { variant: "body2", className: "muted-text", children: "JPG, PNG, WebP, MP4 and WebM accepted. Max file size 12 MB." }), _jsx(Button, { variant: "contained", className: "primary-action", onClick: () => fileInputRef.current?.click(), children: "Browse files" }), _jsx(Typography, { variant: "caption", className: "status-line", role: "status", children: statusMessage }), errorMessage ? _jsx(Alert, { severity: "error", children: errorMessage }) : null] }), _jsxs(Box, { className: "upload-side", children: [selectedFile ? (_jsxs(Box, { className: "selected-file-card", children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Selected file" }), _jsx(Typography, { variant: "subtitle1", children: selectedFile.name }), _jsxs(Typography, { variant: "body2", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB"] }), _jsx(Button, { variant: "outlined", color: "error", onClick: () => handleSelectedFile(null), children: "Remove file" })] })) : (_jsx(Box, { className: "empty-state small-state", children: _jsx(Typography, { variant: "body2", children: "No file selected for analysis." }) })), previewUrl ? (_jsx(Box, { className: "preview-box", children: selectedFile && (selectedFile.type.startsWith('video/') || /\.(mp4|webm)$/i.test(selectedFile.name)) ? (_jsx("video", { controls: true, src: previewUrl, className: "media-preview", onError: () => {
                                                    setErrorMessage('The selected video could not be decoded by this browser.');
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                    setStatusMessage('Video preview unavailable.');
                                                } })) : (_jsx("img", { src: previewUrl, alt: "Selected media preview", className: "media-preview", onError: () => {
                                                    setErrorMessage('The selected image could not be decoded.');
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                    setStatusMessage('Image preview unavailable.');
                                                } })) })) : null] })] }) })] }), _jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Planned analysis pipeline", subheader: "Integration is not connected; these steps are not currently running." }), _jsx(CardContent, { children: _jsx(Box, { className: "pipeline-row", children: [
                                'Input media',
                                'YOLO11 debris detection',
                                'MobileNetV3-Large condition classification',
                                'Risk assessment',
                                'Human review and cleanup prioritization',
                            ].map((item, index) => (_jsxs(Box, { className: "pipeline-step", children: [_jsx(Box, { className: "step-number", children: index + 1 }), _jsx(Typography, { variant: "body2", children: item })] }, item))) }) })] }), _jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Analysis availability", subheader: "Selected media is not sent to an AI model in this frontend." }), _jsxs(CardContent, { children: [_jsxs(Box, { className: "demo-actions", children: [_jsx(Chip, { label: "Inference unavailable", color: "warning", variant: "outlined" }), _jsx(Button, { variant: "contained", className: "primary-action", onClick: explainInferenceUnavailable, children: "Check analysis availability" })] }), _jsxs(Box, { className: "empty-state analysis-unavailable", role: "status", children: [_jsx(Typography, { variant: "subtitle1", children: selectedFile ? 'Media selected; no analysis has been run.' : 'Upload an image or video to begin an analysis.' }), _jsx(Typography, { variant: "body2", children: "FastAPI endpoints and YOLO11 / MobileNetV3-Large inference are not connected. No detections, confidence values, coordinates, or risk scores are being fabricated." })] })] })] })] }));
}
function HotspotsPage({ observations, mapStyle }) {
    const [severityFilter, setSeverityFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [selectedId, setSelectedId] = useState(observations[0]?.id ?? null);
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsx(Card, { className: "filter-card", children: _jsxs(CardContent, { className: "filter-row", children: [_jsx(TextField, { label: "Search location", value: searchText, onChange: (event) => setSearchText(event.target.value), size: "small" }), _jsxs(Select, { value: severityFilter, size: "small", onChange: (event) => setSeverityFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All severities" }), severityOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] }), _jsxs(Select, { value: categoryFilter, size: "small", onChange: (event) => setCategoryFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All categories" }), debrisOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] }), _jsxs(Select, { value: statusFilter, size: "small", onChange: (event) => setStatusFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All statuses" }), reviewOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] })] }) }), _jsxs(Box, { className: "hotspot-layout", children: [_jsxs(Card, { className: "layout-panel map-panel", children: [_jsx(CardHeader, { title: "Coastal monitoring map", subheader: "Markers correspond only to geolocated records in the active data source." }), _jsxs(CardContent, { children: [geolocatedObservations.length > 0 ? _jsxs(MapContainer, { center: [18.3, 73.2], zoom: 7, scrollWheelZoom: true, className: "map-root", children: [_jsx(TileLayer, { attribution: mapStyle === 'terrain' ? '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: mapStyle === 'terrain' ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', eventHandlers: { tileerror: () => setMapTilesFailed(true), load: () => setMapTilesFailed(false) } }), _jsx(MapSizeInvalidator, {}), geolocatedObservations.map((observation) => (_jsx(CircleMarker, { center: [observation.latitude, observation.longitude], radius: 8, pathOptions: { color: getRiskBadgeColor(observation.severity), fillColor: getRiskBadgeColor(observation.severity), fillOpacity: 0.8 }, eventHandlers: { click: () => setSelectedId(observation.id) }, children: _jsxs(Popup, { children: [_jsx(Typography, { variant: "subtitle2", children: observation.locationName }), _jsx(Typography, { variant: "body2", children: observation.debrisCategory }), _jsxs(Typography, { variant: "body2", children: ["Score: ", observation.riskScore] }), _jsxs(Typography, { variant: "body2", children: ["Status: ", observation.reviewStatus] })] }) }, observation.id)))] }) : _jsx(Box, { className: "map-empty-state", children: "No geolocated observations are available to display." }), mapTilesFailed ? _jsx(Box, { className: "map-empty-overlay", role: "alert", children: "Map tiles could not be loaded. Check the network connection and try again." }) : null] })] }), _jsxs(Card, { className: "layout-panel detail-panel", children: [_jsx(CardHeader, { title: "Observation details", subheader: "Selected hotspot" }), _jsx(CardContent, { children: selectedObservation ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "h6", children: selectedObservation.locationName }), _jsx(Chip, { label: selectedObservation.severity, sx: { background: getRiskBadgeColor(selectedObservation.severity), color: '#fff', width: 'fit-content' } }), _jsx(Typography, { variant: "body2", children: selectedObservation.debrisCategory }), _jsxs(Typography, { variant: "body2", children: ["Risk score: ", selectedObservation.riskScore] }), _jsxs(Typography, { variant: "body2", children: ["Review status: ", selectedObservation.reviewStatus] }), isGeolocated(selectedObservation) ? _jsxs(Typography, { variant: "body2", children: ["Coordinates: ", selectedObservation.latitude.toFixed(4), ", ", selectedObservation.longitude.toFixed(4)] }) : _jsx(Typography, { variant: "body2", children: "Coordinates are not available for this observation." }), _jsx(Typography, { variant: "body2", children: selectedObservation.notes })] })) : (_jsx(Box, { className: "empty-state", children: _jsx(Typography, { variant: "body1", children: "No observations match the current filter set." }) })) })] })] })] }));
}
function RiskAssessmentPage({ observations }) {
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
    const updateInput = (key, value) => {
        setInputs((current) => ({ ...current, [key]: value }));
    };
    if (!selectedObservation) {
        return (_jsx(Box, { className: "empty-state", children: _jsx(Typography, { variant: "body1", children: "No observations available for risk assessment." }) }));
    }
    return (_jsx(Box, { className: "page-stack", children: _jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Risk assessment", subheader: "Illustrative prioritization heuristic for demo use" }), _jsxs(CardContent, { children: [_jsxs(Box, { className: "risk-header-box", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Overall risk score" }), _jsx(Typography, { variant: "h2", children: analysis.score })] }), _jsx(Chip, { label: analysis.severity, sx: { background: getRiskBadgeColor(analysis.severity), color: '#fff', fontWeight: 700 } })] }), _jsxs(Box, { className: "detail-grid", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Location" }), _jsx(Typography, { children: selectedObservation.locationName })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Observation date" }), _jsx(Typography, { children: formatDateTime(selectedObservation.timestamp) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Debris category" }), _jsx(Typography, { children: selectedObservation.debrisCategory })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Condition class" }), _jsx(Typography, { children: selectedObservation.condition })] })] }), _jsx(Alert, { severity: "info", className: "methodology-alert", children: RISK_METHODOLOGY }), _jsx(Box, { className: "risk-form-grid", children: Object.entries(inputs).map(([key, value]) => (_jsxs(Box, { className: "slider-panel", children: [_jsxs(Typography, { variant: "subtitle2", children: [key === 'debrisQuantity' ? 'Debris quantity' : key === 'condition' ? 'Condition severity' : key === 'habitat' ? 'Habitat sensitivity' : key === 'shoreline' ? 'Shoreline exposure' : 'Persistence', " ", _jsxs("span", { className: "slider-value", children: [value, " / 100"] })] }), _jsx(Slider, { "aria-label": key, value: value, onChange: (_, nextValue) => updateInput(key, Number(nextValue)), valueLabelDisplay: "auto", min: 0, max: 100 })] }, key))) }), _jsx(Box, { className: "factor-list", children: analysis.factors.map((factor) => (_jsxs(Box, { className: "factor-item", children: [_jsxs(Box, { className: "factor-title-row", children: [_jsx(Typography, { variant: "subtitle2", children: factor.name }), _jsx(Typography, { variant: "body2", children: factor.normalized })] }), _jsx(Typography, { variant: "body2", children: factor.description })] }, factor.name))) }), _jsxs(Box, { className: "explanation-box", children: [_jsx(Typography, { variant: "subtitle2", children: "Updated explanation" }), _jsx(Typography, { variant: "body2", children: analysis.explanation })] })] })] }) }));
}
function HistoryPage({ observations, isDemoData, onDeleteObservation, onOpenObservation, }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [severity, setSeverity] = useState('All');
    const [status, setStatus] = useState('All');
    const [sortField, setSortField] = useState('timestamp');
    const [sortDirection, setSortDirection] = useState('desc');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filtered = useMemo(() => {
        const normalized = observations.filter((observation) => {
            const matchesSearch = search.trim().length === 0 ||
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
    const handleSort = (field) => {
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsx(Card, { className: "analysis-card", children: _jsx(CardContent, { children: _jsxs(Box, { className: "filter-row history-filter-row", children: [_jsx(TextField, { label: "Search by ID or location", value: search, onChange: (event) => setSearch(event.target.value), size: "small" }), _jsxs(Select, { value: category, size: "small", onChange: (event) => setCategory(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All categories" }), debrisOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] }), _jsxs(Select, { value: severity, size: "small", onChange: (event) => setSeverity(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All severities" }), severityOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] }), _jsxs(Select, { value: status, size: "small", onChange: (event) => setStatus(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All statuses" }), reviewOptions.map((option) => (_jsx(MenuItem, { value: option, children: option }, option)))] }), _jsx(Button, { variant: "outlined", onClick: clearFilters, children: "Clear filters" }), _jsx(Button, { variant: "contained", startIcon: _jsx(DownloadRounded, {}), onClick: exportCsv, children: "Export CSV" })] }) }) }), _jsxs(Card, { className: "analysis-card", children: [_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { onClick: () => handleSort('locationName'), className: "sortable-cell", children: "Location" }), _jsx(TableCell, { children: "Timestamp" }), _jsx(TableCell, { children: "Debris" }), _jsx(TableCell, { children: "Condition" }), _jsx(TableCell, { onClick: () => handleSort('riskScore'), className: "sortable-cell", children: "Risk score" }), _jsx(TableCell, { children: "Severity" }), _jsx(TableCell, { children: "Review" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: currentPageItems.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, children: _jsx(Box, { className: "empty-state", children: _jsx(Typography, { variant: "body1", children: observations.length === 0 ? 'No observations have been recorded yet.' : 'No observations match the active filters.' }) }) }) })) : (currentPageItems.map((observation) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: observation.locationName }), _jsx(TableCell, { children: formatDateTime(observation.timestamp) }), _jsx(TableCell, { children: observation.debrisCategory }), _jsx(TableCell, { children: observation.condition }), _jsx(TableCell, { children: observation.riskScore }), _jsx(TableCell, { children: _jsx(Chip, { label: observation.severity, size: "small", sx: { background: getRiskBadgeColor(observation.severity), color: '#fff' } }) }), _jsx(TableCell, { children: observation.reviewStatus }), _jsx(TableCell, { children: _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { size: "small", onClick: () => onOpenObservation(observation.id), children: "View" }), _jsx(Button, { size: "small", color: "warning", onClick: () => {
                                                                const confirmed = window.confirm(`Delete ${observation.id}?`);
                                                                if (confirmed) {
                                                                    onDeleteObservation(observation.id);
                                                                }
                                                            }, children: "Delete" })] }) })] }, observation.id)))) })] }) }), _jsxs(Box, { className: "pagination-row", children: [_jsx(Button, { size: "small", disabled: page === 1, onClick: () => setPage((current) => current - 1), children: "Previous" }), _jsxs(Typography, { variant: "body2", children: ["Page ", page, " of ", totalPages] }), _jsx(Button, { size: "small", disabled: page >= totalPages, onClick: () => setPage((current) => current + 1), children: "Next" })] })] })] }));
}
function CleanupPlanningPage({ tasks, observations, onTaskUpdate }) {
    const [taskForm, setTaskForm] = useState({
        title: '',
        locationName: '',
        observationId: observations[0]?.id ?? '',
        priority: 'Moderate',
        recommendedAction: '',
        assignedTeam: '',
        dueDate: '',
        status: 'Pending',
    });
    const [formErrors, setFormErrors] = useState({});
    const [teamFilter, setTeamFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
            const matchesTeam = teamFilter === 'All' || task.assignedTeam === teamFilter;
            return matchesStatus && matchesPriority && matchesTeam;
        });
    }, [priorityFilter, statusFilter, tasks, teamFilter]);
    const handleChange = (field, value) => {
        setTaskForm((current) => ({ ...current, [field]: value }));
    };
    const submitTask = (event) => {
        event.preventDefault();
        const errors = {};
        if (!taskForm.title.trim())
            errors.title = 'Title is required.';
        if (!taskForm.locationName.trim())
            errors.locationName = 'Location is required.';
        if (!taskForm.assignedTeam.trim())
            errors.assignedTeam = 'Team is required.';
        if (!taskForm.dueDate)
            errors.dueDate = 'Target date is required.';
        if (!taskForm.recommendedAction.trim())
            errors.recommendedAction = 'Recommended action is required.';
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        const nextTask = {
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Create cleanup task", subheader: "Human supervised action planning" }), _jsx(CardContent, { children: _jsxs(Box, { component: "form", className: "task-form", onSubmit: submitTask, children: [_jsx(TextField, { label: "Task title", value: taskForm.title, onChange: (event) => handleChange('title', event.target.value), error: Boolean(formErrors.title), helperText: formErrors.title }), _jsx(TextField, { label: "Location", value: taskForm.locationName, onChange: (event) => handleChange('locationName', event.target.value), error: Boolean(formErrors.locationName), helperText: formErrors.locationName }), _jsxs(Select, { value: taskForm.observationId, onChange: (event) => handleChange('observationId', String(event.target.value)), displayEmpty: true, children: [_jsx(MenuItem, { value: "", children: "No linked observation" }), observations.map((observation) => (_jsx(MenuItem, { value: observation.id, children: observation.id }, observation.id)))] }), _jsx(Select, { value: taskForm.priority, onChange: (event) => handleChange('priority', String(event.target.value)), children: ['Low', 'Moderate', 'High', 'Critical'].map((priority) => (_jsx(MenuItem, { value: priority, children: priority }, priority))) }), _jsx(TextField, { label: "Recommended action", value: taskForm.recommendedAction, onChange: (event) => handleChange('recommendedAction', event.target.value), fullWidth: true, multiline: true, minRows: 3, error: Boolean(formErrors.recommendedAction), helperText: formErrors.recommendedAction }), _jsx(TextField, { label: "Assigned team", value: taskForm.assignedTeam, onChange: (event) => handleChange('assignedTeam', event.target.value), error: Boolean(formErrors.assignedTeam), helperText: formErrors.assignedTeam }), _jsx(TextField, { label: "Target date", type: "date", value: taskForm.dueDate, onChange: (event) => handleChange('dueDate', event.target.value), slotProps: { inputLabel: { shrink: true } }, error: Boolean(formErrors.dueDate), helperText: formErrors.dueDate }), _jsx(Select, { value: taskForm.status, onChange: (event) => handleChange('status', String(event.target.value)), children: ['Pending', 'In progress', 'Completed'].map((status) => (_jsx(MenuItem, { value: status, children: status }, status))) }), _jsx(Button, { type: "submit", variant: "contained", className: "primary-action", children: "Create task" })] }) })] }), _jsx(Card, { className: "analysis-card", children: _jsx(CardContent, { children: _jsxs(Box, { className: "filter-row", children: [_jsxs(Select, { value: statusFilter, size: "small", onChange: (event) => setStatusFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All statuses" }), ['Pending', 'In progress', 'Completed'].map((status) => (_jsx(MenuItem, { value: status, children: status }, status)))] }), _jsxs(Select, { value: priorityFilter, size: "small", onChange: (event) => setPriorityFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All priorities" }), ['Low', 'Moderate', 'High', 'Critical'].map((priority) => (_jsx(MenuItem, { value: priority, children: priority }, priority)))] }), _jsxs(Select, { value: teamFilter, size: "small", onChange: (event) => setTeamFilter(event.target.value), children: [_jsx(MenuItem, { value: "All", children: "All teams" }), [...new Set(tasks.map((task) => task.assignedTeam))].map((team) => (_jsx(MenuItem, { value: team, children: team }, team)))] })] }) }) }), _jsx(Box, { className: "task-list-grid", children: filteredTasks.length === 0 ? _jsx(Box, { className: "empty-state", children: _jsx(Typography, { variant: "body1", children: tasks.length === 0 ? 'No cleanup tasks have been created yet.' : 'No tasks match the selected filters.' }) }) : filteredTasks.map((task) => (_jsx(Card, { className: "task-card", children: _jsxs(CardContent, { children: [_jsxs(Box, { className: "task-header-row", children: [_jsx(Typography, { variant: "h6", children: task.title }), _jsx(Chip, { label: task.priority, className: `priority-chip ${task.priority.toLowerCase()}` })] }), _jsxs(Typography, { variant: "body2", children: ["Location: ", task.locationName] }), _jsxs(Typography, { variant: "body2", children: ["Observation: ", task.observationId ?? 'No linked record'] }), _jsxs(Typography, { variant: "body2", children: ["Action: ", task.recommendedAction] }), _jsxs(Typography, { variant: "body2", children: ["Assigned team: ", task.assignedTeam] }), _jsxs(Typography, { variant: "body2", children: ["Due: ", formatDate(task.dueDate)] }), _jsxs(Box, { className: "task-actions", children: [_jsx(Select, { value: task.status, size: "small", onChange: (event) => onTaskUpdate(tasks.map((item) => (item.id === task.id ? { ...item, status: String(event.target.value) } : item))), children: ['Pending', 'In progress', 'Completed'].map((status) => (_jsx(MenuItem, { value: status, children: status }, status))) }), _jsx(Button, { color: "warning", variant: "outlined", onClick: () => {
                                            const confirmed = window.confirm(`Mark ${task.id} as completed?`);
                                            if (confirmed) {
                                                onTaskUpdate(tasks.map((item) => (item.id === task.id ? { ...item, status: 'Completed' } : item)));
                                            }
                                        }, children: "Complete" })] })] }) }, task.id))) })] }));
}
function AnalyticsPage({ observations, tasks, isDemoData, selectedRange, onRangeChange, chartTextColor, chartGridColor, chartAccentColor }) {
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
    return (_jsxs(Box, { className: "page-stack", children: [_jsx(Card, { className: "analysis-card", children: _jsx(CardContent, { children: _jsxs(Box, { className: "toolbar-row", children: [_jsx(ToggleButtonGroup, { value: selectedRange, exclusive: true, onChange: (_, value) => { if (value)
                                    onRangeChange(value); }, size: "small", children: timeRangeOptions.map((option) => (_jsx(ToggleButton, { value: option.value, "aria-label": option.label, children: option.label }, option.value))) }), _jsxs(Box, { className: "report-actions", children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadRounded, {}), onClick: exportObservationCsv, children: "Export observations" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadRounded, {}), onClick: exportTaskCsv, children: "Export tasks" }), _jsx(Button, { variant: "contained", startIcon: _jsx(PrintRounded, {}), onClick: () => window.print(), children: "Print report" })] })] }) }) }), _jsxs(Box, { className: "analytics-grid", children: [_jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Observation trends", subheader: "Detection counts over time" }), _jsx(CardContent, { className: "chart-holder", children: filteredObservations.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No observation data is available for this period." }) : _jsx(Line, { data: {
                                        labels: dateTrend.map((entry) => entry.label),
                                        datasets: [{
                                                label: 'Observations',
                                                data: dateTrend.map((entry) => entry.value),
                                                borderColor: chartAccentColor,
                                                backgroundColor: chartAccentColor === '#43C7F2' ? 'rgba(67,199,242,0.12)' : 'rgba(8,127,140,0.08)',
                                                fill: true,
                                                tension: 0.25,
                                            }],
                                    }, options: axisOptions }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Debris category distribution", subheader: "Current segmentation" }), _jsx(CardContent, { className: "chart-holder", children: filteredObservations.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No debris categories are available to chart." }) : _jsx(Bar, { data: {
                                        labels: categoryData.map((entry) => entry.label),
                                        datasets: [{
                                                label: 'Count',
                                                data: categoryData.map((entry) => entry.value),
                                                backgroundColor: ['#087F8C', '#39856F', '#65BCE8', '#D5A43B', '#D97745', '#6D7C90'],
                                            }],
                                    }, options: axisOptions }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Risk severity mix", subheader: "Selected reporting window" }), _jsx(CardContent, { className: "chart-holder", children: filteredObservations.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No severity data is available to chart." }) : _jsx(Doughnut, { data: {
                                        labels: ['Low', 'Moderate', 'High', 'Critical'],
                                        datasets: [{
                                                data: [severityBreakdown.Low, severityBreakdown.Moderate, severityBreakdown.High, severityBreakdown.Critical],
                                                backgroundColor: ['#39856F', '#D5A43B', '#D97745', '#C84646'],
                                            }],
                                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } } } }) })] }), _jsxs(Card, { className: "layout-panel", children: [_jsx(CardHeader, { title: "Cleanup task completion", subheader: "Operational workload" }), _jsx(CardContent, { className: "chart-holder", children: tasks.length === 0 ? _jsx(Box, { className: "chart-empty-state", children: "No cleanup task data is available to chart." }) : _jsx(Bar, { data: {
                                        labels: taskStats.map((entry) => entry.label),
                                        datasets: [{
                                                label: 'Tasks',
                                                data: taskStats.map((entry) => entry.value),
                                                backgroundColor: ['#65BCE8', '#D5A43B', '#39856F'],
                                            }],
                                    }, options: axisOptions }) })] })] }), _jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Report summary", subheader: "Selected methodology and totals" }), _jsxs(CardContent, { children: [_jsxs(Box, { className: "report-summary-grid", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Range" }), _jsx(Typography, { variant: "body1", children: timeRangeOptions.find((option) => option.value === selectedRange)?.label })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Total observations" }), _jsx(Typography, { variant: "body1", children: reportSummary.totalObservations })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Cleanup tasks" }), _jsx(Typography, { variant: "body1", children: reportSummary.totalTasks })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", className: "muted-text", children: "Severity distribution" }), _jsx(Typography, { variant: "body1", children: severityOptions.map((name) => `${name}: ${reportSummary.severityBreakdown[name]}`).join(' · ') })] })] }), _jsx(Alert, { severity: "info", children: "This is a frontend summary of the records currently available in the selected data source. It is not a validated scientific report or live backend output." })] })] })] }));
}
function SettingsPage({ settings, onSave, onThemeChange, onResetData, onLoadDemoData, onExitDemo, hasFixtureData }) {
    const [formValues, setFormValues] = useState(settings);
    useEffect(() => {
        setFormValues(settings);
    }, [settings]);
    const handleField = (field, value) => {
        setFormValues((current) => ({ ...current, [field]: value }));
    };
    const handleNotificationChange = (field, value) => {
        setFormValues((current) => ({
            ...current,
            notifications: {
                ...current.notifications,
                [field]: value,
            },
        }));
    };
    const onSubmit = (event) => {
        event.preventDefault();
        onSave(formValues);
    };
    return (_jsx(Box, { className: "page-stack", children: _jsxs(Card, { className: "analysis-card", children: [_jsx(CardHeader, { title: "Settings", subheader: "Browser-local preferences, data-source controls, and review configuration" }), _jsx(CardContent, { children: _jsxs(Box, { component: "form", className: "settings-form", onSubmit: onSubmit, children: [_jsxs(Box, { className: "settings-section", children: [_jsx(Typography, { variant: "h6", children: "Profile" }), _jsx(TextField, { label: "Display name", value: formValues.displayName, onChange: (event) => handleField('displayName', event.target.value) }), _jsx(TextField, { label: "Email", value: formValues.email, onChange: (event) => handleField('email', event.target.value) })] }), _jsxs(Box, { className: "settings-section", children: [_jsx(Typography, { variant: "h6", children: "Display preferences" }), _jsxs(RadioGroup, { value: formValues.theme, onChange: (event) => {
                                            const theme = event.target.value;
                                            handleField('theme', theme);
                                            onThemeChange(theme);
                                        }, children: [_jsx(FormControlLabel, { value: "light", control: _jsx(Radio, {}), label: "Light" }), _jsx(FormControlLabel, { value: "dark", control: _jsx(Radio, {}), label: "Dark" })] }), _jsx(Select, { value: formValues.defaultRange, onChange: (event) => handleField('defaultRange', event.target.value), children: timeRangeOptions.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) }), _jsxs(Select, { value: formValues.mapStyle, onChange: (event) => handleField('mapStyle', event.target.value), children: [_jsx(MenuItem, { value: "streets", children: "Streets" }), _jsx(MenuItem, { value: "terrain", children: "Terrain" })] })] }), _jsxs(Box, { className: "settings-section", children: [_jsx(Typography, { variant: "h6", children: "Notifications" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: formValues.notifications.dailyDigest, onChange: (_, checked) => handleNotificationChange('dailyDigest', checked) }), label: "Daily digest" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: formValues.notifications.riskAlerts, onChange: (_, checked) => handleNotificationChange('riskAlerts', checked) }), label: "Risk alerts" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: formValues.notifications.reviewDue, onChange: (_, checked) => handleNotificationChange('reviewDue', checked) }), label: "Review due" })] }), _jsxs(Box, { className: "settings-section", children: [_jsx(Typography, { variant: "h6", children: "Application information" }), _jsxs(Typography, { variant: "body2", children: ["Risk-score methodology disclaimer: ", RISK_METHODOLOGY] }), _jsxs(Typography, { variant: "body2", children: ["Data source: ", hasFixtureData ? 'Explicitly loaded demonstration fixtures (not real records)' : 'Browser-local records; no backend connected'] })] }), _jsxs(Box, { className: "settings-actions", children: [_jsx(Button, { type: "submit", variant: "contained", children: "Save preferences" }), hasFixtureData ? _jsx(Button, { variant: "outlined", onClick: onExitDemo, children: "Exit demonstration mode" }) : _jsx(Button, { variant: "outlined", onClick: onLoadDemoData, children: "Load demonstration data" }), _jsx(Button, { variant: "outlined", color: "error", onClick: onResetData, children: "Clear local data and reset preferences" })] })] }) })] }) }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AppInner, {}) }));
}
