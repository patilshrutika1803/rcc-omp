import { useState } from "react";
import { toast } from "sonner";
import type { BackupJob, BackupJobFormData, BackupSubTab } from "../types/backup";
import { BACKUP_JOBS } from "../constants/backupConstants";

export function useBackupActivities() {
  const [subTab, setSubTab] = useState<BackupSubTab>("dashboard");
  const [jobs, setJobs] = useState<BackupJob[]>(BACKUP_JOBS);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<BackupJob | null>(null);
  const [runConfirmJob, setRunConfirmJob] = useState<BackupJob | null>(null);
  const [showRunAll, setShowRunAll] = useState(false);
  const [runAllProgress, setRunAllProgress] = useState<number | null>(null);

  const openJob = (j: BackupJob) => {
    const latest = jobs.find(jj => jj.id === j.id) ?? j;
    setSelectedJob(latest);
    setShowDrawer(true);
  };
  const closeDrawer = () => setShowDrawer(false);

  const handleAddJob = (data: BackupJobFormData) => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextBackup = `${nextDate.toISOString().split("T")[0]} ${data.backupTime}`;
    const newJob: BackupJob = {
      id: `BK-${Date.now()}`,
      name: data.name, server: "",
      backupType: data.backupType, frequency: data.frequency,
      lastBackup: "—", nextBackup,
      status: "Scheduled", progress: 0,
      user: data.user, sizeGB: 0,
      destination: data.destination, retention: "30 Days", duration: "—",
      department: data.department, lastVerified: "—",
      recoveryPoints: 0, compressionRatio: "—",
      quota: data.quota, description: data.description, history: [],
    };
    setJobs(prev => [...prev, newJob]);
    setShowAddModal(false);
    toast.success(`Backup job "${data.name}" created successfully.`);
  };

  const handleEditJob = (data: BackupJobFormData) => {
    if (!editingJob) return;
    const update = (j: BackupJob): BackupJob => j.id !== editingJob.id ? j : {
      ...j, name: data.name, department: data.department,
      backupType: data.backupType, frequency: data.frequency,
      destination: data.destination, user: data.user,
      quota: data.quota, description: data.description,
    };
    setJobs(prev => prev.map(update));
    if (selectedJob?.id === editingJob.id) setSelectedJob(prev => prev ? update(prev) : null);
    setEditingJob(null);
    toast.success("Backup job updated successfully.");
  };

  const confirmRunNow = (j: BackupJob) => {
    setShowDrawer(false);
    setRunConfirmJob(j);
  };

  const executeRunNow = () => {
    const j = runConfirmJob;
    if (!j) return;
    setRunConfirmJob(null);
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace("T", " ");
    setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, status: "Running", progress: 0 } : jj));

    let prog = 0;
    const tick = setInterval(() => {
      prog = Math.min(prog + Math.floor(Math.random() * 20) + 8, 100);
      if (prog >= 100) {
        clearInterval(tick);
        setJobs(prev => prev.map(jj => jj.id !== j.id ? jj : {
          ...jj, status: "Completed", progress: 100, lastBackup: now, nextBackup: tomorrow,
          history: [{ date: now, status: "Completed", duration: "12m", sizeGB: jj.sizeGB || 0 }, ...jj.history.slice(0, 9)],
        }));
        if (selectedJob?.id === j.id) setSelectedJob(prev => prev ? { ...prev, status: "Completed", progress: 100, lastBackup: now } : null);
        toast.success(`"${j.name}" completed successfully.`);
      } else {
        setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, progress: prog } : jj));
      }
    }, 500);
  };

  const executeRunAll = () => {
    setShowRunAll(false);
    setRunAllProgress(0);
    const total = jobs.length;
    let done = 0;
    jobs.forEach((j, idx) => {
      setTimeout(() => {
        done++;
        const now = new Date().toISOString().slice(0, 16).replace("T", " ");
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace("T", " ");
        setRunAllProgress(Math.round((done / total) * 100));
        setJobs(prev => prev.map(jj => jj.id !== j.id ? jj : {
          ...jj, status: "Completed", progress: 100, lastBackup: now, nextBackup: tomorrow,
          history: [{ date: now, status: "Completed", duration: "15m", sizeGB: jj.sizeGB || 0 }, ...jj.history.slice(0, 9)],
        }));
        if (done === total) setTimeout(() => { setRunAllProgress(null); toast.success("All backup jobs completed successfully."); }, 600);
      }, idx * 400);
    });
  };

  const handleDuplicate = (j: BackupJob) => {
    const newJob: BackupJob = { ...j, id: `BK-${Date.now()}`, name: `${j.name} (Copy)`, status: "Scheduled", progress: 0, lastBackup: "—", history: [] };
    setJobs(prev => [...prev, newJob]);
    toast.success(`Duplicated "${j.name}".`);
  };

  const handleDelete = (j: BackupJob) => {
    setJobs(prev => prev.filter(jj => jj.id !== j.id));
    if (selectedJob?.id === j.id) setShowDrawer(false);
    toast.success(`Backup job "${j.name}" deleted.`);
  };

  return {
    // sub-tab
    subTab, setSubTab,
    // jobs
    jobs, setJobs,
    // drawer
    selectedJob, showDrawer, openJob, closeDrawer,
    // add/edit modal
    showAddModal, setShowAddModal,
    editingJob, setEditingJob,
    // run confirm
    runConfirmJob, setRunConfirmJob, confirmRunNow, executeRunNow,
    // run all
    showRunAll, setShowRunAll, runAllProgress, executeRunAll,
    // CRUD
    handleAddJob, handleEditJob, handleDuplicate, handleDelete,
  };
}
