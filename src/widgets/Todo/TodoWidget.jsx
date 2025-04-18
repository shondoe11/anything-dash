import { useEffect, useState } from "react";
import { deleteDataFromAirtable, fetchAirtableData, postDataToAirtable, editDataInAirtable } from "../../services/service";
import { toast } from "react-toastify";
import { Card, Form, Button, Spinner, Badge, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { FaTasks, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

export default function TodoWidget({ expandedView: propExpandedView = false }) {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTask, setEditTask] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedView, setExpandedView] = useState(propExpandedView || false);

    //& fetch tasks on page load
    useEffect(() => {
        refreshTasks();
    }, []); //~ fetch tasks on mount only

    const refreshTasks = async () => {
        setIsLoading(true);
        toast.info('Fetching tasks...', {autoClose: false});
        try {
            const data = await fetchAirtableData();
            const today = new Date().toISOString().split('T')[0];
            const formattedTasks = data.map(record => ({
                id: record.id,
                ...record.fields,
                createdTime: record.createdTime
            }));
            setOverdueTasks(
                formattedTasks
                    .filter((task) => task.Status === 'New' && task['Due Date'] && task['Due Date'] < today)
                    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            );
            setTasks(
                formattedTasks
                    .filter((task) => task.Status === 'New' && (!task['Due Date'] || task['Due Date'] >= today))
                    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            );
            setCompletedTasks(
                formattedTasks
                    .filter((task) => task.Status === 'Completed')
                    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            );
        } catch (error) {
            toast.error('Failed to fetch tasks. Please try again.');
            console.error('fetch tasks FAIL ', error);
        } finally {
            setIsLoading(false); //~ always set loading state back false at end function
            toast.dismiss(); //~ dismiss toast loading
        }
    };

    const handleAdd = async () => {
        if (!newTask) {
            toast.error('Please enter a task name.');
            return;
        }
        setIsLoading(true);
        toast.info('Adding task...', {autoClose: false});
        try {
            await postDataToAirtable({
                Tasks: newTask, 
                Status: 'New',
                'Due Date': dueDate || null
            });
            setNewTask('');
            setDueDate('');
            //~ refresh tasks
            refreshTasks();
            toast.success('Task added successfully!');
        } catch (error) {
            toast.error('Failed to add task. Please try again.');
            console.error('add task FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };

    const handleEdit = async (id) => {
        if (!id) return;
        setIsLoading(true);
        toast.info('Updating task...', {autoClose: false});
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
            console.error('update task FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };

    //& marking task done
    const handleDone = async (id) => {
        setIsLoading(true);
        toast.info('Marking task as completed...', {autoClose: false});
        try {
            await editDataInAirtable(id, {Status: 'Completed'});
            refreshTasks();
            toast.success('Task marked as completed!');
        } catch (error) {
            toast.error('Failed to mark task as completed. Please try again.');
            console.error('mark task complete FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };
    
    //& mark completed task as incomplete
    const handleIncomplete = async (id) => {
        setIsLoading(true);
        toast.info('Marking task as incomplete...', {autoClose: false});
        try {
            await editDataInAirtable(id, {Status: 'New'});
            refreshTasks();
            toast.success('Task marked as incomplete!');
        } catch (error) {
            toast.error('Failed to mark task as incomplete. Please try again.');
            console.error('mark task incomplete FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };
    
    const handleDelete = async (id) => {
        setIsLoading(true);
        toast.info('Deleting task...', {autoClose: false});
        try {
            await deleteDataFromAirtable(id);
            refreshTasks();
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task. Please try again.');
            console.error('delete task FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    };

    return (
        <>
            <Card className="border-0 shadow-sm mb-4 widget-card overflow-hidden">
                <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4 gradient-header">
                    <div className="d-flex align-items-center">
                        <FaTasks className="text-white me-2 widget-icon" size={20} />
                        <h5 className="mb-0 text-white fw-bold">Todo Dashboard</h5>
                    </div>
                    <div>
                        <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                            <FaCalendarAlt className="me-1" size={12} />
                            {overdueTasks.length + tasks.length + completedTasks.length} Tasks
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Row className="g-0">
                        <Col md={12} lg={expandedView ? 12 : 5} className="p-4 border-end">
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                    <FaTasks className="me-2 text-primary" /> Add New Task
                                </h6>
                                <Form className="mb-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small text-muted">Task Name:</Form.Label>
                                        <Form.Control
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            placeholder="Add a New Task [required]"
                                            disabled={isLoading}
                                            className="border-0 shadow-sm"
                                            required 
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small text-muted d-flex align-items-center">
                                            <FaCalendarAlt className="me-2 text-primary" size={14} /> Select Due Date (optional):
                                        </Form.Label>
                                        <Form.Control 
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            disabled={isLoading}
                                            className="border-0 shadow-sm"
                                        />
                                    </Form.Group>
                                    <Button 
                                        variant="primary" 
                                        className="mt-2 w-100" 
                                        onClick={handleAdd}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-plus me-2"></i> Create Task
                                            </>
                                        )}
                                    </Button>
                                </Form>
                            </div>
                        </Col>
                        
                        <Col md={12} lg={expandedView ? 12 : 7} className="p-4">
                            <Tabs defaultActiveKey="active" className="mb-4 tabs-border-bottom">
                                <Tab 
                                    eventKey="active" 
                                    title={
                                        <div className="d-flex align-items-center">
                                            <FaTasks className="me-2" />
                                            <span>Active ({tasks.length})</span>
                                        </div>
                                    }
                                >
                                    <div className="pt-3">
                                        {isLoading ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" role="status" variant="primary" className="spinner-2rem">
                                                    <span className="visually-hidden">Loading tasks...</span>
                                                </Spinner>
                                                <p className="mt-3 text-muted">Loading tasks...</p>
                                            </div>
                                        ) : tasks.length > 0 ? (
                                            tasks.map((task) => (
                                                <Card key={task.id} className="mb-3 border-0 shadow-sm rounded-card transition-card">
                                                    <Card.Body className="p-3">
                                                        {editTaskId === task.id ? (
                                                            <Form className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                                                                <Form.Group className="mb-2 mb-md-0 flex-grow-1">
                                                                    <Form.Label className="small text-muted mb-1">Task Description</Form.Label>
                                                                    <Form.Control 
                                                                        className="border-0 shadow-sm"
                                                                        value={editTask}
                                                                        onChange={(e) => setEditTask(e.target.value)} 
                                                                        disabled={isLoading} 
                                                                    />
                                                                </Form.Group>
                                                                <Form.Group className="mb-2 mb-md-0 ms-md-2 form-minwide">
                                                                    <Form.Label className="small text-muted mb-1">Due Date</Form.Label>
                                                                    <Form.Control 
                                                                        className="border-0 shadow-sm"
                                                                        type="date"
                                                                        value={editDueDate}
                                                                        onChange={(e) => setEditDueDate(e.target.value)} 
                                                                        disabled={isLoading} 
                                                                    />
                                                                </Form.Group>
                                                                <div className="ms-md-2 mt-2 mt-md-0 d-flex">
                                                                    <Button 
                                                                        variant="success"
                                                                        onClick={() => handleEdit(task.id)} 
                                                                        disabled={isLoading}
                                                                        className="px-3"
                                                                    >
                                                                        <i className="fa-regular fa-floppy-disk me-2"></i> Save
                                                                    </Button>
                                                                </div>
                                                            </Form>
                                                        ) : (
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <h6 className="mb-1 fw-bold">{task.Tasks}</h6>
                                                                    {task['Due Date'] && (
                                                                        <div className="text-muted small">
                                                                            <FaCalendarAlt className="me-1" size={12} /> Due: {task['Due Date']}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <Button 
                                                                        variant="outline-success" 
                                                                        size="sm"
                                                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                                                        style={{width: '32px', height: '32px', padding: 0}}
                                                                        onClick={() => handleDone(task.id)} 
                                                                        disabled={isLoading}
                                                                        title="Mark as completed"
                                                                    >
                                                                        <i className="fa-regular fa-square"></i>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline-primary" 
                                                                        size="sm"
                                                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                                                        style={{width: '32px', height: '32px', padding: 0}}
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
                                                                        style={{width: '32px', height: '32px', padding: 0}}
                                                                        onClick={() => handleDelete(task.id)} 
                                                                        disabled={isLoading}
                                                                        title="Delete task"
                                                                    >
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-muted">No active tasks. Add a new task to get started.</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>
                                
                                <Tab 
                                    eventKey="overdue" 
                                    title={
                                        <div className="d-flex align-items-center">
                                            <FaExclamationCircle className="me-2 text-danger" />
                                            <span>Overdue ({overdueTasks.length})</span>
                                        </div>
                                    }
                                >
                                    <div className="pt-3">
                                        {isLoading ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" role="status" variant="danger" className="spinner-2rem">
                                                    <span className="visually-hidden">Loading tasks...</span>
                                                </Spinner>
                                                <p className="mt-3 text-muted">Loading overdue tasks...</p>
                                            </div>
                                        ) : overdueTasks.length > 0 ? (
                                            overdueTasks.map((task) => (
                                                <Card key={task.id} className="mb-3 border-0 shadow-sm rounded-card border-left-danger transition-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <Badge bg="danger" className="mb-2">Overdue</Badge>
                                                                <h6 className="mb-1 fw-bold">{task.Tasks}</h6>
                                                                {task['Due Date'] && (
                                                                    <div className="text-danger small">
                                                                        <FaCalendarAlt className="me-1" size={12} /> Due: {task['Due Date']}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <Button 
                                                                    variant="outline-success" 
                                                                    size="sm"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px', padding: 0}}
                                                                    onClick={() => handleDone(task.id)} 
                                                                    disabled={isLoading}
                                                                    title="Mark as completed"
                                                                >
                                                                    <i className="fa-regular fa-square"></i>
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px', padding: 0}}
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
                                                                    style={{width: '32px', height: '32px', padding: 0}}
                                                                    onClick={() => handleDelete(task.id)} 
                                                                    disabled={isLoading}
                                                                    title="Delete task"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-muted">No overdue tasks. You&apos;re all caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>
                                
                                <Tab 
                                    eventKey="completed" 
                                    title={
                                        <div className="d-flex align-items-center">
                                            <FaCheckCircle className="me-2 text-success" />
                                            <span>Completed ({completedTasks.length})</span>
                                        </div>
                                    }
                                >
                                    <div className="pt-3">
                                        {isLoading ? (
                                            <div className="text-center py-4">
                                                <Spinner animation="border" role="status" variant="success" className="spinner-2rem">
                                                    <span className="visually-hidden">Loading tasks...</span>
                                                </Spinner>
                                                <p className="mt-3 text-muted">Loading completed tasks...</p>
                                            </div>
                                        ) : completedTasks.length > 0 ? (
                                            completedTasks.map((task) => (
                                                <Card key={task.id} className="mb-3 border-0 shadow-sm rounded-card border-left-success opacity-80 transition-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <Badge bg="success" className="mb-2">Completed</Badge>
                                                                <h6 className="mb-1 fw-bold text-decoration-line-through">{task.Tasks}</h6>
                                                                {task['Due Date'] && (
                                                                    <div className="text-muted small">
                                                                        <FaCalendarAlt className="me-1" size={12} /> Due: {task['Due Date']}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <Button 
                                                                    variant="outline-warning" 
                                                                    size="sm"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px', padding: 0}}
                                                                    onClick={() => handleIncomplete(task.id)} 
                                                                    disabled={isLoading}
                                                                    title="Mark as incomplete"
                                                                >
                                                                    <i className="fa-solid fa-rotate-left"></i>
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px', padding: 0}}
                                                                    onClick={() => {
                                                                        setEditTaskId(task.id);
                                                                        setEditTask(task.Tasks);
                                                                        setEditDueDate(task['Due Date'] || '');
                                                                    }}
                                                                    disabled={isLoading}
                                                                    title="Edit task"
                                                                >
                                                                    <i className="fa-solid fa-pencil"></i>
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-danger" 
                                                                    size="sm"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px', padding: 0}}
                                                                    onClick={() => handleDelete(task.id)} 
                                                                    disabled={isLoading}
                                                                    title="Delete task"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-muted">No completed tasks yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            { !propExpandedView && (
                <div className="text-center mt-3 mb-4 d-none d-lg-block">
                    { !expandedView ? (
                        <Button 
                            variant="outline-primary" 
                            onClick={() => setExpandedView(true)} 
                            className="px-4 py-2 rounded-pill"
                        >
                            <i className="fa-solid fa-chevron-down me-2"></i> Show More
                        </Button>
                    ) : (
                        <Button 
                            variant="outline-primary" 
                            onClick={() => setExpandedView(false)} 
                            className="px-4 py-2 rounded-pill"
                        >
                            <i className="fa-solid fa-chevron-up me-2"></i> Show Less
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

TodoWidget.propTypes = {
    expandedView: PropTypes.bool
};
