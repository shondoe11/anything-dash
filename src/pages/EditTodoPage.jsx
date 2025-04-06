import { useEffect, useState } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchAirtableData, editDataInAirtable, deleteDataFromAirtable } from '../services/service';

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
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <Card key={task.id} className="mb-3 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              {editTaskId === task.id ? (
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <Form.Control
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="me-2"
                  />
                  <Form.Control
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="me-2"
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleEdit(task.id)}
                    disabled={isLoading}
                  >
                    <i className="fa-regular fa-floppy-disk"></i>
                  </Button>
                </div>
              ) : (
                <div className="flex-grow-1">
                  <span className="fw-medium">{task.Tasks}</span>
                  {task['Due Date'] && <span className="ms-2 text-muted"> (Due: {task['Due Date']})</span>}
                </div>
              )}
              <div className="d-flex gap-2">
                <Button
                  variant={task.Status === 'Completed' ? "success" : "outline-success"}
                  size="sm"
                  onClick={() => handleDone(task.id)}
                  disabled={isLoading}
                >
                  {task.Status === 'Completed' ? (
                    <i className="fa-regular fa-square-check"></i>
                  ) : (
                    <i className="fa-regular fa-square"></i>
                  )}
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setEditTaskId(task.id);
                    setEditTask(task.Tasks);
                    setEditDueDate(task['Due Date'] || '');
                  }}
                  disabled={isLoading}
                >
                  <i className="fa-regular fa-pen-to-square"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                  disabled={isLoading}
                >
                  <i className="fa-solid fa-trash"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="alert alert-info">No tasks found.</div>
      )}
    </Container>
  );
}
