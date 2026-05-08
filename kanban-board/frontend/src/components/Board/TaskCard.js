import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import './TaskCard.css';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#a855f7',
};

const LABEL_COLORS = {
  bug: '#ef4444',
  feature: '#6366f1',
  improvement: '#10b981',
  docs: '#0ea5e9',
  design: '#a855f7',
  testing: '#f59e0b',
};

const TaskCard = ({ task, index, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-card${snapshot.isDragging ? ' task-card--dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          {/* Priority stripe */}
          <div
            className="task-priority-stripe"
            style={{ background: PRIORITY_COLORS[task.priority] }}
          />

          <div className="task-card-body">
            {/* Labels */}
            {task.labels?.length > 0 && (
              <div className="task-labels">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="task-label"
                    style={{ background: `${LABEL_COLORS[label]}22`, color: LABEL_COLORS[label] }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            <p className="task-title">{task.title}</p>

            {task.description && (
              <p className="task-desc">{task.description}</p>
            )}

            <div className="task-meta">
              {dueDateStr && (
                <span className={`task-due${isOverdue ? ' task-due--overdue' : ''}`}>
                  📅 {dueDateStr}
                </span>
              )}

              {task.assignee && (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="avatar task-assignee"
                  width={22}
                  height={22}
                  title={task.assignee.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
