import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchAirtableData, editDataInAirtable, deleteDataFromAirtable } from '../services/service';
import styles from '../widgets/Todo/TodoWidget.module.css';

export default function EditTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAirtableData();
      data.reverse();
      const formattedTasks = data.map(record => ({
        id: record.id,
        ...record.fields
      }));
      setTasks(formattedTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks. Please try again.');
      console.error('fetch tasks FAIL', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!id) return;
    setIsLoading(true);
    try {
      await editDataInAirtable(id, {
        Tasks: editTask,
        'Due Date': editDueDate || null,
      });
      setEditTaskId(null);
      setEditTask('');
      setEditDueDate('');
      refreshTasks();
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task. Please try again.');
      console.error('update task FAILED:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await deleteDataFromAirtable(id);
      refreshTasks();
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task. Please try again.');
      console.error('delete task FAILED:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = async (id) => {
    setIsLoading(true);
    try {
      await editDataInAirtable(id, { Status: 'Completed' });
      refreshTasks();
      toast.success('Task marked as completed!');
    } catch (error) {
      toast.error('Failed to mark task as completed. Please try again.');
      console.error('mark task complete FAILED:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <h1>Edit Current Tasks</h1>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className={styles['task-item']}>
            {editTaskId === task.id ? (
              <div className={styles['edit-container']}>
                <input
                  className={styles['edit-input']}
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                />
                <input
                  className={styles['edit-date']}
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
                <button
                  className={styles['edit-button']}
                  onClick={() => handleEdit(task.id)}
                  disabled={isLoading}
                >
                  <i className="fa-regular fa-floppy-disk"></i>
                </button>
              </div>
            ) : (
              <div>
                <span>{task.Tasks}</span>
                {task['Due Date'] && <span> (Due: {task['Due Date']})</span>}
              </div>
            )}
            <div className={styles['button-group']}>
              <button
                className={styles['done-button']}
                onClick={() => handleDone(task.id)}
                disabled={isLoading}
              >
                {task.Status === 'Completed' ? (
                  <i className="fa-regular fa-square-check"></i>
                ) : (
                  <i className="fa-regular fa-square"></i>
                )}
              </button>
              <button
                className={styles['edit-button']}
                onClick={() => {
                  setEditTaskId(task.id);
                  setEditTask(task.Tasks);
                  setEditDueDate(task['Due Date'] || '');
                }}
                disabled={isLoading}
              >
                <i className="fa-regular fa-pen-to-square"></i>
              </button>
              <button
                className={styles['delete-button']}
                onClick={() => handleDelete(task.id)}
                disabled={isLoading}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div>No tasks found.</div>
      )}
    </Container>
  );
}
