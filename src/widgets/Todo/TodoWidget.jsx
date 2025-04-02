import { useEffect, useState } from "react";
import { deleteDataFromAirtable, fetchAirtableData, postDataToAirtable, editDataInAirtable } from "../../services/service";
import styles from "./TodoWidget.module.css";
import { toast } from "react-toastify";

export default function TodoWidget({refreshTrigger}) {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTask, setEditTask] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedView, setExpandedView] = useState(false);

    // fetch tasks on page load
    useEffect(() => {
        refreshTasks();
    }, [refreshTrigger]); // refreshTrigger: use counter as state in dashboard and pass into TodoWidget + AnimeWidget //! not advisable. lift state instead

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
            setIsLoading(false); //always set loading state back to false at end of function
            toast.dismiss(); // dismiss toast loading
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
            // refresh tasks
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

    // marking task done
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
        <div className={styles['todo-widget']}>
            <h2>Todo List</h2>
            <div className={styles["section-container"] + " " + styles["new-section"]}>
                <h3>New Tasks</h3>
                <div className={styles['input-group']}>
                    <label>Task Name:</label>
                    <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a New Task [required]"
                    disabled={isLoading}
                    required />
                </div>
                <div className={styles['input-group']}>
                    <label>Select Due Date (optional):</label>
                    <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Due Date"
                    disabled={isLoading}
                    />
                </div>
                <button className={styles['add-button']} onClick={handleAdd}><span>{isLoading ? 'Adding...' : 'Create'}</span></button>

                <div className={styles['task-list']}>
                    {isLoading ? (
                        <div>Loading tasks...</div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className={styles['task-item']}>
                                {editTaskId === task.id ? (
                                    <div className={styles['edit-container']}>
                                        <input 
                                            className={styles['edit-input']}
                                            value={editTask}
                                            onChange={(e) => setEditTask(e.target.value)} 
                                            disabled={isLoading} />
                                        <input 
                                            className={styles['edit-date']}
                                            type="date"
                                            value={editDueDate}
                                            onChange={(e) => setEditDueDate(e.target.value)} 
                                            disabled={isLoading} />
                                        <button 
                                            className={styles['edit-button']} 
                                            onClick={() => handleEdit(task.id)} 
                                            disabled={isLoading}>
                                            <i className="fa-regular fa-floppy-disk"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <span>{task.Tasks}</span>
                                )}
                                <div className={styles['button-group']}>
                                    <button 
                                        className={styles['done-button']} 
                                        onClick={() => handleDone(task.id)} 
                                        disabled={isLoading}>
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
                                        disabled={isLoading}>
                                        <i className="fa-regular fa-pen-to-square"></i>
                                    </button>
                                    <button 
                                        className={styles['delete-button']} 
                                        onClick={() => handleDelete(task.id)} 
                                        disabled={isLoading}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>  
                            </div>
                        ))
                    )}
                </div>
            </div>
            {!expandedView && (
                <button className={styles['expand-button']} onClick={() => setExpandedView(true)}>Show More</button>
            )}
            {expandedView && (
                <>
                    <button className={styles['expand-button']} onClick={() => setExpandedView(false)}>Show Less</button>
                    {overdueTasks.length > 0 && (
                        <div className={styles["section-container"] + " " + styles["overdue-section"]}>
                            <h3>Overdue Tasks</h3>
                            <div className={styles['task-list']}>
                                {overdueTasks.map((task) => (
                                    <div key={task.id} className={styles['task-item']}>
                                        {editTaskId === task.id ? (
                                        <div className={styles['edit-container']}>
                                            <input 
                                            className={styles['edit-input']}
                                            value={editTask}
                                            onChange={(e) => setEditTask(e.target.value)} 
                                            disabled={isLoading} 
                                            />
                                            <input 
                                            className={styles['edit-date']}
                                            type="date"
                                            value={editDueDate}
                                            onChange={(e) => setEditDueDate(e.target.value)} 
                                            disabled={isLoading} 
                                            />
                                            <button className={styles['edit-button']} onClick={() => handleEdit(task.id)} disabled={isLoading}><i className="fa-regular fa-floppy-disk"></i></button>
                                        </div>
                                        ) : (
                                        <span>{task.Tasks} (Due: {task['Due Date']})</span>
                                        )}
                                        <div className={styles['button-group']}>
                                            <button className={styles['done-button']} onClick={() => handleDone(task.id)} disabled={isLoading}>{task.Status === "Completed" ? (
                                            <i className="fa-regular fa-square-check"></i>
                                            ) : (
                                            <i className="fa-regular fa-square"></i>
                                            )}</button>
                                            <button 
                                            className={styles['edit-button']} 
                                            onClick={() => {
                                            setEditTaskId(task.id); 
                                            setEditTask(task.Tasks); 
                                            setEditDueDate(task['Due Date'] || '');}} 
                                            disabled={isLoading}><i className="fa-regular fa-pen-to-square"></i></button>
                                            <button className={styles['delete-button']} onClick={() => handleDelete(task.id)}><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className={styles["section-container"] + " " + styles["completed-section"]}>
                        <h3>Completed Tasks</h3>
                        <div className={styles['task-list']}>
                            {completedTasks.map((task) => (
                                <div key={task.id} className={styles['task-item']}>
                                    {editTaskId === task.id ? (
                                        <div className={styles['edit-container']}>
                                            <input 
                                            className={styles['edit-input']}
                                            value={editTask}
                                            onChange={(e) => setEditTask(e.target.value)}
                                            disabled={isLoading} 
                                            />
                                            <input 
                                            className={styles['edit-date']}
                                            type="date"
                                            value={editDueDate}
                                            onChange={(e) => setEditDueDate(e.target.value)}
                                            disabled={isLoading} 
                                            />
                                            <button className={styles['edit-button']} onClick={() => handleEdit(task.id)} disabled={isLoading}><i className="fa-regular fa-floppy-disk"></i></button>
                                        </div>
                                    ) : (
                                    <span>{task.Tasks}</span>
                                    )}
                                    <div className={styles['button-group']}>
                                        <button className={styles['done-button']} onClick={() => handleDone(task.id)} disabled={isLoading}>{task.Status === "Completed" ? (
                                        <i className="fa-regular fa-square-check"></i>
                                        ) : (
                                        <i className="fa-regular fa-square"></i>
                                        )}</button>
                                        <button 
                                        className={styles['edit-button']} 
                                        onClick={() => {
                                        setEditTaskId(task.id); 
                                        setEditTask(task.Tasks); 
                                        setEditDueDate(task['Due Date'] || '');}}
                                        disabled={isLoading}><i className="fa-regular fa-pen-to-square"></i></button>
                                        <button className={styles['delete-button']} onClick={() => handleDelete(task.id)} disabled={isLoading}><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
