import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Lock,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function StatusBadge({ status = 'untested', size = 'md' }) {
  const norm = String(status).toLowerCase();

  let className = 'badge-untested';
  let Icon = Clock;
  let label = status;

  if (norm === 'passed' || norm === 'pass' || norm === 'resolved' || norm === 'verified') {
    className = 'badge-passed';
    Icon = CheckCircle2;
  } else if (norm === 'failed' || norm === 'fail' || norm === 'open') {
    className = 'badge-failed';
    Icon = XCircle;
  } else if (norm === 'skipped' || norm === 'skip' || norm === 'reopened') {
    className = 'badge-skipped';
    Icon = AlertTriangle;
  } else if (norm === 'error' || norm === 'in progress') {
    className = 'badge-blocked';
    Icon = AlertOctagon;
  } else if (norm === 'blocked') {
    className = 'badge-blocked';
    Icon = Lock;
  } else if (norm === 'running' || norm === 'busy') {
    className = 'badge-running';
    Icon = Loader2;
  } else if (norm === 'not run' || norm === 'not_run' || norm === 'untested') {
    className = 'badge-untested';
    Icon = Clock;
    label = 'Not Run';
  }

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`badge ${className}`} style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
      <Icon size={iconSize} className={norm === 'running' ? 'spin-icon' : ''} />
      <span>{label}</span>
    </span>
  );
}
