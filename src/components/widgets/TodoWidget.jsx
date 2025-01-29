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
        const loadTasks = async () => {
            const data = await fetchAirtableData();
            const today = new Date().toISOString().split('T')[0];
            console.log(data); // confirm data
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
                (task) => TextTrackList.Status === 'New' && (!task['Due Date'] || task['Due Date'] >= today)
                )
            );
            setOngoingTasks(formattedTasks.filter((task) => task.Status === 'Ongoing'));
            setCompletedTasks(formattedTasks.filter((task) => task.Status === 'Completed'))
        };
        loadTasks();
    }, []);

    const refreshTasks = async () => {
        const data = await fetchAirtableData();
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

    const handleEdit = async () => {
        if (!editTaskId) return;
        await editDataInAirtable(editTaskId, {
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

            <h3>New Tasks</h3>
            <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New Task"
            required />
            <input 
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due Date"
            />
            <button onClick={handleAdd}>Create</button>

            <div className={styles['task-list']}>
                {tasks.map((task) => (
                    <div key={task.id} className={styles['task-item']}>
                        <span>{task.Tasks}</span>
                        <button onClick={() => handleDone(task.id)}>Done</button>
                        <button onClick={() => setEditTaskId(task.id)}>Edit</button>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                ))}
            </div>

            {overdueTasks.length > 0 && ( // hide if no overdue
                <>
                    <h3>Overdue Tasks</h3>
                    <div className={styles['task-list']}>
                        {overdueTasks.map((task) => (
                            <div key={task.id} className={styles['task-item']}>
                                <span>{task.Tasks} (Due: {task['Due Date']})</span>
                                <button onClick={() => handleDone(task.id)}>Done</button>
                                <button onClick={() => setEditTaskId(task.id)}>Edit</button>
                                <button onClick={() => handleDelete(task.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <h3>Ongoing Tasks</h3>
            <div className={styles['task-list']}>
                {ongoingTasks.map((task) => (
                    <div key={task.id} className={styles['task-item']}>
                    <span>{task.Tasks}</span>
                    <button onClick={() => handleDone(task.id)}>Done</button>
                    <button onClick={() => setEditTaskId(task.id)}>Edit</button>
                    </div>
                ))}
            </div>

            <h3>Completed Tasks</h3>
            <div className={styles['task-list']}>
                {completedTasks.map((task) => (
                    <div key={task.id} className={styles['task-item']}>
                    <span>{task.Tasks}</span>
                    <button onClick={() => setEditTaskId(task.id)}>Edit</button>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                ))}
            </div>

            {editTaskId && (
                <div className={styles['edit-section']}>
                    <h3>Edit Task</h3>
                    <input 
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    placeholder="Edit Task"
                    required />
                    <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    placeholder="Edit Due Date" />
                    <button onClick={handleEdit}>Edit</button>
                </div>
            )}
        </div>
    );
}