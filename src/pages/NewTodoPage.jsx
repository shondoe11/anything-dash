import { useState } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { postDataToAirtable } from '../services/service';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function NewTaskPage() {
  const { userRecordId, login } = useAuth();
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!userRecordId) { login(); return; }
    if (!newTask) {
      toast.error('Please enter a task name.');
      return;
    }
    setIsLoading(true);
    toast.info('Adding task...', { autoClose: false });
    try {
      await postDataToAirtable(userRecordId, {
        Tasks: newTask,
        Status: 'New',
        'Due Date': dueDate || null,
      });
      toast.success('Task added successfully!');
      //~ reset form fields aft submit success
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
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1>Create New Task</h1>
        <Button as={Link} to="/todo" variant="secondary" size="sm">Go Back</Button>
      </div>
      <Card className="shadow-sm border-0 p-0">
        <Card.Body>
          <Form onSubmit={handleAdd}>
            <Form.Group className="mb-3">
              <Form.Label>Task Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Add a New Task [required]"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select Due Date (optional):</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
              />
            </Form.Group>
            <Button className="w-100" variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Adding...</span>
                </>
              ) : (
                'Create'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
