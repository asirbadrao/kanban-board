import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import './KanbanList.css';

const KanbanList = ({ list, onAddTask, onEditTask, onDeleteList, onRenameList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(list._id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    onRenameList(list._id, renameValue.trim());
    setIsRenaming(false);
  };

  return (
    <div className="kanban-list">
      {/* List header */}
      <div className="list-header">
        {isRenaming ? (
          <form onSubmit={handleRename} style={{ flex: 1 }}>
            <input
              className="list-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              onBlur={handleRename}
              maxLength={100}
            />
          </form>
        ) : (
          <button
            className="list-title-btn"
            onClick={() => setIsRenaming(true)}
            title="Click to rename"
          >
            {list.title}
            <span className="task-count">{list.tasks?.length || 0}</span>
          </button>
        )}

        <button
          className="list-delete-btn"
          onClick={() => onDeleteList(list._id)}
          title="Delete list"
        >
          ×
        </button>
      </div>

      {/* Droppable task area */}
      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            className={`task-drop-zone${snapshot.isDraggingOver ? ' task-drop-zone--over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {list.tasks?.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onEditTask(task, list._id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task */}
      {isAdding ? (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <textarea
            className="add-task-input"
            placeholder="Task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            rows={2}
            maxLength={200}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask(e);
              }
              if (e.key === 'Escape') setIsAdding(false);
            }}
          />
          <div className="add-task-actions">
            <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }}>
              Add
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 13, padding: '6px 10px' }}
              onClick={() => { setIsAdding(false); setNewTitle(''); }}
            >
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          + Add a task
        </button>
      )}
    </div>
  );
};

export default KanbanList;
