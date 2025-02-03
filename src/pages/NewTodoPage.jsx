import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { postDataToAirtable } from '../services/service';
import styles from '../widgets/Todo/TodoWidget.module.css';

export default function NewTaskPage() {
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask) {
      toast.error('Please enter a task name.');
      return;
    }
    setIsLoading(true);
    toast.info('Adding task...', { autoClose: false });
    try {
      await postDataToAirtable({
        Tasks: newTask,
        Status: 'New',
        'Due Date': dueDate || null,
      });
      toast.success('Task added successfully!');
      // reset form fields after successful submission
      setNewTask('');
      setDueDate('');
    } catch (error) {
      toast.error('Failed to add task. Please try again.');
      console.error('add task FAILED:', error);
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  return (
    <Container className="my-4">
      <h1>Create New Task</h1>
      <div className={styles['todo-widget']}>
        <form onSubmit={handleAdd}>
          <div className={styles['input-group']}>
            <label>Task Name:</label>
            <input
              type="text"
              placeholder="Add a New Task [required]"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className={styles['input-group']}>
            <label>Select Due Date (optional):</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button className={styles['add-button']} type="submit" disabled={isLoading}>
            <span>{isLoading ? 'Adding...' : 'Create'}</span>
          </button>
        </form>
      </div>
    </Container>
  );
}
