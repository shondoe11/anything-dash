import { useEffect, useState } from "react";
import { deleteDataFromAirtable, fetchAirtableData, postDataToAirtable } from "../../services/service";
import styles from "./TodoWidget.module.css";

export default function TodoWidget() {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');

    // fetch tasks on page load
    useEffect(() => {
        const loadTasks = async () => {
            const data = await fetchAirtableData();
            const today = new Date().toISOString().split("T")[0];
            console.log(data); // confirm data
            const formattedTasks = data.map(record => ({
                id: record.id,
                ...record.fields
            }));
            const overdue = formattedTasks.filter(task => task["Due Date"] && task["Due Date"] < today);
            const nonOverdue = formattedTasks.filter(task => !task["Due Date"] || task["Due Date"] >= today);
            setTasks(nonOverdue);
            setOverdueTasks(overdue);
        };
        loadTasks();
    }, []);

    // add new task
    const handleAdd = async () => {
        if (!newTask) return;
        await postDataToAirtable({
            Tasks: newTask, 
            Status: 'New',
            "Due Date": dueDate || null
        });
        setNewTask('');
        setDueDate('');
        // refresh tasks
        const updated = await fetchAirtableData();
        const today = new Date().toISOString().split("T")[0];
        const formattedTasks = updated.map(r => ({
            id: r.id,
            ...r.fields
        }));
        setTasks(formattedTasks.filter(task => !task["Due Date"] || task["Due Date"] >= today));
        setOverdueTasks(formattedTasks.filter(task => task["Due Date"] && task["Due Date"] < today));
    };

    // delete task
    const handleDelete = async (id) => {
        await deleteDataFromAirtable(id);
        setTasks(tasks.filter(task => task.id !== id));
        setOverdueTasks(overdueTasks.filter(task => task.id !== id));
    };

    return (
        <div className={styles["todo-widget"]}>
            <h2>Todo List</h2>
            <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task"
            required />
            <input 
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due Date"
            />
            <button onClick={handleAdd}>Add</button>

            <div className={styles["task-list"]}>
                {tasks.map(task => (
                    <div key={task.id} className={styles["task-item"]}>
                        <span>{task.Tasks}</span>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}