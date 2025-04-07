import { useEffect, useState } from "react";
import { deleteDataFromAirtable, fetchAirtableData, postDataToAirtable, editDataInAirtable } from "../../services/service";
import { toast } from "react-toastify";
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';


export default function TodoWidget({refreshTrigger, expandedView: propExpandedView}) {
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
    }, [refreshTrigger]); //~ refreshTrigger: use counter as state in dashboard and pass into TodoWidget + AnimeWidget 
    //! not advisable. lift state instead

    const refreshTasks = async () => {
        setIsLoading(true);
        toast.info('Fetching tasks...', {autoClose: false});
        try {
            const data = await fetchAirtableData();
            data.reverse();
            const today = new Date().toISOString().split('T')[0];
            const formattedTasks = data.map(record => ({
                    id: record.id,
                    ...record.fields
                }));
                setOverdueTasks(
                    formattedTasks.filter(
                        (task) => task.Status === 'New' && task['Due Date'] && task['Due Date'] < today
                    )
                );
                setTasks(
                    formattedTasks.filter(
                        (task) => task.Status === 'New' && (!task['Due Date'] || task['Due Date'] >= today)
                    )
                );
                setCompletedTasks(formattedTasks.filter((task) => task.Status === 'Completed'));
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
            toast.error('Failed to update task. Please try again.')
            console.error('update task FAILED: ', error);
        } finally {
            setIsLoading(false);
            toast.dismiss();
        }
    }

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
            console.error('mark task compelte FAILED: ', error);
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
        <Card className="border shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Todo List</h5>
            </Card.Header>
            <Card.Body>
                <Card className="mb-3 border-0 bg-light">
                    <Card.Body>
                        <h6 className="mb-3">New Tasks</h6>
                        <Form className="mb-3">
                            <Form.Group className="mb-2">
                                <Form.Label>Task Name:</Form.Label>
                                <Form.Control
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a New Task [required]"
                                    disabled={isLoading}
                                    required 
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Select Due Date (optional):</Form.Label>
                                <Form.Control 
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={isLoading}
                                />
                            </Form.Group>
                            <Button 
                                variant="success" 
                                className="mt-2" 
                                onClick={handleAdd}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Adding...' : 'Create'}
                            </Button>
                        </Form>

                <div>
                    {isLoading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Loading tasks...</span>
                            </Spinner>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <Card key={task.id} className="mb-2 border">
                                <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                                    {editTaskId === task.id ? (
                                        <Form className="d-flex flex-grow-1 me-2 gap-2">
                                            <Form.Control 
                                                size="sm"
                                                value={editTask}
                                                onChange={(e) => setEditTask(e.target.value)} 
                                                disabled={isLoading} 
                                            />
                                            <Form.Control 
                                                size="sm"
                                                type="date"
                                                value={editDueDate}
                                                onChange={(e) => setEditDueDate(e.target.value)} 
                                                disabled={isLoading} 
                                            />
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleEdit(task.id)} 
                                                disabled={isLoading}
                                            >
                                                <i className="fa-regular fa-floppy-disk"></i>
                                            </Button>
                                        </Form>
                                    ) : (
                                        <span className="text-truncate">{task.Tasks}</span>
                                    )}
                                    {editTaskId !== task.id && (
                                        <div className="d-flex gap-1">
                                            <Button 
                                                variant="outline-success" 
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
                                    )}
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </div>
                    </Card.Body>
                </Card>

                {!expandedView && (
                    <div className="text-center">
                        <Button variant="outline-primary" onClick={() => setExpandedView(true)}>Show More</Button>
                    </div>
                )}
                {expandedView && (
                    <>
                        <div className="text-center mb-3">
                            <Button variant="outline-primary" onClick={() => setExpandedView(false)}>Show Less</Button>
                        </div>
                    {overdueTasks.length > 0 && (
                        <Card className="mb-3 border-0 bg-light">
                            <Card.Body>
                                <h6 className="mb-3 text-danger">Overdue Tasks</h6>
                                <div>
                                    {overdueTasks.map((task) => (
                                        <Card key={task.id} className="mb-2 border border-danger">
                                            <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                                                {editTaskId === task.id ? (
                                                    <Form className="d-flex flex-grow-1 me-2 gap-2">
                                                        <Form.Control 
                                                            size="sm"
                                                            value={editTask}
                                                            onChange={(e) => setEditTask(e.target.value)} 
                                                            disabled={isLoading} 
                                                        />
                                                        <Form.Control 
                                                            size="sm"
                                                            type="date"
                                                            value={editDueDate}
                                                            onChange={(e) => setEditDueDate(e.target.value)} 
                                                            disabled={isLoading} 
                                                        />
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm"
                                                            onClick={() => handleEdit(task.id)} 
                                                            disabled={isLoading}
                                                        >
                                                            <i className="fa-regular fa-floppy-disk"></i>
                                                        </Button>
                                                    </Form>
                                                ) : (
                                                    <span className="text-danger text-truncate">{task.Tasks} (Due: {task['Due Date']})</span>
                                                )}
                                                {editTaskId !== task.id && (
                                                    <div className="d-flex gap-1">
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm"
                                                            onClick={() => handleDone(task.id)} 
                                                            disabled={isLoading}
                                                        >
                                                            {task.Status === "Completed" ? (
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
                                                )}
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                    
                    <Card className="mb-3 border-0 bg-light">
                        <Card.Body>
                            <h6 className="mb-3 text-success">Completed Tasks</h6>
                            <div>
                                {completedTasks.map((task) => (
                                    <Card key={task.id} className="mb-2 border border-success">
                                        <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                                            {editTaskId === task.id ? (
                                                <Form className="d-flex flex-grow-1 me-2 gap-2">
                                                    <Form.Control 
                                                        size="sm"
                                                        value={editTask}
                                                        onChange={(e) => setEditTask(e.target.value)}
                                                        disabled={isLoading} 
                                                    />
                                                    <Form.Control 
                                                        size="sm"
                                                        type="date"
                                                        value={editDueDate}
                                                        onChange={(e) => setEditDueDate(e.target.value)}
                                                        disabled={isLoading} 
                                                    />
                                                    <Button 
                                                        variant="outline-success" 
                                                        size="sm"
                                                        onClick={() => handleEdit(task.id)} 
                                                        disabled={isLoading}
                                                    >
                                                        <i className="fa-regular fa-floppy-disk"></i>
                                                    </Button>
                                                </Form>
                                            ) : (
                                                <span className="text-success text-truncate">{task.Tasks}</span>
                                            )}
                                            {editTaskId !== task.id && (
                                                <div className="d-flex gap-1">
                                                    <Button 
                                                        variant="outline-success" 
                                                        size="sm"
                                                        onClick={() => handleDone(task.id)} 
                                                        disabled={isLoading}
                                                    >
                                                        {task.Status === "Completed" ? (
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
                                            )}
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </>
            )}
            </Card.Body>
        </Card>
    );
}

TodoWidget.propTypes = {
    refreshTrigger: PropTypes.number,
    expandedView: PropTypes.bool
};

TodoWidget.defaultProps = {
    refreshTrigger: 0,
    expandedView: false
};
