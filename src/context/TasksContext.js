import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/tasks');
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load tasks in context:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload) => {
    try {
      const res = await axiosInstance.post('/tasks', payload);
      const created = res.data?.data;
      if (created) {
        setTasks((current) => [created, ...current]);
        return created;
      }
    } catch (err) {
      console.error('Error creating task in context:', err);
      throw err;
    }
  };

  const updateTask = async (updatedTask) => {
    const id = updatedTask._id || updatedTask.id;
    if (!id) return;
    try {
      const res = await axiosInstance.put(`/tasks/${id}`, updatedTask);
      const savedTask = res.data?.data;
      if (savedTask) {
        setTasks((current) => current.map((t) => (t._id === id || t.id === id ? savedTask : t)));
        return savedTask;
      }
    } catch (err) {
      console.error('Error updating task in context:', err);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((t) => t._id !== id && t.id !== id));
    } catch (err) {
      console.error('Error deleting task in context:', err);
      throw err;
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      const existing = tasks.find(t => (t._id || t.id) === id);
      const nextStatus = existing?.status === 'Completed' ? 'Open' : 'Completed';
      const res = await axiosInstance.put(`/tasks/${id}`, { status: nextStatus });
      const savedTask = res.data?.data;
      if (savedTask) {
        setTasks((current) => current.map((t) => (t._id === id || t.id === id ? savedTask : t)));
        return savedTask;
      }
    } catch (err) {
      console.error('Error toggling task status in context:', err);
      throw err;
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        refetch: fetchTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
