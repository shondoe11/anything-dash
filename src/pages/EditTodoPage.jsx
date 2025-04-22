import { useEffect, useState } from 'react';
import { Container, Form, Button, Card, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchAirtableData, editDataInAirtable, deleteDataFromAirtable } from '../services/service';
import { useAuth } from '../context/AuthContext';

export default function EditTasksPage() {
  const { userRecordId, netlifyUser, login } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (userRecordId) refreshTasks();
  }, [userRecordId]);

  const refreshTasks = async () => {
    if (!userRecordId) { login(); return; }
    setIsLoading(true);
    try {
      const data = await fetchAirtableData(userRecordId, netlifyUser.email);
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

  //& toggle task complete status
  const handleDone = async (id, status) => {
    setIsLoading(true);
    toast.info(status === 'Completed'
      ? 'Marking task as incomplete...'
      : 'Marking task as completed...', { autoClose: false });
    try {
      const newStatus = status === 'Completed' ? 'New' : 'Completed';
      await editDataInAirtable(id, { Status: newStatus });
      refreshTasks();
      toast.success(`Task marked as ${newStatus === 'Completed' ? 'completed' : 'incomplete'}!`);
    } catch (error) {
      toast.error(`Failed to mark task as ${status === 'Completed' ? 'incomplete' : 'completed'}. Please try again.`);
      console.error('toggle task status FAILED:', error);
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  return (
    <Container className="my-4 slide-up">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="mb-0 fw-bold">Manage Tasks</h1>
            <div>
              <Badge bg="primary" className="me-2 fs-6 py-2 px-3">
                <i className="fa-solid fa-tasks me-1"></i> {tasks.length} Tasks
              </Badge>
              <Badge bg={isLoading ? "warning" : "success"} className="fs-6 py-2 px-3">
                {isLoading ? "Syncing..." : "Up to date"}
              </Badge>
            </div>
          </div>
          <p className="text-muted mt-2">Edit, complete, or delete your current tasks</p>
        </Col>
      </Row>
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" className="spinner-3rem">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Fetching your tasks...</p>
        </div>
      ) : tasks.length > 0 ? (
        <Row>
          {tasks.map((task) => (
            <Col xs={12} key={task.id} className="mb-3">
              <Card 
                className={`border-0 shadow-sm widget-card transition-card ${task.Status === 'Completed' ? 'border-left-success' : 'border-left-primary'}`}  
              >
                <Card.Body className="p-0">
                  <Row className="g-0">
                    <Col xs={editTaskId === task.id ? 12 : 9} className="p-3">
                      {editTaskId === task.id ? (
                        <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                          <Form.Group className="mb-2 mb-md-0 flex-grow-1">
                            <Form.Label className="small text-muted mb-1">Task Description</Form.Label>
                            <Form.Control
                              value={editTask}
                              onChange={(e) => setEditTask(e.target.value)}
                              placeholder="Enter task description"
                              className="border-0 shadow-sm"
                            />
                          </Form.Group>
                          <Form.Group className="mb-2 mb-md-0 ms-md-2 form-minwide">
                            <Form.Label className="small text-muted mb-1">Due Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="border-0 shadow-sm"
                            />
                          </Form.Group>
                          <div className="ms-md-2 mt-2 mt-md-0 d-flex">
                            <Button
                              variant="success"
                              className="py-2 px-3"
                              onClick={() => handleEdit(task.id)}
                              disabled={isLoading}
                            >
                              <i className="fa-regular fa-floppy-disk me-2"></i> Save
                            </Button>
                            <Button
                              variant="secondary"
                              className="py-2 px-3 ms-2"
                              onClick={() => {
                                setEditTaskId(null);
                                setEditTask('');
                                setEditDueDate('');
                              }}
                              disabled={isLoading}
                            >
                              Go Back
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-1">
                          <div className="d-flex align-items-start mb-1">
                            {task.Status === 'Completed' ? (
                              <Badge bg="success" className="me-2 py-1 px-2">Completed</Badge>
                            ) : (
                              task['Due Date'] && new Date(task['Due Date']) < new Date() ? (
                                <Badge bg="danger" className="me-2 py-1 px-2">Overdue</Badge>
                              ) : (
                                <Badge bg="info" className="me-2 py-1 px-2">Active</Badge>
                              )
                            )}
                            <h5 className="fw-bold mb-1" style={task.Status === 'Completed' ? {textDecoration: 'line-through', opacity: 0.6} : {}}>
                              {task.Tasks}
                            </h5>
                          </div>
                          {task['Due Date'] && (
                            <div className="text-muted small">
                              <i className="fa-regular fa-calendar me-1"></i> Due: {task['Due Date']}
                            </div>
                          )}
                        </div>
                      )}
                    </Col>
                    
                    {editTaskId !== task.id && (
                      <Col xs={3} className="p-3 d-flex align-items-center justify-content-end">
                        <div className="d-flex align-items-start gap-2">
                          <Button
                            variant={task.Status === 'Completed' ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => handleDone(task.id, task.Status)}
                            disabled={isLoading}
                            title={task.Status === 'Completed' ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {task.Status === 'Completed' ? (
                              <i className="fa-solid fa-rotate-left"></i>
                            ) : (
                              <i className="fa-regular fa-square"></i>
                            )}
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => {
                              setEditTaskId(task.id);
                              setEditTask(task.Tasks);
                              setEditDueDate(task['Due Date'] || '');
                            }}
                            disabled={isLoading}
                            title="Edit task"
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => handleDelete(task.id)}
                            disabled={isLoading}
                            title="Delete task"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </Button>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fa-regular fa-clipboard text-muted icon-large"></i>
          </div>
          <h4 className="text-muted mb-3">No tasks found</h4>
          <p className="text-muted">You don&apos;t have any tasks yet. Create a new task to get started.</p>
          <Button variant="primary" as="a" href="/todo/new">
            <i className="fa-solid fa-plus me-2"></i> Create New Task
          </Button>
        </div>
      )}
    </Container>
  );
}
