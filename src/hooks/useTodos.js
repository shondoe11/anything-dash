//* custom hook fr todo tasks
import { useState, useEffect, useCallback } from 'react';
import { fetchAirtableData, postDataToAirtable, editDataInAirtable, deleteDataFromAirtable } from '../services/service';
import { useAuth } from '../context/AuthContext';

export default function useTodos() {
  const { userRecordId, netlifyUser, login } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userRecordId) { login(); return; }
    setLoading(true);
    try {
      const data = await fetchAirtableData(userRecordId, netlifyUser.email);
      const formatted = data.map(r => ({ id: r.id, ...r.fields }));
      setTasks(formatted);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userRecordId, netlifyUser.email, login]);

  useEffect(() => {
    if (userRecordId) {
      refresh();
    }
  }, [userRecordId, refresh]);

  const addTask = async (newRecord) => {
    await postDataToAirtable(userRecordId, newRecord);
    refresh();
  };

  const editTask = async (id, fields) => {
    await editDataInAirtable(id, fields);
    refresh();
  };

  const deleteTask = async (id) => {
    await deleteDataFromAirtable(id);
    refresh();
  };

  const archiveTasks = async (ids) => {
    await Promise.all(ids.map(id => deleteDataFromAirtable(id)));
    refresh();
  };

  return { tasks, loading, error, addTask, editTask, deleteTask, archiveTasks };
}
