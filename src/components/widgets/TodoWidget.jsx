import { useEffect, useState } from "react";
import { deleteDataFromAirtable, fetchAirtableData, postDataToAirtable, editDataInAirtable } from "../../services/service";
import styles from "./TodoWidget.module.css";

export default function TodoWidget() {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [ongoingTasks, setOngoingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTask, setEditTask] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    // fetch tasks on page load
    useEffect(() => {
        refreshTasks();
    }, []);

    const refreshTasks = async () => {
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
            setOngoingTasks(formattedTasks.filter((task) => task.Status === 'Ongoing'));
            setCompletedTasks(formattedTasks.filter((task) => task.Status === 'Completed'));
    };

    const handleAdd = async () => {
        if (!newTask) return;
        await postDataToAirtable({
            Tasks: newTask, 
            Status: 'New',
            'Due Date': dueDate || null
        });
        setNewTask('');
        setDueDate('');
        // refresh tasks
        refreshTasks();
    };

    const handleEdit = async (id) => {
        if (!id) return;
        await editDataInAirtable(id, {
            Tasks: editTask,
            'Due Date': editDueDate || null,
        });
        setEditTaskId(null);
        setEditTask('');
        setEditDueDate('');
        refreshTasks();
    }

    // marking task done
    const handleDone = async (id) => {
        await editDataInAirtable(id, {Status: 'Completed'});
        refreshTasks();
    }
    
    const handleDelete = async (id) => {
        await deleteDataFromAirtable(id);
        refreshTasks();
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
                    required />
                </div>
                <div className={styles['input-group']}>
                    <label>Select Due Date (optional):</label>
                    <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Due Date"
                    />
                </div>
                <button className={styles['add-button']} onClick={handleAdd}><span>Create</span></button>

                <div className={styles['task-list']}>
                    {tasks.map((task) => (
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
                                    <button className={styles['edit-button']} onClick={() => handleEdit(task.id)}><i className="fa-regular fa-floppy-disk"></i></button>
                                </div>
                            ) : (
                            <span>{task.Tasks}</span>
                            )}
                            <div className={styles['button-group']}>
                                <button className={styles['done-button']} onClick={() => handleDone(task.id)}>
                                    {task.Status === 'Completed' ? (<i className="fa-regular fa-square-check"></i>) : (
                                    <i className="fa-regular fa-square"></i>
                                    )}</button>
                                <button className={styles['edit-button']} 
                                onClick={() => {
                                setEditTaskId(task.id);
                                setEditTask(task.Tasks);
                                setEditDueDate(task['Due Date'] || '');
                                }}><i className="fa-regular fa-pen-to-square"></i></button>
                                <button className={styles['delete-button']} onClick={() => handleDelete(task.id)}><i className="fa-solid fa-trash"></i></button>
                            </div>  
                        </div>
                    ))}
                </div>
            </div>
            {overdueTasks.length > 0 && ( // hide if no overdue
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
                                    />
                                    <input 
                                    className={styles['edit-date']}
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)} 
                                    />
                                    <button className={styles['edit-button']} onClick={() => handleEdit(task.id)}><i className="fa-regular fa-floppy-disk"></i></button>
                                </div>
                                ) : (
                                <span>{task.Tasks} (Due: {task['Due Date']})</span>
                                )}
                                <div className={styles['button-group']}>
                                    <button className={styles['done-button']} onClick={() => handleDone(task.id)}>{task.Status === "Completed" ? (
                                    <i className="fa-regular fa-square-check"></i>
                                    ) : (
                                    <i className="fa-regular fa-square"></i>
                                    )}</button>
                                    <button 
                                    className={styles['edit-button']} 
                                    onClick={() => {
                                    setEditTaskId(task.id); 
                                    setEditTask(task.Tasks); 
                                    setEditDueDate(task['Due Date'] || '');}}><i className="fa-regular fa-pen-to-square"></i></button>
                                    <button className={styles['delete-button']} onClick={() => handleDelete(task.id)}><i className="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles["section-container"] + " " + styles["ongoing-section"]}>
                <h3>Ongoing Tasks</h3>
                <div className={styles['task-list']}>
                    {ongoingTasks.map((task) => (
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
                                    <button className={styles['edit-button']} onClick={() => handleEdit(task.id)}><i className="fa-regular fa-floppy-disk"></i></button>
                                </div>
                            ) : (
                            <span>{task.Tasks}</span>
                            )}
                            <div className={styles['button-group']}>
                                <button className={styles['done-button']} onClick={() => handleDone(task.id)}>
                                {task.Status === "Completed" ? (
                                <i className="fa-regular fa-square-check"></i>
                                ) : (
                                <i className="fa-regular fa-square"></i>
                                )}</button>
                                <button 
                                className={styles['edit-button']} 
                                onClick={() => {
                                setEditTaskId(task.id); 
                                setEditTask(task.Tasks); 
                                setEditDueDate(task['Due Date'] || '');}}><i className="fa-regular fa-pen-to-square"></i></button>
                                <button className={styles['delete-button']} onClick={() => handleDelete(task.id)}><i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
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
                                    />
                                    <input 
                                    className={styles['edit-date']}
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)} 
                                    />
                                    <button className={styles['edit-button']} onClick={() => handleEdit(task.id)}><i className="fa-regular fa-floppy-disk"></i></button>
                                </div>
                            ) : (
                            <span>{task.Tasks}</span>
                            )}
                            <div className={styles['button-group']}>
                                <button className={styles['done-button']} onClick={() => handleDone(task.id)}>{task.Status === "Completed" ? (
                                <i className="fa-regular fa-square-check"></i>
                                ) : (
                                <i className="fa-regular fa-square"></i>
                                )}</button>
                                <button 
                                className={styles['edit-button']} 
                                onClick={() => {
                                setEditTaskId(task.id); 
                                setEditTask(task.Tasks); 
                                setEditDueDate(task['Due Date'] || '');}}><i className="fa-regular fa-pen-to-square"></i></button>
                                <button className={styles['delete-button']} onClick={() => handleDelete(task.id)}><i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}