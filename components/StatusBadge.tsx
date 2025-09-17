
import React from 'react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
}

const statusColors: Record<Status, string> = {
  [Status.Draft]: 'bg-slate-100 text-slate-800',
  [Status.InReview]: 'bg-yellow-100 text-yellow-800',
  [Status.Approved]: 'bg-green-100 text-green-800',
  [Status.Archived]: 'bg-gray-100 text-gray-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
