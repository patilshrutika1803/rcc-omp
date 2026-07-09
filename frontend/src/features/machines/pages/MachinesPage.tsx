// ─────────────────────────────────────────────────────────────────────────────
// MachinesPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  Monitor,
  LayoutDashboard,
  Wrench,
  Server,
  Search,
  Bell,
  User,
  ChevronRight,
  Clock,
  CheckCircle2,
  Info,
  Plus,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  XCircle,
  Filter,
  Download,
  Table2,
  Eye,
  Edit2,
  Cpu,
  Zap,
  Wifi,
  Battery,
  Printer,
  Thermometer,
  CalendarClock,
  MapPin,
  UserCheck,
  ArrowUpDown,
  Tag,
  HardDrive,
  Type
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { daysUntil, formatDate } from "../../../shared/utils/dateHelpers";

const DEPARTMENTS = ["Quality Assurance", "Quality Control", "Production", "Warehouse", "Engineering", "Purchase & Accounts", "HR & Admin", "Environmental Health & Safety", "IT Department"];

// ─────────────────────────────────────────────────────────────────────────────
// MACHINES MANAGEMENT MODULE
// ─────────────────────────────────────────────────────────────────────────────

type MachineStatus = "Healthy" | "Warning" | "Critical" | "Under Maintenance" | "Offline";

interface MachineRecord {
  id: string;
  assetId: string;
  name: string;
  department: string;
  location: string;
  type: string;
  status: MachineStatus;
  health: number;
  user: string;
  lastMaintenance: string;
  nextMaintenance: string;
  warrantyExpiry: string;
  serialNumber: string;
  purchaseDate: string;
  installationDate: string;
  model: string;
  manufacturer: string;
  cpu: number;
  memory: number;
  temperature: number;
  powerStatus: "On" | "Off";
  networkStatus: "Online" | "Offline" | "Degraded";
  lastHeartbeat: string;
  purchaseCost: number;
  maintenanceCostYTD: number;
  floorX: number;
  floorY: number;
  specs: Record<string, string>;
  alerts: { severity: "Critical" | "Warning" | "Info"; message: string; time: string }[];
  maintenanceHistory: { date: string; user: string; type: string; duration: string; cost: number; parts: string; remarks: string; status: string }[];
}

export const MACHINES: MachineRecord[] = [
  {
    id: "MCH-FLA-001", assetId: "RCC-AST-2020-001", name: "Filling Machine Line A",
    department: "Production", location: "Production Floor – Block A", type: "Filling Machine",
    status: "Healthy", health: 94, user: "Rajesh Kumar",
    lastMaintenance: "2026-06-03", nextMaintenance: "2026-07-03", warrantyExpiry: "2027-08-15",
    serialNumber: "KHS-DRS-2020-4421", purchaseDate: "2020-08-15", installationDate: "2020-09-01",
    model: "KHS Innofill DRS-ZMS", manufacturer: "KHS GmbH",
    cpu: 72, memory: 58, temperature: 42, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "2 min ago",
    purchaseCost: 48.5, maintenanceCostYTD: 84, floorX: 15, floorY: 20,
    specs: { "Rated Power": "22 kW", "Voltage": "415V / 3-Phase", "Max Throughput": "12,000 bottles/hr", "Operating Pressure": "4–6 bar", "Weight": "4,200 kg", "Dimensions": "4.8m × 2.2m × 2.5m" },
    alerts: [{ severity: "Info", message: "Scheduled maintenance due today", time: "2 hours ago" }],
    maintenanceHistory: [
      { date: "2026-06-03", user: "Rajesh Kumar", type: "Preventive", duration: "4h", cost: 12000, parts: "Gaskets, O-rings", remarks: "All checks passed. Wear gaskets replaced.", status: "Completed" },
      { date: "2026-05-03", user: "Rajesh Kumar", type: "Preventive", duration: "3.5h", cost: 8500, parts: "Belt tension adjustment", remarks: "Minor belt tension adjustment done.", status: "Completed" },
      { date: "2026-04-03", user: "Suresh Babu", type: "Corrective", duration: "6h", cost: 24000, parts: "Filter, Nozzle set", remarks: "Nozzle clog resolved. Filter replaced.", status: "Completed" },
    ],
  },
  {
    id: "MCH-ACP-003", assetId: "RCC-AST-2018-003", name: "Air Compressor – Production Floor",
    department: "Production", location: "Compressor Room – Ground Floor", type: "Air Compressor",
    status: "Warning", health: 68, user: "Suresh Babu",
    lastMaintenance: "2026-04-01", nextMaintenance: "2026-06-28", warrantyExpiry: "2025-12-31",
    serialNumber: "AC-GA55-2018-7823", purchaseDate: "2018-06-10", installationDate: "2018-07-02",
    model: "Atlas Copco GA55+", manufacturer: "Atlas Copco",
    cpu: 88, memory: 74, temperature: 68, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "5 min ago",
    purchaseCost: 32.0, maintenanceCostYTD: 118, floorX: 25, floorY: 65,
    specs: { "Rated Power": "55 kW", "Voltage": "415V / 3-Phase", "Free Air Delivery": "9.5 m³/min", "Max Pressure": "13 bar", "Weight": "720 kg", "Dimensions": "2.0m × 0.88m × 1.6m" },
    alerts: [
      { severity: "Warning", message: "Oil temperature elevated – 68°C (limit: 65°C)", time: "15 min ago" },
      { severity: "Warning", message: "Maintenance overdue by 5 days", time: "1 day ago" },
    ],
    maintenanceHistory: [
      { date: "2026-04-01", user: "Suresh Babu", type: "Preventive", duration: "3h", cost: 18000, parts: "Oil, Filter", remarks: "Oil changed, filters replaced.", status: "Completed" },
      { date: "2026-01-02", user: "Suresh Babu", type: "Preventive", duration: "4h", cost: 22000, parts: "Belt, Valve kit", remarks: "Full quarterly PM done.", status: "Completed" },
    ],
  },
  {
    id: "MCH-UPS-DC1", assetId: "RCC-AST-2022-005", name: "UPS System – Data Center",
    department: "IT Department", location: "Data Center – Server Room 1", type: "UPS System",
    status: "Healthy", health: 98, user: "Arjun Rao",
    lastMaintenance: "2026-01-15", nextMaintenance: "2026-07-15", warrantyExpiry: "2027-03-31",
    serialNumber: "EAT-9PX-2022-00149", purchaseDate: "2022-03-10", installationDate: "2022-03-25",
    model: "Eaton 9PX 20KVA", manufacturer: "Eaton Corporation",
    cpu: 18, memory: 22, temperature: 28, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "1 min ago",
    purchaseCost: 18.5, maintenanceCostYTD: 28, floorX: 68, floorY: 15,
    specs: { "Rating": "20 KVA / 18 kW", "Input Voltage": "230V / 1-Phase", "Battery Capacity": "240 Ah / 192V", "Backup Time (Full Load)": "12 minutes", "Battery Type": "VRLA Sealed", "Dimensions": "880mm × 432mm × 1825mm" },
    alerts: [],
    maintenanceHistory: [
      { date: "2026-01-15", user: "Arjun Rao", type: "Preventive", duration: "3h", cost: 14000, parts: "None", remarks: "Battery capacity at 94%. Firmware updated to v3.2.", status: "Completed" },
      { date: "2025-07-15", user: "Arjun Rao", type: "Preventive", duration: "3h", cost: 14000, parts: "None", remarks: "Full PM completed. All systems nominal.", status: "Completed" },
    ],
  },
  {
    id: "MCH-PKG-002", assetId: "RCC-AST-2021-002", name: "Packaging Machine – Line B",
    department: "Production", location: "Production Floor – Block B", type: "Packaging Machine",
    status: "Under Maintenance", health: 0, user: "Priya Nair",
    lastMaintenance: "2026-06-10", nextMaintenance: "2026-07-10", warrantyExpiry: "2026-12-31",
    serialNumber: "BSH-TTMD-2021-3310", purchaseDate: "2021-12-01", installationDate: "2021-12-20",
    model: "Bosch Sigpack TTMD", manufacturer: "Bosch Packaging",
    cpu: 0, memory: 0, temperature: 24, powerStatus: "Off", networkStatus: "Offline", lastHeartbeat: "3 hours ago",
    purchaseCost: 42.0, maintenanceCostYTD: 96, floorX: 38, floorY: 30,
    specs: { "Rated Power": "18 kW", "Voltage": "415V / 3-Phase", "Throughput": "80 packs/min", "Seal Temperature Range": "120–200°C", "Weight": "1,850 kg", "Dimensions": "3.6m × 1.8m × 2.1m" },
    alerts: [{ severity: "Info", message: "Machine under scheduled maintenance – estimated 4h remaining", time: "3 hours ago" }],
    maintenanceHistory: [
      { date: "2026-07-03", user: "Priya Nair", type: "Corrective", duration: "In Progress", cost: 0, parts: "Sealing bar, Conveyor rollers", remarks: "Ongoing repair of sealing mechanism.", status: "In Progress" },
      { date: "2026-06-10", user: "Priya Nair", type: "Preventive", duration: "4h", cost: 16000, parts: "Sealing bar", remarks: "Sealing bar replaced. Belt aligned.", status: "Completed" },
    ],
  },
  {
    id: "MCH-NSW-DC1", assetId: "RCC-AST-2023-008", name: "Core Network Switch – DC",
    department: "IT Department", location: "Data Center – Network Rack 3", type: "Network Equipment",
    status: "Healthy", health: 96, user: "Vikram Singh",
    lastMaintenance: "2026-04-05", nextMaintenance: "2026-07-05", warrantyExpiry: "2028-04-05",
    serialNumber: "CSC-C9500-2023-FC41", purchaseDate: "2023-04-01", installationDate: "2023-04-10",
    model: "Cisco Catalyst 9500", manufacturer: "Cisco Systems",
    cpu: 34, memory: 41, temperature: 38, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "30 sec ago",
    purchaseCost: 28.0, maintenanceCostYTD: 22, floorX: 72, floorY: 28,
    specs: { "Switching Capacity": "3.6 Tbps", "Ports": "48 × 10GE + 8 × 25GE", "Power Consumption": "550W", "Voltage": "100–240V AC", "Stacking": "StackWise-480", "Dimensions": "1U × 445mm × 470mm" },
    alerts: [{ severity: "Info", message: "Firmware update available – IOS-XE 17.10.1", time: "1 day ago" }],
    maintenanceHistory: [
      { date: "2026-04-05", user: "Vikram Singh", type: "Preventive", duration: "2h", cost: 8000, parts: "None", remarks: "Firmware upgraded to 17.9.4. Dust cleared.", status: "Completed" },
    ],
  },
  {
    id: "MCH-HVAC-SR1", assetId: "RCC-AST-2019-004", name: "HVAC Unit – Server Room",
    department: "IT Department", location: "Server Room 1 – 2nd Floor", type: "HVAC",
    status: "Critical", health: 32, user: "Meena Pillai",
    lastMaintenance: "2026-06-01", nextMaintenance: "2026-07-01", warrantyExpiry: "2024-12-31",
    serialNumber: "SCH-INROW-2019-7721", purchaseDate: "2019-11-15", installationDate: "2019-12-01",
    model: "Schneider APC InRow RC", manufacturer: "Schneider Electric",
    cpu: 95, memory: 88, temperature: 82, powerStatus: "On", networkStatus: "Degraded", lastHeartbeat: "8 min ago",
    purchaseCost: 22.0, maintenanceCostYTD: 142, floorX: 62, floorY: 18,
    specs: { "Cooling Capacity": "10 kW", "Airflow": "1,500 CFM", "Input Power": "3.5 kW", "Voltage": "230V / 1-Phase", "Refrigerant": "R-410A", "Dimensions": "600mm × 1,200mm × 2,000mm" },
    alerts: [
      { severity: "Critical", message: "Coolant leak detected – server room temperature rising", time: "20 min ago" },
      { severity: "Critical", message: "Temperature threshold exceeded: 82°C (limit: 50°C)", time: "15 min ago" },
      { severity: "Warning", message: "Maintenance overdue by 2 days", time: "2 days ago" },
    ],
    maintenanceHistory: [
      { date: "2026-06-01", user: "Meena Pillai", type: "Preventive", duration: "3h", cost: 12000, parts: "Filter", remarks: "Filters cleaned. Coolant at 98%.", status: "Completed" },
      { date: "2026-05-01", user: "Meena Pillai", type: "Preventive", duration: "3h", cost: 12000, parts: "Filter", remarks: "PM completed. Coils cleaned.", status: "Completed" },
    ],
  },
  {
    id: "MCH-CVR-WH2", assetId: "RCC-AST-2021-006", name: "Conveyor Belt – Warehouse",
    department: "Warehouse", location: "Warehouse – Zone B", type: "Conveyor System",
    status: "Healthy", health: 87, user: "Suresh Babu",
    lastMaintenance: "2026-06-19", nextMaintenance: "2026-07-03", warrantyExpiry: "2026-09-30",
    serialNumber: "ILX-2400-2021-8834", purchaseDate: "2021-09-15", installationDate: "2021-10-01",
    model: "Intralox Series 2400", manufacturer: "Intralox LLC",
    cpu: 52, memory: 38, temperature: 36, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "4 min ago",
    purchaseCost: 12.5, maintenanceCostYTD: 36, floorX: 55, floorY: 75,
    specs: { "Belt Width": "600 mm", "Motor Power": "5.5 kW", "Belt Speed": "0.2–1.2 m/s", "Max Load Capacity": "500 kg/m", "Belt Material": "Modular Plastic", "Length": "24 meters" },
    alerts: [],
    maintenanceHistory: [
      { date: "2026-06-19", user: "Suresh Babu", type: "Preventive", duration: "2h", cost: 6000, parts: "Bearings", remarks: "Bearings lubricated. Belt tension adjusted.", status: "Completed" },
    ],
  },
  {
    id: "MCH-GEN-BKP1", assetId: "RCC-AST-2017-007", name: "Diesel Generator – Backup",
    department: "Engineering", location: "Generator Shed – Rear Campus", type: "Generator",
    status: "Healthy", health: 92, user: "Rajesh Kumar",
    lastMaintenance: "2026-06-07", nextMaintenance: "2026-07-07", warrantyExpiry: "2025-06-30",
    serialNumber: "CMN-C300-2017-1198", purchaseDate: "2017-06-01", installationDate: "2017-06-20",
    model: "Cummins C300D5 300kVA", manufacturer: "Cummins Inc.",
    cpu: 0, memory: 0, temperature: 28, powerStatus: "Off", networkStatus: "Online", lastHeartbeat: "10 min ago",
    purchaseCost: 35.0, maintenanceCostYTD: 64, floorX: 88, floorY: 82,
    specs: { "Rated Power": "300 kVA / 240 kW", "Voltage Output": "415V / 3-Phase", "Fuel Type": "Diesel", "Fuel Tank Capacity": "990 liters", "Engine": "Cummins QSL9-G7", "Weight": "4,500 kg" },
    alerts: [],
    maintenanceHistory: [
      { date: "2026-06-07", user: "Rajesh Kumar", type: "Preventive", duration: "4h", cost: 18000, parts: "Oil, Filters", remarks: "Oil changed. Load test passed at 85% capacity.", status: "Completed" },
      { date: "2026-05-07", user: "Rajesh Kumar", type: "Preventive", duration: "4h", cost: 18000, parts: "Battery", remarks: "Full PM done. Battery replaced.", status: "Completed" },
    ],
  },
  {
    id: "MCH-CHL-PH1", assetId: "RCC-AST-2020-009", name: "Chiller Unit – Production Hall",
    department: "Engineering", location: "Production Hall – Mechanical Room", type: "Chiller",
    status: "Warning", health: 61, user: "Meena Pillai",
    lastMaintenance: "2026-03-10", nextMaintenance: "2026-06-25", warrantyExpiry: "2026-08-31",
    serialNumber: "CAR-30XA-2020-5512", purchaseDate: "2020-08-20", installationDate: "2020-09-15",
    model: "Carrier 30XA Aquaforce", manufacturer: "Carrier Corporation",
    cpu: 82, memory: 68, temperature: 54, powerStatus: "On", networkStatus: "Degraded", lastHeartbeat: "12 min ago",
    purchaseCost: 58.0, maintenanceCostYTD: 88, floorX: 30, floorY: 78,
    specs: { "Cooling Capacity": "250 kW", "Refrigerant": "R-134a", "Power Consumption": "58 kW", "Voltage": "415V / 3-Phase", "Chilled Water Flow": "43 m³/hr", "Weight": "2,800 kg" },
    alerts: [
      { severity: "Warning", message: "Refrigerant pressure below optimal range", time: "30 min ago" },
      { severity: "Warning", message: "Maintenance overdue by 8 days", time: "8 days ago" },
    ],
    maintenanceHistory: [
      { date: "2026-03-10", user: "Meena Pillai", type: "Preventive", duration: "5h", cost: 28000, parts: "None", remarks: "Refrigerant at 97%. Coils cleaned.", status: "Completed" },
    ],
  },
  {
    id: "MCH-ATC-QL1", assetId: "RCC-AST-2019-010", name: "Quality Lab Autoclave",
    department: "Quality Control", location: "Quality Lab – Room 204", type: "Laboratory Equipment",
    status: "Healthy", health: 89, user: "Anita Desai",
    lastMaintenance: "2026-06-12", nextMaintenance: "2026-07-12", warrantyExpiry: "2027-01-31",
    serialNumber: "TTN-3870-2019-0044", purchaseDate: "2019-01-20", installationDate: "2019-02-01",
    model: "Tuttnauer 3870EL", manufacturer: "Tuttnauer Ltd.",
    cpu: 44, memory: 36, temperature: 34, powerStatus: "On", networkStatus: "Online", lastHeartbeat: "7 min ago",
    purchaseCost: 8.5, maintenanceCostYTD: 18, floorX: 78, floorY: 55,
    specs: { "Chamber Volume": "80 liters", "Temperature Range": "105–135°C", "Max Pressure": "3.2 bar", "Power": "4.5 kW", "Voltage": "230V / 1-Phase", "Dimensions": "580mm × 870mm × 900mm" },
    alerts: [],
    maintenanceHistory: [
      { date: "2026-07-02", user: "Anita Desai", type: "Preventive", duration: "2h", cost: 6000, parts: "Door seal", remarks: "Early PM completed. All validations passed.", status: "Completed" },
      { date: "2026-06-12", user: "Anita Desai", type: "Preventive", duration: "2h", cost: 6000, parts: "Seals", remarks: "Seals replaced. Temperature calibrated.", status: "Completed" },
    ],
  },
  {
    id: "MCH-CNC-001", assetId: "RCC-AST-2016-011", name: "CNC Lathe Machine",
    department: "Production", location: "Workshop – Machine Shop", type: "CNC Machine",
    status: "Offline", health: 0, user: "Rajesh Kumar",
    lastMaintenance: "2026-05-20", nextMaintenance: "2026-07-20", warrantyExpiry: "2022-12-31",
    serialNumber: "DMG-CTX-2016-9921", purchaseDate: "2016-11-01", installationDate: "2016-12-01",
    model: "DMG Mori CTX beta 800", manufacturer: "DMG Mori",
    cpu: 0, memory: 0, temperature: 22, powerStatus: "Off", networkStatus: "Offline", lastHeartbeat: "2 days ago",
    purchaseCost: 95.0, maintenanceCostYTD: 220, floorX: 18, floorY: 45,
    specs: { "Max Turning Diameter": "400 mm", "Max Turning Length": "800 mm", "Spindle Speed": "6,000 RPM", "Motor Power": "30 kW", "Voltage": "415V / 3-Phase", "Weight": "12,000 kg" },
    alerts: [
      { severity: "Critical", message: "Machine offline – power failure reported", time: "2 days ago" },
      { severity: "Warning", message: "Spindle drive fault detected before shutdown", time: "2 days ago" },
    ],
    maintenanceHistory: [
      { date: "2026-05-20", user: "Rajesh Kumar", type: "Corrective", duration: "8h", cost: 45000, parts: "Servo drive, Coolant pump", remarks: "Servo drive replaced. Machine operational.", status: "Completed" },
    ],
  },
  {
    id: "MCH-WTP-001", assetId: "RCC-AST-2018-012", name: "Water Treatment Plant",
    department: "Engineering", location: "Utility Block – Ground Floor", type: "Water Treatment",
    status: "Critical", health: 28, user: "Suresh Babu",
    lastMaintenance: "2026-05-15", nextMaintenance: "2026-06-15", warrantyExpiry: "2025-05-31",
    serialNumber: "PWT-RO-2018-5501", purchaseDate: "2018-05-10", installationDate: "2018-06-01",
    model: "Pentair RO-500 Industrial", manufacturer: "Pentair",
    cpu: 98, memory: 91, temperature: 74, powerStatus: "On", networkStatus: "Degraded", lastHeartbeat: "25 min ago",
    purchaseCost: 28.0, maintenanceCostYTD: 158, floorX: 42, floorY: 85,
    specs: { "Capacity": "500 liters/hour", "Recovery Rate": "70%", "Max Pressure": "60 psi", "Power Consumption": "3 kW", "Voltage": "230V / 1-Phase", "Membrane Type": "Thin Film Composite" },
    alerts: [
      { severity: "Critical", message: "Membrane fouling detected – permeate flow reduced 60%", time: "1 hour ago" },
      { severity: "Critical", message: "Maintenance overdue by 18 days – escalated to management", time: "18 days ago" },
      { severity: "Warning", message: "TDS levels elevated: 450 ppm (limit: 200 ppm)", time: "2 hours ago" },
    ],
    maintenanceHistory: [
      { date: "2026-05-15", user: "Suresh Babu", type: "Preventive", duration: "6h", cost: 32000, parts: "Pre-filter cartridges", remarks: "Filters replaced. Pressure normal.", status: "Completed" },
    ],
  },
];

export function mchStatusCfg(status: MachineStatus) {
  switch (status) {
    case "Healthy":           return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", hex: "#10B981" };
    case "Warning":           return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",   hex: "#F59E0B" };
    case "Critical":          return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     hex: "#EF4444" };
    case "Under Maintenance": return { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",    hex: "#3B82F6" };
    case "Offline":           return { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400",   hex: "#94A3B8" };
  }
}

function MchStatusBadge({ status }: { status: MachineStatus }) {
  const c = mchStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {status}
    </span>
  );
}

function HealthBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : value > 0 ? "bg-red-500" : "bg-slate-300";
  const textColor = value >= 80 ? "text-emerald-600" : value >= 60 ? "text-amber-600" : value > 0 ? "text-red-600" : "text-slate-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className={`text-xs font-bold w-9 text-right ${textColor}`}>{value}%</span>}
    </div>
  );
}

function HealthGauge({ value }: { value: number }) {
  const color = value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : value > 0 ? "#EF4444" : "#94A3B8";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const dash = (value / 100) * arcLen;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-135deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F5F9" strokeWidth="9"
            strokeDasharray={`${arcLen} ${circ - arcLen}`} strokeLinecap="round" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Health</span>
        </div>
      </div>
    </div>
  );
}

// ─── 1. MACHINES DASHBOARD ────────────────────────────────────────────────────

const HEALTH_TREND_30D = [
  { day: "Jun 3",  healthy: 9, warning: 2, critical: 1 }, { day: "Jun 7",  healthy: 9, warning: 1, critical: 1 },
  { day: "Jun 10", healthy: 8, warning: 2, critical: 2 }, { day: "Jun 13", healthy: 9, warning: 2, critical: 1 },
  { day: "Jun 16", healthy: 8, warning: 3, critical: 1 }, { day: "Jun 19", healthy: 9, warning: 2, critical: 1 },
  { day: "Jun 22", healthy: 8, warning: 2, critical: 2 }, { day: "Jun 25", healthy: 8, warning: 3, critical: 1 },
  { day: "Jun 28", healthy: 7, warning: 3, critical: 2 }, { day: "Jul 1",  healthy: 8, warning: 2, critical: 2 },
  { day: "Jul 3",  healthy: 8, warning: 2, critical: 2 },
];

function MachineDashboardTab() {
  const total = MACHINES.length;
  const healthy = MACHINES.filter(m => m.status === "Healthy").length;
  const warning = MACHINES.filter(m => m.status === "Warning").length;
  const critical = MACHINES.filter(m => m.status === "Critical").length;
  const underMaint = MACHINES.filter(m => m.status === "Under Maintenance").length;
  const offline = MACHINES.filter(m => m.status === "Offline").length;

  const deptDist = DEPARTMENTS.map(dept => ({
    name: dept, value: MACHINES.filter(m => m.department === dept).length,
  })).filter(d => d.value > 0);

  const PIE_COLORS = ["#2563EB", "#7C3AED", "#D97706", "#16A34A", "#DC2626", "#0891B2"];

  const recentAlerts = MACHINES.flatMap(m => m.alerts.map(a => ({ ...a, machine: m.name, machineId: m.id })))
    .sort((a, b) => (a.severity === "Critical" ? -1 : b.severity === "Critical" ? 1 : 0)).slice(0, 5);

  const upcomingMaint = [...MACHINES]
    .sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance)).slice(0, 5);

  const newestMachines = [...MACHINES]
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Total Machines", val: total,      icon: Server,       bg: "bg-blue-50",    border: "border-blue-100",    text: "text-blue-600",    sub: "All registered" },
          { label: "Healthy",        val: healthy,    icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", sub: "Fully operational" },
          { label: "Warning",        val: warning,    icon: AlertTriangle,bg: "bg-amber-50",   border: "border-amber-100",   text: "text-amber-600",   sub: "Needs attention" },
          { label: "Critical",       val: critical,   icon: XCircle,      bg: "bg-red-50",     border: "border-red-100",     text: "text-red-600",     sub: "Immediate action" },
          { label: "Maintenance",    val: underMaint, icon: Wrench,       bg: "bg-indigo-50",  border: "border-indigo-100",  text: "text-indigo-600",  sub: "Under service" },
          { label: "Offline",        val: offline,    icon: Activity,     bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-500",   sub: "Not responding" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
                <kpi.icon size={15} className={kpi.text} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
            <div className="text-[11px] font-medium text-slate-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Machine Health Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">30-day status count overview</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              {[["bg-emerald-400","Healthy"],["bg-amber-400","Warning"],["bg-red-400","Critical"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm inline-block ${c}`} />{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={HEALTH_TREND_30D} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
              <Area type="monotone" dataKey="warning" stackId="1" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#FEE2E2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={deptDist} cx="50%" cy="50%" outerRadius={60} innerRadius={28} dataKey="value" paddingAngle={3}>
                {deptDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {deptDist.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-600 truncate max-w-[150px]" title={d.name}>{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={15} className="text-red-500" /> Recent Alerts
          </h3>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No active alerts</div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert, i) => {
                const cls = alert.severity === "Critical" ? "bg-red-50 border-red-200 text-red-800" : alert.severity === "Warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800";
                return (
                  <div key={i} className={`rounded-lg border px-3 py-2.5 ${cls}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">{alert.severity} · {alert.machine.split("–")[0].trim()}</div>
                    <div className="text-xs font-medium leading-snug">{alert.message}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{alert.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarClock size={15} className="text-blue-500" /> Upcoming Maintenance
          </h3>
          <div className="space-y-2.5">
            {upcomingMaint.map(m => {
              const days = daysUntil(m.nextMaintenance);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-center shrink-0 border ${days < 0 ? "bg-red-50 border-red-200" : days === 0 ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
                    <span className={`text-[9px] font-bold uppercase ${days < 0 ? "text-red-500" : days === 0 ? "text-blue-500" : "text-slate-400"}`}>
                      {new Date(m.nextMaintenance).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                    <span className={`text-sm font-bold leading-none ${days < 0 ? "text-red-700" : days === 0 ? "text-blue-700" : "text-slate-700"}`}>
                      {new Date(m.nextMaintenance).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.user}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${days < 0 ? "bg-red-50 text-red-600" : days === 0 ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}>
                    {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server size={15} className="text-slate-400" /> Newest Registered
          </h3>
          <div className="space-y-3">
            {newestMachines.map(m => {
              const cfg = mchStatusCfg(m.status);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Server size={13} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.id} · {m.purchaseDate}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {m.status === "Under Maintenance" ? "Maint." : m.status === "Offline" ? "Offline" : m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. MACHINE INVENTORY ─────────────────────────────────────────────────────

function MachineInventoryTab({ onViewDetails }: { onViewDetails: (m: MachineRecord) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PER = 8;

  const types = [...new Set(MACHINES.map(m => m.type))];

  const filtered = useMemo(() => {
    let d = [...MACHINES];
    if (search) { const q = search.toLowerCase(); d = d.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.user.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)); }
    if (filterStatus) d = d.filter(m => m.status === filterStatus);
    if (filterDept)   d = d.filter(m => m.department === filterDept);
    if (filterType)   d = d.filter(m => m.type === filterType);
    d.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "health") cmp = a.health - b.health;
      else if (sortField === "nextMaintenance") cmp = a.nextMaintenance.localeCompare(b.nextMaintenance);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return d;
  }, [search, filterStatus, filterDept, filterType, sortField, sortDir]);

  const paged = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => { if (selectedIds.size === paged.length) setSelectedIds(new Set()); else setSelectedIds(new Set(paged.map(m => m.id))); };

  const SortBtn = ({ field }: { field: string }) => (
    <button onClick={() => { if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }}>
      <ArrowUpDown size={11} className={sortField === field ? "text-blue-500" : "text-slate-300"} />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search machines, users..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
        </div>
        {[
          { val: filterStatus, set: (v: string) => { setFilterStatus(v); setPage(1); }, opts: ["Healthy","Warning","Critical","Under Maintenance","Offline"], placeholder: "All Statuses" },
          { val: filterDept,   set: (v: string) => { setFilterDept(v); setPage(1); },   opts: DEPARTMENTS, placeholder: "All Departments" },
          { val: filterType,   set: (v: string) => { setFilterType(v); setPage(1); },   opts: types, placeholder: "All Types" },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)} className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
            <option value="">{f.placeholder}</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && <span className="text-xs text-slate-600 font-medium bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">{selectedIds.size} selected</span>}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500">Showing <span className="font-bold text-slate-900">{paged.length}</span> of {filtered.length} machines</span>
          <select className="h-7 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none">
            <option>8 per page</option><option>15 per page</option><option>25 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3"><input type="checkbox" checked={selectedIds.size === paged.length && paged.length > 0} onChange={toggleAll} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-1" /></th>
                <th className="px-4 py-3"><div className="flex items-center gap-1">Machine <SortBtn field="name" /></div></th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"><div className="flex items-center gap-1">Health <SortBtn field="health" /></div></th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Last Maint.</th>
                <th className="px-4 py-3"><div className="flex items-center gap-1">Next Maint. <SortBtn field="nextMaintenance" /></div></th>
                <th className="px-4 py-3">Warranty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paged.map(machine => {
                const cfg = mchStatusCfg(machine.status);
                const days = daysUntil(machine.nextMaintenance);
                const wDays = daysUntil(machine.warrantyExpiry);
                return (
                  <tr key={machine.id} onClick={() => onViewDetails(machine)} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(machine.id)} onChange={() => toggleSelect(machine.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-1" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Server size={13} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{machine.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{machine.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{machine.department}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[140px]">
                      <span className="truncate block" title={machine.location}>{machine.location.split("–")[0].trim()}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">{machine.type}</span>
                    </td>
                    <td className="px-4 py-3.5"><MchStatusBadge status={machine.status} /></td>
                    <td className="px-4 py-3.5 w-36"><div className="w-28"><HealthBar value={machine.health} /></div></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {machine.user.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{machine.user.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(machine.lastMaintenance)}</td>
                    <td className="px-4 py-3.5">
                      <div className={`text-xs font-bold ${days < 0 ? "text-red-600" : days === 0 ? "text-blue-600" : days <= 7 ? "text-amber-600" : "text-slate-700"}`}>{formatDate(machine.nextMaintenance)}</div>
                      <div className={`text-[10px] font-medium ${days < 0 ? "text-red-400" : days === 0 ? "text-blue-400" : "text-slate-400"}`}>{days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d late` : `in ${days}d`}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${wDays < 0 ? "bg-red-50 text-red-600 border border-red-200" : wDays < 90 ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                        {wDays < 0 ? "Expired" : wDays < 30 ? `${wDays}d left` : formatDate(machine.warrantyExpiry)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onViewDetails(machine)} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Eye size={14} /></button>
                        <button title="Edit" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"><Edit2 size={14} /></button>
                        <button title="More" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 text-xs font-bold rounded-md transition-colors ${p === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="h-7 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. MACHINE DETAILS ────────────────────────────────────────────────────────

function MachineDetailsTab({ machine, onGoToInventory }: { machine: MachineRecord | null; onGoToInventory: () => void }) {
  const [section, setSection] = useState<"overview" | "specs" | "alerts" | "history" | "timeline">("overview");

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-5">
          <Server size={28} className="text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">No Machine Selected</h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">Select a machine from the Machine Inventory to view its full profile, specifications and history.</p>
        <button onClick={onGoToInventory} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Table2 size={14} /> Browse Inventory
        </button>
      </div>
    );
  }

  const cfg = mchStatusCfg(machine.status);
  const sections = [
    { id: "overview", label: "Overview" }, { id: "specs", label: "Specifications" },
    { id: "alerts",   label: `Alerts${machine.alerts.length > 0 ? ` (${machine.alerts.length})` : ""}` },
    { id: "history",  label: "Maint. History" }, { id: "timeline", label: "Timeline" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${cfg.bg} ${cfg.border}`}>
              <Server size={24} className={cfg.text} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{machine.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{machine.id}</span>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{machine.assetId}</span>
                <MchStatusBadge status={machine.status} />
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={11} /> {machine.location}</span>
                <span className="flex items-center gap-1"><UserCheck size={11} /> {machine.user}</span>
                <span className="flex items-center gap-1"><Tag size={11} /> {machine.type}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
            <HealthGauge value={machine.health} />
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Edit2 size={12} /> Edit Machine</button>
              <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Download size={12} /> Download History</button>
              <button className="flex items-center gap-2 h-8 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"><CalendarClock size={12} /> Schedule Maintenance</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id as typeof section)} className={`px-5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${section === s.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Machine Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Model", machine.model], ["Manufacturer", machine.manufacturer],
                ["Serial Number", machine.serialNumber], ["Department", machine.department],
                ["Purchase Date", formatDate(machine.purchaseDate)], ["Installation Date", formatDate(machine.installationDate)],
                ["Purchase Cost", `₹${machine.purchaseCost} Lakhs`], ["YTD Maint. Cost", `₹${machine.maintenanceCostYTD}K`],
                ["Warranty Expiry", formatDate(machine.warrantyExpiry)], ["Assigned User", machine.user],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-xs font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Current Status</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Power", value: machine.powerStatus, good: machine.powerStatus === "On" },
                  { label: "Network", value: machine.networkStatus, good: machine.networkStatus === "Online" },
                  { label: "Last Heartbeat", value: machine.lastHeartbeat, good: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-medium text-slate-500">{s.label}</span>
                    <span className={`text-xs font-bold ${s.good ? "text-emerald-600" : "text-red-600"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Maintenance Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-emerald-600 font-semibold mb-1">Last PM</div>
                  <div className="text-xs font-bold text-emerald-800">{formatDate(machine.lastMaintenance)}</div>
                </div>
                <div className={`rounded-xl p-3 text-center border ${daysUntil(machine.nextMaintenance) < 0 ? "bg-red-50 border-red-100" : daysUntil(machine.nextMaintenance) === 0 ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"}`}>
                  <div className={`text-[10px] font-semibold mb-1 ${daysUntil(machine.nextMaintenance) < 0 ? "text-red-600" : daysUntil(machine.nextMaintenance) === 0 ? "text-blue-600" : "text-amber-600"}`}>Next PM</div>
                  <div className={`text-xs font-bold ${daysUntil(machine.nextMaintenance) < 0 ? "text-red-800" : daysUntil(machine.nextMaintenance) === 0 ? "text-blue-800" : "text-amber-800"}`}>{formatDate(machine.nextMaintenance)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "specs" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(machine.specs).map(([key, value]) => (
              <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{key}</div>
                <div className="text-sm font-bold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "alerts" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Active Alerts ({machine.alerts.length})</h3>
          {machine.alerts.length === 0 ? (
            <div className="text-center py-10"><CheckCircle2 size={32} className="text-emerald-300 mx-auto mb-3" /><p className="text-sm font-medium text-slate-500">No active alerts</p></div>
          ) : (
            <div className="space-y-3">
              {machine.alerts.map((alert, i) => {
                const ac = alert.severity === "Critical" ? "bg-red-50 border-red-200 text-red-800" : alert.severity === "Warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800";
                return (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${ac}`}>
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 opacity-70" />
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">{alert.severity}</div>
                      <div className="text-sm font-semibold">{alert.message}</div>
                      <div className="text-xs mt-1 opacity-60">{alert.time}</div>
                    </div>
                    <button className="text-xs font-semibold px-2 py-1 rounded border border-current/20 bg-white/50 hover:bg-white transition-colors shrink-0">Resolve</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {section === "history" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maintenance History · {machine.maintenanceHistory.length} records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Duration</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Parts</th>
                  <th className="px-4 py-3">Remarks</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {machine.maintenanceHistory.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{h.date}</td>
                    <td className="px-4 py-3.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${h.type === "Corrective" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{h.type}</span></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{h.user}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-600">{h.duration}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-900">₹{h.cost.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{h.parts || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px]"><span className="truncate block" title={h.remarks}>{h.remarks}</span></td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${h.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "timeline" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-5">Activity Timeline</h3>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {[
              { time: machine.lastHeartbeat, title: "Heartbeat received", desc: `Status: ${machine.status} · Health: ${machine.health}%` },
              { time: "3 hours ago", title: "Automated health check", desc: "System diagnostics completed" },
              ...machine.maintenanceHistory.slice(0, 3).map(h => ({ time: h.date, title: `${h.type} maintenance – ${h.status}`, desc: `${h.user} · ${h.duration} · ₹${h.cost.toLocaleString("en-IN")}` })),
              { time: formatDate(machine.installationDate), title: "Machine installed & registered", desc: `${machine.manufacturer} ${machine.model}` },
            ].map((item, i) => (
              <div key={i} className="relative pl-7">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.time}</div>
                <div className="text-xs font-bold text-slate-800">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. LIVE MONITORING ───────────────────────────────────────────────────────

function LiveMonitoringTab() {
  const [netFilter, setNetFilter] = useState("All");
  const displayed = netFilter === "All" ? MACHINES : MACHINES.filter(m => m.networkStatus === netFilter || (netFilter === "Offline" && m.status === "Offline"));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {["All", "Online", "Degraded", "Offline"].map(f => (
            <button key={f} onClick={() => setNetFilter(f)} className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-all ${netFilter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{f}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live · Auto-refresh every 60s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {displayed.map(machine => {
          const cfg = mchStatusCfg(machine.status);
          return (
            <div key={machine.id} className={`bg-white border-2 rounded-xl shadow-sm p-4 hover:shadow-md transition-all ${machine.status === "Critical" ? "border-red-200" : machine.status === "Warning" ? "border-amber-200" : "border-slate-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                    <Server size={15} className={cfg.text} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">{machine.name.split("–")[0].trim()}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{machine.id}</div>
                  </div>
                </div>
                <MchStatusBadge status={machine.status} />
              </div>

              {machine.powerStatus === "On" ? (
                <div className="space-y-2.5 mb-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><Cpu size={10} /> CPU</span>
                      <span className="font-bold text-slate-700">{machine.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${machine.cpu > 85 ? "bg-red-500" : machine.cpu > 70 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${machine.cpu}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><HardDrive size={10} /> Memory</span>
                      <span className="font-bold text-slate-700">{machine.memory}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${machine.memory > 85 ? "bg-red-500" : machine.memory > 70 ? "bg-amber-500" : "bg-purple-500"}`} style={{ width: `${machine.memory}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-3 py-3 bg-slate-50 rounded-lg text-center text-xs text-slate-400 font-medium">Machine powered off</div>
              )}

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  { icon: Thermometer, label: "Temp", value: `${machine.temperature}°C`, bad: machine.temperature > 70, warn: machine.temperature > 50 },
                  { icon: Wifi, label: "Network", value: machine.networkStatus, bad: machine.networkStatus === "Offline", warn: machine.networkStatus === "Degraded" },
                  { icon: Zap, label: "Power", value: machine.powerStatus, bad: machine.powerStatus === "Off", warn: false },
                  { icon: Clock, label: "Heartbeat", value: machine.lastHeartbeat, bad: false, warn: false },
                ].map(({ icon: Icon, label, value, bad, warn }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5">
                    <Icon size={10} className={bad ? "text-red-500" : warn ? "text-amber-500" : "text-slate-400"} />
                    <span className="text-slate-500">{label}</span>
                    <span className={`ml-auto font-bold truncate max-w-[48px] ${bad ? "text-red-600" : warn ? "text-amber-600" : "text-slate-700"}`} title={value}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span>Health Score</span><span className="font-bold text-slate-700">{machine.health}%</span>
                </div>
                <HealthBar value={machine.health} showLabel={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. MAINTENANCE HISTORY ────────────────────────────────────────────────────

function MachineMaintenanceHistoryTab() {
  const allHistory = MACHINES.flatMap(m =>
    m.maintenanceHistory.map(h => ({ ...h, machineName: m.name, machineId: m.id, department: m.department }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  const totalCost = allHistory.reduce((sum, h) => sum + h.cost, 0);
  const corrective = allHistory.filter(h => h.type === "Corrective").length;
  const preventive = allHistory.filter(h => h.type === "Preventive").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Records", val: allHistory.length, sub: "All machines", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Preventive", val: preventive, sub: "Scheduled PM", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Total Cost YTD", val: `₹${(totalCost / 1000).toFixed(0)}K`, sub: "All maintenance", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm`}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-2xl font-bold mb-1 ${kpi.color}`}>{kpi.val}</div>
            <div className="text-[11px] text-slate-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">All Maintenance Records</h3>
        <button className="flex items-center gap-2 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={13} /> Export Report
        </button>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-4">
        {allHistory.map((h, i) => (
          <div key={i} className="relative pl-8">
            <div className={`absolute -left-[11px] top-3 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${h.type === "Corrective" ? "bg-orange-200" : "bg-blue-200"}`}>
              <div className={`w-2 h-2 rounded-full ${h.type === "Corrective" ? "bg-orange-500" : "bg-blue-500"}`} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{h.machineName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{h.machineId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.type === "Corrective" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{h.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${h.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{h.status}</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">{h.remarks}</div>
                  {h.parts && h.parts !== "None" && <div className="text-[11px] text-slate-400 mt-1">Parts replaced: {h.parts}</div>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-900">{h.date}</span>
                  <span className="flex items-center gap-1"><UserCheck size={11} /> {h.user}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {h.duration}</span>
                  {h.cost > 0 && <span className="font-bold text-slate-700">₹{h.cost.toLocaleString("en-IN")}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. ASSET ANALYTICS ────────────────────────────────────────────────────────

const MAINT_COST_TREND = [
  { month: "Jan", preventive: 97, corrective: 48 }, { month: "Feb", preventive: 97, corrective: 65 },
  { month: "Mar", preventive: 98, corrective: 90 }, { month: "Apr", preventive: 96, corrective: 28 },
  { month: "May", preventive: 94, corrective: 102 }, { month: "Jun", preventive: 96, corrective: 52 },
  { month: "Jul", preventive: 40, corrective: 44 },
];

const DOWNTIME_DATA = [
  { name: "Jan", hours: 12 }, { name: "Feb", hours: 18 }, { name: "Mar", hours: 8 },
  { name: "Apr", hours: 22 }, { name: "May", hours: 14 }, { name: "Jun", hours: 19 }, { name: "Jul", hours: 6 },
];

function AssetAnalyticsTab() {
  const healthDist = [
    { name: "Excellent (90+)", value: MACHINES.filter(m => m.health >= 90).length, color: "#10B981" },
    { name: "Good (70–89)", value: MACHINES.filter(m => m.health >= 70 && m.health < 90).length, color: "#3B82F6" },
    { name: "Fair (50–69)", value: MACHINES.filter(m => m.health >= 50 && m.health < 70).length, color: "#F59E0B" },
    { name: "Poor (1–49)", value: MACHINES.filter(m => m.health > 0 && m.health < 50).length, color: "#EF4444" },
    { name: "Offline/Maint.", value: MACHINES.filter(m => m.health === 0).length, color: "#94A3B8" },
  ];

  const deptCost = DEPARTMENTS.map(dept => ({
    name: dept.split(" ")[0],
    cost: MACHINES.filter(m => m.department === dept).reduce((sum, m) => sum + m.maintenanceCostYTD, 0),
  })).filter(d => d.cost > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="text-sm font-bold text-slate-900">Maintenance Cost Trend</h3><p className="text-xs text-slate-400 mt-0.5">₹ Thousands · 2026 YTD</p></div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Preventive</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> Corrective</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MAINT_COST_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="preventive" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="corrective" stackId="a" fill="#FB923C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Health Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={healthDist} cx="50%" cy="50%" outerRadius={65} innerRadius={32} dataKey="value" paddingAngle={3}>
                {healthDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {healthDist.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} /><span className="text-slate-600">{d.name}</span></div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5"><h3 className="text-sm font-bold text-slate-900">Downtime Analysis</h3><p className="text-xs text-slate-400 mt-0.5">Total downtime hours by month</p></div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DOWNTIME_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Area type="monotone" dataKey="hours" stroke="#EF4444" fill="#FEE2E2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-5"><h3 className="text-sm font-bold text-slate-900">Maintenance Cost by Department</h3><p className="text-xs text-slate-400 mt-0.5">₹ Thousands · YTD 2026</p></div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptCost} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={65} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="cost" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Machine Availability KPIs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Overall Availability", value: "89.3%", sub: "Target: 95%", color: "text-amber-600" },
            { label: "MTBF", value: "342 hrs", sub: "Mean Time Between Failures", color: "text-blue-600" },
            { label: "MTTR", value: "4.8 hrs", sub: "Mean Time To Repair", color: "text-slate-600" },
            { label: "OEE", value: "76.4%", sub: "Overall Equipment Effectiveness", color: "text-emerald-600" },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs font-bold text-slate-700 mb-1">{kpi.label}</div>
              <div className="text-[10px] text-slate-400">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7. MACHINE MAP ────────────────────────────────────────────────────────────

function MachineMapTab({ onViewDetails }: { onViewDetails: (m: MachineRecord) => void }) {
  const [hovered, setHovered] = useState<MachineRecord | null>(null);

  const zones = [
    { label: "Production Floor", x: 5, y: 5, w: 45, h: 55, fill: "#EFF6FF", stroke: "#BFDBFE" },
    { label: "IT / Data Center", x: 55, y: 5, w: 40, h: 40, fill: "#F0FDF4", stroke: "#BBF7D0" },
    { label: "Warehouse", x: 55, y: 50, w: 25, h: 35, fill: "#FFFBEB", stroke: "#FDE68A" },
    { label: "Quality Lab", x: 80, y: 50, w: 15, h: 35, fill: "#F5F3FF", stroke: "#DDD6FE" },
    { label: "Engineering", x: 5, y: 65, w: 45, h: 30, fill: "#FFF7ED", stroke: "#FED7AA" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-sm font-bold text-slate-900">Factory Floor Layout</h3><p className="text-xs text-slate-400 mt-0.5">Click a machine to view details · Hover for quick info</p></div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
          {[["#10B981","Healthy"],["#F59E0B","Warning"],["#EF4444","Critical"],["#3B82F6","Maintenance"],["#94A3B8","Offline"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />{l}</div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden" style={{ paddingTop: "56%" }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="mchGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.15" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#mchGrid)" />
            {zones.map((z, i) => (
              <g key={i}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill} stroke={z.stroke} strokeWidth="0.5" rx="1.5" />
                <text x={z.x + z.w / 2} y={z.y + 3} textAnchor="middle" fontSize="2" fill="#94A3B8" fontWeight="700" fontFamily="sans-serif">{z.label}</text>
              </g>
            ))}
            {MACHINES.map(machine => {
              const cfg = mchStatusCfg(machine.status);
              const isHov = hovered?.id === machine.id;
              return (
                <g key={machine.id}
                  onMouseEnter={() => setHovered(machine)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onViewDetails(machine)}
                  style={{ cursor: "pointer" }}
                >
                  {isHov && <circle cx={machine.floorX} cy={machine.floorY} r="5" fill={cfg.hex} opacity="0.15" />}
                  <circle cx={machine.floorX} cy={machine.floorY} r={isHov ? "2.8" : "2.2"} fill={cfg.hex} stroke="white" strokeWidth="0.5" />
                  {machine.status === "Critical" && (
                    <circle cx={machine.floorX} cy={machine.floorY} r="2.2" fill={cfg.hex} opacity="0.4">
                      <animate attributeName="r" from="2.2" to="5" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text x={machine.floorX} y={machine.floorY + 5} textAnchor="middle" fontSize="1.7" fill="#64748B" fontFamily="monospace">{machine.id.split("-").slice(1).join("-")}</text>
                </g>
              );
            })}
          </svg>

          {hovered && (
            <div className="absolute top-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-52 z-10">
              <div className="text-xs font-bold text-slate-900 mb-1">{hovered.name}</div>
              <div className="text-[10px] font-mono text-slate-400 mb-2">{hovered.id}</div>
              <MchStatusBadge status={hovered.status} />
              <div className="mt-2.5 text-[10px] text-slate-500"><MapPin size={9} className="inline mr-1" />{hovered.location}</div>
              <div className="mt-2"><HealthBar value={hovered.health} /></div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1"><UserCheck size={9} />{hovered.user}</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
          {zones.map((z, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className="w-3 h-3 rounded border" style={{ backgroundColor: z.fill, borderColor: z.stroke }} />
              {z.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {MACHINES.map(m => {
          const cfg = mchStatusCfg(m.status);
          return (
            <button key={m.id} onClick={() => onViewDetails(m)} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
              <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{m.name.split("–")[0].trim()}</div>
                <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 8. QR CODE & ASSET LABELS ────────────────────────────────────────────────

function QRPattern({ seed }: { seed: string }) {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const sz = 10;
  const cells = Array.from({ length: sz }, (_, r) =>
    Array.from({ length: sz }, (_, c) => {
      if ((r < 3 && c < 3) || (r < 3 && c >= sz - 3) || (r >= sz - 3 && c < 3)) return true;
      return (r * sz + c + hash) % 3 !== 0;
    })
  );
  return (
    <svg viewBox={`0 0 ${sz} ${sz}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={sz} height={sz} fill="white" />
      {cells.flatMap((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0F172A" /> : null))}
    </svg>
  );
}

function QRCodeLabelsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">Asset QR Labels</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">{MACHINES.length} machines</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={13} /> Export PDF
          </button>
          <button className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Printer size={13} /> Print All Labels
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MACHINES.map(machine => {
          const cfg = mchStatusCfg(machine.status);
          const isSel = selectedId === machine.id;
          return (
            <div key={machine.id} onClick={() => setSelectedId(isSel ? null : machine.id)}
              className={`bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${isSel ? "border-blue-500" : "border-slate-200 hover:border-slate-300"}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
                      <Monitor size={12} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-600 leading-none">Rajaram Consumer Care</div>
                      <div className="text-[8px] text-slate-400 leading-none mt-0.5">RCC OMP · Asset Label</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {machine.status === "Under Maintenance" ? "MAINT" : machine.status === "Offline" ? "OFFLINE" : machine.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="w-20 h-20 shrink-0 border border-slate-200 rounded-lg overflow-hidden p-1 bg-white">
                    <QRPattern seed={machine.id} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs font-bold text-slate-900 leading-snug">{machine.name}</div>
                    <div className="space-y-0.5">
                      {[
                        ["Asset ID", machine.assetId],
                        ["Machine", machine.id],
                        ["Dept.", machine.department.split(" ")[0]],
                        ["S/N", machine.serialNumber.slice(-10)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-baseline gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase w-12 shrink-0">{label}</span>
                          <span className="text-[9px] font-mono text-slate-700 truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[9px] text-slate-500 flex items-center gap-1">
                  <MapPin size={9} className="shrink-0" />
                  <span className="truncate">{machine.location}</span>
                </div>
              </div>

              {isSel && (
                <div className="border-t border-blue-200 px-4 py-2 bg-blue-50 rounded-b-xl flex gap-3">
                  <button className="flex-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors text-center">Print Label</button>
                  <div className="w-px bg-blue-200" />
                  <button className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 transition-colors text-center">Download PNG</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MACHINES MAIN CONTENT ─────────────────────────────────────────────────────

type MachinesTab = "dashboard" | "inventory" | "details" | "history";

export default function MachinesPage() {
  const [activeTab, setActiveTab] = useState<MachinesTab>("dashboard");
  const [selectedMachine, setSelectedMachine] = useState<MachineRecord | null>(null);

  const handleViewDetails = (machine: MachineRecord) => {
    setSelectedMachine(machine);
    setActiveTab("details");
  };

  const TABS: { id: MachinesTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "dashboard",  label: "Dashboard",        icon: LayoutDashboard },
    { id: "inventory",  label: "Machine Inventory", icon: Table2 },
    { id: "details",    label: "Machine Details",   icon: Info },
    { id: "history",    label: "Maint. History",    icon: Clock },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Machines Management</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Machines Management</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monitor, manage and maintain all plant & IT infrastructure assets · {MACHINES.length} machines registered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={13} /> Export
            </button>
            <button className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> Add Machine
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  isActive ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}>
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-200">
        {activeTab === "dashboard"  && <MachineDashboardTab />}
        {activeTab === "inventory"  && <MachineInventoryTab onViewDetails={handleViewDetails} />}
        {activeTab === "details"    && <MachineDetailsTab machine={selectedMachine} onGoToInventory={() => setActiveTab("inventory")} />}
        {activeTab === "history"    && <MachineMaintenanceHistoryTab />}
      </div>
    </div>
  );
}
