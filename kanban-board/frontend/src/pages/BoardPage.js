import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import Navbar from '../components/Layout/Navbar';
import KanbanList from '../components/Board/KanbanList';
import TaskModal from '../components/Board/TaskModal';
import InviteMemberModal from '../components/Board/InviteMemberModal';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [taskModal, setTaskModal] = useState(null); // { task?, listId }
  const [showInvite, setShowInvite] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);

  // ─── Fetch board data ──────────────────────────────────────────────────────
  const fetchBoard = useCallback(async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data.board);
      setLists(res.data.lists);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        setError('Board not found or access denied.');
      } else {
        setError('Failed to load board.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // ─── Socket.IO real-time events ───────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;

    socket.emit('join-board', id);

    const handleTaskCreated = (task) => {
      setLists((prev) =>
        prev.map((l) =>
          l._id === task.list.toString()
            ? { ...l, tasks: [...l.tasks, task] }
            : l
        )
      );
    };

    const handleTaskUpdated = (task) => {
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          tasks: l.tasks.map((t) => (t._id === task._id ? task : t)),
        }))
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          tasks: l.tasks.filter((t) => t._id !== taskId),
        }))
      );
    };

    const handleTasksReordered = ({ tasks }) => {
      setLists((prev) => {
        const updated = prev.map((l) => ({ ...l, tasks: [...l.tasks] }));
        tasks.forEach(({ _id, list, position }) => {
          updated.forEach((l) => {
            l.tasks = l.tasks.filter((t) => t._id !== _id);
          });
          const targetList = updated.find((l) => l._id === list);
          if (targetList) {
            targetList.tasks.splice(position, 0, { _id, list, position });
          }
        });
        return updated;
      });
      // Refetch for clean state after remote reorder
      fetchBoard();
    };

    const handleListCreated = (list) => {
      setLists((prev) => {
        if (prev.find((l) => l._id === list._id)) return prev;
        return [...prev, { ...list, tasks: [] }];
      });
    };

    const handleListUpdated = (updatedList) => {
      setLists((prev) =>
        prev.map((l) =>
          l._id === updatedList._id ? { ...l, title: updatedList.title } : l
        )
      );
    };

    const handleListDeleted = ({ listId }) => {
      setLists((prev) => prev.filter((l) => l._id !== listId));
    };

    const handleMemberAdded = ({ boardId, member }) => {
      if (boardId === id) {
        setBoard((prev) => ({
          ...prev,
          members: [...(prev.members || []), member],
        }));
      }
    };

    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-deleted', handleTaskDeleted);
    socket.on('tasks-reordered', handleTasksReordered);
    socket.on('list-created', handleListCreated);
    socket.on('list-updated', handleListUpdated);
    socket.on('list-deleted', handleListDeleted);
    socket.on('board-member-added', handleMemberAdded);

    return () => {
      socket.emit('leave-board', id);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-deleted', handleTaskDeleted);
      socket.off('tasks-reordered', handleTasksReordered);
      socket.off('list-created', handleListCreated);
      socket.off('list-updated', handleListUpdated);
      socket.off('list-deleted', handleListDeleted);
      socket.off('board-member-added', handleMemberAdded);
    };
  }, [id, fetchBoard]);

  // ─── Drag and Drop ────────────────────────────────────────────────────────
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceList = lists.find((l) => l._id === source.droppableId);
    const destList = lists.find((l) => l._id === destination.droppableId);
    if (!sourceList || !destList) return;

    // Optimistic update
    const newLists = lists.map((l) => ({ ...l, tasks: [...l.tasks] }));
    const srcList = newLists.find((l) => l._id === source.droppableId);
    const dstList = newLists.find((l) => l._id === destination.droppableId);

    const [movedTask] = srcList.tasks.splice(source.index, 1);
    movedTask.list = destination.droppableId;
    dstList.tasks.splice(destination.index, 0, movedTask);

    setLists(newLists);

    // Build reorder payload
    const tasksToUpdate = [];
    dstList.tasks.forEach((t, i) => {
      tasksToUpdate.push({ _id: t._id, list: destination.droppableId, position: i });
    });
    if (source.droppableId !== destination.droppableId) {
      srcList.tasks.forEach((t, i) => {
        tasksToUpdate.push({ _id: t._id, list: source.droppableId, position: i });
      });
    }

    try {
      await api.patch('/tasks/reorder', { tasks: tasksToUpdate, boardId: id });
    } catch (err) {
      // Revert on failure
      fetchBoard();
    }
  };

  // ─── List CRUD ────────────────────────────────────────────────────────────
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      await api.post('/lists', { title: newListTitle.trim(), boardId: id });
      setNewListTitle('');
      setShowAddList(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Delete this list and all its tasks?')) return;
    try {
      await api.delete(`/lists/${listId}`);
    } catch (err) {
      alert('Failed to delete list');
    }
  };

  const handleRenameList = async (listId, title) => {
    try {
      await api.patch(`/lists/${listId}`, { title });
    } catch (err) {
      alert('Failed to rename list');
    }
  };

  // ─── Task CRUD ────────────────────────────────────────────────────────────
  const handleAddTask = async (listId, title) => {
    try {
      await api.post('/tasks', { title, listId, boardId: id });
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleTaskSaved = (task, isEdit) => {
    // Socket handles state update; just close modal
    setTaskModal(null);
  };

  const handleTaskDeleted = (taskId) => {
    setTaskModal(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Loading board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="board-page">
      <Navbar />

      {/* Board header */}
      <div className="board-header" style={{ '--board-color': board?.background || '#6366f1' }}>
        <div className="board-header-inner">
          <div className="board-header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
            <div>
              <h2 className="board-title">{board?.title}</h2>
              {board?.description && (
                <p className="board-desc">{board.description}</p>
              )}
            </div>
          </div>
          <div className="board-header-right">
            <div className="board-members-row">
              {board?.members?.slice(0, 5).map((m, i) => (
                <img
                  key={m.user?._id || i}
                  src={m.user?.avatar}
                  alt={m.user?.name}
                  className="avatar"
                  width={30}
                  height={30}
                  title={m.user?.name}
                  style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i, border: '2px solid var(--bg)' }}
                />
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(true)}>
              + Invite
            </button>
          </div>
        </div>
      </div>

      {/* Board canvas */}
      <div className="board-canvas">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lists-container">
            {lists.map((list) => (
              <KanbanList
                key={list._id}
                list={list}
                onAddTask={handleAddTask}
                onEditTask={(task, listId) => setTaskModal({ task, listId })}
                onDeleteList={handleDeleteList}
                onRenameList={handleRenameList}
              />
            ))}

            {/* Add list */}
            <div className="add-list-wrapper">
              {showAddList ? (
                <form className="add-list-form" onSubmit={handleAddList}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="List name…"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    autoFocus
                    maxLength={100}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>
                      Add List
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: 13, padding: '7px 12px' }}
                      onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                    >
                      ✕
                    </button>
                  </div>
                </form>
              ) : (
                <button className="add-list-btn" onClick={() => setShowAddList(true)}>
                  + Add another list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {taskModal && (
        <TaskModal
          task={taskModal.task || null}
          listId={taskModal.listId}
          boardId={id}
          members={board?.members}
          onClose={() => setTaskModal(null)}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showInvite && (
        <InviteMemberModal
          boardId={id}
          members={board?.members}
          onClose={() => setShowInvite(false)}
          onInvited={(updatedBoard) => setBoard(updatedBoard)}
        />
      )}
    </div>
  );
};

export default BoardPage;
