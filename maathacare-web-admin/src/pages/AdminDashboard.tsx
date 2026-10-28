import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import SriLankaMap, { type DistrictSummary, type MapMetric } from '../components/SriLankaMap';
import { DISTRICTS as LOCATION_DISTRICTS, MOH_AREAS } from './location';
import './AdminDashboard.css';

type DashboardView = 'overview' | 'map' | 'workforce' | 'mothers';
type JsonRecord = Record<string, unknown>;

interface PHM {
  staffId: string;
  fullName: string;
  nic: string;
  district: string;
  mohArea: string;
  gnDivision: string;
  email: string;
  phone: string;
  status: string;
  motherCount: number;
  raw: JsonRecord;
}

interface Mother {
  id: string;
  fullName: string;
  nic: string;
  phone: string;
  address: string;
  district: string;
  mohArea: string;
  gnDivision: string;
  assignedStaffId: string;
  pregnancyWeek: number | null;
  riskLevel: string;
  nextClinicDate: string;
  raw: JsonRecord;
}

interface AreaStat {
  areaName: string;
  district: string;
  phmCount: number;
  motherCount: number;
  status: string;
}

interface FetchResult<T> {
  items: T[];
  endpoint: string | null;
  errors: string[];
}

interface RegistrationForm {
  fullName: string;
  nic: string;
  staffId: string;
  district: string;
  mohArea: string;
  gnDivision: string;
  email: string;
  phone: string;
  password: string;
}

const API_URL = (((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_URL) || 'http://localhost:8080').replace(/\/$/, '');
const CASELOAD_TARGET = 150;


const locationKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const DISTRICT_NAME_BY_CODE = new Map(
  LOCATION_DISTRICTS.map((district) => [district.code, district.name]),
);

const DISTRICT_BY_MOH = new Map<string, string>();
Object.entries(MOH_AREAS).forEach(([districtCode, areas]) => {
  const districtName = DISTRICT_NAME_BY_CODE.get(districtCode);
  if (!districtName) return;
  areas.forEach((area) => DISTRICT_BY_MOH.set(locationKey(area.name), districtName));
});

const resolveDistrict = (district: string, mohArea: string): string =>
  district.trim() || DISTRICT_BY_MOH.get(locationKey(mohArea)) || '';

const STAFF_ENDPOINTS = [
  '/api/users/staff/all',
  '/api/admin/phms',
  '/api/phms',
  '/api/staff/phms',
];

const MOTHER_ENDPOINTS = [
  '/api/users/mothers/all',
  '/api/admin/mothers',
  '/api/mothers',
  '/api/patients/mothers',
];

const DISTRIBUTION_ENDPOINTS = [
  '/api/users/staff/stats/distribution',
  '/api/admin/stats/phm-distribution',
  '/api/phms/stats/distribution',
];

const REGISTER_ENDPOINTS = [
  '/api/users/staff/register',
  '/api/admin/phms/register',
  '/api/phms/register',
];

const asRecord = (value: unknown): JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as JsonRecord : {};

const firstValue = (record: JsonRecord, keys: string[]): unknown => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
};

const text = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const record = asRecord(value);
  return text(firstValue(record, ['name', 'fullName', 'areaName', 'label', 'value', 'code']));
};

const numberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const nestedText = (record: JsonRecord, parentKeys: string[], childKeys: string[]): string => {
  for (const parent of parentKeys) {
    const nested = asRecord(record[parent]);
    const found = text(firstValue(nested, childKeys));
    if (found) return found;
  }
  return '';
};

const extractArray = (payload: unknown, preferredKeys: string[]): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  for (const key of [...preferredKeys, 'content', 'data', 'results', 'items', 'records']) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate;
    const nested = asRecord(candidate);
    for (const nestedKey of [...preferredKeys, 'content', 'items', 'records']) {
      if (Array.isArray(nested[nestedKey])) return nested[nestedKey] as unknown[];
    }
  }
  return [];
};

const normalisePHM = (value: unknown, index: number): PHM => {
  const record = asRecord(value);
  const staffId = text(firstValue(record, ['staffId', 'staffID', 'registrationNumber', 'registrationNo', 'phmId', 'phmID', 'employeeId', 'employeeID', 'username', 'id'])) || `PHM-${index + 1}`;
  const fullName = text(firstValue(record, ['fullName', 'name', 'staffName', 'phmName', 'displayName'])) || 'Unnamed PHM';
  return {
    staffId,
    fullName,
    nic: text(firstValue(record, ['nic', 'NIC', 'nationalId', 'nationalIdentityCard'])),
    district: text(firstValue(record, ['district', 'districtName'])) || nestedText(record, ['district'], ['name', 'districtName']),
    mohArea: text(firstValue(record, ['mohArea', 'moh_area', 'mohAreaName', 'mohDivision', 'assignedArea', 'areaName'])) || nestedText(record, ['moh', 'mohArea'], ['name', 'areaName']),
    gnDivision: text(firstValue(record, ['gnDivision', 'gn_division', 'gnDivisionName', 'residentialDivision', 'division'])) || nestedText(record, ['gn', 'gnDivision'], ['name']),
    email: text(firstValue(record, ['email', 'emailAddress'])),
    phone: text(firstValue(record, ['phone', 'phoneNumber', 'mobile', 'contactNumber'])),
    status: text(firstValue(record, ['status', 'accountStatus', 'employmentStatus'])) || 'ACTIVE',
    motherCount: numberValue(firstValue(record, ['motherCount', 'mothersCount', 'assignedMotherCount', 'patientCount', 'caseload'])),
    raw: record,
  };
};

const normaliseMother = (value: unknown, index: number): Mother => {
  const record = asRecord(value);
  const assignedStaffId = text(firstValue(record, [
    'assignedStaffId', 'assignedPhmId', 'assignedPHMId', 'phmStaffId', 'phmId', 'staffId', 'assignedTo',
  ])) || nestedText(record, ['phm', 'assignedPhm', 'staff', 'assignedStaff'], ['staffId', 'phmId', 'id', 'username']);
  const weekRaw = firstValue(record, ['pregnancyWeek', 'gestationalWeek', 'currentWeek', 'week']);
  const parsedWeek = Number(weekRaw);
  return {
    id: text(firstValue(record, ['motherId', 'registrationId', 'registrationNumber', 'patientId', 'id', 'nic'])) || `MOTHER-${index + 1}`,
    fullName: text(firstValue(record, ['fullName', 'name', 'motherName', 'patientName'])) || 'Unnamed mother',
    nic: text(firstValue(record, ['nic', 'NIC', 'nationalId'])),
    phone: text(firstValue(record, ['phone', 'phoneNumber', 'mobile', 'contactNumber'])),
    address: text(firstValue(record, ['address', 'homeAddress'])),
    district: text(firstValue(record, ['district', 'districtName'])),
    mohArea: text(firstValue(record, ['mohArea', 'mohAreaName', 'areaName'])) || nestedText(record, ['moh', 'mohArea'], ['name', 'areaName']),
    gnDivision: text(firstValue(record, ['gnDivision', 'gnDivisionName'])) || nestedText(record, ['gn', 'gnDivision'], ['name']),
    assignedStaffId,
    pregnancyWeek: Number.isFinite(parsedWeek) ? parsedWeek : null,
    riskLevel: text(firstValue(record, ['riskLevel', 'riskStatus', 'risk'])) || 'Not recorded',
    nextClinicDate: text(firstValue(record, ['nextClinicDate', 'appointmentDate', 'nextAppointment'])),
    raw: record,
  };
};

const normaliseAreaStat = (value: unknown): AreaStat => {
  const record = asRecord(value);
  const phmCount = numberValue(firstValue(record, ['phmCount', 'staffCount', 'numberOfPhms', 'numberOfPHMs']));
  const motherCount = numberValue(firstValue(record, ['motherCount', 'mothersCount', 'patientCount', 'numberOfMothers']));
  const average = phmCount > 0 ? motherCount / phmCount : motherCount;
  return {
    areaName: text(firstValue(record, ['areaName', 'mohArea', 'mohAreaName', 'name'])) || 'Unassigned area',
    district: text(firstValue(record, ['district', 'districtName'])),
    phmCount,
    motherCount,
    status: text(firstValue(record, ['status', 'coverageStatus'])) || (phmCount === 0 ? 'Unstaffed' : average > CASELOAD_TARGET ? 'Overloaded' : 'Adequate'),
  };
};

const authHeaders = (json = false): HeadersInit => {
  const stored = localStorage.getItem('adminToken') || '';
  const token = stored.toLowerCase().startsWith('bearer ') ? stored : `Bearer ${stored}`;
  return {
    Accept: 'application/json',
    ...(stored ? { Authorization: token } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
};

const readPayload = async (response: Response): Promise<unknown> => {
  const body = await response.text();
  if (!body) return null;
  try { return JSON.parse(body); } catch { return body; }
};

async function fetchFirstArray<T>(
  endpoints: string[],
  preferredKeys: string[],
  normalise: (item: unknown, index: number) => T,
): Promise<FetchResult<T>> {
  const errors: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, { headers: authHeaders() });
      const payload = await readPayload(response);
      if (response.status === 401 || response.status === 403) {
        errors.push(`${endpoint}: HTTP ${response.status} – ${typeof payload === 'string' && payload ? payload : 'Access denied'}`);
        continue;
      }
      if (!response.ok) {
        errors.push(`${endpoint}: HTTP ${response.status}${typeof payload === 'string' && payload ? ` – ${payload}` : ''}`);
        continue;
      }
      const array = extractArray(payload, preferredKeys);
      return { items: array.map(normalise), endpoint, errors };
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }
  return { items: [], endpoint: null, errors };
}

async function mutateFirst(endpoints: string[], method: string, body?: unknown): Promise<unknown> {
  const errors: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: authHeaders(body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const payload = await readPayload(response);
      if (response.status === 401 || response.status === 403) {
        throw new Error(typeof payload === 'string' && payload ? payload : `Access denied (HTTP ${response.status}).`);
      }
      if (response.ok) return payload;
      if (response.status === 404 || response.status === 405) {
        errors.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      throw new Error(typeof payload === 'string' && payload ? payload : `HTTP ${response.status}`);
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }
  throw new Error(errors.join('\n') || 'No compatible API endpoint was found.');
}

const maskNic = (nic: string): string => {
  if (!nic) return 'Not recorded';
  if (nic.length <= 4) return nic;
  return `${nic.slice(0, 3)}••••${nic.slice(-2)}`;
};

const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'PH';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<DashboardView>('overview');
  const [staff, setStaff] = useState<PHM[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [serverStats, setServerStats] = useState<AreaStat[]>([]);
  const [search, setSearch] = useState('');
  const [motherSearch, setMotherSearch] = useState('');
  const [selectedPHM, setSelectedPHM] = useState<PHM | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [mapMetric, setMapMetric] = useState<MapMetric>('coverage');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [gnOptions, setGnOptions] = useState<string[]>([]);
  const [loadingGnOptions, setLoadingGnOptions] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    fullName: '', nic: '', staffId: '', district: '', mohArea: '', gnDivision: '', email: '', phone: '', password: '',
  });

  const signOut = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    navigate('/login', { replace: true });
  }, [navigate]);

  const loadDashboard = useCallback(async (manual = false) => {
    manual ? setRefreshing(true) : setLoading(true);
    setLoadError('');
    try {
      const [staffResult, motherResult, statResult] = await Promise.all([
        fetchFirstArray(STAFF_ENDPOINTS, ['staff', 'phms', 'users'], normalisePHM),
        fetchFirstArray(MOTHER_ENDPOINTS, ['mothers', 'patients', 'users'], normaliseMother),
        fetchFirstArray(DISTRIBUTION_ENDPOINTS, ['distribution', 'stats', 'areas'], (item) => normaliseAreaStat(item)),
      ]);

      if (!staffResult.endpoint) {
        throw new Error(`Registered PHMs could not be loaded.\n${staffResult.errors.join('\n')}`);
      }

      setStaff(staffResult.items);
      setMothers(motherResult.items);
      setServerStats(statResult.items);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [signOut]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const mothersByStaff = useMemo(() => {
    const map = new Map<string, Mother[]>();
    for (const mother of mothers) {
      const key = mother.assignedStaffId.trim().toLowerCase();
      if (!key) continue;
      map.set(key, [...(map.get(key) || []), mother]);
    }
    return map;
  }, [mothers]);

  const enrichedStaff = useMemo(() => staff.map((person) => {
    const matched = mothersByStaff.get(person.staffId.toLowerCase()) || [];
    return { ...person, motherCount: matched.length || person.motherCount };
  }), [mothersByStaff, staff]);

  const areaStats = useMemo<AreaStat[]>(() => {
    if (serverStats.length) return serverStats;
    const map = new Map<string, AreaStat>();
    for (const person of enrichedStaff) {
      const name = person.mohArea || 'Unassigned area';
      const current = map.get(name) || { areaName: name, district: person.district, phmCount: 0, motherCount: 0, status: 'Adequate' };
      current.phmCount += 1;
      current.motherCount += person.motherCount;
      map.set(name, current);
    }
    for (const mother of mothers) {
      if (mother.assignedStaffId) continue;
      const name = mother.mohArea || 'Unassigned area';
      const current = map.get(name) || { areaName: name, district: '', phmCount: 0, motherCount: 0, status: 'Unstaffed' };
      current.motherCount += 1;
      map.set(name, current);
    }
    return Array.from(map.values()).map((area) => ({
      ...area,
      status: area.phmCount === 0 ? 'Unstaffed' : area.motherCount / area.phmCount > CASELOAD_TARGET ? 'Overloaded' : 'Adequate',
    }));
  }, [enrichedStaff, mothers, serverStats]);

  const totalMothers = useMemo(() => {
    if (mothers.length) return mothers.length;
    const staffTotal = enrichedStaff.reduce((sum, person) => sum + person.motherCount, 0);
    return staffTotal || areaStats.reduce((sum, area) => sum + area.motherCount, 0);
  }, [areaStats, enrichedStaff, mothers.length]);

  const activePHMs = enrichedStaff.filter((person) => !['INACTIVE', 'DISABLED', 'REMOVED'].includes(person.status.toUpperCase())).length;
  const staffedAreas = new Set(enrichedStaff.map((person) => person.mohArea).filter(Boolean)).size;
  const overloadedPHMs = enrichedStaff.filter((person) => person.motherCount > CASELOAD_TARGET).length;
  const unassignedMothers = mothers.filter((mother) => !mother.assignedStaffId).length;

  const workloadGroups = useMemo(() => ({
    light: enrichedStaff.filter((person) => person.motherCount <= 75).length,
    balanced: enrichedStaff.filter((person) => person.motherCount > 75 && person.motherCount <= CASELOAD_TARGET).length,
    overloaded: enrichedStaff.filter((person) => person.motherCount > CASELOAD_TARGET).length,
  }), [enrichedStaff]);

  const topPHMs = useMemo(
    () => [...enrichedStaff].sort((a, b) => b.motherCount - a.motherCount).slice(0, 10),
    [enrichedStaff],
  );
  const maxCaseload = Math.max(1, ...topPHMs.map((person) => person.motherCount));

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrichedStaff;
    return enrichedStaff.filter((person) =>
      `${person.fullName} ${person.staffId} ${person.mohArea} ${person.district} ${person.gnDivision}`.toLowerCase().includes(query),
    );
  }, [enrichedStaff, search]);

  const filteredMothers = useMemo(() => {
    const query = motherSearch.trim().toLowerCase();
    if (!query) return mothers;
    return mothers.filter((mother) =>
      `${mother.fullName} ${mother.id} ${mother.nic} ${mother.assignedStaffId} ${mother.mohArea} ${mother.district} ${mother.gnDivision}`.toLowerCase().includes(query),
    );
  }, [motherSearch, mothers]);

  const selectedMothers = useMemo(() => {
    if (!selectedPHM) return [];
    return mothersByStaff.get(selectedPHM.staffId.toLowerCase()) || [];
  }, [mothersByStaff, selectedPHM]);


  const selectedRegistrationDistrict = useMemo(
    () => LOCATION_DISTRICTS.find((district) => district.name === form.district) || null,
    [form.district],
  );

  const availableMohAreas = useMemo(
    () => selectedRegistrationDistrict ? (MOH_AREAS[selectedRegistrationDistrict.code] || []) : [],
    [selectedRegistrationDistrict],
  );

  const selectedRegistrationMohArea = useMemo(
    () => availableMohAreas.find((area) => area.name === form.mohArea) || null,
    [availableMohAreas, form.mohArea],
  );

  const districtStats = useMemo<Record<string, DistrictSummary>>(() => {
    const result: Record<string, DistrictSummary> = {};
    const staffDistrictById = new Map<string, string>();
    const staffCountByMoh = new Map<string, number>();
    const areaStatByMoh = new Map(areaStats.map((area) => [locationKey(area.areaName), area]));

    LOCATION_DISTRICTS.forEach((district) => {
      result[district.name] = {
        phmCount: 0,
        motherCount: 0,
        totalMoh: MOH_AREAS[district.code]?.length || 0,
        understaffedMoh: 0,
      };
    });

    enrichedStaff.forEach((person) => {
      const districtName = resolveDistrict(person.district, person.mohArea);
      if (districtName && result[districtName]) {
        result[districtName].phmCount += 1;
        staffDistrictById.set(person.staffId.toLowerCase(), districtName);
      }
      const mohKey = locationKey(person.mohArea);
      if (mohKey) staffCountByMoh.set(mohKey, (staffCountByMoh.get(mohKey) || 0) + 1);
    });

    if (mothers.length) {
      mothers.forEach((mother) => {
        const districtName =
          resolveDistrict(mother.district, mother.mohArea) ||
          staffDistrictById.get(mother.assignedStaffId.toLowerCase()) ||
          '';
        if (districtName && result[districtName]) result[districtName].motherCount += 1;
      });
    } else {
      areaStats.forEach((area) => {
        const districtName = resolveDistrict(area.district, area.areaName);
        if (districtName && result[districtName]) result[districtName].motherCount += area.motherCount;
      });
    }

    Object.entries(MOH_AREAS).forEach(([districtCode, areas]) => {
      const districtName = DISTRICT_NAME_BY_CODE.get(districtCode);
      if (!districtName || !result[districtName]) return;
      result[districtName].understaffedMoh = areas.filter((area) => {
        const key = locationKey(area.name);
        const serverArea = areaStatByMoh.get(key);
        const phmCount = serverArea?.phmCount ?? staffCountByMoh.get(key) ?? 0;
        const motherCount = serverArea?.motherCount ?? 0;
        const average = phmCount > 0 ? motherCount / phmCount : motherCount;
        const status = serverArea?.status.toLowerCase() || '';
        return phmCount === 0 || average > CASELOAD_TARGET || status.includes('over') || status.includes('unstaff');
      }).length;
    });

    return result;
  }, [areaStats, enrichedStaff, mothers]);

  const districtRows = useMemo(() => LOCATION_DISTRICTS.map((district) => {
    const summary = districtStats[district.name] || { phmCount: 0, motherCount: 0, totalMoh: 0, understaffedMoh: 0 };
    const coveredMoh = Math.max(0, summary.totalMoh - summary.understaffedMoh);
    const coverage = summary.totalMoh ? Math.round((coveredMoh / summary.totalMoh) * 100) : 0;
    const averageCaseload = summary.phmCount ? Math.round(summary.motherCount / summary.phmCount) : summary.motherCount;
    return { district: district.name, ...summary, coveredMoh, coverage, averageCaseload };
  }).sort((a, b) => {
    if (mapMetric === 'phms') return b.phmCount - a.phmCount;
    if (mapMetric === 'mothers') return b.motherCount - a.motherCount;
    if (mapMetric === 'caseload') return b.averageCaseload - a.averageCaseload;
    return b.coverage - a.coverage;
  }), [districtStats, mapMetric]);

  const nationalMapSummary = useMemo<DistrictSummary>(() => districtRows.reduce(
    (total, district) => ({
      phmCount: total.phmCount + district.phmCount,
      motherCount: total.motherCount + district.motherCount,
      totalMoh: total.totalMoh + district.totalMoh,
      understaffedMoh: total.understaffedMoh + district.understaffedMoh,
    }),
    { phmCount: 0, motherCount: 0, totalMoh: 0, understaffedMoh: 0 },
  ), [districtRows]);

  const activeMapSummary = selectedDistrict
    ? districtStats[selectedDistrict] || nationalMapSummary
    : nationalMapSummary;
  const activeMapCoverage = activeMapSummary.totalMoh
    ? Math.round(((activeMapSummary.totalMoh - activeMapSummary.understaffedMoh) / activeMapSummary.totalMoh) * 100)
    : 0;
  const activeMapCaseload = activeMapSummary.phmCount
    ? Math.round(activeMapSummary.motherCount / activeMapSummary.phmCount)
    : activeMapSummary.motherCount;

  useEffect(() => {
    setForm((current) => ({ ...current, mohArea: '', gnDivision: '', staffId: '' }));
    setGnOptions([]);
  }, [form.district]);

  useEffect(() => {
    setForm((current) => ({ ...current, gnDivision: '' }));
    setGnOptions([]);

    if (!form.mohArea) {
      setLoadingGnOptions(false);
      return;
    }

    const endpoints = [
      `/api/locations/gn-divisions?mohArea=${encodeURIComponent(form.mohArea)}`,
      `/api/locations/gn?mohArea=${encodeURIComponent(form.mohArea)}`,
    ];

    setLoadingGnOptions(true);
    void fetchFirstArray(
      endpoints,
      ['gnDivisions', 'divisions'],
      (item) => text(item) || text(firstValue(asRecord(item), ['name', 'divisionName'])),
    )
      .then((result) => setGnOptions(Array.from(new Set(result.items.filter(Boolean))).sort()))
      .catch(() => setGnOptions([]))
      .finally(() => setLoadingGnOptions(false));
  }, [form.mohArea]);

  useEffect(() => {
    if (!selectedRegistrationDistrict || !selectedRegistrationMohArea) {
      setForm((current) => current.staffId ? { ...current, staffId: '' } : current);
      return;
    }

    const prefix = `PHM-${selectedRegistrationDistrict.code}-${selectedRegistrationMohArea.code}-`;
    const suffixes = enrichedStaff
      .filter((person) => person.staffId.toUpperCase().startsWith(prefix))
      .map((person) => Number(person.staffId.split('-').at(-1)) || 0);
    const nextStaffId = `${prefix}${String(Math.max(0, ...suffixes) + 1).padStart(3, '0')}`;

    setForm((current) => current.staffId === nextStaffId ? current : { ...current, staffId: nextStaffId });
  }, [enrichedStaff, selectedRegistrationDistrict, selectedRegistrationMohArea]);

  const registerPHM = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await mutateFirst(REGISTER_ENDPOINTS, 'POST', {
        staffId: form.staffId,
        fullName: form.fullName.trim(),
        nic: form.nic.trim(),
        mohArea: form.mohArea,
        gnDivision: form.gnDivision,
        password: form.nic.trim(),
      });
      setForm({ fullName: '', nic: '', staffId: '', district: '', mohArea: '', gnDivision: '', email: '', phone: '', password: '' });
      setShowRegistration(false);
      await loadDashboard(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'PHM registration failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPassword = async (person: PHM) => {
    if (!window.confirm(`Reset ${person.fullName}'s password?`)) return;
    try {
      await mutateFirst([
        `/api/users/staff/reset-password/${encodeURIComponent(person.staffId)}`,
        `/api/admin/phms/${encodeURIComponent(person.staffId)}/reset-password`,
      ], 'PUT', { password: person.nic });
      window.alert('Password reset request completed.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Password reset failed.');
    }
  };

  const removePHM = async (person: PHM) => {
    if (!window.confirm(`Remove ${person.fullName} (${person.staffId})? This cannot be undone.`)) return;
    try {
      await mutateFirst([
        `/api/users/staff/delete/${encodeURIComponent(person.staffId)}`,
        `/api/admin/phms/${encodeURIComponent(person.staffId)}`,
        `/api/phms/${encodeURIComponent(person.staffId)}`,
      ], 'DELETE');
      setSelectedPHM(null);
      await loadDashboard(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to remove PHM.');
    }
  };

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">MINISTRY OF HEALTH · SRI LANKA</p>
          <h1>MaathaCare Admin Dashboard</h1>
          <p className="topbar-subtitle">PHM workforce, maternal registrations, coverage and caseload intelligence</p>
        </div>
        <div className="topbar-actions">
          <span className={`live-indicator ${loadError ? 'offline' : ''}`}><i />{loadError ? 'API attention required' : 'Connected'}</span>
          <button className="secondary-top-button" onClick={() => void loadDashboard(true)} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh data'}</button>
          <button className="logout-button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Admin dashboard sections">
        <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}>Overview</button>
        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>Statistical map</button>
        <button className={view === 'workforce' ? 'active' : ''} onClick={() => setView('workforce')}>PHM workforce & registration</button>
        <button className={view === 'mothers' ? 'active' : ''} onClick={() => setView('mothers')}>Mother records</button>
      </nav>

      <section className="dashboard-content">
        {loading && <div className="state-card"><span className="spinner" />Loading registered PHMs and maternal records…</div>}

        {!loading && loadError && (
          <div className="error-panel" role="alert">
            <div><strong>PHM records were not returned by the API.</strong><pre>{loadError}</pre></div>
            <button onClick={() => void loadDashboard(true)}>Try again</button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <section className="metric-grid">
              <Metric label="Registered PHMs" value={enrichedStaff.length} detail={`${activePHMs} active accounts`} tone="blue" />
              <Metric label="Registered mothers" value={totalMothers} detail={`${unassignedMothers} without a PHM assignment`} tone="pink" />
              <Metric label="MOH areas staffed" value={staffedAreas} detail={`${areaStats.length} areas in statistics`} tone="green" />
              <Metric label="Overloaded PHMs" value={overloadedPHMs} detail={`More than ${CASELOAD_TARGET} mothers`} tone="amber" />
            </section>


            {view === 'overview' && (
              <>
                <section className="chart-grid">
                  <article className="panel chart-panel">
                    <PanelHeading kicker="CASELOAD RANKING" title="Mothers registered to each PHM" note={`Target ≤ ${CASELOAD_TARGET}`} />
                    <div className="bar-chart" role="img" aria-label="PHM maternal caseload bar chart">
                      {topPHMs.map((person) => (
                        <button className="bar-row" key={person.staffId} onClick={() => setSelectedPHM(person)}>
                          <span className="bar-label"><strong>{person.fullName}</strong><small>{person.staffId}</small></span>
                          <span className="bar-track"><i style={{ width: `${Math.max(3, (person.motherCount / maxCaseload) * 100)}%` }} className={person.motherCount > CASELOAD_TARGET ? 'over' : ''} /></span>
                          <b>{person.motherCount}</b>
                        </button>
                      ))}
                      {!topPHMs.length && <Empty text="No PHM records are available for the chart." />}
                    </div>
                  </article>

                  <article className="panel workload-panel">
                    <PanelHeading kicker="WORKLOAD MIX" title="PHM caseload distribution" />
                    <div className="donut-wrap">
                      <div className="donut" style={{ '--light': `${enrichedStaff.length ? (workloadGroups.light / enrichedStaff.length) * 100 : 0}%`, '--balanced': `${enrichedStaff.length ? ((workloadGroups.light + workloadGroups.balanced) / enrichedStaff.length) * 100 : 0}%` } as CSSProperties}>
                        <span><strong>{enrichedStaff.length}</strong><small>Total PHMs</small></span>
                      </div>
                      <div className="legend">
                        <Legend label="0–75 mothers" value={workloadGroups.light} className="light" />
                        <Legend label={`76–${CASELOAD_TARGET} mothers`} value={workloadGroups.balanced} className="balanced" />
                        <Legend label={`>${CASELOAD_TARGET} mothers`} value={workloadGroups.overloaded} className="overloaded" />
                      </div>
                    </div>
                  </article>
                </section>

                <section className="panel area-panel">
                  <PanelHeading kicker="AREA STATISTICS" title="MOH workforce and maternal registrations" note="Select a PHM from the workforce for full details" />
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead><tr><th>MOH area</th><th>District</th><th>PHMs</th><th>Mothers</th><th>Avg. per PHM</th><th>Status</th></tr></thead>
                      <tbody>
                        {[...areaStats].sort((a, b) => b.motherCount - a.motherCount).map((area) => {
                          const average = area.phmCount ? Math.round(area.motherCount / area.phmCount) : area.motherCount;
                          const status = area.phmCount === 0 ? 'Unstaffed' : average > CASELOAD_TARGET ? 'Overloaded' : area.status;
                          return <tr key={`${area.areaName}-${area.district}`}><td><strong>{area.areaName}</strong></td><td>{area.district || '—'}</td><td>{area.phmCount}</td><td>{area.motherCount}</td><td>{average}</td><td><Status value={status} /></td></tr>;
                        })}
                      </tbody>
                    </table>
                    {!areaStats.length && <Empty text="No MOH statistics were returned. PHM records are still available in Workforce." />}
                  </div>
                </section>
              </>
            )}

            {view === 'map' && (
              <section className="map-page">
                <div className="section-toolbar map-toolbar">
                  <div>
                    <p className="section-kicker">NATIONAL GEOSPATIAL INTELLIGENCE</p>
                    <h2>Sri Lanka maternal-health statistical map</h2>
                    <p>Choose a metric, hover over a district, or select it for a detailed administrative snapshot.</p>
                  </div>
                  <div className="map-metric-switch" role="group" aria-label="Map metric">
                    <MapMetricButton active={mapMetric === 'coverage'} onClick={() => setMapMetric('coverage')}>Coverage</MapMetricButton>
                    <MapMetricButton active={mapMetric === 'mothers'} onClick={() => setMapMetric('mothers')}>Mothers</MapMetricButton>
                    <MapMetricButton active={mapMetric === 'phms'} onClick={() => setMapMetric('phms')}>PHMs</MapMetricButton>
                    <MapMetricButton active={mapMetric === 'caseload'} onClick={() => setMapMetric('caseload')}>Caseload</MapMetricButton>
                  </div>
                </div>

                <section className="map-layout">
                  <article className="panel statistical-map-panel">
                    <PanelHeading
                      kicker="DISTRICT MAP"
                      title={`${mapMetricLabel(mapMetric)} by district`}
                      note="Click a district for details"
                    />
                    <div className="statistical-map-shell">
                      <SriLankaMap
                        districtStats={districtStats}
                        metric={mapMetric}
                        selectedDistrict={selectedDistrict}
                        onSelectDistrict={(district) => setSelectedDistrict((current) => current === district ? null : district)}
                      />
                    </div>
                  </article>

                  <aside className="map-side-column">
                    <article className="panel district-summary-panel">
                      <div className="district-summary-hero">
                        <div>
                          <p className="section-kicker">{selectedDistrict ? 'SELECTED DISTRICT' : 'NATIONAL SNAPSHOT'}</p>
                          <h2>{selectedDistrict || 'Sri Lanka'}</h2>
                          <p>{selectedDistrict ? 'District workforce and maternal coverage' : 'Combined statistics across all 25 districts'}</p>
                        </div>
                        {selectedDistrict && <button className="clear-district-button" onClick={() => setSelectedDistrict(null)}>Clear</button>}
                      </div>
                      <div className="district-stat-grid">
                        <MapStat label="Registered PHMs" value={activeMapSummary.phmCount} />
                        <MapStat label="Registered mothers" value={activeMapSummary.motherCount} />
                        <MapStat label="MOH coverage" value={`${activeMapCoverage}%`} />
                        <MapStat label="Average caseload" value={activeMapCaseload} />
                      </div>
                      <div className={`coverage-callout ${activeMapSummary.understaffedMoh ? 'attention' : 'healthy'}`}>
                        <strong>{activeMapSummary.totalMoh - activeMapSummary.understaffedMoh} of {activeMapSummary.totalMoh} MOH areas adequate</strong>
                        <span>{activeMapSummary.understaffedMoh ? `${activeMapSummary.understaffedMoh} area(s) need workforce attention.` : 'All tracked areas are within the configured target.'}</span>
                      </div>
                    </article>

                    <article className="panel district-ranking-panel">
                      <PanelHeading kicker="DISTRICT RANKING" title={`Top districts by ${mapMetricLabel(mapMetric).toLowerCase()}`} />
                      <div className="district-ranking-list">
                        {districtRows.slice(0, 7).map((district, index) => (
                          <button
                            key={district.district}
                            className={`district-ranking-row ${selectedDistrict === district.district ? 'selected' : ''}`}
                            onClick={() => setSelectedDistrict(district.district)}
                          >
                            <span className="ranking-number">{String(index + 1).padStart(2, '0')}</span>
                            <span className="ranking-name"><strong>{district.district}</strong><small>{district.phmCount} PHMs · {district.motherCount} mothers</small></span>
                            <b>{districtMetricValue(district, mapMetric)}</b>
                          </button>
                        ))}
                      </div>
                    </article>
                  </aside>
                </section>

                <article className="panel district-table-panel">
                  <PanelHeading kicker="DISTRICT PERFORMANCE" title="National district comparison" note="25 administrative districts" />
                  <div className="data-table-wrap">
                    <table className="data-table district-table">
                      <thead><tr><th>District</th><th>PHMs</th><th>Mothers</th><th>Avg. caseload</th><th>MOH coverage</th><th>Areas needing action</th><th>Status</th></tr></thead>
                      <tbody>
                        {districtRows.map((district) => (
                          <tr
                            key={district.district}
                            className="clickable-row"
                            onClick={() => setSelectedDistrict(district.district)}
                          >
                            <td><strong>{district.district}</strong></td>
                            <td>{district.phmCount}</td>
                            <td>{district.motherCount}</td>
                            <td>{district.averageCaseload}</td>
                            <td><span className="coverage-value">{district.coverage}%</span><small className="cell-subtext">{district.coveredMoh}/{district.totalMoh} MOH areas</small></td>
                            <td>{district.understaffedMoh}</td>
                            <td><Status value={district.understaffedMoh ? 'Needs attention' : district.totalMoh ? 'Adequate' : 'No data'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </section>
            )}

            {view === 'workforce' && (
              <section className="workforce-page">
                <div className="section-toolbar">
                  <div><p className="section-kicker">PHM DIRECTORY</p><h2>Workforce management</h2><p>{enrichedStaff.length} registered PHMs · click a row to view assigned mothers</p></div>
                  <div className="toolbar-actions"><input className="search-box" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID, MOH, district" /><button className="primary-button" onClick={() => setShowRegistration((current) => !current)}>{showRegistration ? 'Close registration' : '+ Register PHM'}</button></div>
                </div>

                {showRegistration && (
                  <article className="panel registration-panel">
                    <PanelHeading kicker="NEW PHM ACCOUNT" title="PHM registration" note="Staff ID and initial password are generated automatically" />
                    <form className="registration-form" onSubmit={registerPHM}>
                      <FormField label="Full name"><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" /></FormField>
                      <FormField label="NIC"><input required value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value, password: e.target.value })} placeholder="Enter PHM NIC" /></FormField>
                      <FormField label="District">
                        <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                          <option value="">Select district</option>
                          {LOCATION_DISTRICTS.map((district) => <option key={district.code} value={district.name}>{district.name}</option>)}
                        </select>
                      </FormField>
                      <FormField label="MOH area">
                        <select required disabled={!selectedRegistrationDistrict} value={form.mohArea} onChange={(e) => setForm({ ...form, mohArea: e.target.value })}>
                          <option value="">{selectedRegistrationDistrict ? 'Select MOH area' : 'Select district first'}</option>
                          {availableMohAreas.map((area) => <option key={`${selectedRegistrationDistrict?.code}-${area.code}`} value={area.name}>{area.name}</option>)}
                        </select>
                      </FormField>
                      <FormField label="GN division">
                        <select required disabled={!form.mohArea || loadingGnOptions || !gnOptions.length} value={form.gnDivision} onChange={(e) => setForm({ ...form, gnDivision: e.target.value })}>
                          <option value="">
                            {!form.mohArea
                              ? 'Select MOH area first'
                              : loadingGnOptions
                                ? 'Loading GN divisions…'
                                : gnOptions.length
                                  ? 'Select GN division'
                                  : 'No GN divisions returned'}
                          </option>
                          {gnOptions.map((division) => <option key={division} value={division}>{division}</option>)}
                        </select>
                        {form.mohArea && !loadingGnOptions && !gnOptions.length && <small className="form-helper error">The GN-division API returned no options for this MOH area.</small>}
                      </FormField>
                      <FormField label="Official staff ID">
                        <input required readOnly value={form.staffId} placeholder="Generated after selecting MOH area" />
                        <small className="form-helper">Format: PHM-{selectedRegistrationDistrict?.code || 'DIST'}-{selectedRegistrationMohArea?.code || 'MOH'}-XXX</small>
                      </FormField>
                      <FormField label="Email (optional)"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></FormField>
                      <FormField label="Phone (optional)"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" /></FormField>
                      <FormField label="Initial password">
                        <input type="password" readOnly value={form.password} placeholder="Automatically copied from NIC" />
                        <small className="form-helper">The initial password is the PHM's NIC.</small>
                      </FormField>
                      <div className="form-submit"><button className="primary-button" disabled={isSaving || loadingGnOptions || !form.staffId || !form.gnDivision}>{isSaving ? 'Registering…' : 'Create PHM account'}</button></div>
                    </form>
                  </article>
                )}

                <article className="panel directory-panel">
                  <div className="data-table-wrap">
                    <table className="data-table workforce-table">
                      <thead><tr><th>PHM</th><th>Staff ID</th><th>District / MOH</th><th>GN division</th><th>Mothers</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredStaff.map((person) => (
                          <tr key={person.staffId} className="clickable-row" onClick={() => setSelectedPHM(person)}>
                            <td><div className="person-cell"><span className="avatar">{initials(person.fullName)}</span><span><strong>{person.fullName}</strong><small>{person.email || person.phone || 'No contact recorded'}</small></span></div></td>
                            <td><code>{person.staffId}</code></td>
                            <td><strong>{person.mohArea || 'Unassigned'}</strong><small className="cell-subtext">{person.district || 'District not recorded'}</small></td>
                            <td>{person.gnDivision || '—'}</td>
                            <td><span className={`caseload-count ${person.motherCount > CASELOAD_TARGET ? 'over' : ''}`}>{person.motherCount}</span></td>
                            <td><Status value={person.status} /></td>
                            <td><div className="row-actions"><button onClick={(e) => { e.stopPropagation(); void resetPassword(person); }}>Reset password</button><button className="danger" onClick={(e) => { e.stopPropagation(); void removePHM(person); }}>Remove</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filteredStaff.length && <Empty text={search ? 'No PHMs match this search.' : 'The API returned an empty PHM list.'} />}
                  </div>
                </article>
              </section>
            )}

            {view === 'mothers' && (
              <section className="mothers-page">
                <div className="section-toolbar">
                  <div><p className="section-kicker">ADMIN RECORD ACCESS</p><h2>Registered mother records</h2><p>{mothers.length} records returned by the mother API</p></div>
                  <input className="search-box" value={motherSearch} onChange={(event) => setMotherSearch(event.target.value)} placeholder="Search mother, NIC, PHM or MOH" />
                </div>
                <article className="panel directory-panel">
                  <div className="data-table-wrap">
                    <table className="data-table mothers-table">
                      <thead><tr><th>Mother</th><th>Registration ID</th><th>Assigned PHM</th><th>MOH / GN</th><th>Pregnancy</th><th>Risk</th><th>Next clinic</th></tr></thead>
                      <tbody>
                        {filteredMothers.map((mother) => <tr key={mother.id}><td><strong>{mother.fullName}</strong><small className="cell-subtext">{maskNic(mother.nic)} · {mother.phone || 'No phone'}</small></td><td><code>{mother.id}</code></td><td>{mother.assignedStaffId || <span className="unassigned">Unassigned</span>}</td><td><strong>{mother.mohArea || '—'}</strong><small className="cell-subtext">{mother.gnDivision || '—'}</small></td><td>{mother.pregnancyWeek === null ? '—' : `Week ${mother.pregnancyWeek}`}</td><td><Status value={mother.riskLevel} /></td><td>{mother.nextClinicDate || '—'}</td></tr>)}
                      </tbody>
                    </table>
                    {!mothers.length && <Empty text="No compatible mother-list endpoint was found. PHM counts can still come from the distribution API or each PHM record." />}
                  </div>
                </article>
              </section>
            )}
          </>
        )}
      </section>

      {selectedPHM && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedPHM(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${selectedPHM.fullName} details`} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div className="person-cell"><span className="avatar large">{initials(selectedPHM.fullName)}</span><span><p className="section-kicker">PHM ADMIN PROFILE</p><h2>{selectedPHM.fullName}</h2><small>{selectedPHM.staffId}</small></span></div>
              <button className="icon-button" onClick={() => setSelectedPHM(null)} aria-label="Close">×</button>
            </div>
            <div className="detail-grid">
              <Detail label="NIC" value={maskNic(selectedPHM.nic)} />
              <Detail label="Status" value={selectedPHM.status} />
              <Detail label="District" value={selectedPHM.district || 'Not recorded'} />
              <Detail label="MOH area" value={selectedPHM.mohArea || 'Not recorded'} />
              <Detail label="GN division" value={selectedPHM.gnDivision || 'Not recorded'} />
              <Detail label="Contact" value={selectedPHM.phone || selectedPHM.email || 'Not recorded'} />
              <Detail label="Registered mothers" value={String(selectedMothers.length || selectedPHM.motherCount)} />
              <Detail label="Caseload status" value={(selectedMothers.length || selectedPHM.motherCount) > CASELOAD_TARGET ? 'Overloaded' : 'Within target'} />
            </div>
            <div className="modal-section-heading"><div><p className="section-kicker">ASSIGNED CASELOAD</p><h3>Mothers registered to this PHM</h3></div><span className="count-badge">{selectedMothers.length || selectedPHM.motherCount}</span></div>
            <div className="assigned-list">
              {selectedMothers.map((mother) => <div className="assigned-row" key={mother.id}><div><strong>{mother.fullName}</strong><span>{mother.id} · {maskNic(mother.nic)}</span></div><div><b>{mother.pregnancyWeek === null ? 'Week —' : `Week ${mother.pregnancyWeek}`}</b><Status value={mother.riskLevel} /></div></div>)}
              {!selectedMothers.length && <Empty text={selectedPHM.motherCount ? `${selectedPHM.motherCount} mothers are reported for this PHM, but the API did not return their individual records.` : 'No mothers are currently assigned to this PHM.'} />}
            </div>
            <div className="modal-actions"><button onClick={() => void resetPassword(selectedPHM)}>Reset password</button><button className="danger" onClick={() => void removePHM(selectedPHM)}>Remove PHM</button></div>
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone: string }) {
  return <article className={`metric-card ${tone}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function PanelHeading({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
  return <div className="panel-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2></div>{note && <span className="muted-note">{note}</span>}</div>;
}

function Legend({ label, value, className }: { label: string; value: number; className: string }) {
  return <div className="legend-row"><i className={className} /><span>{label}</span><strong>{value}</strong></div>;
}

function Status({ value }: { value: string }) {
  const normalised = value.toLowerCase();
  const tone = normalised.includes('over') || normalised.includes('high') || normalised.includes('critical') || normalised.includes('risk')
    ? 'risk'
    : normalised.includes('inactive') || normalised.includes('disable') || normalised.includes('unstaffed') || normalised.includes('unassigned')
      ? 'neutral'
      : 'healthy';
  return <span className={`status-pill ${tone}`}>{value || 'Unknown'}</span>;
}

function Empty({ text: value }: { text: string }) {
  return <div className="empty-message">{value}</div>;
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}


function MapMetricButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={active ? 'active' : ''} onClick={onClick}>{children}</button>;
}

function MapStat({ label, value }: { label: string; value: string | number }) {
  return <div className="map-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function mapMetricLabel(metric: MapMetric): string {
  if (metric === 'mothers') return 'Registered mothers';
  if (metric === 'phms') return 'Registered PHMs';
  if (metric === 'caseload') return 'Average caseload';
  return 'MOH coverage';
}

function districtMetricValue(
  district: { phmCount: number; motherCount: number; coverage: number; averageCaseload: number },
  metric: MapMetric,
): string | number {
  if (metric === 'mothers') return district.motherCount;
  if (metric === 'phms') return district.phmCount;
  if (metric === 'caseload') return district.averageCaseload;
  return `${district.coverage}%`;
}


function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}